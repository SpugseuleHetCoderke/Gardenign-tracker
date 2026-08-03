import Link from "next/link";
import { getSchedule } from "@/lib/care";
import { ACTIVITY_LABELS } from "@/lib/care-shared";
import TaskCard from "@/components/TaskCard";
import { prisma } from "@/lib/prisma";
import { longDateFmt } from "@/lib/format";
import EnableNotifications from "@/components/EnableNotifications";
import type { ActivityType } from "@/generated/prisma/client";

// The schedule depends on today's date, so it must never be cached at build time.
export const dynamic = "force-dynamic";

function Section({
  title,
  tone,
  tasks,
}: {
  title: string;
  tone: "overdue" | "today" | "upcoming";
  tasks: Awaited<ReturnType<typeof getSchedule>>["overdue"];
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.key} task={task} tone={tone} />
        ))}
      </ul>
    </section>
  );
}

export default async function TodayPage() {
  const [schedule, plantCount] = await Promise.all([
    getSchedule(),
    prisma.plantInstance.count({ where: { active: true } }),
  ]);

  const nothingDue =
    schedule.overdue.length === 0 && schedule.today.length === 0;

  // "3 planten hebben water nodig" → one tap to the bulk screen, prefiltered.
  const dueNow = [...schedule.overdue, ...schedule.today];
  const countByActivity = new Map<ActivityType, number>();
  for (const t of dueNow) {
    countByActivity.set(
      t.activityType,
      (countByActivity.get(t.activityType) ?? 0) + 1,
    );
  }
  const quickActions = [...countByActivity.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1]);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Vandaag</h1>
        <p className="text-sm text-muted">{longDateFmt.format(new Date())}</p>
      </header>

      <EnableNotifications />

      {plantCount === 0 ? (
        <div className="rounded-xl border border-border-soft bg-surface p-6 text-center">
          <p className="mb-1 text-4xl" aria-hidden>
            🪴
          </p>
          <p className="mb-4 text-muted">
            Nog geen planten. Voeg je eerste toe, dan maakt het schema zichzelf.
          </p>
          <Link
            href="/planten/nieuw"
            className="inline-block min-h-11 rounded-lg bg-accent px-4 py-3 font-semibold text-white"
          >
            Plant toevoegen
          </Link>
        </div>
      ) : (
        <>
          {nothingDue && (
            <div className="mb-6 rounded-xl border border-border-soft bg-surface p-6 text-center">
              <p className="mb-1 text-4xl" aria-hidden>
                ✅
              </p>
              <p className="text-muted">
                Niets te doen vandaag. Geniet van de tuin.
              </p>
            </div>
          )}

          {quickActions.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                Alles in één keer
              </h2>
              <div className="flex flex-wrap gap-2">
                {quickActions.map(([activity, n]) => (
                  <Link
                    key={activity}
                    href={`/loggen?activiteit=${activity}`}
                    className="min-h-11 rounded-lg border border-accent bg-accent-soft px-3 py-2 text-sm font-medium text-accent"
                  >
                    {ACTIVITY_LABELS[activity]} · {n} planten
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Section title="Te laat" tone="overdue" tasks={schedule.overdue} />
          <Section title="Vandaag" tone="today" tasks={schedule.today} />
          <Section title="Binnenkort" tone="upcoming" tasks={schedule.upcoming} />
        </>
      )}
    </>
  );
}
