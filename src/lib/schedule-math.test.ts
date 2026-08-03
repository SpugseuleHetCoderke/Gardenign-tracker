import { addDays, addHours } from "date-fns";
import { describe, expect, it } from "vitest";
import { bucketTasks, computeDueTask, sortByUrgency, UPCOMING_WINDOW_DAYS } from "./schedule-math";
import type { CareRuleForScheduling, PlantForScheduling } from "./schedule-math";

// Local time, deliberately no "Z" — the real app always works with local wall
// clock (new Date(), or a date input parsed at noon local time), so tests
// build dates the same way rather than via raw UTC millisecond arithmetic,
// which can land on the wrong side of a local calendar-day boundary.
const NOW = new Date("2026-08-03T12:00:00");

function day(offset: number): Date {
  return addDays(NOW, offset);
}

function makePlant(overrides: Partial<PlantForScheduling> = {}): PlantForScheduling {
  return {
    id: "plant-1",
    nickname: null,
    location: "balkon",
    plantedDate: null,
    createdAt: day(0),
    species: { name: "Tomaat", emoji: "🍅" },
    ...overrides,
  };
}

function makeRule(overrides: Partial<CareRuleForScheduling> = {}): CareRuleForScheduling {
  return {
    activityType: "WATERING",
    intervalDays: 2,
    instructions: "Water aan de voet geven.",
    ...overrides,
  };
}

describe("computeDueTask", () => {
  it("anchors on the planted date when nothing has ever been logged", () => {
    const plant = makePlant({ plantedDate: day(-10) });
    const rule = makeRule({ intervalDays: 2 });

    const task = computeDueTask(plant, rule, null, NOW);

    // Planted 10 days ago, waters every 2 days -> due 8 days ago -> 8 days overdue.
    expect(task.daysOverdue).toBe(8);
    expect(task.lastDoneAt).toBeNull();
  });

  it("falls back to createdAt when there's no planted date either", () => {
    const plant = makePlant({ plantedDate: null, createdAt: day(-3) });
    const rule = makeRule({ intervalDays: 2 });

    const task = computeDueTask(plant, rule, null, NOW);

    // Record created 3 days ago, interval 2 -> due 1 day ago -> 1 day overdue.
    expect(task.daysOverdue).toBe(1);
  });

  it("anchors on the last matching log, not the planted date, once one exists", () => {
    const plant = makePlant({ plantedDate: day(-30) });
    const rule = makeRule({ intervalDays: 7 });

    const task = computeDueTask(plant, rule, day(-2), NOW);

    // Watered 2 days ago, interval 7 -> due in 5 days.
    expect(task.daysOverdue).toBe(-5);
    expect(task.lastDoneAt).toEqual(day(-2));
  });

  it("is due today (not overdue, not upcoming) exactly on the interval boundary", () => {
    const plant = makePlant();
    const rule = makeRule({ intervalDays: 3 });

    const task = computeDueTask(plant, rule, day(-3), NOW);

    expect(task.daysOverdue).toBe(0);
  });

  it("ignores the time of day, only the calendar date", () => {
    const plant = makePlant();
    const rule = makeRule({ intervalDays: 2 });

    // Logged very late at night two days ago; "now" is midday.
    // day(-2) is already noon, so +11h lands at 23:00 the same calendar day.
    const lateNightLog = addHours(day(-2), 11);
    const task = computeDueTask(plant, rule, lateNightLog, NOW);

    expect(task.daysOverdue).toBe(0);
  });

  it("only looks at logs of the same activity type (via the caller), and carries the rule's own instructions", () => {
    const plant = makePlant();
    const rule = makeRule({
      activityType: "HARVESTING",
      instructions: "Pluk als de vrucht rood is.",
    });

    const task = computeDueTask(plant, rule, null, NOW);

    expect(task.activityType).toBe("HARVESTING");
    expect(task.instructions).toBe("Pluk als de vrucht rood is.");
  });

  it("prefers the nickname over the species name, but falls back to the species name", () => {
    const withNickname = computeDueTask(
      makePlant({ nickname: "Balkontomaat" }),
      makeRule(),
      null,
      NOW,
    );
    const withoutNickname = computeDueTask(makePlant({ nickname: null }), makeRule(), null, NOW);

    expect(withNickname.plantLabel).toBe("Balkontomaat");
    expect(withoutNickname.plantLabel).toBe("Tomaat");
  });
});

describe("sortByUrgency", () => {
  it("orders most-overdue first", () => {
    const plant = makePlant();
    const tasks = [
      // Logged 10 days ago, waters every 30 days -> not due for 20 more days.
      computeDueTask(plant, makeRule({ activityType: "WATERING", intervalDays: 30 }), day(-10), NOW),
      // Logged 20 days ago, every 2 days -> 18 days overdue: the most urgent.
      computeDueTask(plant, makeRule({ activityType: "PRUNING", intervalDays: 2 }), day(-20), NOW),
      // Logged 2 days ago, every 2 days -> due exactly today.
      computeDueTask(plant, makeRule({ activityType: "HARVESTING", intervalDays: 2 }), day(-2), NOW),
    ];

    const sorted = sortByUrgency(tasks);

    expect(sorted.map((t) => t.activityType)).toEqual([
      "PRUNING",
      "HARVESTING",
      "WATERING",
    ]);
  });

  it("does not mutate the input array", () => {
    const plant = makePlant();
    const tasks = [
      computeDueTask(plant, makeRule({ activityType: "WATERING" }), day(-1), NOW),
      computeDueTask(plant, makeRule({ activityType: "PRUNING" }), day(-20), NOW),
    ];
    const original = [...tasks];

    sortByUrgency(tasks);

    expect(tasks).toEqual(original);
  });
});

describe("bucketTasks", () => {
  const plant = makePlant();

  it("puts positive daysOverdue in overdue, zero in today, and splits the rest by the upcoming window", () => {
    const overdue = computeDueTask(plant, makeRule({ activityType: "WATERING" }), day(-10), NOW);
    const dueToday = computeDueTask(plant, makeRule({ activityType: "PRUNING" }), day(-2), NOW);
    const soon = computeDueTask(
      plant,
      makeRule({ activityType: "HARVESTING", intervalDays: UPCOMING_WINDOW_DAYS }),
      day(0),
      NOW,
    );
    const farOut = computeDueTask(
      plant,
      makeRule({ activityType: "FERTILIZING", intervalDays: UPCOMING_WINDOW_DAYS + 1 }),
      day(0),
      NOW,
    );

    const schedule = bucketTasks([overdue, dueToday, soon, farOut]);

    expect(schedule.overdue.map((t) => t.activityType)).toEqual(["WATERING"]);
    expect(schedule.today.map((t) => t.activityType)).toEqual(["PRUNING"]);
    expect(schedule.upcoming.map((t) => t.activityType)).toEqual(["HARVESTING"]);
    // FERTILIZING is 8 days out with a 7-day window: shows up nowhere yet.
  });

  it("sorts the upcoming bucket soonest-first", () => {
    const soon = computeDueTask(plant, makeRule({ activityType: "WATERING", intervalDays: 2 }), day(0), NOW);
    const later = computeDueTask(plant, makeRule({ activityType: "PRUNING", intervalDays: 5 }), day(0), NOW);

    const schedule = bucketTasks([later, soon]);

    expect(schedule.upcoming.map((t) => t.activityType)).toEqual(["WATERING", "PRUNING"]);
  });
});
