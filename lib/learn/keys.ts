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
  // Arrows with a modifier are sent the way xterm sends them: alt+left is
  // CSI 1;3D.
  const arrow = { up: "A", down: "B", right: "C", left: "D" }[base];
  if (arrow && mods.length) {
    const code =
      1 +
      (mods.includes("shift") ? 1 : 0) +
      (mods.includes("alt") ? 2 : 0) +
      (mods.includes("ctrl") ? 4 : 0);
    return `\x1b[1;${code}${arrow}`;
  }
  let out = NAMED[base] ?? base;
  if (mods.includes("ctrl") && base.length === 1) {
    out = String.fromCharCode(base.toLowerCase().charCodeAt(0) & 0x1f);
  }
  if (mods.includes("alt")) out = `\x1b${out}`;
  return out;
}

// The character each physical punctuation key types on a US layout.
const US_PUNCTUATION: Record<string, string> = {
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
  Space: " ",
};

/**
 * The character a physical key types with no modifier held, read as a US
 * layout. That is the key the Kitty keyboard protocol reports as the base
 * layout key, and the one tuios binds.
 */
export function baseKey(code: string): string | undefined {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  return US_PUNCTUATION[code];
}

/** The parts of a KeyboardEvent the key helpers read. */
export type KeyLike = Pick<
  KeyboardEvent,
  "key" | "code" | "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;

/**
 * The bytes for an Option chord on a Mac, sent as Alt: Option+j is ESC j, the
 * same bytes alt+j sends on Linux. Null when the event is not such a chord.
 *
 * macOS types a character with Option held: Option+j is "∆", and Option+n is
 * a dead key that waits to put a tilde on the next letter. xterm's
 * macOptionIsMeta covers only part of that. The Kitty keyboard encoder
 * reports the composed glyph as the key, and a dead key opens a composition
 * that swallows the key after it. Reading the physical key instead gives the
 * chord the reader pressed whatever the keyboard mode.
 *
 * Shift is kept for letters (Option+Shift+j is ESC J). A shifted digit or
 * symbol is left to the terminal, since its shifted character depends on the
 * layout.
 */
export function optionAsAlt(event: KeyLike): string | null {
  if (!event.altKey || event.ctrlKey || event.metaKey) return null;
  const base = baseKey(event.code);
  if (!base) return null;
  if (!event.shiftKey) return `\x1b${base}`;
  const upper = base.toUpperCase();
  return upper === base.toLowerCase() ? null : `\x1b${upper}`;
}

// What Option and a letter or digit types on a US Mac layout, for a chord
// that reaches tuios as the composed glyph. The dead keys (e, i, n, u) spill
// their accent.
const MAC_OPTION_GLYPHS: Record<string, string> = {
  å: "a",
  "∫": "b",
  ç: "c",
  "∂": "d",
  "´": "e",
  ƒ: "f",
  "©": "g",
  "˙": "h",
  ˆ: "i",
  "∆": "j",
  "˚": "k",
  "¬": "l",
  µ: "m",
  "˜": "n",
  ø: "o",
  π: "p",
  œ: "q",
  "®": "r",
  ß: "s",
  "†": "t",
  "¨": "u",
  "√": "v",
  "∑": "w",
  "≈": "x",
  "¥": "y",
  Ω: "z",
  "¡": "1",
  "™": "2",
  "£": "3",
  "¢": "4",
  "∞": "5",
  "§": "6",
  "¶": "7",
  "•": "8",
  ª: "9",
  º: "0",
};

/** "alt+∆" and a bare "∆" are the Mac spellings of alt+j. */
function fromMacOption(key: string): string {
  const glyph = key.startsWith("alt+") ? key.slice(4) : key;
  const base = MAC_OPTION_GLYPHS[glyph];
  return base ? `alt+${base}` : key;
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
  else {
    if (key.length === 1) {
      names.push(key.toLowerCase());
      if (key !== key.toLowerCase()) names.push(key);
    }
    // With ctrl held, key is still the letter, which is what we want. With
    // Option on a Mac it is a composed glyph ("∆"), or "Dead" for the keys
    // that put an accent on the next letter, so the physical key decides.
    const code = event.code ?? "";
    if (/^(Key|Digit)/.test(code)) names.push(baseKey(code) ?? "");
    if (code === "Space") names.push("space");
  }
  return names.filter(Boolean);
}

/** Whether the key tuios reported is the chord a step asks for. */
export function sameChord(reported: string, wanted: string): boolean {
  if (reported === wanted) return true;
  // tuios reports "\\" for the backslash key and "|" for shift+backslash, and
  // binds both to the same split. A Mac Option glyph is the alt chord.
  const norm = (k: string) =>
    fromMacOption(k)
      .replace(/^shift\+(.)$/, "$1")
      .toLowerCase();
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
