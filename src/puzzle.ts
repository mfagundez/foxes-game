export interface PuzzleDefinition {
  /** `blocks[row][column]` is the block number (1..N) of that cell; N = `blocks.length`. */
  readonly blocks: readonly (readonly number[])[];
}

// Provisional fixture: it has several valid solutions. The future puzzle generator will
// guarantee a unique one and replace it.
const PROVISIONAL_PUZZLE: PuzzleDefinition = {
  blocks: [
    [1, 1, 1, 2, 2],
    [1, 3, 3, 2, 2],
    [4, 3, 3, 2, 5],
    [4, 4, 3, 5, 5],
    [4, 4, 5, 5, 5],
  ],
};

export function loadPuzzle(): PuzzleDefinition {
  return PROVISIONAL_PUZZLE;
}

export function puzzleSize(puzzle: PuzzleDefinition): number {
  return puzzle.blocks.length;
}

/** Palette index (0-based) of a block number (1-based). The palette covers N <= 5. */
export function blockPaletteIndex(block: number): number {
  return block - 1;
}
