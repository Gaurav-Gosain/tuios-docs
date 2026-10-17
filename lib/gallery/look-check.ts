/**
 * The check of one look value, shared by the look file (look.ts) and the key
 * notes on the page (annotate.ts). It follows tuios's own checks closely
 * enough that a value it passes is one tuios takes: a value tuios refuses
 * fails the whole `tuios look apply`, so the gallery must never publish one.
 */

import lookKeys from "./look-keys.json";

export type LookKey = {
  path: string;
  type: "bool" | "int" | "string" | "list";
  description?: string;
  default?: string;
  accepted?: string[];
  min?: number;
  max?: number;
  color?: boolean;
  /**
   * The names one item may be: an item of a list, or of a string of items
   * joined by split. An item may carry ":share" after the name. tuios leaves
   * out any other item and keeps the rest, since such an item can start a
   * command, such as custom/clock in a dock list.
   */
  items?: string[];
  split?: string;
  max_items?: number;
  /** The most bytes of a string, or of one list item. */
  max_bytes?: number;
};

export const LOOK_KEYS = new Map<string, LookKey>(
  (lookKeys.keys as LookKey[]).map((k) => [k.path, k]),
);

/** The longest string value a look keeps, in bytes, as tuios caps it. */
export const MAX_STRING = 512;

// biome-ignore lint/suspicious/noControlCharactersInRegex: matching controls is the point
export const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;

/** tuios's chrome role names (internal/theme/parse.go roleNames). */
const ROLES = new Set([
  "accent",
  "accent_bright",
  "success",
  "warning",
  "error",
  "info",
  "surface",
  "canvas",
  "panel",
  "card",
  "border.unfocused",
  "border.copy",
  "border.multifocus",
  "rule",
  "status.attention",
  "status.busy",
  "dots.close",
  "dots.minimize",
  "dots.zoom",
  "dock.ground",
  "rail.ground",
  "text",
  "dim",
  "muted",
]);

/** The CharmTone colour names tuios knows, with its two aliases. */
const TONES = new Set(
  (
    "cumin tang yam paprika bengal uni sriracha coral salmon chili cherry tuna " +
    "macaron pony cheeky flamingo dolly blush urchin mochi lilac prince violet " +
    "mauve grape plum orchid jelly charple hazy ox sapphire guppy oceania " +
    "thunder anchovy damson malibu sardine zinc turtle lichen guac julep bok " +
    "mustard citron zest butter pepper bbq char iron oyster squid steam smoke " +
    "steep sash salt soda darple larple pickle gator spinach pom steak toast " +
    "ice ash charcoal"
  ).split(" "),
);

const SLOTS = new Set([
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "purple",
  "cyan",
  "white",
]);

/** Whether s is a colour as tuios's ParseColor reads one. */
export function isColour(raw: string): boolean {
  const s = raw.trim();
  if (s === "") return true; // empty unsets a colour option
  if (s[0] === "#") return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
  if (s[0] >= "0" && s[0] <= "9") return /^\d+$/.test(s) && Number(s) <= 255;
  const name = s.toLowerCase().replace(/[- ]/g, "_");
  if (ROLES.has(name) || TONES.has(name) || name === "fg" || name === "bg")
    return true;
  return SLOTS.has(name.replace(/^bright_/, ""));
}

export type Checked =
  | {
      ok: true;
      value: unknown;
      /** The items tuios leaves out. The value is null when none is left. */
      dropped?: string[];
    }
  | { ok: false; why: string };

function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

/**
 * Keeps the items of a string of items that name an allowed item, as tuios
 * does for appearance.sidebar.sections. The value is null when no item but a
 * spacer is left.
 */
function checkItemString(key: LookKey, value: string): Checked {
  const items = key.items ?? [];
  const keep: string[] = [];
  const dropped: string[] = [];
  let named = 0;
  for (const raw of value.split(key.split ?? ",")) {
    const field = raw.trim();
    if (field === "") continue;
    const name = field.split(":")[0].trim().toLowerCase();
    if (!items.includes(name)) {
      dropped.push(field);
      continue;
    }
    if (name !== "spacer") named++;
    keep.push(field);
  }
  return {
    ok: true,
    value: named > 0 ? keep.join(key.split ?? ",") : null,
    dropped,
  };
}

/** A list of one-line strings, with the items tuios leaves out dropped. */
function checkList(key: LookKey, value: unknown): Checked {
  if (!Array.isArray(value)) return { ok: false, why: "expected a list" };
  if (key.max_items !== undefined && value.length > key.max_items)
    return { ok: false, why: `more than ${key.max_items} items` };
  const keep: string[] = [];
  const dropped: string[] = [];
  for (const item of value) {
    if (typeof item !== "string")
      return { ok: false, why: "expected a list of text" };
    if (CONTROL.test(item))
      return { ok: false, why: "an item has a control character" };
    if (byteLength(item) > (key.max_bytes ?? MAX_STRING))
      return {
        ok: false,
        why: `an item is longer than ${key.max_bytes ?? MAX_STRING} bytes`,
      };
    if (key.items && !key.items.includes(item.trim())) dropped.push(item);
    else keep.push(key.items ? item.trim() : item);
  }
  return { ok: true, value: keep, dropped };
}

/** The value as a look keeps it, or why it cannot. */
export function checkLookValue(key: LookKey, value: unknown): Checked {
  switch (key.type) {
    case "bool":
      return typeof value === "boolean"
        ? { ok: true, value }
        : { ok: false, why: "expected true or false" };
    case "int": {
      // A TOML float such as 100.0 is not a whole number to tuios, which
      // refuses the whole look over it. The parse keeps integers as bigint.
      if (typeof value !== "bigint")
        return { ok: false, why: "expected a whole number" };
      const n = Number(value);
      if (!Number.isSafeInteger(n))
        return { ok: false, why: "expected a whole number" };
      if (key.max !== undefined && (n < (key.min ?? 0) || n > key.max))
        return {
          ok: false,
          why: `out of range: ${key.min ?? 0} to ${key.max}`,
        };
      return { ok: true, value: n };
    }
    case "list":
      return checkList(key, value);
    case "string": {
      if (typeof value !== "string") return { ok: false, why: "expected text" };
      if (CONTROL.test(value))
        return { ok: false, why: "has a control character" };
      const max = key.max_bytes ?? MAX_STRING;
      if (byteLength(value) > max)
        return { ok: false, why: `longer than ${max} bytes` };
      if (key.items) return checkItemString(key, value);
      if (key.color) {
        if (key.accepted?.includes(value) || isColour(value))
          return { ok: true, value };
        return { ok: false, why: "not a colour" };
      }
      if (key.accepted && !key.accepted.includes(value))
        return {
          ok: false,
          why: `expected one of: ${key.accepted.join(", ")}`,
        };
      return { ok: true, value };
    }
  }
}
