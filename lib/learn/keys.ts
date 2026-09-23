/**
 * Keys in tuios's notation ("ctrl+b", "shift+tab", "|"): how to draw them, the
 * bytes a terminal sends for them, and which physical key presses them.
 */
import type { KeyItem } from "./types";

const NAMED: Record<string, string> = {
  enter: "\r",
  esc: "\x1b",
  escape: "\x1b",
  tab: "\t",
  space: " ",
  backspace: "\x7f",
  up: "\x1b[A",
  down: "\x1b[B",
  right: "\x1b[C",
  left: "\x1b[D",
};

const LABELS: Record<string, string> = {
  ctrl: "ctrl",
  alt: "alt",
  shift: "shift",
  enter: "enter",
  esc: "esc",
  tab: "tab",
  space: "space",
  backspace: "bksp",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

/** Split a chord into its parts: "ctrl+b" is ["ctrl", "b"]. "+" alone stays. */
export function chordParts(chord: string): string[] {
  if (chord === "+" || !chord.includes("+")) return [chord];
  return chord.split("+");
}

/** The text on one keycap. */
export function keyLabel(part: string): string {
  return LABELS[part] ?? part;
}

/** The bytes a terminal sends for a chord, or for text to type. */
export function keyBytes(item: KeyItem): string {
  if (typeof item !== "string") return item.text;
  const parts = chordParts(item);
  const base = parts[parts.length - 1];
  const mods = parts.slice(0, -1);
  if (mods.includes("shift") && base === "tab") return "\x1b[Z";
  let out = NAMED[base] ?? base;
  if (mods.includes("ctrl") && base.length === 1) {
    out = String.fromCharCode(base.toLowerCase().charCodeAt(0) & 0x1f);
  }
  if (mods.includes("alt")) out = `\x1b${out}`;
  return out;
}

/** The bytes for a whole step, in order. */
export function sequenceBytes(items: KeyItem[]): string[] {
  return items.map(keyBytes);
}

/**
 * The key names a physical key press matches, so a keycap can light up while
 * its key is held. Modifiers light their own caps.
 */
export function pressedNames(event: KeyboardEvent): string[] {
  const names: string[] = [];
  if (event.ctrlKey || event.key === "Control") names.push("ctrl");
  if (event.altKey || event.key === "Alt") names.push("alt");
  if (event.shiftKey || event.key === "Shift") names.push("shift");
  const key = event.key;
  const map: Record<string, string> = {
    Enter: "enter",
    Escape: "esc",
    Tab: "tab",
    " ": "space",
    Backspace: "backspace",
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };
  if (map[key]) names.push(map[key]);
  else if (key.length === 1) {
    names.push(key.toLowerCase());
    if (key !== key.toLowerCase()) names.push(key);
    // With ctrl held, key is still the letter, which is what we want. With
    // Option on a Mac it is a composed glyph, so the code decides.
    if (event.code.startsWith("Key"))
      names.push(event.code.slice(3).toLowerCase());
    if (event.code.startsWith("Digit")) names.push(event.code.slice(5));
  }
  return names;
}

/** Whether the key tuios reported is the chord a step asks for. */
export function sameChord(reported: string, wanted: string): boolean {
  if (reported === wanted) return true;
  // tuios reports "\\" for the backslash key and "|" for shift+backslash, and
  // binds both to the same split.
  const norm = (k: string) => k.replace(/^shift\+(.)$/, "$1").toLowerCase();
  return norm(reported) === norm(wanted);
}

/** A readable name for a sequence, such as "ctrl+b |". */
export function sequenceLabel(items: KeyItem[]): string {
  return items
    .map((item) =>
      typeof item === "string"
        ? chordParts(item).map(keyLabel).join("+")
        : item.text.trim(),
    )
    .join(" ");
}
