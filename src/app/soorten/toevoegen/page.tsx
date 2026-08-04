import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATALOG } from "@/lib/catalog";
import { monthRange } from "@/lib/format";
import { LIFECYCLE_LABELS } from "@/lib/species-labels";
import CatalogPicker, { type PickerItem } from "@/components/CatalogPicker";

export const dynamic = "force-dynamic";

/** A one-line gist for the picker list: lifecycle + when you'd harvest it. */
function summarize(entry: (typeof CATALOG)[number]): string {
  const parts = [LIFECYCLE_LABELS[entry.lifecycle]];
  const harvest = monthRange(entry.harvest?.[0], entry.harvest?.[1]);
  if (harvest) parts.push(`oogst ${harvest}`);
  return parts.join(" · ");
}

export default async function AddFromCatalogPage() {
  const owned = await prisma.species.findMany({ select: { slug: true } });
  const ownedSlugs = new Set(owned.map((s) => s.slug));

  const items: PickerItem[] = CATALOG.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    emoji: entry.emoji,
    category: entry.category,
    latinName: entry.latinName,
    summary: summarize(entry),
    owned: ownedSlugs.has(entry.slug),
  })).sort((a, b) => a.name.localeCompare(b.name, "nl"));

  return (
    <>
      <Link href="/soorten" className="text-sm text-muted">
        ← Naslag
      </Link>
      <h1 className="mb-1 mt-2 text-2xl font-bold">Wat heb je gekocht?</h1>
      <p className="mb-6 text-sm text-muted">
        Zoek de plant, vink hem aan en hij komt volledig ingevuld in je naslag —
        zon, water, kalender, verzorging en veelvoorkomende problemen. Je kan
        alles daarna nog aanpassen.
      </p>

      <CatalogPicker items={items} />
    </>
  );
}
