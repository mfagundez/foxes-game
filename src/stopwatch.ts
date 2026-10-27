/** Time source in milliseconds; injectable so tests control it. */
export type Clock = () => number;

export interface Stopwatch {
  /** Milliseconds since creation; frozen at the value read by `stop` once stopped. */
  elapsedMs(): number;
  /** Freezes `elapsedMs` at the current value and returns it. Later calls change nothing. */
  stop(): number;
  isStopped(): boolean;
}

/** Starts counting at creation. Elapsed time is a difference of clock readings, not a tick count. */
export function createStopwatch(clock: Clock): Stopwatch {
  const startedAt = clock();
  let frozen: number | undefined;

  const elapsedMs = (): number => frozen ?? Math.max(0, clock() - startedAt);

  return {
    elapsedMs,
    stop() {
      frozen ??= elapsedMs();
      return frozen;
    },
    isStopped: () => frozen !== undefined,
  };
}
