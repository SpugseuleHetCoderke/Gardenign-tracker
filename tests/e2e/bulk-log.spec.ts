import { test, expect } from "@playwright/test";
import { cleanupE2eData, countLogEntries, e2eName, findPlantByNickname } from "./helpers";

test.describe("logging one activity across several plants at once", () => {
  test.beforeEach(cleanupE2eData);
  test.afterEach(cleanupE2eData);

  test("selecting two plants and submitting logs both, and only both", async ({ page }) => {
    const tomatoName = e2eName("Bulk tomaat");
    const basilName = e2eName("Bulk basilicum");

    for (const [species, nickname] of [
      ["🍅 Tomaat", tomatoName],
      ["🍃 Basilicum", basilName],
    ] as const) {
      await page.goto("/planten/nieuw");
      await page.getByLabel("Wat is het?").selectOption({ label: species });
      await page.getByLabel("Geef het een naam").fill(nickname);
      await page.getByRole("button", { name: "Plant toevoegen" }).click();
      await expect(page.getByRole("heading", { name: nickname })).toBeVisible();
    }

    await page.goto("/loggen");
    await page.getByRole("button", { name: "Snoeien", exact: true }).click();

    const tomatoRow = page.locator("label", { hasText: tomatoName });
    const basilRow = page.locator("label", { hasText: basilName });
    await tomatoRow.getByRole("checkbox").check();
    await basilRow.getByRole("checkbox").check();

    await expect(page.getByText("(2 geselecteerd)", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Snoeien noteren voor 2 planten/ }).click();
    await expect(page.getByText("2 planten genoteerd.")).toBeVisible();

    const tomato = await findPlantByNickname(tomatoName);
    const basil = await findPlantByNickname(basilName);

    const tomatoLogs = await countLogEntries(tomato!.id);
    const basilLogs = await countLogEntries(basil!.id);

    expect(tomatoLogs).toHaveLength(1);
    expect(tomatoLogs[0].activityType).toBe("PRUNING");
    expect(basilLogs).toHaveLength(1);
    expect(basilLogs[0].activityType).toBe("PRUNING");
  });

  test("switching activity resets the selection back to whatever is actually due", async ({ page }) => {
    const nickname = e2eName("Selectie-reset tomaat");

    await page.goto("/planten/nieuw");
    await page.getByLabel("Wat is het?").selectOption({ label: "🍅 Tomaat" });
    await page.getByLabel("Geef het een naam").fill(nickname);
    // Not due for anything yet (planted today) — so it should start unchecked.
    await page.getByRole("button", { name: "Plant toevoegen" }).click();
    await expect(page.getByRole("heading", { name: nickname })).toBeVisible();

    await page.goto("/loggen");
    const row = page.locator("label", { hasText: nickname });

    // A freshly planted tomato isn't due for anything, so it starts unchecked
    // under the default activity (Water geven).
    await expect(row.getByRole("checkbox")).not.toBeChecked();

    // Manually check it, then switch activities — the manual check should
    // not leak into the new activity's selection.
    await row.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Oogsten", exact: true }).click();
    await expect(row.getByRole("checkbox")).not.toBeChecked();
  });
});
