import "./style.css";
import {
  advanceCell,
  cellLabel,
  cellStateAt,
  createInitialState,
  type CellState,
} from "./board-state";
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

function mountBoard(root: HTMLElement, puzzle: PuzzleDefinition): void {
  const size = puzzleSize(puzzle);
  let board = createInitialState(size);

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

    blockRow.forEach((block, column) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";
      button.dataset["palette"] = String(blockPaletteIndex(block));

      const content = document.createElement("span");
      content.setAttribute("aria-hidden", "true");
      button.append(content);

      const render = (): void => {
        const state = cellStateAt(board, row, column);
        content.textContent = CELL_CONTENT[state];
        button.setAttribute("aria-label", cellLabel(row, column, block, state));
      };
      button.addEventListener("click", () => {
        board = advanceCell(board, row, column);
        render();
      });
      render();

      rowElement.append(button);
    });

    boardElement.append(rowElement);
  });

  root.replaceChildren(boardElement);
}

const root = document.querySelector<HTMLElement>("#app");
if (root === null) {
  throw new Error("Missing #app container");
}
mountBoard(root, loadPuzzle());
