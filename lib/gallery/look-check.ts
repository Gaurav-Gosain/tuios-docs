/**
 * The check of one look value, shared by the look file (look.ts) and the key
 * notes on the page (annotate.ts). It follows tuios's own checks closely
 * enough that a value it passes is one tuios takes: a value tuios refuses
 * fails the whole `tuios look apply`, so the gallery must never publish one.
 */

import lookKeys from "./look-keys.json";

export type LookKey = {
  path: string;
  type: "bool" | "int" | "string";
  description?: string;
  default?: string;
  accepted?: string[];
  min?: number;
  max?: number;
  color?: boolean;
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

export type Checked = { ok: true; value: unknown } | { ok: false; why: string };

/** The value as a look keeps it, or why it cannot. */
export function checkLookValue(key: LookKey, value: unknown): Checked {
  switch (key.type) {
    case "bool":
      return typeof value === "boolean"
        ? { ok: true, value }
        : { ok: false, why: "expected true or false" };
    case "int": {
      if (typeof value !== "bigint" && !Number.isInteger(value))
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
    case "string": {
      if (typeof value !== "string") return { ok: false, why: "expected text" };
      if (CONTROL.test(value))
        return { ok: false, why: "has a control character" };
      if (new TextEncoder().encode(value).length > MAX_STRING)
        return { ok: false, why: `longer than ${MAX_STRING} bytes` };
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
