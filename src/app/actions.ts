"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ActivityType,
  Lifecycle,
  PlantCategory,
} from "@/generated/prisma/client";

function parseEnum<T extends Record<string, string>>(
  enumObj: T,
  value: unknown,
  label: string,
): T[keyof T] {
  if (
    typeof value === "string" &&
    (Object.values(enumObj) as string[]).includes(value)
  ) {
    return value as T[keyof T];
  }
  throw new Error(`Onbekende ${label}: ${String(value)}`);
}

const parseActivityType = (v: unknown) =>
  parseEnum(ActivityType, v, "activiteit");

/** Reads a `YYYY-MM-DD` field, defaulting to now when it's absent. */
function parseDate(formData: FormData, field: string): Date {
  const raw = String(formData.get(field) ?? "").trim();
  if (!raw) return new Date();
  // Midday avoids the date shifting a day either way across timezones.
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) throw new Error("Ongeldige datum");
  return d;
}

/** Reads an optional month number (1-12) from a select. */
function parseMonth(formData: FormData, field: string): number | null {
  const raw = String(formData.get(field) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 12) return null;
  return n;
}

/** Reads a text field, collapsing blanks to null. */
function text(formData: FormData, field: string): string | null {
  const v = String(formData.get(field) ?? "").trim();
  return v || null;
}

// -------------------------------------------------------------- push signup

type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Called from the browser right after `pushManager.subscribe()` succeeds. */
export async function subscribeToPush(sub: PushSubscriptionInput) {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    throw new Error("Ongeldig push-abonnement");
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
}

/** Called when the user turns notifications back off on this device. */
export async function unsubscribeFromPush(endpoint: string) {
  if (!endpoint) return;
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

// ---------------------------------------------------------------- activities

/** Log something that was done. Backs both the one-tap button and the full form. */
export async function logActivity(formData: FormData) {
  const plantInstanceId = String(formData.get("plantId") ?? "");
  if (!plantInstanceId) throw new Error("plantId ontbreekt");

  const activityType = parseActivityType(formData.get("activityType"));

  await prisma.logEntry.create({
    data: {
      plantInstanceId,
      activityType,
      notes: text(formData, "notes"),
      loggedAt: parseDate(formData, "loggedAt"),
    },
  });

  revalidatePath("/");
  revalidatePath("/loggen");
  revalidatePath("/planten");
  revalidatePath(`/planten/${plantInstanceId}`);
}

/**
 * Log the same activity for several plants at once — "everything got watered".
 * Checkbox groups arrive as repeated `plantIds` entries.
 */
export async function logActivityBulk(formData: FormData) {
  const plantIds = formData.getAll("plantIds").map(String).filter(Boolean);
  const activityType = parseActivityType(formData.get("activityType"));
  const loggedAt = parseDate(formData, "loggedAt");

  if (plantIds.length === 0) return { count: 0 };

  await prisma.logEntry.createMany({
    data: plantIds.map((plantInstanceId) => ({
      plantInstanceId,
      activityType,
      loggedAt,
    })),
  });

  revalidatePath("/");
  revalidatePath("/loggen");
  revalidatePath("/planten");
  for (const id of plantIds) revalidatePath(`/planten/${id}`);

  return { count: plantIds.length };
}

/** Undo: removes a single log entry. */
export async function deleteLogEntry(formData: FormData) {
  const id = String(formData.get("logId") ?? "");
  const plantId = String(formData.get("plantId") ?? "");
  if (!id) throw new Error("logId ontbreekt");

  await prisma.logEntry.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/loggen");
  revalidatePath(`/planten/${plantId}`);
}

// ------------------------------------------------------------------- plants

export async function createPlant(formData: FormData) {
  const speciesId = String(formData.get("speciesId") ?? "");
  if (!speciesId) throw new Error("Kies eerst een soort");

  const plantedRaw = String(formData.get("plantedDate") ?? "").trim();

  const plant = await prisma.plantInstance.create({
    data: {
      speciesId,
      nickname: text(formData, "nickname"),
      location: text(formData, "location"),
      plantedDate: plantedRaw ? parseDate(formData, "plantedDate") : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/planten");
  redirect(`/planten/${plant.id}`);
}

export async function updatePlant(formData: FormData) {
  const id = String(formData.get("plantId") ?? "");
  if (!id) throw new Error("plantId ontbreekt");

  const plantedRaw = String(formData.get("plantedDate") ?? "").trim();

  await prisma.plantInstance.update({
    where: { id },
    data: {
      nickname: text(formData, "nickname"),
      location: text(formData, "location"),
      plantedDate: plantedRaw ? parseDate(formData, "plantedDate") : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/planten");
  redirect(`/planten/${id}`);
}

/** Soft archive: keeps the history, drops the plant off the schedule. */
export async function setPlantActive(formData: FormData) {
  const id = String(formData.get("plantId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("plantId ontbreekt");

  await prisma.plantInstance.update({ where: { id }, data: { active } });

  revalidatePath("/");
  revalidatePath("/loggen");
  revalidatePath("/planten");
  revalidatePath(`/planten/${id}`);
}

/** Permanent, and takes the plant's whole history with it. */
export async function deletePlant(formData: FormData) {
  const id = String(formData.get("plantId") ?? "");
  if (!id) throw new Error("plantId ontbreekt");

  await prisma.plantInstance.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/loggen");
  revalidatePath("/planten");
  redirect("/planten");
}

// ------------------------------------------------------------------ species

/** Turns "Rode biet" into "rode-biet", kept unique by appending a counter. */
async function uniqueSlug(name: string, exceptId?: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      // Strip the accents NFD just split off, so "ë" becomes "e".
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "soort";

  for (let i = 0; ; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await prisma.species.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === exceptId) return candidate;
  }
}

/**
 * Care rules arrive as one row per activity type: an interval and an
 * instruction. A blank or zero interval means "not on the schedule".
 */
function readCareRules(formData: FormData) {
  const rules: {
    activityType: ActivityType;
    intervalDays: number;
    instructions: string;
  }[] = [];

  for (const activityType of Object.values(ActivityType)) {
    if (activityType === ActivityType.NOTE) continue;

    const days = Number(
      String(formData.get(`interval_${activityType}`) ?? "").trim(),
    );
    if (!Number.isFinite(days) || days <= 0) continue;

    rules.push({
      activityType,
      intervalDays: Math.round(days),
      instructions:
        String(formData.get(`instructions_${activityType}`) ?? "").trim() ||
        "Nog geen uitleg ingevuld.",
    });
  }

  return rules;
}

/** Every editable species field, shared by create and update. */
function readSpeciesFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Een naam is verplicht");

  const sunlight = String(formData.get("sunlight") ?? "").trim();
  if (!sunlight) throw new Error("Vul in hoeveel zon de plant nodig heeft");

  const lifecycleRaw = String(formData.get("lifecycle") ?? "").trim();

  return {
    name,
    sunlight,
    emoji: String(formData.get("emoji") ?? "").trim() || "🌱",
    category: parseEnum(PlantCategory, formData.get("category"), "categorie"),
    lifecycle: lifecycleRaw
      ? parseEnum(Lifecycle, lifecycleRaw, "levensduur")
      : null,
    latinName: text(formData, "latinName"),
    soil: text(formData, "soil"),
    waterNeeds: text(formData, "waterNeeds"),
    spacing: text(formData, "spacing"),
    height: text(formData, "height"),
    sowIndoorsFromMonth: parseMonth(formData, "sowIndoorsFromMonth"),
    sowIndoorsToMonth: parseMonth(formData, "sowIndoorsToMonth"),
    sowOutdoorsFromMonth: parseMonth(formData, "sowOutdoorsFromMonth"),
    sowOutdoorsToMonth: parseMonth(formData, "sowOutdoorsToMonth"),
    plantOutFromMonth: parseMonth(formData, "plantOutFromMonth"),
    plantOutToMonth: parseMonth(formData, "plantOutToMonth"),
    harvestFromMonth: parseMonth(formData, "harvestFromMonth"),
    harvestToMonth: parseMonth(formData, "harvestToMonth"),
    generalNotes: text(formData, "generalNotes"),
    commonProblems: text(formData, "commonProblems"),
    companionPlants: text(formData, "companionPlants"),
  };
}

export async function createSpecies(formData: FormData) {
  const fields = readSpeciesFields(formData);
  const rules = readCareRules(formData);

  const species = await prisma.species.create({
    data: {
      ...fields,
      slug: await uniqueSlug(fields.name),
      careRules: { create: rules },
    },
  });

  revalidatePath("/soorten");
  revalidatePath("/planten/nieuw");
  redirect(`/soorten/${species.slug}`);
}

export async function updateSpecies(formData: FormData) {
  const id = String(formData.get("speciesId") ?? "");
  if (!id) throw new Error("speciesId ontbreekt");

  const fields = readSpeciesFields(formData);
  const rules = readCareRules(formData);

  const species = await prisma.$transaction(async (tx) => {
    const updated = await tx.species.update({
      where: { id },
      data: { ...fields, slug: await uniqueSlug(fields.name, id) },
    });

    // Replace the rule set wholesale — simpler than diffing, and the rules
    // hold no history worth preserving.
    await tx.careRule.deleteMany({ where: { speciesId: id } });
    if (rules.length > 0) {
      await tx.careRule.createMany({
        data: rules.map((r) => ({ ...r, speciesId: id })),
      });
    }

    return updated;
  });

  revalidatePath("/");
  revalidatePath("/soorten");
  revalidatePath(`/soorten/${species.slug}`);
  revalidatePath("/planten");
  redirect(`/soorten/${species.slug}`);
}

/** Refused while any plant still uses the species, to protect its history. */
export async function deleteSpecies(formData: FormData) {
  const id = String(formData.get("speciesId") ?? "");
  if (!id) throw new Error("speciesId ontbreekt");

  const inUse = await prisma.plantInstance.count({ where: { speciesId: id } });
  if (inUse > 0) {
    throw new Error(
      `Deze soort is nog in gebruik door ${inUse} plant(en). Verwijder of archiveer die eerst.`,
    );
  }

  await prisma.species.delete({ where: { id } });

  revalidatePath("/soorten");
  revalidatePath("/planten/nieuw");
  redirect("/soorten");
}
