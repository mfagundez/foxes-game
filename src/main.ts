import "./style.css";
import {
  advanceCell,
  cellLabel,
  cellStateAt,
  createInitialState,
  type CellState,
} from "./board-state";
import { formatElapsed } from "./elapsed-format";
import { createHighlightScheduler } from "./highlight-scheduler";
import { findConflictingFoxes, type CellPosition } from "./placement-rules";
import {
  blockPaletteIndex,
  loadPuzzle,
  puzzleSize,
  type PuzzleDefinition,
} from "./puzzle";
import { createStopwatch } from "./stopwatch";
import { isVictory } from "./victory";

const CELL_CONTENT: Record<CellState, string> = {
  empty: "",
  grass: "🌱",
  fox: "🦊",
};

const CONFLICT_HIGHLIGHT_DELAY_MS = 1000;
const TIMER_REFRESH_MS = 250;

interface CellView {
  readonly button: HTMLButtonElement;
  readonly content: HTMLElement;
}

function positionKey(row: number, column: number): string {
  return `${row},${column}`;
}

function mountBoard(root: HTMLElement, puzzle: PuzzleDefinition): void {
  const size = puzzleSize(puzzle);
  let board = createInitialState(size);
  let highlighted = new Set<string>();
  const cells: CellView[][] = [];
  const stopwatch = createStopwatch(() => Date.now());

  const timerElement = document.createElement("div");
  timerElement.className = "timer";
  timerElement.setAttribute("role", "timer");

  const victoryTime = document.createElement("div");
  victoryTime.className = "victory-time";
  const victoryElement = document.createElement("div");
  victoryElement.className = "victory";
  victoryElement.hidden = true;
  victoryElement.setAttribute("aria-hidden", "true");
  const victoryMessage = document.createElement("div");
  victoryMessage.className = "victory-message";
  const victoryTitle = document.createElement("div");
  victoryTitle.className = "victory-title";
  victoryTitle.textContent = "¡Victoria!";
  victoryMessage.append(victoryTitle, victoryTime);
  victoryElement.append(victoryMessage);

  const announcer = document.createElement("div");
  announcer.className = "visually-hidden";
  announcer.setAttribute("role", "status");

  const renderTimer = (): void => {
    timerElement.textContent = formatElapsed(stopwatch.elapsedMs());
  };
  const timerInterval = setInterval(renderTimer, TIMER_REFRESH_MS);

  const renderAll = (): void => {
    puzzle.blocks.forEach((blockRow, row) => {
      blockRow.forEach((block, column) => {
        const view = cells[row]?.[column];
        if (view === undefined) return;
        const state = cellStateAt(board, row, column);
        const inConflict = highlighted.has(positionKey(row, column));
        view.content.textContent = CELL_CONTENT[state];
        view.button.toggleAttribute("data-conflict", inConflict);
        view.button.setAttribute(
          "aria-label",
          cellLabel(row, column, block, state, inConflict),
        );
      });
    });
  };

  const scheduler = createHighlightScheduler<readonly CellPosition[]>(
    CONFLICT_HIGHLIGHT_DELAY_MS,
    (conflicts) => {
      highlighted = new Set(conflicts.map((c) => positionKey(c.row, c.column)));
      renderAll();
    },
  );

  const finishGame = (): void => {
    stopwatch.stop();
    clearInterval(timerInterval);
    scheduler.cancel();
    highlighted = new Set();
    renderTimer();
    const time = formatElapsed(stopwatch.elapsedMs());
    victoryTime.textContent = time;
    victoryElement.hidden = false;
    announcer.textContent = `¡Victoria! Tiempo empleado: ${time}`;
    for (const view of cells.flat()) {
      view.button.setAttribute("aria-disabled", "true");
    }
  };

  const activate = (row: number, column: number): void => {
    if (stopwatch.isStopped()) return;
    board = advanceCell(board, row, column);
    if (isVictory(board, puzzle.blocks)) {
      finishGame();
      renderAll();
      return;
    }
    const conflicts = findConflictingFoxes(board, puzzle.blocks);
    highlighted = new Set();
    scheduler.cancel();
    if (conflicts.length > 0) {
      scheduler.schedule(conflicts);
    }
    renderAll();
  };

  const gameElement = document.createElement("div");
  gameElement.className = "game";
  gameElement.style.setProperty("--size", String(size));

  const boardElement = document.createElement("div");
  boardElement.className = "board";
  boardElement.setAttribute("role", "group");
  boardElement.setAttribute("aria-label", "Tablero");

  const boardFrame = document.createElement("div");
  boardFrame.className = "board-frame";

  puzzle.blocks.forEach((blockRow, row) => {
    const rowElement = document.createElement("div");
    rowElement.className = "row";
    rowElement.setAttribute("role", "group");
    rowElement.setAttribute("aria-label", `Fila ${row + 1}`);
    const rowViews: CellView[] = [];

    blockRow.forEach((block, column) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.dataset["palette"] = String(blockPaletteIndex(block));

      const content = document.createElement("span");
      content.setAttribute("aria-hidden", "true");
      button.append(content);

      button.addEventListener("click", () => {
        activate(row, column);
      });

      rowViews.push({ button, content });
      rowElement.append(button);
    });

    cells.push(rowViews);
    boardElement.append(rowElement);
  });

  renderAll();
  renderTimer();
  boardFrame.append(boardElement, victoryElement);
  gameElement.append(timerElement, boardFrame, announcer);
  root.replaceChildren(gameElement);
}

const root = document.querySelector<HTMLElement>("#app");
if (root === null) {
  throw new Error("Missing #app container");
}
mountBoard(root, loadPuzzle());
