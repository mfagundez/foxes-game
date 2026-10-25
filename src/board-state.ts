export type CellState = "empty" | "grass" | "fox";

export type BoardState = readonly (readonly CellState[])[];

const NEXT_CELL_STATE: Record<CellState, CellState> = {
  empty: "grass",
  grass: "fox",
  fox: "empty",
};

const CELL_STATE_LABEL: Record<CellState, string> = {
  empty: "vacía",
  grass: "césped",
  fox: "zorro",
};

export function nextCellState(state: CellState): CellState {
  return NEXT_CELL_STATE[state];
}

export function createInitialState(size: number): BoardState {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, (): CellState => "empty"),
  );
}

export function cellStateAt(
  board: BoardState,
  row: number,
  column: number,
): CellState {
  const state = board[row]?.[column];
  if (state === undefined) {
    throw new RangeError(`Cell (${row}, ${column}) is outside the board`);
  }
  return state;
}

/** Returns a new board where only the cell at (`row`, `column`), 0-based, has advanced one state. */
export function advanceCell(
  board: BoardState,
  row: number,
  column: number,
): BoardState {
  const next = nextCellState(cellStateAt(board, row, column));
  return board.map((boardRow, r) =>
    r === row
      ? boardRow.map((state, c) => (c === column ? next : state))
      : boardRow,
  );
}

/**
 * Accessible name of a cell. `row` and `column` are 0-based; the name numbers them from 1.
 * A fox flagged `inConflict` gets the suffix ", en conflicto".
 */
export function cellLabel(
  row: number,
  column: number,
  block: number,
  state: CellState,
  inConflict = false,
): string {
  const suffix = state === "fox" && inConflict ? ", en conflicto" : "";
  return `fila ${row + 1}, columna ${column + 1}, bloque ${block}: ${CELL_STATE_LABEL[state]}${suffix}`;
}
