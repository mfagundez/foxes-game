/**
 * Formats a duration in milliseconds as mm:ss, truncating down to whole seconds. Minutes have at
 * least two digits and keep growing past 59 (there is no hours field).
 * Throws a RangeError if `ms` is negative or not finite.
 */
export function formatElapsed(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError(`Invalid duration: ${ms}`);
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
