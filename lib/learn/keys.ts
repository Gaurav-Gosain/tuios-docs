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
> & { keyCode?: number; getModifierState?: (key: string) => boolean };

/**
 * The physical key of an Alt chord: from code, or when a browser leaves code
 * empty, from the US Mac Option glyph in key, or from keyCode.
 */
function chordBase(event: KeyLike): string | undefined {
  const fromCode = baseKey(event.code);
  if (fromCode || event.code) return fromCode;
  const glyph = MAC_OPTION_GLYPHS[event.key];
  if (glyph) return glyph;
  const kc = event.keyCode ?? 0;
  if (kc >= 65 && kc <= 90) return String.fromCharCode(kc + 32);
  if (kc >= 48 && kc <= 57) return String.fromCharCode(kc);
  return undefined;
}

/** The parts of navigator that say which system the page runs on. */
export type NavigatorLike = {
  platform?: string;
  userAgent?: string;
  userAgentData?: { platform?: string };
};

/**
 * Whether the page runs on a Mac. Any one of the three signals is enough,
 * since a privacy setting or a browser can blank or spoof one of them:
 * navigator.platform is "" or "Win32" in some hardened setups.
 */
export function detectMac(nav: NavigatorLike | undefined): boolean {
  if (!nav) return false;
  return (
    /Mac|iPhone|iPad|iPod/.test(nav.platform ?? "") ||
    /macOS|iOS/i.test(nav.userAgentData?.platform ?? "") ||
    /Macintosh|Mac OS X|iPhone|iPad/.test(nav.userAgent ?? "")
  );
}

/**
 * Whether a key value is something Alt composed rather than the plain
 * character: a glyph outside printable ASCII, a dead key, or no value at all.
 * Alt and a letter on Linux or Windows reports the letter itself.
 */
function composedKey(key: string): boolean {
  if (key === "Dead" || key === "Unidentified" || key === "") return true;
  return !/^[\x20-\x7e]$/.test(key);
}

/** Whether `key` is what Option and the key `base` types on a US Mac. */
function macOptionKey(key: string, base: string): boolean {
  if (key === "Dead") return ["e", "i", "n", "u", "`"].includes(base);
  return MAC_OPTION_GLYPHS[key] === base;
}

/**
 * The bytes for Alt (Option on a Mac) and a letter, digit or punctuation key,
 * sent as ESC and the key: Option+j is ESC j, the bytes alt+j sends on Linux.
 * Null when the terminal should handle the event itself.
 *
 * macOS types a character with Option held: Option+j is "∆", and Option+n is
 * a dead key that waits to put a tilde on the next letter. xterm's
 * macOptionIsMeta covers only part of that. The Kitty keyboard encoder
 * reports the composed glyph as the key, and a dead key opens a composition
 * that swallows the key after it. Reading the physical key instead gives the
 * chord the reader pressed whatever the keyboard mode.
 *
 * `mac` only widens the net. Off a Mac, or when the platform is hidden, the
 * page still steps in when the event is plainly a composed Option key: the
 * key is a US Mac Option glyph for that physical key, or any glyph or dead
 * key while Alt alone is held. Alt and a plain letter, as Linux and Windows
 * report it, is left to the terminal, and so is AltGr: Windows reports it as
 * ctrl and alt, and Linux as the AltGraph key or modifier.
 *
 * The physical key comes from code. A browser that leaves code empty still
 * reports the glyph or keyCode, so those stand in.
 *
 * Shift is kept for letters (Option+Shift+j is ESC J). A shifted digit or
 * symbol is left to the terminal, since its shifted character depends on the
 * layout.
 */
export function altChordBytes(event: KeyLike, mac: boolean): string | null {
  if (!event.altKey || event.ctrlKey || event.metaKey) return null;
  if (event.key === "AltGraph") return null;
  const base = chordBase(event);
  if (!base) return null;
  if (!mac && !macOptionKey(event.key, base)) {
    if (!composedKey(event.key)) return null;
    if (event.getModifierState?.("AltGraph")) return null;
  }
  if (!event.shiftKey) return `\x1b${base}`;
  const upper = base.toUpperCase();
  return upper === base.toLowerCase() ? null : `\x1b${upper}`;
}

/** altChordBytes as a Mac sees it: every plain Option chord. */
export function optionAsAlt(event: KeyLike): string | null {
  return altChordBytes(event, true);
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

/**
 * Whether a chord uses alt, in tuios's notation or as a Mac Option glyph:
 * "alt+j", "ctrl+alt+x" and "∆" are, "j" and "ctrl+b" are not.
 */
export function isAltChord(chord: string): boolean {
  return chordParts(fromMacOption(chord)).slice(0, -1).includes("alt");
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
