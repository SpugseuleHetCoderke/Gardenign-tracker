import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPlant } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function NewPlantPage() {
  const species = await prisma.species.findMany({ orderBy: { name: "asc" } });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Link href="/planten" className="text-sm text-muted">
        ← Mijn planten
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Plant toevoegen</h1>

      {species.length === 0 ? (
        <div className="rounded-xl border border-border-soft bg-surface p-6 text-center">
          <p className="mb-4 text-muted">
            Er staan nog geen soorten in de naslag. Voeg er eerst één toe.
          </p>
          <Link
            href="/soorten/nieuw"
            className="inline-block min-h-11 rounded-lg bg-accent px-4 py-3 font-semibold text-white"
          >
            Soort toevoegen
          </Link>
        </div>
      ) : (
        <form action={createPlant} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Wat is het?</span>
            <select
              name="speciesId"
              required
              defaultValue=""
              className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
            >
              <option value="" disabled>
                Kies…
              </option>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted">
              Staat het er niet bij?{" "}
              <Link href="/soorten/nieuw" className="text-accent underline">
                Voeg een nieuwe soort toe
              </Link>
              .
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Geef het een naam{" "}
              <span className="font-normal text-muted">(optioneel)</span>
            </span>
            <input
              name="nickname"
              placeholder="bv. Grote tomaat bij het tuinhuis"
              className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Waar staat het{" "}
              <span className="font-normal text-muted">(optioneel)</span>
            </span>
            <input
              name="location"
              placeholder="bv. vensterbank keuken"
              className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Geplant op</span>
            <input
              type="date"
              name="plantedDate"
              defaultValue={today}
              className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
            />
            <span className="text-xs text-muted">
              Hiermee wordt berekend wanneer de eerste verzorging nodig is.
            </span>
          </label>

          <button
            type="submit"
            className="min-h-12 rounded-lg bg-accent px-4 font-semibold text-white"
          >
            Plant toevoegen
          </button>
        </form>
      )}
    </>
  );
}
