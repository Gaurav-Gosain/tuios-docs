/**
 * Notes on the keys of a shared config, for the gallery dialog: where each key
 * is, what it is, and what is wrong with its value. They are made where the
 * config is read, by the sync, and travel in the feed as
 * plain data. The page draws them over the highlighted text, so it needs no
 * TOML parser and no copy of the tuios key list beyond the descriptions of the
 * look keys, which load with the highlighter.
 *
 * A note is one of:
 *
 * - doc: a look key with a good value. The page shows its description.
 * - bad: a look key whose value tuios refuses, and why.
 * - left: a tuios key that `tuios look apply` leaves out.
 * - unknown: a key tuios does not have.
 *
 * The text is scanned line by line for table headers and `key = value` lines.
 * The values are read from the parsed TOML, so the scanner only has to find
 * where things are. A line inside a multi-line string or array is skipped. A
 * config that does not parse as TOML gets no notes.
 */

import { parse } from "smol-toml";
import since from "../since/data.json";
import type { GalleryNote } from "./feed";
import { LOOK_META, LOOK_TABLES } from "./look";
import { checkLookValue, LOOK_KEYS } from "./look-check";

/** The most notes one file carries. */
export const MAX_NOTES = 200;

const CONFIG_KEYS = new Set(Object.keys(since.config));
const HAS_CHILDREN = new Set<string>();
for (const k of CONFIG_KEYS) {
  const parts = k.split(".");
  for (let i = 1; i < parts.length; i++)
    HAS_CHILDREN.add(parts.slice(0, i).join("."));
}

/**
 * Whether tuios has a key at path. A map such as hooks takes any key under
 * it, and a table of named entries such as dock.custom.NAME is listed with *
 * for the name.
 */
export function isConfigKey(path: string[]): boolean {
  const dotted = path.join(".");
  if (CONFIG_KEYS.has(dotted)) return true;
  for (let i = path.length - 1; i >= 1; i--) {
    const prefix = path.slice(0, i).join(".");
    if (CONFIG_KEYS.has(prefix) && !HAS_CHILDREN.has(prefix)) return true;
  }
  for (let i = 1; i < path.length; i++) {
    const prefix = path.slice(0, i).join(".");
    const named = [...path.slice(0, i), "*", ...path.slice(i + 1)].join(".");
    if (CONFIG_KEYS.has(`${prefix}.*`) && CONFIG_KEYS.has(named)) return true;
  }
  return false;
}

const BARE = /^[A-Za-z0-9_-]+/;

/** Reads one key part at the start of s: bare, "basic" or 'literal'. */
function readPart(s: string): { part: string; length: number } | null {
  const bare = BARE.exec(s);
  if (bare) return { part: bare[0], length: bare[0].length };
  const basic = /^"((?:[^"\\]|\\.)*)"/.exec(s);
  if (basic) {
    try {
      return { part: JSON.parse(basic[0]), length: basic[0].length };
    } catch {
      return null;
    }
  }
  const literal = /^'([^']*)'/.exec(s);
  if (literal) return { part: literal[1], length: literal[0].length };
  return null;
}

/** Reads a dotted key at the start of s. Returns its parts and length. */
function readKey(s: string): { parts: string[]; length: number } | null {
  const parts: string[] = [];
  let i = 0;
  for (;;) {
    while (s[i] === " " || s[i] === "\t") i++;
    const read = readPart(s.slice(i));
    if (!read) return null;
    parts.push(read.part);
    i += read.length;
    let j = i;
    while (s[j] === " " || s[j] === "\t") j++;
    if (s[j] !== ".") return { parts, length: i };
    i = j + 1;
  }
}

/** The end of a one-line value starting at s[0]: before a comment. */
function valueEnd(s: string): number {
  let quote = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === "\\" && quote === '"') i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === "#") {
      return s.slice(0, i).trimEnd().length;
    }
  }
  return s.trimEnd().length;
}

/**
 * The brackets a line opens less the ones it closes, and the multi-line
 * string it leaves open, outside strings and comments.
 */
function openings(value: string): { depth: number; multi: string } {
  let depth = 0;
  let quote = "";
  for (let i = 0; i < value.length; i++) {
    const three = value.slice(i, i + 3);
    if (!quote && (three === '"""' || three === "'''")) {
      const close = value.indexOf(three, i + 3);
      if (close < 0) return { depth, multi: three };
      i = close + 2;
      continue;
    }
    const c = value[i];
    if (quote) {
      if (c === "\\" && quote === '"') i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "#") break;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
  }
  return { depth, multi: "" };
}

function lookup(root: unknown, path: string[]): unknown {
  let v = root;
  for (const p of path) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
    v = (v as Record<string, unknown>)[p];
  }
  return v;
}

/** The kind of a key path, and why when it is not a doc note. */
function classify(
  path: string[],
  value: unknown,
): Pick<GalleryNote, "kind" | "why"> | null {
  const dotted = path.join(".");
  if (path.length === 1 && LOOK_META.has(dotted)) return null;
  if (path[0] === "theme" || path[0] === "glyphs") return null;
  // An inline table, such as appearance = { gap = 1 }, of a table that
  // holds look keys: the look file takes its keys, so it is not left out.
  // Its own keys get no notes.
  if (
    LOOK_TABLES.has(dotted) &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  )
    return null;
  const key = LOOK_KEYS.get(dotted);
  if (key) {
    const checked = checkLookValue(key, value);
    if (!checked.ok) return { kind: "bad", why: checked.why };
    // A rail layout of left-out sections only, such as "custom".
    return checked.value === null ? { kind: "left" } : { kind: "doc" };
  }
  if (isConfigKey(path)) return { kind: "left" };
  return { kind: "unknown" };
}

/** The notes of one config text, or none when it is not TOML. */
export function annotate(text: string): GalleryNote[] {
  let root: unknown;
  try {
    root = parse(text, { integersAsBigInt: true, maxDepth: 8 });
  } catch {
    return [];
  }
  const notes: GalleryNote[] = [];
  const lines = text.split("\n");
  let table: string[] = [];
  let tableIsArray = false;
  let skipTable = false;
  let depth = 0;
  let multi = "";
  for (let line = 0; line < lines.length; line++) {
    const raw = lines[line];
    if (multi) {
      if (raw.includes(multi)) multi = "";
      continue;
    }
    if (depth > 0) {
      const open = openings(raw);
      if (open.multi) multi = open.multi;
      depth = Math.max(depth + open.depth, 0);
      continue;
    }
    const indent = raw.length - raw.trimStart().length;
    const body = raw.slice(indent);
    if (body === "" || body.startsWith("#")) continue;

    const header = /^(\[\[?)\s*/.exec(body);
    if (header) {
      const key = readKey(body.slice(header[0].length));
      if (!key) continue;
      table = key.parts;
      tableIsArray = header[1] === "[[";
      const close = body.indexOf("]", header[0].length + key.length);
      const end = indent + (close < 0 ? body.length : close + header[1].length);
      const dotted = table.join(".");
      skipTable = false;
      if (
        LOOK_TABLES.has(dotted) ||
        table[0] === "theme" ||
        table[0] === "glyphs"
      ) {
        continue;
      }
      skipTable = true;
      notes.push({
        line,
        start: indent,
        end,
        path: dotted,
        kind: isConfigKey(table) ? "left" : "unknown",
      });
      continue;
    }

    const key = readKey(body);
    if (!key) continue;
    let eq = key.length;
    while (body[eq] === " " || body[eq] === "\t") eq++;
    if (body[eq] !== "=") continue;
    let vs = eq + 1;
    while (body[vs] === " " || body[vs] === "\t") vs++;
    const value = body.slice(vs);
    const open = openings(value);
    if (open.multi) multi = open.multi;
    if (open.depth > 0) depth = open.depth;

    if (skipTable || tableIsArray) continue;
    const path = [...table, ...key.parts];
    const kind = classify(path, lookup(root, path));
    if (!kind) continue;
    const note: GalleryNote = {
      line,
      start: indent,
      end: indent + key.length,
      path: path.join("."),
      ...kind,
    };
    if (kind.kind === "bad" && !open.multi && open.depth === 0) {
      note.valueStart = indent + vs;
      note.valueEnd = indent + vs + valueEnd(value);
    }
    notes.push(note);
    if (notes.length >= MAX_NOTES) break;
  }
  return notes;
}
