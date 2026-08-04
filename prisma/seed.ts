/**
 * Seeds the five starter species by copying them out of the built-in
 * catalogue (`src/lib/catalog.ts`), which is the single source of truth for
 * plant data. Everything else in the catalogue is added on demand from
 * Naslag → Toevoegen.
 *
 * Safe to re-run: it updates the starter rows in place and never touches
 * plants, logs, or species you added yourself.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATALOG_BY_SLUG, STARTER_SLUGS, toSpeciesInput } from "../src/lib/catalog";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const slug of STARTER_SLUGS) {
    const entry = CATALOG_BY_SLUG.get(slug);
    if (!entry) throw new Error(`Catalogue is missing starter species: ${slug}`);

    const { fields, careRules } = toSpeciesInput(entry);

    const species = await prisma.species.upsert({
      where: { slug },
      create: { slug, ...fields, isBuiltIn: true },
      update: { ...fields, isBuiltIn: true },
    });

    for (const rule of careRules) {
      await prisma.careRule.upsert({
        where: {
          speciesId_activityType: {
            speciesId: species.id,
            activityType: rule.activityType,
          },
        },
        create: { speciesId: species.id, ...rule },
        update: {
          intervalDays: rule.intervalDays,
          instructions: rule.instructions,
        },
      });
    }

    // Drop rules the catalogue no longer lists, so the DB matches the source.
    await prisma.careRule.deleteMany({
      where: {
        speciesId: species.id,
        activityType: { notIn: careRules.map((r) => r.activityType) },
      },
    });

    console.log(`  ${entry.emoji} ${entry.name} — ${careRules.length} verzorgingsregels`);
  }

  console.log(`\nCatalogus bevat ${CATALOG_BY_SLUG.size} soorten om uit te kiezen.`);
}

main()
  .then(async () => {
    console.log("Seed klaar.");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
