import { describe, expect, it } from "vitest";
import { formatElapsed } from "./elapsed-format";

describe("formatElapsed", () => {
  it.each([
    [0, "00:00"],
    [999, "00:00"],
    [1000, "00:01"],
    [59_999, "00:59"],
    [60_000, "01:00"],
    [599_999, "09:59"],
    [600_000, "10:00"],
    [3_599_999, "59:59"],
    [3_600_000, "60:00"],
    [4_503_000, "75:03"],
    [5_999_999, "99:59"],
    [6_000_000, "100:00"],
  ])("formats %i ms as %s", (ms, expected) => {
    expect(formatElapsed(ms)).toBe(expected);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "throws a RangeError for %s",
    (ms) => {
      expect(() => formatElapsed(ms)).toThrow(RangeError);
    },
  );
});
