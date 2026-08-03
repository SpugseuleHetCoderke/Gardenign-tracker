import Link from "next/link";
import { createSpecies } from "@/app/actions";
import SpeciesForm from "@/components/SpeciesForm";

export default function NewSpeciesPage() {
  return (
    <>
      <Link href="/soorten" className="text-sm text-muted">
        ← Naslag
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold">Soort toevoegen</h1>
      <p className="mb-6 text-sm text-muted">
        Verschijnt meteen in de naslag en bij het toevoegen van een plant.
      </p>

      <SpeciesForm action={createSpecies} submitLabel="Soort toevoegen" />
    </>
  );
}
