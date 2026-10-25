import type { Page } from "@playwright/test";
import { loadPuzzle } from "../../src/puzzle";
import { expect, test } from "./fixtures";

const puzzle = loadPuzzle();

function blockOf(row: number, column: number): number {
  const block = puzzle.blocks[row - 1]?.[column - 1];
  if (block === undefined) throw new Error(`No cell at ${row},${column}`);
  return block;
}

function cell(page: Page, row: number, column: number, state: string) {
  return page.getByRole("button", {
    name: `fila ${row}, columna ${column}, bloque ${blockOf(row, column)}: ${state}`,
    exact: true,
  });
}

function conflictCells(page: Page) {
  return page.locator(".cell[data-conflict]");
}

async function placeFox(page: Page, row: number, column: number) {
  await cell(page, row, column, "vacía").click();
  await cell(page, row, column, "césped").click();
  await expect(cell(page, row, column, "zorro")).toBeVisible();
}

async function openWithClock(page: Page) {
  await page.clock.install({ time: new Date("2026-01-01T10:00:00Z") });
  await page.goto("/");
  await page.clock.pauseAt(new Date("2026-01-01T10:01:00Z"));
}

async function expectHighlighted(page: Page, cells: [number, number][]) {
  await expect(conflictCells(page)).toHaveCount(cells.length);
  for (const [row, column] of cells) {
    await expect(
      cell(page, row, column, "zorro, en conflicto"),
    ).toHaveAttribute("data-conflict", "");
  }
}

test.describe("reglas de colocación", () => {
  test("el resaltado aparece a 1 s de la activación y no antes", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);

    await page.clock.runFor(999);
    await expect(conflictCells(page)).toHaveCount(0);
    await expect(cell(page, 1, 1, "zorro")).toBeVisible();

    await page.clock.runFor(1);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
  });

  test("solo se resaltan los zorros implicados, no su fila, columna ni bloque", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);
    await placeFox(page, 2, 3);
    await cell(page, 1, 2, "vacía").click();

    await page.clock.runFor(1000);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
    await expect(cell(page, 2, 3, "zorro")).not.toHaveAttribute(
      "data-conflict",
      "",
    );
    await expect(cell(page, 1, 2, "césped")).toBeVisible();
  });

  test("sin conflictos no hay resaltado", async ({ page }) => {
    await openWithClock(page);
    for (const [row, column] of [
      [1, 1],
      [2, 3],
      [3, 5],
      [4, 2],
    ] as const) {
      await placeFox(page, row, column);
    }

    await page.clock.runFor(5000);
    await expect(conflictCells(page)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /en conflicto/ }),
    ).toHaveCount(0);
  });

  test("una activación dentro del segundo cancela el resaltado pendiente y lo reinicia", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);

    await page.clock.runFor(600);
    await cell(page, 5, 3, "vacía").click();
    await page.clock.runFor(600);
    await expect(conflictCells(page)).toHaveCount(0);

    await page.clock.runFor(400);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
  });

  test("varias activaciones rápidas dan un solo resaltado, 1 s después de la última", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    for (const [row, column] of [
      [1, 5],
      [5, 3],
      [4, 2],
    ] as const) {
      await cell(page, row, column, "vacía").click();
      await page.clock.runFor(200);
    }
    await cell(page, 1, 5, "césped").click();
    await page.clock.runFor(999);
    await expect(conflictCells(page)).toHaveCount(0);

    await page.clock.runFor(1);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
  });

  test("teclado: Enter y Espacio programan el resaltado", async ({ page }) => {
    await openWithClock(page);
    await cell(page, 1, 1, "vacía").focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    await cell(page, 1, 5, "vacía").focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");

    await page.clock.runFor(999);
    await expect(conflictCells(page)).toHaveCount(0);
    await page.clock.runFor(1);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
  });

  test("corrección rápida: crear y deshacer un conflicto en menos de 1 s no muestra resaltado", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);
    await page.clock.runFor(400);
    await cell(page, 1, 5, "zorro").click();

    await expect(conflictCells(page)).toHaveCount(0);
    await page.clock.runFor(5000);
    await expect(conflictCells(page)).toHaveCount(0);
    await expect(cell(page, 1, 5, "vacía")).toBeVisible();
  });

  test("activar con el resaltado visible lo borra de inmediato y no reaparece antes de 1 s", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);
    await page.clock.runFor(1000);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);

    await cell(page, 5, 3, "vacía").click();
    await expect(conflictCells(page)).toHaveCount(0);
    await expect(cell(page, 1, 1, "zorro")).toBeVisible();
    await expect(cell(page, 1, 5, "zorro")).toBeVisible();

    await page.clock.runFor(999);
    await expect(conflictCells(page)).toHaveCount(0);
    await page.clock.runFor(1);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
  });

  test("quitar un zorro y quedar sin conflictos: se borra y no reaparece", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);
    await page.clock.runFor(1000);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);

    await cell(page, 1, 5, "zorro, en conflicto").click();
    await expect(conflictCells(page)).toHaveCount(0);
    await page.clock.runFor(5000);
    await expect(conflictCells(page)).toHaveCount(0);
  });

  test("quitar un zorro y seguir con conflictos: reaparecen solo los que siguen en conflicto", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 1, 5);
    await placeFox(page, 3, 1);
    await page.clock.runFor(1000);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
      [3, 1],
    ]);

    await cell(page, 3, 1, "zorro, en conflicto").click();
    await expect(conflictCells(page)).toHaveCount(0);
    await page.clock.runFor(999);
    await expect(conflictCells(page)).toHaveCount(0);
    await page.clock.runFor(1);
    await expectHighlighted(page, [
      [1, 1],
      [1, 5],
    ]);
  });

  test("nombre accesible: con sufijo mientras está resaltada y sin él después de activar", async ({
    page,
  }) => {
    await openWithClock(page);
    await placeFox(page, 1, 1);
    await placeFox(page, 2, 2);
    await expect(cell(page, 1, 1, "zorro")).toBeVisible();

    await page.clock.runFor(1000);
    await expect(cell(page, 1, 1, "zorro, en conflicto")).toBeVisible();
    await expect(cell(page, 2, 2, "zorro, en conflicto")).toBeVisible();

    await cell(page, 5, 3, "vacía").click();
    await expect(cell(page, 1, 1, "zorro")).toBeVisible();
    await expect(cell(page, 2, 2, "zorro")).toBeVisible();
  });
});
