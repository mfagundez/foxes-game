import { describe, expect, it } from "vitest";
import { blockPaletteIndex, loadPuzzle, puzzleSize } from "./puzzle";

describe("provisional puzzle integrity", () => {
  const puzzle = loadPuzzle();
  const size = puzzleSize(puzzle);

  it("is 5x5", () => {
    expect(size).toBe(5);
  });

  it("has every row of length N", () => {
    for (const row of puzzle.blocks) {
      expect(row).toHaveLength(size);
    }
  });

  it("has exactly N distinct blocks numbered 1..N", () => {
    const distinct = new Set(puzzle.blocks.flat());
    expect([...distinct].sort((a, b) => a - b)).toEqual(
      Array.from({ length: size }, (_, i) => i + 1),
    );
  });

  it("has every block contiguous by orthogonal adjacency", () => {
    for (let block = 1; block <= size; block++) {
      const cells: [number, number][] = [];
      puzzle.blocks.forEach((row, r) =>
        row.forEach((value, c) => {
          if (value === block) cells.push([r, c]);
        }),
      );
      const [start] = cells;
      expect(start).toBeDefined();

      const seen = new Set<string>();
      const pending: [number, number][] = start ? [start] : [];
      while (pending.length > 0) {
        const [r, c] = pending.pop() as [number, number];
        if (seen.has(`${r},${c}`) || puzzle.blocks[r]?.[c] !== block) continue;
        seen.add(`${r},${c}`);
        pending.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
      }
      expect(seen.size).toBe(cells.length);
    }
  });
});

describe("blockPaletteIndex", () => {
  const puzzle = loadPuzzle();
  const cells = puzzle.blocks.flatMap((row) => row.map((block) => block));

  it("gives equal blocks the same index and different blocks different indices", () => {
    for (const a of cells) {
      for (const b of cells) {
        expect(blockPaletteIndex(a) === blockPaletteIndex(b)).toBe(a === b);
      }
    }
  });

  it("is stable across calls", () => {
    expect(blockPaletteIndex(3)).toBe(blockPaletteIndex(3));
  });
});
