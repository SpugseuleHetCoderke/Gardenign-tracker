import "server-only";

import { prisma } from "@/lib/prisma";
import type { DueTask, Schedule } from "@/lib/care-shared";
import { bucketTasks, computeDueTask, sortByUrgency } from "@/lib/schedule-math";

/**
 * The schedule is derived, never stored: for every active plant, and every
 * care rule its species has, the next due date is
 *
 *     (date of the last log of that type, or the planted date) + intervalDays
 *
 * Nothing to keep in sync, and editing a care interval instantly updates every
 * reminder. This one module backs both the dashboard and the reminder email,
 * so the two can never disagree.
 *
 * The actual due-date math lives in schedule-math.ts, as plain functions with
 * no database dependency, so it can be unit tested directly. Types and pure
 * UI helpers live in care-shared.ts so client components can use them without
 * pulling in the database driver.
 */

export * from "@/lib/care-shared";

/**
 * Every scheduled task across all active plants, with its due date resolved.
 * `now` is injectable so this can be tested and so the reminder job can ask
 * about a specific day.
 */
export async function getAllTasks(now: Date = new Date()): Promise<DueTask[]> {
  const plants = await prisma.plantInstance.findMany({
    where: { active: true },
    include: {
      species: { include: { careRules: true } },
      logs: { orderBy: { loggedAt: "desc" } },
    },
  });

  const tasks: DueTask[] = [];

  for (const plant of plants) {
    for (const rule of plant.species.careRules) {
      // Logs come back newest-first, so the first match is the most recent.
      const lastLog = plant.logs.find((l) => l.activityType === rule.activityType);
      tasks.push(computeDueTask(plant, rule, lastLog?.loggedAt ?? null, now));
    }
  }

  return sortByUrgency(tasks);
}

/** Tasks split into the three buckets the dashboard shows. */
export async function getSchedule(now: Date = new Date()): Promise<Schedule> {
  return bucketTasks(await getAllTasks(now));
}

/** What the reminder email covers: anything late plus anything due today. */
export async function getTasksDueNow(now: Date = new Date()): Promise<DueTask[]> {
  const tasks = await getAllTasks(now);
  return tasks.filter((t) => t.daysOverdue >= 0);
}

/** Scheduled tasks for one plant, for the plant detail page. */
export async function getTasksForPlant(
  plantId: string,
  now: Date = new Date(),
): Promise<DueTask[]> {
  const tasks = await getAllTasks(now);
  return tasks
    .filter((t) => t.plantId === plantId)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
