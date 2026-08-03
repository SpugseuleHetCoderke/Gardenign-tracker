/**
 * Types and pure helpers that are safe to import from anywhere, including
 * client components.
 *
 * Everything that touches the database lives in `care.ts` instead. Keeping
 * them apart matters: a client component that imports the database module
 * drags the Postgres driver into the browser bundle, which fails the build.
 */
import type { ActivityType } from "@/generated/prisma/client";

export type DueTask = {
  /** Stable identity for a plant+activity pairing, handy as a React key. */
  key: string;
  plantId: string;
  plantLabel: string;
  location: string | null;
  speciesName: string;
  emoji: string;
  activityType: ActivityType;
  instructions: string;
  intervalDays: number;
  /** Null when the activity has never been logged. */
  lastDoneAt: Date | null;
  dueDate: Date;
  /** Negative = not due yet, 0 = due today, positive = this many days late. */
  daysOverdue: number;
};

export type Schedule = {
  overdue: DueTask[];
  today: DueTask[];
  upcoming: DueTask[];
};

/** Imperative, as shown on a task card: "Water geven — Balkontomaat". */
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  WATERING: "Water geven",
  FERTILIZING: "Bemesten",
  PRUNING: "Snoeien",
  HARVESTING: "Oogsten",
  REPOTTING: "Verpotten",
  NOTE: "Notitie",
};

export function plantLabel(p: {
  nickname: string | null;
  species: { name: string };
}): string {
  return p.nickname?.trim() || p.species.name;
}

/** "3 dagen te laat" / "vandaag" / "over 2 dagen" */
export function dueLabel(task: DueTask): string {
  const d = task.daysOverdue;
  if (d === 0) return "vandaag";
  if (d === 1) return "1 dag te laat";
  if (d > 1) return `${d} dagen te laat`;
  if (d === -1) return "morgen";
  return `over ${-d} dagen`;
}
