import { test, expect } from "@playwright/test";
import { cleanupE2eData, countCareRules, e2eName, findSpeciesByName } from "./helpers";

test.describe("adding a new plant type through the encyclopedia", () => {
  test.beforeEach(cleanupE2eData);
  test.afterEach(cleanupE2eData);

  test("a new species appears in the encyclopedia and in the add-plant picker, with its care schedule intact", async ({
    page,
  }) => {
    const name = e2eName("Radijs");

    await page.goto("/soorten/nieuw");
    await page.getByLabel("Naam *").fill(name);
    await page.getByLabel("Icoon").fill("🔴");
    await page.getByLabel("Hoeveel zon? *").fill("Volle zon tot halfschaduw");
    await page.locator('[name="interval_WATERING"]').fill("2");
    await page
      .locator('[name="instructions_WATERING"]')
      .fill("Gelijkmatig vochtig houden.");
    await page.locator('[name="interval_HARVESTING"]').fill("25");
    await page
      .locator('[name="instructions_HARVESTING"]')
      .fill("Uittrekken zodra de bol zichtbaar boven de grond komt.");

    await page.getByRole("button", { name: "Soort toevoegen" }).click();

    // Redirects to the new species' own encyclopedia page.
    await expect(page.getByRole("heading", { name })).toBeVisible();
    await expect(page.getByText("Gelijkmatig vochtig houden.")).toBeVisible();

    await page.goto("/soorten");
    await expect(page.locator("li", { hasText: name })).toBeVisible();

    await page.goto("/planten/nieuw");
    const options = await page.getByLabel("Wat is het?").locator("option").allTextContents();
    expect(options.some((o) => o.includes(name))).toBe(true);

    const species = await findSpeciesByName(name);
    expect(species).not.toBeNull();
    const ruleTypes = await countCareRules(species!.id);
    expect(ruleTypes.sort()).toEqual(["HARVESTING", "WATERING"]);
  });

  test("a species still in use by a plant refuses to be deleted", async ({ page }) => {
    const name = e2eName("Beschermde soort");

    await page.goto("/soorten/nieuw");
    await page.getByLabel("Naam *").fill(name);
    await page.getByLabel("Hoeveel zon? *").fill("Volle zon");
    await page.getByRole("button", { name: "Soort toevoegen" }).click();
    await expect(page.getByRole("heading", { name })).toBeVisible();

    await page.goto("/planten/nieuw");
    // Species left without an explicit emoji default to 🌱, which is part of
    // the <option> label the picker renders.
    await page.getByLabel("Wat is het?").selectOption({ label: `🌱 ${name}` });
    await page.getByLabel("Geef het een naam").fill(e2eName("Beschermde plant"));
    await page.getByRole("button", { name: "Plant toevoegen" }).click();

    const species = await findSpeciesByName(name);
    await page.goto(`/soorten/${species!.slug}/bewerken`);

    await expect(page.getByRole("button", { name: "Soort verwijderen" })).toBeDisabled();
    await expect(page.getByText(/plant\(en\) van deze soort in de tuin staan/)).toBeVisible();
  });
});
