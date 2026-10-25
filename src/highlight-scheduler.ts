export interface HighlightScheduler<T> {
  /** Cancels any pending highlight and schedules `value` to be shown after the delay. */
  schedule(value: T): void;
  /** Cancels the pending highlight, if any. */
  cancel(): void;
}

/** Keeps at most one pending highlight; `show` receives the value of the last `schedule` call. */
export function createHighlightScheduler<T>(
  delayMs: number,
  show: (value: T) => void,
): HighlightScheduler<T> {
  let pending: ReturnType<typeof setTimeout> | undefined;

  const cancel = (): void => {
    if (pending !== undefined) {
      clearTimeout(pending);
      pending = undefined;
    }
  };

  return {
    schedule(value) {
      cancel();
      pending = setTimeout(() => {
        pending = undefined;
        show(value);
      }, delayMs);
    },
    cancel,
  };
}
