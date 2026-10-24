import { expect, test } from "./fixtures";

test("la página carga con el título Foxes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Foxes");
});
