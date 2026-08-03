import { test, expect } from "@playwright/test";
import { cleanupE2eData, countLogEntries, e2eName, findPlantByNickname } from "./helpers";

test.describe("adding a plant and working through its schedule", () => {
  test.beforeEach(cleanupE2eData);
  test.afterEach(cleanupE2eData);

  test("a newly added plant appears in Vandaag once its first task falls due, and marking it done reschedules it", async ({
    page,
  }) => {
    const nickname = e2eName("Balkontomaat");

    await page.goto("/planten/nieuw");
    await page.getByLabel("Wat is het?").selectOption({ label: "🍅 Tomaat" });
    await page.getByLabel("Geef het een naam").fill(nickname);
    await page.getByLabel("Waar staat het").fill("zuidbalkon");

    // Backdate planting so watering (every 2 days) is already due.
    const plantedDate = new Date();
    plantedDate.setDate(plantedDate.getDate() - 3);
    await page.getByLabel("Geplant op").fill(plantedDate.toISOString().slice(0, 10));

    await page.getByRole("button", { name: "Plant toevoegen" }).click();

    // Redirects straight to the plant detail page.
    await expect(page.getByRole("heading", { name: nickname })).toBeVisible();
    // "Water geven" appears both in the schedule list and in the log form's
    // <select> options, so scope to the schedule section specifically.
    const scheduleSection = page.locator("section", { has: page.getByRole("heading", { name: "Schema" }) });
    await expect(scheduleSection.getByText("Water geven")).toBeVisible();

    await page.goto("/");
    const wateringRow = page.locator("li", { hasText: nickname }).filter({ hasText: "Water geven" });
    await expect(wateringRow).toBeVisible();
    await expect(wateringRow).toContainText(/te laat/);

    await wateringRow.getByRole("button", { name: "Klaar" }).click();

    // Done: it should drop out of "Te laat" and reappear under "Binnenkort".
    await expect(page.locator("li", { hasText: nickname }).filter({ hasText: "Water geven" })).toContainText(
      "over",
    );

    const plant = await findPlantByNickname(nickname);
    expect(plant).not.toBeNull();
    const logs = await countLogEntries(plant!.id);
    expect(logs).toHaveLength(1);
  });

  test("archiving a plant removes it from Vandaag but keeps its history", async ({ page }) => {
    const nickname = e2eName("Te archiveren basilicum");

    await page.goto("/planten/nieuw");
    await page.getByLabel("Wat is het?").selectOption({ label: "🍃 Basilicum" });
    await page.getByLabel("Geef het een naam").fill(nickname);
    await page.getByRole("button", { name: "Plant toevoegen" }).click();

    await page.getByRole("button", { name: /Archiveren/ }).click();
    await expect(page.getByText("Gearchiveerd")).toBeVisible();

    await page.goto("/planten");
    await expect(page.getByText("Gearchiveerd", { exact: true })).toBeVisible();
    await expect(page.locator("li", { hasText: nickname })).toBeVisible();

    await page.goto("/");
    await expect(page.locator("li", { hasText: nickname })).toHaveCount(0);
  });
});
