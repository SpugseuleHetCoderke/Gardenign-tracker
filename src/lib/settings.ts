import "server-only";

import { prisma } from "@/lib/prisma";

/** The one and only settings row — see the Settings model's comment for why. */
const SETTINGS_ID = "singleton";

/** Creates the settings row with defaults on first read, so callers never deal with null. */
export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID },
    update: {},
  });
}

export async function updateEmailSettings(input: {
  emailRemindersOn: boolean;
  emailAddress: string | null;
}) {
  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...input },
    update: input,
  });
}
