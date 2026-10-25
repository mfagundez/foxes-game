import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHighlightScheduler } from "./highlight-scheduler";

describe("createHighlightScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the value after exactly the delay and not before", () => {
    const show = vi.fn();
    createHighlightScheduler<string>(1000, show).schedule("a");

    vi.advanceTimersByTime(999);
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalledExactlyOnceWith("a");
  });

  it("a new schedule within the delay cancels the previous one and restarts the delay", () => {
    const show = vi.fn();
    const scheduler = createHighlightScheduler<string>(1000, show);

    scheduler.schedule("a");
    vi.advanceTimersByTime(600);
    scheduler.schedule("b");
    vi.advanceTimersByTime(600);
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    expect(show).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("delivers a single highlight after several rapid schedules", () => {
    const show = vi.fn();
    const scheduler = createHighlightScheduler<number>(1000, show);

    for (let i = 1; i <= 5; i++) {
      scheduler.schedule(i);
      vi.advanceTimersByTime(200);
    }
    vi.advanceTimersByTime(5000);
    expect(show).toHaveBeenCalledExactlyOnceWith(5);
  });

  it("shows nothing when cancelled without a new schedule (quick fix)", () => {
    const show = vi.fn();
    const scheduler = createHighlightScheduler<string>(1000, show);

    scheduler.schedule("conflict");
    vi.advanceTimersByTime(300);
    scheduler.cancel();
    vi.advanceTimersByTime(5000);
    expect(show).not.toHaveBeenCalled();
  });

  it("can be cancelled with nothing pending and scheduled again afterwards", () => {
    const show = vi.fn();
    const scheduler = createHighlightScheduler<string>(1000, show);

    scheduler.cancel();
    scheduler.schedule("a");
    vi.advanceTimersByTime(1000);
    scheduler.schedule("b");
    vi.advanceTimersByTime(1000);
    expect(show.mock.calls).toEqual([["a"], ["b"]]);
  });
});
