import type { Locator, Page } from "@playwright/test";
import { loadPuzzle } from "../../src/puzzle";
import { expect, test } from "./fixtures";

const puzzle = loadPuzzle();

// Valid solution of the fixed puzzle as 1-based [row, column] pairs.
const SOLUTION: readonly (readonly [number, number])[] = [
  [1, 2],
  [2, 4],
  [3, 1],
  [4, 3],
  [5, 5],
];

const START = new Date("2026-01-01T10:00:00Z");

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

function timer(page: Page) {
  return page.getByRole("timer");
}

function victory(page: Page) {
  return page.locator(".victory");
}

function announcer(page: Page) {
  return page.getByRole("status");
}

async function placeFox(page: Page, row: number, column: number) {
  await cell(page, row, column, "vacía").click();
  await cell(page, row, column, "césped").click();
  await expect(cell(page, row, column, "zorro")).toBeVisible();
}

async function placeFoxes(
  page: Page,
  foxes: readonly (readonly [number, number])[],
) {
  for (const [row, column] of foxes) {
    await placeFox(page, row, column);
  }
}

/** Opens the page with the clock paused, so the game starts at exactly 00:00. */
async function openPaused(page: Page) {
  await page.clock.install({ time: START });
  await page.clock.pauseAt(new Date(START.getTime() + 1000));
  await page.goto("/");
}

async function expectBoardUnchanged(page: Page) {
  for (const [row, column] of SOLUTION) {
    await expect(cell(page, row, column, "zorro")).toBeVisible();
  }
  await expect(page.locator(".cell")).toHaveCount(25);
  await expect(page.getByRole("button", { name: /: césped/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /: zorro/ })).toHaveCount(5);
}

async function winAt(page: Page, elapsedMs: number) {
  await placeFoxes(page, SOLUTION.slice(0, 4));
  await page.clock.runFor(elapsedMs);
  await placeFox(page, ...SOLUTION[4]!);
}

test.describe("cronómetro", () => {
  test("arranca en 00:00 al cargar y avanza con el tiempo", async ({
    page,
  }) => {
    await openPaused(page);
    await expect(timer(page)).toHaveText("00:00");
    await expect(victory(page)).toBeHidden();

    await page.clock.runFor(3000);
    await expect(timer(page)).toHaveText("00:03");
  });

  test("trunca hacia abajo a segundos", async ({ page }) => {
    await openPaused(page);
    await page.clock.runFor(999);
    await expect(timer(page)).toHaveText("00:00");
    await page.clock.runFor(1);
    await expect(timer(page)).toHaveText("00:01");
  });

  test("sigue contando con la pestaña en segundo plano (salto de reloj)", async ({
    page,
  }) => {
    await openPaused(page);
    await page.clock.fastForward(30_000);
    await expect(timer(page)).toHaveText("00:30");
  });

  for (const [elapsed, expected] of [
    [59_000, "00:59"],
    [599_000, "09:59"],
    [600_000, "10:00"],
    [4_503_000, "75:03"],
    [6_000_000, "100:00"],
  ] as const) {
    test(`formato mm:ss: ${expected}`, async ({ page }) => {
      await openPaused(page);
      await page.clock.fastForward(elapsed);
      await expect(timer(page)).toHaveText(expected);
    });
  }

  test("escritorio: encima del tablero y alineado a su derecha", async ({
    page,
  }) => {
    await openPaused(page);
    const timerBox = await timer(page).boundingBox();
    const boardBox = await page
      .getByRole("group", { name: "Tablero" })
      .boundingBox();
    expect(timerBox).not.toBeNull();
    expect(boardBox).not.toBeNull();
    expect(timerBox!.y + timerBox!.height).toBeLessThanOrEqual(boardBox!.y);
    // The timer box spans the board width and its text is right-aligned.
    expect(timerBox!.x + timerBox!.width).toBeCloseTo(
      boardBox!.x + boardBox!.width,
      0,
    );
    expect(
      await timer(page).evaluate((e) => getComputedStyle(e).textAlign),
    ).toBe("right");
  });

  test("móvil de 320 px: sin scroll horizontal y cronómetro sobre el tablero", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openPaused(page);
    await page.clock.fastForward(6_000_000);
    await expect(timer(page)).toHaveText("100:00");

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const timerBox = await timer(page).boundingBox();
    const boardBox = await page
      .getByRole("group", { name: "Tablero" })
      .boundingBox();
    expect(timerBox!.y + timerBox!.height).toBeLessThanOrEqual(boardBox!.y);
  });
});

test.describe("victoria", () => {
  test("se gana al colocar el 5.º zorro de una disposición válida, con césped en otras celdas", async ({
    page,
  }) => {
    await openPaused(page);
    await cell(page, 1, 1, "vacía").click();
    await expect(cell(page, 1, 1, "césped")).toBeVisible();
    await placeFoxes(page, SOLUTION.slice(0, 4));
    await expect(victory(page)).toBeHidden();
    await expect(announcer(page)).toHaveText("");

    await placeFox(page, ...SOLUTION[4]!);
    await expect(victory(page)).toBeVisible();
    await expect(page.locator(".victory-title")).toHaveText("¡Victoria!");
  });

  test("cualquier disposición válida cuenta (otra solución del puzzle)", async ({
    page,
  }) => {
    await openPaused(page);
    await placeFoxes(page, [
      [1, 4],
      [2, 1],
      [3, 3],
      [4, 5],
      [5, 2],
    ]);
    await expect(victory(page)).toBeVisible();
  });

  test("con 5 zorros y algún conflicto no hay victoria y el cronómetro sigue", async ({
    page,
  }) => {
    await openPaused(page);
    await placeFoxes(page, [...SOLUTION.slice(0, 4), [5, 4]]);
    await page.clock.runFor(5000);
    await expect(victory(page)).toBeHidden();
    await expect(timer(page)).toHaveText("00:05");
    await expect(timer(page)).toHaveAttribute("role", "timer");
    await expect(announcer(page)).toHaveText("");
  });

  test("recargar con una partida en curso empieza otra en 00:00 con el tablero vacío", async ({
    page,
  }) => {
    await openPaused(page);
    await placeFoxes(page, SOLUTION.slice(0, 2));
    await page.clock.runFor(5000);
    await expect(timer(page)).toHaveText("00:05");

    await page.reload();

    await expect(timer(page)).toHaveText("00:00");
    await expect(page.getByRole("button", { name: /: vacía/ })).toHaveCount(25);
    await expect(victory(page)).toBeHidden();
    await expect(announcer(page)).toHaveText("");
  });

  test("con menos de 5 zorros no hay victoria", async ({ page }) => {
    await openPaused(page);
    await placeFoxes(page, SOLUTION.slice(0, 4));
    await page.clock.runFor(2000);
    await expect(victory(page)).toBeHidden();
    await expect(timer(page)).toHaveText("00:02");
  });

  test("quitar un zorro de una disposición con 5 en conflicto no da la victoria", async ({
    page,
  }) => {
    await openPaused(page);
    await placeFoxes(page, [...SOLUTION.slice(0, 4), [5, 4]]);
    await cell(page, 5, 4, "zorro").click();
    await expect(cell(page, 5, 4, "vacía")).toBeVisible();
    await expect(victory(page)).toBeHidden();
  });

  test("el cronómetro se para en la victoria y el mensaje muestra el mismo tiempo", async ({
    page,
  }) => {
    await openPaused(page);
    await winAt(page, 67_000);

    await expect(timer(page)).toHaveText("01:07");
    await expect(page.locator(".victory-time")).toHaveText("01:07");
    await page.clock.runFor(60_000);
    await expect(timer(page)).toHaveText("01:07");
    await expect(page.locator(".victory-time")).toHaveText("01:07");
    await expect(timer(page)).toBeVisible();
  });

  test("victoria dentro del segundo: el valor se trunca (1500 ms → 00:01)", async ({
    page,
  }) => {
    await openPaused(page);
    await winAt(page, 1500);
    await expect(timer(page)).toHaveText("00:01");
    await expect(page.locator(".victory-time")).toHaveText("00:01");
  });

  test("el tablero sigue visible bajo el mensaje", async ({ page }) => {
    await openPaused(page);
    await winAt(page, 1000);
    await expect(victory(page)).toBeVisible();
    await expect(page.locator(".cell")).toHaveCount(25);
    await expectBoardUnchanged(page);
    const frame = await page.locator(".board-frame").boundingBox();
    const message = await page.locator(".victory-message").boundingBox();
    expect(message!.x).toBeGreaterThanOrEqual(frame!.x);
    expect(message!.x + message!.width).toBeLessThanOrEqual(
      frame!.x + frame!.width,
    );
  });

  test("no queda resaltado de conflicto pendiente tras ganar", async ({
    page,
  }) => {
    await openPaused(page);
    await placeFoxes(page, [...SOLUTION.slice(0, 4), [5, 4]]);
    // Fixing the conflict wins right away; the pending highlight must not show up.
    await cell(page, 5, 4, "zorro").click();
    await placeFox(page, ...SOLUTION[4]!);
    await expect(victory(page)).toBeVisible();
    await page.clock.runFor(5000);
    await expect(page.locator(".cell[data-conflict]")).toHaveCount(0);
  });
});

test.describe("victoria con resaltado visible", () => {
  test("retirar el zorro sobrante con el resaltado visible no deja conflictos en el tablero bloqueado", async ({
    page,
  }) => {
    await openPaused(page);
    await placeFox(page, 5, 1);
    await placeFoxes(page, SOLUTION);
    await page.clock.runFor(1500);
    await expect(page.locator(".cell[data-conflict]")).not.toHaveCount(0);
    await expect(victory(page)).toBeHidden();

    await cell(page, 5, 1, "zorro, en conflicto").click();

    await expect(victory(page)).toBeVisible();
    await expect(page.locator(".cell[data-conflict]")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /en conflicto/ }),
    ).toHaveCount(0);
  });
});

test.describe("tablero bloqueado tras la victoria", () => {
  async function lockedBoard(page: Page) {
    await openPaused(page);
    await winAt(page, 1000);
    await expect(victory(page)).toBeVisible();
  }

  async function expectNoChange(page: Page, target: Locator) {
    await expectBoardUnchanged(page);
    await expect(target).toBeVisible();
  }

  test("no responde al clic", async ({ page }) => {
    await lockedBoard(page);
    // The overlay lets pointer events through; `force` skips the disabled-state wait.
    await cell(page, 1, 2, "zorro").click({ force: true });
    await cell(page, 3, 3, "vacía").click({ force: true });
    await expectNoChange(page, cell(page, 3, 3, "vacía"));
  });

  test("no responde a Enter ni a Espacio", async ({ page }) => {
    await lockedBoard(page);
    const target = cell(page, 3, 3, "vacía");
    await target.focus();
    await expect(target).toBeFocused();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Space");
    await expectNoChange(page, target);
  });

  test("conserva el foco de teclado en las celdas", async ({ page }) => {
    await lockedBoard(page);
    // The last fox was placed with the pointer, so focus sits on cell (5,5): go back one cell.
    await page.keyboard.press("Shift+Tab");
    const previous = cell(page, 5, 4, "vacía");
    await expect(previous).toBeFocused();
    await expect(page.locator(".cell:focus-visible")).toHaveCount(1);
    await expect(previous).toHaveCount(1);
    expect(
      await previous.evaluate((element) => element.matches(":focus-visible")),
    ).toBe(true);
  });

  test("marca las celdas como no operables sin cambiar su nombre accesible", async ({
    page,
  }) => {
    await lockedBoard(page);
    await expect(page.locator(".cell[aria-disabled='true']")).toHaveCount(25);
    for (const [row, column] of SOLUTION) {
      await expect(cell(page, row, column, "zorro")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
    await expect(cell(page, 3, 3, "vacía")).toBeVisible();
    await expect(cell(page, 1, 1, "vacía")).toBeVisible();
  });

  test("anuncia la victoria y el tiempo en una región de estado", async ({
    page,
  }) => {
    await openPaused(page);
    await winAt(page, 67_000);
    await expect(announcer(page)).toHaveText(
      "¡Victoria! Tiempo empleado: 01:07",
    );
    await expect(announcer(page)).toHaveAttribute("role", "status");
  });

  test("recargar empieza una partida nueva en 00:00 con el tablero vacío", async ({
    page,
  }) => {
    await lockedBoard(page);
    await page.reload();
    await expect(timer(page)).toHaveText("00:00");
    await expect(victory(page)).toBeHidden();
    await expect(announcer(page)).toHaveText("");
    await expect(page.getByRole("button", { name: /: vacía/ })).toHaveCount(25);
    await expect(page.locator(".cell[aria-disabled]")).toHaveCount(0);
  });
});

test.describe("tablero bloqueado: toque", () => {
  test.use({ hasTouch: true });

  test("no responde al toque tras la victoria", async ({ page }) => {
    await openPaused(page);
    await winAt(page, 1000);
    await expect(victory(page)).toBeVisible();

    await cell(page, 1, 2, "zorro").tap({ force: true });
    await cell(page, 3, 3, "vacía").tap({ force: true });
    await expectBoardUnchanged(page);
    await expect(cell(page, 3, 3, "vacía")).toBeVisible();
  });
});
