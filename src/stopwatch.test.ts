import { describe, expect, it } from "vitest";
import { createStopwatch } from "./stopwatch";

function fakeClock(start = 1_000_000) {
  let now = start;
  return {
    clock: () => now,
    advance(ms: number) {
      now += ms;
    },
  };
}

describe("createStopwatch", () => {
  it("starts at 0 and follows the clock", () => {
    const time = fakeClock();
    const stopwatch = createStopwatch(time.clock);
    expect(stopwatch.elapsedMs()).toBe(0);
    time.advance(3500);
    expect(stopwatch.elapsedMs()).toBe(3500);
    expect(stopwatch.isStopped()).toBe(false);
  });

  it("freezes the value read by stop", () => {
    const time = fakeClock();
    const stopwatch = createStopwatch(time.clock);
    time.advance(67_000);
    expect(stopwatch.stop()).toBe(67_000);
    time.advance(60_000);
    expect(stopwatch.elapsedMs()).toBe(67_000);
    expect(stopwatch.isStopped()).toBe(true);
  });

  it("makes stop idempotent", () => {
    const time = fakeClock();
    const stopwatch = createStopwatch(time.clock);
    time.advance(1500);
    stopwatch.stop();
    time.advance(1000);
    expect(stopwatch.stop()).toBe(1500);
  });

  it("measures elapsed time even if no one reads it in between", () => {
    const time = fakeClock();
    const stopwatch = createStopwatch(time.clock);
    time.advance(30_000);
    expect(stopwatch.elapsedMs()).toBe(30_000);
  });

  it("never goes negative if the clock moves backwards", () => {
    const time = fakeClock();
    const stopwatch = createStopwatch(time.clock);
    time.advance(-500);
    expect(stopwatch.elapsedMs()).toBe(0);
  });
});
