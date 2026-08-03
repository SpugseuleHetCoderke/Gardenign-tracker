import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteSpecies, updateSpecies } from "@/app/actions";
import SpeciesForm from "@/components/SpeciesForm";

export const dynamic = "force-dynamic";

export default async function EditSpeciesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const species = await prisma.species.findUnique({
    where: { slug },
    include: { careRules: true, _count: { select: { plants: true } } },
  });

  if (!species) notFound();

  return (
    <>
      <Link href={`/soorten/${species.slug}`} className="text-sm text-muted">
        ← {species.name}
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">{species.name} bewerken</h1>

      <SpeciesForm
        action={updateSpecies}
        values={species}
        submitLabel="Wijzigingen opslaan"
      />

      <form action={deleteSpecies} className="mt-8">
        <input type="hidden" name="speciesId" value={species.id} />
        <button
          type="submit"
          disabled={species._count.plants > 0}
          className="min-h-11 w-full rounded-lg border border-overdue/40 px-4 text-sm font-medium text-overdue disabled:cursor-not-allowed disabled:opacity-40"
        >
          Soort verwijderen
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          {species._count.plants > 0
            ? `Kan niet verwijderd worden zolang er ${species._count.plants} plant(en) van deze soort in de tuin staan.`
            : "Dit kan niet ongedaan gemaakt worden."}
        </p>
      </form>
    </>
  );
}
