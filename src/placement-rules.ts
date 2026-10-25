import { cellStateAt, type BoardState } from "./board-state";

export interface CellPosition {
  readonly row: number;
  readonly column: number;
}

function inConflict(
  a: CellPosition,
  b: CellPosition,
  blocks: readonly (readonly number[])[],
): boolean {
  const sameBlock = blocks[a.row]?.[a.column] === blocks[b.row]?.[b.column];
  const adjacent =
    Math.abs(a.row - b.row) <= 1 && Math.abs(a.column - b.column) <= 1;
  return sameBlock || a.row === b.row || a.column === b.column || adjacent;
}

/**
 * Fox cells (0-based, in row-major order) that conflict with at least one other fox: same block,
 * same row, same column or adjacent (8 neighbours). Empty and grass cells never count.
 * Throws a RangeError if `blocks` and `board` differ in dimensions.
 */
export function findConflictingFoxes(
  board: BoardState,
  blocks: readonly (readonly number[])[],
): readonly CellPosition[] {
  if (
    blocks.length !== board.length ||
    blocks.some((blockRow, r) => blockRow.length !== board[r]?.length)
  ) {
    throw new RangeError("Blocks and board have different dimensions");
  }

  const foxes: CellPosition[] = [];
  board.forEach((boardRow, row) => {
    boardRow.forEach((_, column) => {
      if (cellStateAt(board, row, column) === "fox") {
        foxes.push({ row, column });
      }
    });
  });

  return foxes.filter((fox) =>
    foxes.some((other) => other !== fox && inConflict(fox, other, blocks)),
  );
}
