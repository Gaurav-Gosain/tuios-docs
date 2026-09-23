/**
 * The line Tilly is saying now, outside React state, so the lesson can make
 * Tilly speak without re-rendering itself or the terminal. The Tilly
 * component subscribes with useSyncExternalStore.
 */
import { getPrefs, playSound } from "./sound";
import type { Speech } from "./tilly";

export type Said = Speech & { id: number };

let current: Said | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

/**
 * Say a line and play its sound. A blip is Tilly's voice, so it stays quiet
 * when Tilly is hidden; the chime and the fanfare belong to the lesson and
 * play either way.
 */
export function say(speech: Speech) {
  current = { ...speech, id: nextId++ };
  const hidden = getPrefs().tillyHidden;
  if (!(hidden && speech.sound === "blip")) playSound(speech.sound);
  for (const fn of listeners) fn();
}

/** Clear the bubble, such as when a lesson closes. */
export function hush() {
  if (current === null) return;
  current = null;
  for (const fn of listeners) fn();
}

export function getSaid(): Said | null {
  return current;
}

export function getServerSaid(): Said | null {
  return null;
}

export function subscribeSaid(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
