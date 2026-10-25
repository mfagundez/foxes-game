import { describe, expect, it } from "vitest";
import { createInitialState, type BoardState } from "./board-state";
import { findConflictingFoxes } from "./placement-rules";
import { loadPuzzle } from "./puzzle";

const { blocks } = loadPuzzle();

/** Board with a fox at each (row, column) given 1-based, as in the specs; grass at `grass`. */
function boardWith(
  foxes: readonly (readonly [number, number])[],
  grass: readonly (readonly [number, number])[] = [],
): BoardState {
  const board = createInitialState(5).map((row) => [...row]);
  for (const [r, c] of grass) board[r - 1]![c - 1] = "grass";
  for (const [r, c] of foxes) board[r - 1]![c - 1] = "fox";
  return board;
}

function conflicts(
  foxes: readonly (readonly [number, number])[],
  grass: readonly (readonly [number, number])[] = [],
): string[] {
  return findConflictingFoxes(boardWith(foxes, grass), blocks).map(
    ({ row, column }) => `${row + 1},${column + 1}`,
  );
}

describe("findConflictingFoxes", () => {
  it("flags two foxes in the same block", () => {
    expect(
      conflicts([
        [1, 5],
        [3, 4],
      ]),
    ).toEqual(["1,5", "3,4"]);
  });

  it("ignores two foxes in different blocks, rows, columns and not adjacent", () => {
    expect(
      conflicts([
        [1, 1],
        [3, 4],
      ]),
    ).toEqual([]);
  });

  it("flags two foxes in the same row", () => {
    expect(
      conflicts([
        [1, 1],
        [1, 5],
      ]),
    ).toEqual(["1,1", "1,5"]);
  });

  it("flags two foxes in the same column", () => {
    expect(
      conflicts([
        [1, 1],
        [5, 1],
      ]),
    ).toEqual(["1,1", "5,1"]);
  });

  it("flags two diagonally adjacent foxes", () => {
    expect(
      conflicts([
        [1, 1],
        [2, 2],
      ]),
    ).toEqual(["1,1", "2,2"]);
  });

  it("ignores foxes separated by one cell", () => {
    expect(
      conflicts([
        [1, 1],
        [2, 3],
      ]),
    ).toEqual([]);
  });

  it("ignores grass next to a fox", () => {
    expect(
      conflicts(
        [[1, 1]],
        [
          [1, 2],
          [2, 1],
          [2, 2],
        ],
      ),
    ).toEqual([]);
  });

  it("flags a fox involved in several conflicts once", () => {
    expect(
      conflicts([
        [1, 1],
        [1, 5],
        [3, 1],
      ]),
    ).toEqual(["1,1", "1,5", "3,1"]);
  });

  it("flags several simultaneous pairs and leaves the free fox out", () => {
    expect(
      conflicts([
        [1, 1],
        [1, 5],
        [3, 1],
        [4, 4],
        [5, 5],
        [2, 3],
      ]),
    ).toEqual(["1,1", "1,5", "3,1", "4,4", "5,5"]);
  });

  it("returns nothing for a board without conflicts", () => {
    expect(
      conflicts([
        [1, 1],
        [2, 3],
        [3, 5],
        [4, 2],
      ]),
    ).toEqual([]);
  });

  it("returns nothing for an empty board", () => {
    expect(conflicts([])).toEqual([]);
  });

  it("throws a RangeError when board and blocks differ in dimensions", () => {
    expect(() => findConflictingFoxes(createInitialState(4), blocks)).toThrow(
      RangeError,
    );
    expect(() =>
      findConflictingFoxes(createInitialState(5), blocks.slice(0, 4)),
    ).toThrow(RangeError);
  });

  it("does not mutate its arguments", () => {
    const board = boardWith([
      [1, 1],
      [1, 2],
    ]);
    const snapshot = JSON.stringify(board);
    findConflictingFoxes(board, blocks);
    expect(JSON.stringify(board)).toBe(snapshot);
  });
});
