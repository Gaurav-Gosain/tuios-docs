/**
 * What brings Tilly in (components/eggs/site-keys.tsx): a word typed on the
 * page, the Konami code, or three quick clicks on the logo. Plain functions
 * with no DOM, tested by triggers.test.ts.
 */

/** Sent on window to bring Tilly in, by the 404 shell for one. */
export const TILLY_EVENT = "tuios:tilly";

export const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** The sequences that bring Tilly in, one key per entry. */
export const TILLY_SEQUENCES = [KONAMI, [..."tilly"]];

/**
 * Watches keys for any of the sequences. feed takes a KeyboardEvent key and
 * reports whether a sequence has just ended; the keys of a match are then
 * forgotten, so one more key does not match again.
 */
export function keySequences(sequences: string[][] = TILLY_SEQUENCES) {
  const longest = Math.max(...sequences.map((s) => s.length));
  let typed: string[] = [];
  return {
    feed(key: string): boolean {
      const k = key.length === 1 ? key.toLowerCase() : key;
      typed = [...typed, k].slice(-longest);
      const hit = sequences.some(
        (s) =>
          typed.length >= s.length &&
          s.every((x, i) => typed[typed.length - s.length + i] === x),
      );
      if (hit) typed = [];
      return hit;
    },
  };
}

/**
 * Counts clicks. click takes a time in ms and reports whether it is the
 * count-th click within windowMs of the first. It never holds a click back:
 * the caller lets every click do what it does anyway.
 */
export function quickClicks(count = 3, windowMs = 1000) {
  let times: number[] = [];
  return {
    click(now: number): boolean {
      times = [...times.filter((t) => now - t <= windowMs), now];
      if (times.length >= count) {
        times = [];
        return true;
      }
      return false;
    },
  };
}
