import "./style.css";
import {
  advanceCell,
  cellLabel,
  cellStateAt,
  createInitialState,
  type CellState,
} from "./board-state";
import { createHighlightScheduler } from "./highlight-scheduler";
import { findConflictingFoxes, type CellPosition } from "./placement-rules";
import {
  blockPaletteIndex,
  loadPuzzle,
  puzzleSize,
  type PuzzleDefinition,
} from "./puzzle";

const CELL_CONTENT: Record<CellState, string> = {
  empty: "",
  grass: "🌱",
  fox: "🦊",
};

const CONFLICT_HIGHLIGHT_DELAY_MS = 1000;

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

  const activate = (row: number, column: number): void => {
    board = advanceCell(board, row, column);
    const conflicts = findConflictingFoxes(board, puzzle.blocks);
    highlighted = new Set();
    scheduler.cancel();
    if (conflicts.length > 0) {
      scheduler.schedule(conflicts);
    }
    renderAll();
  };

  const boardElement = document.createElement("div");
  boardElement.className = "board";
  boardElement.setAttribute("role", "group");
  boardElement.setAttribute("aria-label", "Tablero");
  boardElement.style.setProperty("--size", String(size));

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
  root.replaceChildren(boardElement);
}

const root = document.querySelector<HTMLElement>("#app");
if (root === null) {
  throw new Error("Missing #app container");
}
mountBoard(root, loadPuzzle());
