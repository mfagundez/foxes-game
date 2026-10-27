import { describe, expect, it } from "vitest";
import { createInitialState, type BoardState } from "./board-state";
import { loadPuzzle } from "./puzzle";
import { isVictory } from "./victory";

const { blocks } = loadPuzzle();

// Columns (0-based) of the fox in each row; every one is a valid solution of the fixed puzzle.
const SOLUTIONS = [
  [1, 3, 0, 2, 4],
  [1, 4, 2, 0, 3],
  [2, 4, 1, 3, 0],
  [3, 0, 2, 4, 1],
] as const;

function boardWith(
  foxes: readonly (readonly [number, number])[],
  grass: readonly (readonly [number, number])[] = [],
): BoardState {
  return createInitialState(5).map((boardRow, row) =>
    boardRow.map((_, column) => {
      if (foxes.some(([r, c]) => r === row && c === column)) return "fox";
      if (grass.some(([r, c]) => r === row && c === column)) return "grass";
      return "empty";
    }),
  );
}

function solutionFoxes(columns: readonly number[]): [number, number][] {
  return columns.map((column, row) => [row, column]);
}

describe("isVictory", () => {
  it.each(SOLUTIONS)("accepts valid solution %#", (...columns) => {
    expect(isVictory(boardWith(solutionFoxes(columns)), blocks)).toBe(true);
  });

  it("is not affected by grass cells", () => {
    const board = boardWith(solutionFoxes(SOLUTIONS[0]), [
      [0, 0],
      [4, 4],
      [2, 2],
    ]);
    expect(isVictory(board, blocks)).toBe(true);
  });

  it("is false on an empty board", () => {
    expect(isVictory(createInitialState(5), blocks)).toBe(false);
  });

  it("is false with fewer than N foxes and no conflict", () => {
    expect(
      isVictory(boardWith(solutionFoxes(SOLUTIONS[0]).slice(0, 4)), blocks),
    ).toBe(false);
  });

  it("is false with N foxes when two are in conflict", () => {
    const foxes = solutionFoxes(SOLUTIONS[0]);
    foxes[4] = [4, 3]; // same column as row 2 and adjacent to row 3
    expect(isVictory(boardWith(foxes), blocks)).toBe(false);
  });

  it("is false with more than N foxes", () => {
    const foxes = [...solutionFoxes(SOLUTIONS[0]), [0, 4] as [number, number]];
    expect(isVictory(boardWith(foxes), blocks)).toBe(false);
  });

  it("throws a RangeError when board and blocks differ in dimensions", () => {
    expect(() => isVictory(createInitialState(4), blocks)).toThrow(RangeError);
  });
});
