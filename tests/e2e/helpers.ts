import "dotenv/config";
import { Client } from "pg";

/**
 * Tests run against the real dev database (no mocks, no separate test DB) —
 * simplest thing that works for a one-person hobby project. Every plant and
 * species a test creates gets an `E2E_PREFIX`-tagged name, so `cleanupE2eData`
 * can wipe exactly that and nothing the real user has added.
 *
 * This talks to Postgres with plain `pg` rather than the generated Prisma
 * client: that generated file uses `import.meta`, which Playwright's
 * CommonJS test transform can't load (unlike tsx, which Next.js and the
 * scripts/ folder use and which handles it fine).
 */
export const E2E_PREFIX = "[e2e]";

export function e2eName(label: string): string {
  return `${E2E_PREFIX} ${label}`;
}

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function cleanupE2eData() {
  await withClient(async (client) => {
    await client.query(
      `DELETE FROM "PlantInstance" WHERE nickname LIKE $1`,
      [`${E2E_PREFIX}%`],
    );
    await client.query(`DELETE FROM "Species" WHERE name LIKE $1`, [
      `${E2E_PREFIX}%`,
    ]);
  });
}

export type TestPlant = { id: string; slug: string | null };

export async function findPlantByNickname(nickname: string) {
  return withClient(async (client) => {
    const res = await client.query(
      `SELECT id FROM "PlantInstance" WHERE nickname = $1 LIMIT 1`,
      [nickname],
    );
    return (res.rows[0] as { id: string } | undefined) ?? null;
  });
}

export async function findSpeciesByName(name: string) {
  return withClient(async (client) => {
    const res = await client.query(
      `SELECT id, slug FROM "Species" WHERE name = $1 LIMIT 1`,
      [name],
    );
    return (res.rows[0] as { id: string; slug: string } | undefined) ?? null;
  });
}

export async function countLogEntries(plantInstanceId: string) {
  return withClient(async (client) => {
    const res = await client.query(
      `SELECT "activityType" FROM "LogEntry" WHERE "plantInstanceId" = $1`,
      [plantInstanceId],
    );
    return res.rows as { activityType: string }[];
  });
}

export async function countCareRules(speciesId: string) {
  return withClient(async (client) => {
    const res = await client.query(
      `SELECT "activityType" FROM "CareRule" WHERE "speciesId" = $1`,
      [speciesId],
    );
    return res.rows.map((r) => (r as { activityType: string }).activityType);
  });
}
