import type { Page } from "@playwright/test";
import { loadPuzzle } from "../../src/puzzle";
import { expect, test } from "./fixtures";

const puzzle = loadPuzzle();

function cell(
  page: Page,
  row: number,
  column: number,
  block: number,
  state: string,
) {
  return page.getByRole("button", {
    name: `fila ${row}, columna ${column}, bloque ${block}: ${state}`,
    exact: true,
  });
}

function allCells(page: Page) {
  return page.getByRole("button", {
    name: /^fila \d+, columna \d+, bloque \d+: /i,
  });
}

test.describe("tablero", () => {
  test("carga: 25 celdas en 5 filas, todas vacías y con su nombre accesible", async ({
    page,
  }) => {
    await page.goto("/");

    const rows = page.getByRole("group", { name: /^Fila \d+$/ });
    await expect(rows).toHaveCount(5);
    for (let r = 0; r < 5; r++) {
      await expect(rows.nth(r).getByRole("button")).toHaveCount(5);
    }

    await expect(allCells(page)).toHaveCount(25);
    for (const [r, blockRow] of puzzle.blocks.entries()) {
      for (const [c, block] of blockRow.entries()) {
        const button = cell(page, r + 1, c + 1, block, "vacía");
        await expect(button).toBeVisible();
        await expect(button).toHaveText("");
      }
    }
    await expect(cell(page, 1, 1, 1, "vacía")).toBeVisible();
    await expect(cell(page, 5, 5, 5, "vacía")).toBeVisible();
  });

  test("ciclo con clic: vacía, césped, zorro, vacía, con el nombre accesible actualizado", async ({
    page,
  }) => {
    await page.goto("/");

    await cell(page, 2, 3, 3, "vacía").click();
    await expect(cell(page, 2, 3, 3, "césped")).toHaveText("🌱");
    await cell(page, 2, 3, 3, "césped").click();
    await expect(cell(page, 2, 3, 3, "zorro")).toHaveText("🦊");
    await cell(page, 2, 3, 3, "zorro").click();
    await expect(cell(page, 2, 3, 3, "vacía")).toHaveText("");
  });

  test("ciclo: la activación de una celda no afecta a las demás", async ({
    page,
  }) => {
    await page.goto("/");

    await cell(page, 2, 3, 3, "vacía").click();
    await expect(cell(page, 2, 3, 3, "césped")).toBeVisible();
    await expect(page.getByRole("button", { name: /: vacía$/ })).toHaveCount(
      24,
    );
    await expect(
      page.getByRole("button", { name: /: (césped|zorro)$/ }),
    ).toHaveCount(1);
  });

  test("teclado: Enter y Espacio avanzan el estado de la celda enfocada", async ({
    page,
  }) => {
    await page.goto("/");

    await cell(page, 1, 1, 1, "vacía").focus();
    await page.keyboard.press("Enter");
    await expect(cell(page, 1, 1, 1, "césped")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(cell(page, 1, 1, 1, "zorro")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(cell(page, 1, 1, 1, "vacía")).toBeFocused();
  });

  test("teclado: Tab recorre las 25 celdas", async ({ page }) => {
    await page.goto("/");

    for (const [r, blockRow] of puzzle.blocks.entries()) {
      for (const [c, block] of blockRow.entries()) {
        await page.keyboard.press("Tab");
        await expect(cell(page, r + 1, c + 1, block, "vacía")).toBeFocused();
      }
    }
  });

  test("recarga: todas las celdas vuelven a vacía", async ({ page }) => {
    await page.goto("/");

    await cell(page, 1, 1, 1, "vacía").click();
    await cell(page, 5, 5, 5, "vacía").click();
    await cell(page, 5, 5, 5, "césped").click();
    await expect(cell(page, 1, 1, 1, "césped")).toBeVisible();
    await expect(cell(page, 5, 5, 5, "zorro")).toBeVisible();

    await page.reload();

    await expect(page.getByRole("button", { name: /: vacía$/ })).toHaveCount(
      25,
    );
  });
});

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

test.describe("táctil y responsive en móvil", () => {
  test.use({ viewport: { width: 320, height: 640 }, hasTouch: true });

  test("táctil: tap en una celda recorre el ciclo", async ({ page }) => {
    await page.goto("/");

    await cell(page, 3, 2, 3, "vacía").tap();
    await expect(cell(page, 3, 2, 3, "césped")).toHaveText("🌱");
    await cell(page, 3, 2, 3, "césped").tap();
    await expect(cell(page, 3, 2, 3, "zorro")).toHaveText("🦊");
    await cell(page, 3, 2, 3, "zorro").tap();
    await expect(cell(page, 3, 2, 3, "vacía")).toHaveText("");
  });

  test("responsive: tablero completo y sin scroll horizontal a 320 px", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(allCells(page)).toHaveCount(25);
    expect(await hasHorizontalScroll(page)).toBe(false);
    for (const button of await allCells(page).all()) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
    }
  });
});

test.describe("responsive en escritorio", () => {
  test("responsive: escritorio con tablero completo y sin scroll horizontal", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(allCells(page)).toHaveCount(25);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});
