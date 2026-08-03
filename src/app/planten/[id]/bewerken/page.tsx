import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deletePlant, updatePlant } from "@/app/actions";
import { plantLabel } from "@/lib/care-shared";

export const dynamic = "force-dynamic";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const plant = await prisma.plantInstance.findUnique({
    where: { id },
    include: { species: true },
  });

  if (!plant) notFound();

  return (
    <>
      <Link href={`/planten/${plant.id}`} className="text-sm text-muted">
        ← {plantLabel(plant)}
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Gegevens bewerken</h1>

      <form action={updatePlant} className="flex flex-col gap-4">
        <input type="hidden" name="plantId" value={plant.id} />

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Naam</span>
          <input
            name="nickname"
            defaultValue={plant.nickname ?? ""}
            placeholder={plant.species.name}
            className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Waar staat het</span>
          <input
            name="location"
            defaultValue={plant.location ?? ""}
            className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Geplant op</span>
          <input
            type="date"
            name="plantedDate"
            defaultValue={
              plant.plantedDate
                ? plant.plantedDate.toISOString().slice(0, 10)
                : ""
            }
            className="min-h-12 rounded-lg border border-border-soft bg-surface px-3"
          />
        </label>

        <button
          type="submit"
          className="min-h-12 rounded-lg bg-accent px-4 font-semibold text-white"
        >
          Opslaan
        </button>
      </form>

      <form action={deletePlant} className="mt-8">
        <input type="hidden" name="plantId" value={plant.id} />
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg border border-overdue/40 px-4 text-sm font-medium text-overdue"
        >
          Plant definitief verwijderen
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          Dit wist ook de volledige geschiedenis. Archiveren is meestal beter.
        </p>
      </form>
    </>
  );
}
