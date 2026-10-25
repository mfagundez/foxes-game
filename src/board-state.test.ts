import { describe, expect, it } from "vitest";
import {
  advanceCell,
  cellLabel,
  cellStateAt,
  createInitialState,
  nextCellState,
} from "./board-state";

describe("createInitialState", () => {
  it("creates an N x N board with every cell empty", () => {
    const board = createInitialState(5);
    expect(board).toHaveLength(5);
    for (const row of board) {
      expect(row).toEqual(["empty", "empty", "empty", "empty", "empty"]);
    }
  });
});

describe("nextCellState", () => {
  it("cycles empty -> grass -> fox -> empty", () => {
    expect(nextCellState("empty")).toBe("grass");
    expect(nextCellState("grass")).toBe("fox");
    expect(nextCellState("fox")).toBe("empty");
  });
});

describe("advanceCell", () => {
  it("completes the cycle in three activations", () => {
    let board = createInitialState(5);
    const seen = [];
    for (let i = 0; i < 3; i++) {
      board = advanceCell(board, 2, 3);
      seen.push(cellStateAt(board, 2, 3));
    }
    expect(seen).toEqual(["grass", "fox", "empty"]);
  });

  it("leaves every other cell untouched", () => {
    const board = advanceCell(createInitialState(5), 1, 4);
    board.forEach((row, r) =>
      row.forEach((state, c) => {
        expect(state).toBe(r === 1 && c === 4 ? "grass" : "empty");
      }),
    );
  });

  it("does not mutate the previous board", () => {
    const before = createInitialState(5);
    const snapshot = JSON.stringify(before);
    advanceCell(before, 0, 0);
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it("rejects cells outside the board", () => {
    const board = createInitialState(5);
    expect(() => advanceCell(board, 5, 0)).toThrow(RangeError);
    expect(() => advanceCell(board, 0, -1)).toThrow(RangeError);
  });
});

describe("cellLabel", () => {
  it("numbers rows and columns from 1 and uses the block number", () => {
    expect(cellLabel(0, 0, 1, "empty")).toBe(
      "fila 1, columna 1, bloque 1: vacía",
    );
    expect(cellLabel(1, 2, 3, "grass")).toBe(
      "fila 2, columna 3, bloque 3: césped",
    );
    expect(cellLabel(4, 4, 5, "fox")).toBe(
      "fila 5, columna 5, bloque 5: zorro",
    );
  });
});
