import type { Lifecycle, PlantCategory } from "@/generated/prisma/client";

/** Safe to import from client components — plain lookup tables, no database. */

export const CATEGORY_LABELS: Record<PlantCategory, string> = {
  VEGETABLE: "Groente",
  HERB: "Kruid",
  FRUIT: "Fruit",
  FLOWER: "Bloem",
  OTHER: "Overig",
};

/** Plural headings for the encyclopedia's groups. */
export const CATEGORY_HEADINGS: Record<PlantCategory, string> = {
  VEGETABLE: "Groenten",
  HERB: "Kruiden",
  FRUIT: "Fruit",
  FLOWER: "Bloemen",
  OTHER: "Overig",
};

/** The order groups appear in the encyclopedia. */
export const CATEGORY_ORDER: PlantCategory[] = [
  "VEGETABLE",
  "HERB",
  "FRUIT",
  "FLOWER",
  "OTHER",
];

export const LIFECYCLE_LABELS: Record<Lifecycle, string> = {
  ANNUAL: "Eenjarig",
  BIENNIAL: "Tweejarig",
  PERENNIAL: "Vaste plant",
};

export const LIFECYCLE_HINTS: Record<Lifecycle, string> = {
  ANNUAL: "Leeft één seizoen — elk jaar opnieuw zaaien.",
  BIENNIAL: "Blad in jaar één, bloei en zaad in jaar twee.",
  PERENNIAL: "Komt elk jaar vanzelf terug.",
};
