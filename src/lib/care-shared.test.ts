import { describe, expect, it } from "vitest";
import { dueLabel, plantLabel } from "./care-shared";
import type { DueTask } from "./care-shared";

function taskWith(daysOverdue: number): DueTask {
  return {
    key: "k",
    plantId: "p",
    plantLabel: "Tomaat",
    location: null,
    speciesName: "Tomaat",
    emoji: "🍅",
    activityType: "WATERING",
    instructions: "",
    intervalDays: 2,
    lastDoneAt: null,
    dueDate: new Date("2026-08-03"),
    daysOverdue,
  };
}

describe("dueLabel", () => {
  it("labels today, tomorrow, and further-out dates distinctly", () => {
    expect(dueLabel(taskWith(0))).toBe("vandaag");
    expect(dueLabel(taskWith(-1))).toBe("morgen");
    expect(dueLabel(taskWith(-5))).toBe("over 5 dagen");
  });

  it("uses singular phrasing for exactly one day late", () => {
    expect(dueLabel(taskWith(1))).toBe("1 dag te laat");
  });

  it("uses plural phrasing for more than one day late", () => {
    expect(dueLabel(taskWith(5))).toBe("5 dagen te laat");
  });
});

describe("plantLabel", () => {
  it("prefers a trimmed nickname over the species name", () => {
    expect(
      plantLabel({ nickname: "  Balkontomaat  ", species: { name: "Tomaat" } }),
    ).toBe("Balkontomaat");
  });

  it("falls back to the species name when there's no nickname, or it's blank", () => {
    expect(plantLabel({ nickname: null, species: { name: "Tomaat" } })).toBe("Tomaat");
    expect(plantLabel({ nickname: "   ", species: { name: "Tomaat" } })).toBe("Tomaat");
  });
});
