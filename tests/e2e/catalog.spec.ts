import { test, expect } from "@playwright/test";
import { findSpeciesByName, countCareRules } from "./helpers";

/**
 * The catalogue is the primary way species get added, so this covers the whole
 * point of it: picking an entry yields a fully-populated species with no form
 * filling. Uses a catalogue entry the seed doesn't install ("Radijs") and
 * removes it afterwards.
 */
const PICKED = "Radijs";

test.describe("adding a species from the built-in catalogue", () => {
  test.afterEach(async () => {
    const species = await findSpeciesByName(PICKED);
    if (species) await deleteSpeciesById(species.id);
  });

  test("searching and picking one entry creates a species with its calendar and care schedule filled in", async ({
    page,
  }) => {
    await page.goto("/soorten/toevoegen");

    await page.getByRole("searchbox").fill("radijs");

    const row = page.locator("label", { hasText: PICKED });
    await expect(row).toBeVisible();
    await row.getByRole("checkbox").check();

    await page.getByRole("button", { name: /1 soort toevoegen/ }).click();
    await expect(page.getByText("1 soort toegevoegd aan de naslag.")).toBeVisible();

    // It should now be marked as owned and no longer selectable.
    await expect(row.getByText("staat er al in")).toBeVisible();
    await expect(row.getByRole("checkbox")).toBeDisabled();

    // The encyclopedia page should be fully populated, not a blank shell.
    const species = await findSpeciesByName(PICKED);
    expect(species).not.toBeNull();

    await page.goto(`/soorten/${species!.slug}`);
    await expect(page.getByRole("heading", { name: PICKED })).toBeVisible();
    await expect(page.getByText("Zon:")).toBeVisible();
    await expect(page.getByText("Buiten zaaien:")).toBeVisible();
    await expect(page.getByText("Oogsten:").first()).toBeVisible();

    // Care rules came across too — that's what drives the schedule.
    const ruleTypes = await countCareRules(species!.id);
    expect(ruleTypes.length).toBeGreaterThan(0);
    expect(ruleTypes).toContain("WATERING");
  });

  test("an entry already in the naslag is shown but cannot be picked again", async ({ page }) => {
    await page.goto("/soorten/toevoegen");

    // Tomaat is installed by the seed, so it must already be marked as owned.
    await page.getByRole("searchbox").fill("tomaat");
    const row = page.locator("label", { hasText: "Tomaat" });
    await expect(row.getByText("staat er al in")).toBeVisible();
    await expect(row.getByRole("checkbox")).toBeDisabled();
  });

  test("a search with no matches offers the manual form instead", async ({ page }) => {
    await page.goto("/soorten/toevoegen");
    await page.getByRole("searchbox").fill("zzzznietbestaand");

    await expect(page.getByText(/Niets gevonden/)).toBeVisible();
    await expect(page.getByRole("link", { name: "zelf toevoegen" })).toBeVisible();
  });
});

/** Local helper — the shared ones don't expose a species delete. */
async function deleteSpeciesById(id: string) {
  const { Client } = await import("pg");
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`DELETE FROM "Species" WHERE id = $1`, [id]);
  } finally {
    await client.end();
  }
}
