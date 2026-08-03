import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllTasks } from "@/lib/care";
import { plantLabel } from "@/lib/care-shared";
import BulkLogForm, { type BulkPlant } from "@/components/BulkLogForm";
import { ActivityType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function BulkLogPage({
  searchParams,
}: {
  searchParams: Promise<{ activiteit?: string }>;
}) {
  const { activiteit } = await searchParams;

  const initialActivity = (Object.values(ActivityType) as string[]).includes(
    activiteit ?? "",
  )
    ? (activiteit as ActivityType)
    : ActivityType.WATERING;

  const [plants, tasks] = await Promise.all([
    prisma.plantInstance.findMany({
      where: { active: true },
      include: { species: { include: { careRules: true } } },
      orderBy: { createdAt: "asc" },
    }),
    getAllTasks(),
  ]);

  const dueByPlant = new Map<string, ActivityType[]>();
  for (const t of tasks) {
    if (t.daysOverdue >= 0) {
      dueByPlant.set(t.plantId, [
        ...(dueByPlant.get(t.plantId) ?? []),
        t.activityType,
      ]);
    }
  }

  const bulkPlants: BulkPlant[] = plants.map((p) => ({
    id: p.id,
    label: plantLabel(p),
    location: p.location,
    emoji: p.species.emoji,
    scheduledFor: p.species.careRules.map((r) => r.activityType),
    dueFor: dueByPlant.get(p.id) ?? [],
  }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Noteren</h1>
        <p className="text-sm text-muted">
          Vink af wat je gedaan hebt — voor meerdere planten tegelijk.
        </p>
      </header>

      {bulkPlants.length === 0 ? (
        <div className="rounded-xl border border-border-soft bg-surface p-6 text-center">
          <p className="mb-4 text-muted">
            Er staan nog geen planten in je tuin.
          </p>
          <Link
            href="/planten/nieuw"
            className="inline-block min-h-11 rounded-lg bg-accent px-4 py-3 font-semibold text-white"
          >
            Plant toevoegen
          </Link>
        </div>
      ) : (
        <BulkLogForm plants={bulkPlants} initialActivity={initialActivity} />
      )}
    </>
  );
}
