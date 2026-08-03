import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteLogEntry, setPlantActive } from "@/app/actions";
import LogForm from "@/components/LogForm";
import { getTasksForPlant } from "@/lib/care";
import { ACTIVITY_LABELS, dueLabel, plantLabel } from "@/lib/care-shared";
import { dateFmt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const plant = await prisma.plantInstance.findUnique({
    where: { id },
    include: {
      species: true,
      logs: { orderBy: { loggedAt: "desc" }, take: 50 },
    },
  });

  if (!plant) notFound();

  const tasks = plant.active ? await getTasksForPlant(plant.id) : [];

  return (
    <>
      <Link href="/planten" className="text-sm text-muted">
        ← Mijn planten
      </Link>

      <header className="mb-6 mt-2 flex items-start gap-3">
        <span aria-hidden className="text-4xl leading-none">
          {plant.species.emoji}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{plantLabel(plant)}</h1>
          <p className="text-sm text-muted">
            <Link
              href={`/soorten/${plant.species.slug}`}
              className="underline underline-offset-2"
            >
              {plant.species.name}
            </Link>
            {plant.location ? ` · ${plant.location}` : ""}
            {plant.plantedDate
              ? ` · geplant ${dateFmt.format(plant.plantedDate)}`
              : ""}
          </p>
          {!plant.active && (
            <p className="mt-1 text-sm font-medium text-muted">Gearchiveerd</p>
          )}
        </div>
      </header>

      {tasks.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Schema
          </h2>
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <li
                key={t.key}
                className="rounded-xl border border-border-soft bg-surface p-3"
              >
                <p className="font-semibold">
                  {ACTIVITY_LABELS[t.activityType]}{" "}
                  <span
                    className={`font-normal ${
                      t.daysOverdue > 0 ? "text-overdue" : "text-muted"
                    }`}
                  >
                    · {dueLabel(t)}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {t.instructions}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Elke {t.intervalDays} dagen ·{" "}
                  {t.lastDoneAt
                    ? `laatst gedaan ${dateFmt.format(t.lastDoneAt)}`
                    : "nog niet gedaan"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Over {plant.species.name.toLowerCase()}
        </h2>
        <div className="rounded-xl border border-border-soft bg-surface p-3 text-sm leading-relaxed">
          <p>
            <strong>Licht:</strong> {plant.species.sunlight}
          </p>
          {plant.species.soil && (
            <p className="mt-2">
              <strong>Grond:</strong> {plant.species.soil}
            </p>
          )}
          <p className="mt-2">
            <Link
              href={`/soorten/${plant.species.slug}`}
              className="text-accent underline underline-offset-2"
            >
              Alles over {plant.species.name.toLowerCase()} in de naslag →
            </Link>
          </p>
        </div>
      </section>

      {plant.active && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Iets noteren
          </h2>
          <LogForm plantId={plant.id} />
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Geschiedenis
        </h2>
        {plant.logs.length === 0 ? (
          <p className="rounded-xl border border-border-soft bg-surface p-3 text-sm text-muted">
            Nog niets genoteerd.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {plant.logs.map((log) => (
              <li
                key={log.id}
                className="flex items-start gap-3 rounded-xl border border-border-soft bg-surface p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {ACTIVITY_LABELS[log.activityType]}{" "}
                    <span className="font-normal text-muted">
                      · {dateFmt.format(log.loggedAt)}
                    </span>
                  </p>
                  {log.notes && (
                    <p className="mt-1 text-sm text-muted">{log.notes}</p>
                  )}
                </div>
                <form action={deleteLogEntry}>
                  <input type="hidden" name="logId" value={log.id} />
                  <input type="hidden" name="plantId" value={plant.id} />
                  <button
                    type="submit"
                    aria-label="Verwijder deze notitie"
                    className="min-h-11 shrink-0 px-2 text-sm text-muted underline underline-offset-2"
                  >
                    Wissen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <Link
          href={`/planten/${plant.id}/bewerken`}
          className="flex min-h-11 items-center justify-center rounded-lg border border-border-soft px-4 text-sm font-medium"
        >
          Gegevens bewerken
        </Link>

        <form action={setPlantActive}>
          <input type="hidden" name="plantId" value={plant.id} />
          <input
            type="hidden"
            name="active"
            value={plant.active ? "false" : "true"}
          />
          <button
            type="submit"
            className="min-h-11 w-full rounded-lg border border-border-soft px-4 text-sm font-medium text-muted"
          >
            {plant.active
              ? "Archiveren (geschiedenis blijft bewaard)"
              : "Terug in het schema zetten"}
          </button>
        </form>
      </div>
    </>
  );
}
