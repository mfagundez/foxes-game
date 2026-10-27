import type { BoardState } from "./board-state";
import { cellStateAt } from "./board-state";
import { findConflictingFoxes } from "./placement-rules";

/**
 * The game is won when the board holds exactly N foxes (N = number of blocks) and none of them is
 * in conflict. Grass and empty cells never prevent the victory.
 * Throws a RangeError if `blocks` and `board` differ in dimensions.
 */
export function isVictory(
  board: BoardState,
  blocks: readonly (readonly number[])[],
): boolean {
  const conflicts = findConflictingFoxes(board, blocks);
  const foxes = board.reduce(
    (total, boardRow, row) =>
      total +
      boardRow.filter((_, column) => cellStateAt(board, row, column) === "fox")
        .length,
    0,
  );
  return foxes === blocks.length && conflicts.length === 0;
}
