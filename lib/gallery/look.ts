/**
 * The look file of a gallery entry: the part of its config that
 * `tuios look apply tuios.dev/r/<id>` can install. The sync makes one for each
 * approved entry from the first code block, and the seed script makes one for
 * each seed setup. The Worker serves it at /r/<id>.toml.
 *
 * A look may set only the keys in look-keys.json. That file is the list tuios
 * itself enforces, vendored here so the two cannot drift. Refresh it from a
 * tuios checkout:
 *
 *   go run ./cmd/tuios look keys --json > lib/gallery/look-keys.json
 *
 * Every other key is left out and named, so the card can say what the look
 * does not carry. A value of the wrong type, outside the accepted set or the
 * range, or with a control character in it, is left out the same way. tuios
 * checks every value again when it applies the look, so this is the first of
 * two checks, never the only one.
 */

import { parse, stringify } from "smol-toml";
import lookKeys from "./look-keys.json";

/** The look format version the file is written in. */
export const LOOK_VERSION = 1;

/** The longest left-out key name the card shows. */
const MAX_LEFT_NAME = 60;
/** The most left-out key names an entry keeps. */
const MAX_LEFT = 12;
/** The longest string value a look keeps, in bytes, as tuios caps it. */
const MAX_STRING = 512;

type LookKey = {
  path: string;
  type: "bool" | "int" | "string";
  accepted?: string[];
  min?: number;
  max?: number;
  color?: boolean;
};

const KEYS = new Map<string, LookKey>(
  (lookKeys.keys as LookKey[]).map((k) => [k.path, k]),
);

/** The tables that hold at least one look key, such as "appearance.sidebar". */
const TABLES = new Set<string>();
for (const path of KEYS.keys()) {
  const parts = path.split(".");
  for (let i = 1; i < parts.length; i++)
    TABLES.add(parts.slice(0, i).join("."));
}

/** The top-level keys a look file has besides its options. */
const META = new Set(["look", "name", "author", "description"]);

/** A theme or glyph set id that tuios can install as look-<id>. */
const ASSET_ID = /^[a-z0-9][a-z0-9_.-]{0,58}$/;
const ASSET_KEY = /^[a-z0-9_]{1,40}$/;
const SAFE_NAME = /^[A-Za-z0-9_.-]+$/;

export type Look = {
  /** The look file, ready to serve. */
  text: string;
  /** How many look keys it sets, not counting a theme or glyph set. */
  keys: number;
  /** The left-out keys the card may name, at most MAX_LEFT. */
  left: string[];
  /** How many keys were left out in all. */
  leftCount: number;
};

// biome-ignore lint/suspicious/noControlCharactersInRegex: matching controls is the point
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;

function isTable(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function okString(value: unknown, max = MAX_STRING): value is string {
  return (
    typeof value === "string" &&
    !CONTROL.test(value) &&
    new TextEncoder().encode(value).length <= max
  );
}

/** The value as the look file keeps it, or undefined when it does not pass. */
function checkValue(key: LookKey, value: unknown): unknown {
  switch (key.type) {
    case "bool":
      return typeof value === "boolean" ? value : undefined;
    case "int": {
      if (typeof value !== "bigint") return undefined;
      const n = Number(value);
      if (!Number.isSafeInteger(n)) return undefined;
      if (key.max !== undefined && (n < (key.min ?? 0) || n > key.max))
        return undefined;
      return n;
    }
    case "string": {
      if (!okString(value)) return undefined;
      // A colour option takes a literal as well as its keywords, and tuios
      // checks the literal. A closed set is checked here.
      if (key.accepted && !key.color && !key.accepted.includes(value))
        return undefined;
      return value;
    }
  }
}

/**
 * A theme or glyph set table, with only plain keys, one-line strings, booleans
 * and tables of those. Returns undefined when the table cannot be a theme or
 * glyph set at all.
 */
function checkAsset(
  value: unknown,
  name: string,
  left: string[],
  depth = 0,
): Record<string, unknown> | undefined {
  if (!isTable(value) || depth > 3) {
    left.push(name);
    return undefined;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    const path = `${name}.${k}`;
    if (!ASSET_KEY.test(k)) {
      left.push(path);
    } else if (typeof v === "boolean") {
      out[k] = v;
    } else if (okString(v, 200)) {
      out[k] = v;
    } else if (isTable(v)) {
      const sub = checkAsset(v, path, left, depth + 1);
      if (sub) out[k] = sub;
    } else {
      left.push(path);
    }
  }
  if (depth === 0 && !(typeof out.id === "string" && ASSET_ID.test(out.id))) {
    left.push(name);
    return undefined;
  }
  return out;
}

/** Sets value at the dotted path in root. */
function put(root: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let table = root;
  for (const part of parts.slice(0, -1)) {
    let next = table[part];
    if (!isTable(next)) {
      next = {};
      table[part] = next;
    }
    table = next as Record<string, unknown>;
  }
  table[parts[parts.length - 1]] = value;
}

/**
 * Sorts a parsed config into the look keys it may keep and the keys it must
 * leave out. A table that holds no look key is named as the table, as tuios
 * names it.
 */
function walk(
  table: Record<string, unknown>,
  prefix: string,
  kept: Record<string, unknown>,
  left: string[],
): number {
  let count = 0;
  for (const [k, v] of Object.entries(table)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isTable(v)) {
      if (TABLES.has(path)) count += walk(v, path, kept, left);
      else left.push(path);
      continue;
    }
    const key = KEYS.get(path);
    const value = key ? checkValue(key, v) : undefined;
    if (value === undefined) {
      left.push(path);
      continue;
    }
    put(kept, path, value);
    count++;
  }
  return count;
}

export type LookSource = {
  /** The config text, already cleaned (see cleanText). */
  config: string;
  /** A theme file, as JSON text, that ships with the setup. */
  theme?: string;
  /** The id the look is served under, for the header line. */
  id: string;
  /** The setup's name. */
  name: string;
  /** The GitHub handle of the person who shared it. */
  author: string;
};

/**
 * The look of a setup, or null when its config sets no look key and carries
 * no theme. A config that does not parse as TOML has no look.
 */
export function buildLook(source: LookSource): Look | null {
  let parsed: Record<string, unknown>;
  try {
    parsed = parse(source.config, {
      integersAsBigInt: true,
      unsafeKeyBehaviour: "throw",
      maxDepth: 8,
    }) as Record<string, unknown>;
  } catch {
    return null;
  }
  const left: string[] = [];
  const kept: Record<string, unknown> = {};
  const options: Record<string, unknown> = {};
  let theme: Record<string, unknown> | undefined;
  let glyphs: Record<string, unknown> | undefined;
  for (const [k, v] of Object.entries(parsed)) {
    if (META.has(k)) continue;
    if (k === "theme") theme = checkAsset(v, "theme", left);
    else if (k === "glyphs") glyphs = checkAsset(v, "glyphs", left);
    else options[k] = v;
  }
  if (source.theme !== undefined && !theme) {
    try {
      theme = checkAsset(JSON.parse(source.theme), "theme", left);
    } catch {
      left.push("theme");
    }
  }
  const count = walk(options, "", kept, left);
  if (count === 0 && !theme && !glyphs) return null;

  const doc: Record<string, unknown> = {
    look: LOOK_VERSION,
    name: source.name,
    author: source.author,
    ...kept,
  };
  if (theme) doc.theme = theme;
  if (glyphs) doc.glyphs = glyphs;
  const header = [
    "# A tuios look from the tuios.dev gallery.",
    `# Apply it: tuios look apply tuios.dev/r/${source.id}`,
    "# Remove it: tuios look remove",
    "",
  ].join("\n");
  const safe = left.filter(
    (name) => name.length <= MAX_LEFT_NAME && SAFE_NAME.test(name),
  );
  return {
    text: `${header}\n${stringify(doc)}\n`,
    keys: count,
    left: [...new Set(safe)].slice(0, MAX_LEFT),
    leftCount: new Set(left).size,
  };
}

/** The look key paths, for tests and the card. */
export function lookKeyPaths(): string[] {
  return [...KEYS.keys()];
}
