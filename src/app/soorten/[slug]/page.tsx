import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ACTIVITY_LABELS, plantLabel } from "@/lib/care-shared";
import { monthRange, MONTHS_NL } from "@/lib/format";
import {
  CATEGORY_LABELS,
  LIFECYCLE_HINTS,
  LIFECYCLE_LABELS,
} from "@/lib/species-labels";
import MonthBar from "@/components/MonthBar";

export const dynamic = "force-dynamic";

/** A labelled calendar row, hidden entirely when the window is unknown. */
function Calendar({
  label,
  from,
  to,
  currentMonth,
}: {
  label: string;
  from: number | null;
  to: number | null;
  currentMonth: number;
}) {
  const range = monthRange(from, to);
  if (!range) return null;

  return (
    <div className="mb-3 last:mb-0">
      <p className="text-sm">
        <strong>{label}:</strong> {range}
      </p>
      <MonthBar from={from} to={to} currentMonth={currentMonth} />
    </div>
  );
}

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <p className="mt-2 first:mt-0">
      <strong>{label}:</strong> {value}
    </p>
  );
}

export default async function SpeciesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const species = await prisma.species.findUnique({
    where: { slug },
    include: {
      careRules: true,
      plants: { where: { active: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!species) notFound();

  const month = new Date().getMonth() + 1;

  const hasCalendar =
    species.sowIndoorsFromMonth ||
    species.sowOutdoorsFromMonth ||
    species.plantOutFromMonth ||
    species.harvestFromMonth;

  return (
    <>
      <Link href="/soorten" className="text-sm text-muted">
        ← Naslag
      </Link>

      <header className="mb-6 mt-2 flex items-start gap-3">
        <span aria-hidden className="text-4xl leading-none">
          {species.emoji}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{species.name}</h1>
          <p className="text-sm text-muted">
            {CATEGORY_LABELS[species.category]}
            {species.lifecycle
              ? ` · ${LIFECYCLE_LABELS[species.lifecycle]}`
              : ""}
            {species.latinName ? ` · ${species.latinName}` : ""}
          </p>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          In het kort
        </h2>
        <div className="rounded-xl border border-border-soft bg-surface p-3 text-sm leading-relaxed">
          <Fact label="Zon" value={species.sunlight} />
          <Fact label="Water" value={species.waterNeeds} />
          <Fact label="Grond" value={species.soil} />
          <Fact label="Plantafstand" value={species.spacing} />
          <Fact label="Hoogte" value={species.height} />
          {species.lifecycle && (
            <p className="mt-2 text-muted">
              {LIFECYCLE_HINTS[species.lifecycle]}
            </p>
          )}
        </div>
      </section>

      {hasCalendar && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Kalender
          </h2>
          <div className="rounded-xl border border-border-soft bg-surface p-3">
            <Calendar
              label="Binnen voorzaaien"
              from={species.sowIndoorsFromMonth}
              to={species.sowIndoorsToMonth}
              currentMonth={month}
            />
            <Calendar
              label="Buiten zaaien"
              from={species.sowOutdoorsFromMonth}
              to={species.sowOutdoorsToMonth}
              currentMonth={month}
            />
            <Calendar
              label="Buiten uitplanten"
              from={species.plantOutFromMonth}
              to={species.plantOutToMonth}
              currentMonth={month}
            />
            <Calendar
              label="Oogsten"
              from={species.harvestFromMonth}
              to={species.harvestToMonth}
              currentMonth={month}
            />
            <p className="mt-3 text-xs text-muted">
              De omkaderde maand is {MONTHS_NL[month - 1]}.
            </p>
          </div>
        </section>
      )}

      {species.careRules.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Verzorging
          </h2>
          <ul className="flex flex-col gap-2">
            {species.careRules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-xl border border-border-soft bg-surface p-3"
              >
                <p className="font-semibold">
                  {ACTIVITY_LABELS[rule.activityType]}{" "}
                  <span className="font-normal text-muted">
                    · elke {rule.intervalDays} dagen
                  </span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {rule.instructions}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(species.generalNotes ||
        species.commonProblems ||
        species.companionPlants) && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Goed om te weten
          </h2>
          <div className="flex flex-col gap-2">
            {species.generalNotes && (
              <p className="rounded-xl border border-border-soft bg-surface p-3 text-sm leading-relaxed">
                {species.generalNotes}
              </p>
            )}
            {species.commonProblems && (
              <div className="rounded-xl border border-border-soft bg-surface p-3 text-sm leading-relaxed">
                <p className="mb-1 font-semibold">Veelvoorkomende problemen</p>
                <p className="text-muted">{species.commonProblems}</p>
              </div>
            )}
            {species.companionPlants && (
              <div className="rounded-xl border border-border-soft bg-surface p-3 text-sm leading-relaxed">
                <p className="mb-1 font-semibold">Buren</p>
                <p className="text-muted">{species.companionPlants}</p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          In onze tuin
        </h2>
        {species.plants.length === 0 ? (
          <div className="rounded-xl border border-border-soft bg-surface p-3 text-sm">
            <p className="mb-3 text-muted">
              Je hebt nog geen {species.name.toLowerCase()} staan.
            </p>
            <Link
              href="/planten/nieuw"
              className="text-accent underline underline-offset-2"
            >
              Toevoegen aan de tuin →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {species.plants.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/planten/${p.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {plantLabel({ ...p, species })}
                    </span>
                    {p.location && (
                      <span className="block text-sm text-muted">
                        {p.location}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href={`/soorten/${species.slug}/bewerken`}
        className="flex min-h-11 items-center justify-center rounded-lg border border-border-soft px-4 text-sm font-medium"
      >
        Deze soort bewerken
      </Link>
    </>
  );
}
