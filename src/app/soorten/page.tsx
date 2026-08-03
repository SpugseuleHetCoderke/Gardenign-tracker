import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { monthInRange, MONTHS_NL } from "@/lib/format";
import { CATEGORY_HEADINGS, CATEGORY_ORDER } from "@/lib/species-labels";
import type { PlantCategory } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function SpeciesIndexPage() {
  const species = await prisma.species.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { plants: true } } },
  });

  const month = new Date().getMonth() + 1;

  const byCategory = new Map<PlantCategory, typeof species>();
  for (const s of species) {
    byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);
  }

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Naslag</h1>
          <p className="text-sm text-muted">
            Alles wat we weten over onze planten.
          </p>
        </div>
        <Link
          href="/soorten/nieuw"
          className="min-h-11 shrink-0 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white"
        >
          Toevoegen
        </Link>
      </header>

      {species.length === 0 && (
        <p className="rounded-xl border border-border-soft bg-surface p-6 text-center text-muted">
          Nog geen soorten. Voeg er één toe.
        </p>
      )}

      {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => (
        <section key={category} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            {CATEGORY_HEADINGS[category]}
          </h2>
          <ul className="flex flex-col gap-2">
            {byCategory.get(category)!.map((s) => {
              const harvestNow = monthInRange(
                month,
                s.harvestFromMonth,
                s.harvestToMonth,
              );
              const sowNow =
                monthInRange(month, s.sowIndoorsFromMonth, s.sowIndoorsToMonth) ||
                monthInRange(
                  month,
                  s.sowOutdoorsFromMonth,
                  s.sowOutdoorsToMonth,
                );

              return (
                <li key={s.id}>
                  <Link
                    href={`/soorten/${s.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface p-3"
                  >
                    <span aria-hidden className="text-2xl leading-none">
                      {s.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="block text-sm text-muted">
                        {s._count.plants > 0
                          ? `${s._count.plants} in de tuin`
                          : "nog niet geplant"}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {harvestNow && (
                        <span className="rounded-full bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
                          nu oogsten
                        </span>
                      )}
                      {sowNow && (
                        <span className="rounded-full bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
                          nu zaaien
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="mt-8 text-center text-xs text-muted">
        Badges gelden voor {MONTHS_NL[month - 1]}.
      </p>
    </>
  );
}
