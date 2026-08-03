/**
 * The pure math behind the schedule: given a plant, one of its species' care
 * rules, and its most recent matching log entry (if any), work out when that
 * task is next due.
 *
 * Pulled out of care.ts so it can be unit tested without a database — no
 * Prisma types here, just plain data in and a DueTask out.
 */
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { plantLabel, type DueTask, type Schedule } from "@/lib/care-shared";
import type { ActivityType } from "@/generated/prisma/client";

const MS_PER_DAY = 86_400_000;

/** How far ahead getSchedule's "coming up" bucket looks. */
export const UPCOMING_WINDOW_DAYS = 7;

export type PlantForScheduling = {
  id: string;
  nickname: string | null;
  location: string | null;
  plantedDate: Date | null;
  createdAt: Date;
  species: {
    name: string;
    emoji: string;
  };
};

export type CareRuleForScheduling = {
  activityType: ActivityType;
  intervalDays: number;
  instructions: string;
};

/**
 * The rule: never done? Start the clock at planting, or else when the plant
 * record was created. Either way the task becomes due one interval later,
 * rather than showing up as instantly overdue the moment a plant is added.
 */
export function computeDueTask(
  plant: PlantForScheduling,
  rule: CareRuleForScheduling,
  lastLoggedAt: Date | null,
  now: Date,
): DueTask {
  const today = startOfDay(now);
  const anchor = lastLoggedAt ?? plant.plantedDate ?? plant.createdAt;
  const dueDate = startOfDay(new Date(anchor.getTime() + rule.intervalDays * MS_PER_DAY));

  return {
    key: `${plant.id}:${rule.activityType}`,
    plantId: plant.id,
    plantLabel: plantLabel(plant),
    location: plant.location,
    speciesName: plant.species.name,
    emoji: plant.species.emoji,
    activityType: rule.activityType,
    instructions: rule.instructions,
    intervalDays: rule.intervalDays,
    lastDoneAt: lastLoggedAt,
    dueDate,
    daysOverdue: differenceInCalendarDays(today, dueDate),
  };
}

/** Most urgent (most overdue) first — the order the Today screen renders in. */
export function sortByUrgency(tasks: DueTask[]): DueTask[] {
  return [...tasks].sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/** Splits an already-computed task list into the three buckets the dashboard shows. */
export function bucketTasks(tasks: DueTask[]): Schedule {
  return {
    overdue: tasks.filter((t) => t.daysOverdue > 0),
    today: tasks.filter((t) => t.daysOverdue === 0),
    upcoming: tasks
      .filter((t) => t.daysOverdue < 0 && -t.daysOverdue <= UPCOMING_WINDOW_DAYS)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
  };
}
