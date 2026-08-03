import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllTasks } from "@/lib/care";
import { plantLabel } from "@/lib/care-shared";

export const dynamic = "force-dynamic";

export default async function PlantsPage() {
  const [plants, tasks] = await Promise.all([
    prisma.plantInstance.findMany({
      include: { species: true },
      orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    }),
    getAllTasks(),
  ]);

  const dueCountByPlant = new Map<string, number>();
  for (const t of tasks) {
    if (t.daysOverdue >= 0) {
      dueCountByPlant.set(t.plantId, (dueCountByPlant.get(t.plantId) ?? 0) + 1);
    }
  }

  const active = plants.filter((p) => p.active);
  const archived = plants.filter((p) => !p.active);

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mijn planten</h1>
        <Link
          href="/planten/nieuw"
          className="min-h-11 shrink-0 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white"
        >
          Toevoegen
        </Link>
      </header>

      {plants.length === 0 && (
        <p className="rounded-xl border border-border-soft bg-surface p-6 text-center text-muted">
          Nog niets hier. Voeg je eerste plant toe.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {active.map((plant) => {
          const due = dueCountByPlant.get(plant.id) ?? 0;
          return (
            <li key={plant.id}>
              <Link
                href={`/planten/${plant.id}`}
                className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-3"
              >
                <span aria-hidden className="text-2xl leading-none">
                  {plant.species.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {plantLabel(plant)}
                  </span>
                  <span className="block text-sm text-muted">
                    {plant.species.name}
                    {plant.location ? ` · ${plant.location}` : ""}
                  </span>
                </span>
                {due > 0 && (
                  <span className="shrink-0 rounded-full bg-overdue-soft px-2 py-1 text-xs font-semibold text-overdue">
                    {due} te doen
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {archived.length > 0 && (
        <>
          <h2 className="mb-2 mt-8 text-sm font-semibold uppercase tracking-wide text-muted">
            Gearchiveerd
          </h2>
          <ul className="flex flex-col gap-2">
            {archived.map((plant) => (
              <li key={plant.id}>
                <Link
                  href={`/planten/${plant.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-3 opacity-60"
                >
                  <span aria-hidden className="text-2xl leading-none">
                    {plant.species.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {plantLabel(plant)}
                    </span>
                    <span className="block text-sm text-muted">
                      {plant.species.name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
