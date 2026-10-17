/**
 * The setup commands that put a look on the browser build of tuios, for the
 * gallery's Try it (components/gallery/try-it.tsx):
 *
 * - `set` for each key of the look, by its config path, with a list as a
 *   JSON array, such as `["mode","workspaces"]`;
 * - `themeJSON` for a [theme] the look carries, last, so its theme wins.
 *
 * Only a look key goes to `set`: the caller passes the paths of
 * look-keys.json, and any other path in the file is skipped. The browser
 * build's `set` takes every look key, and refuses the rest itself as well.
 * What the look left out, and a glyph set, which the page cannot load, are
 * returned as skipped.
 */

import type { SetupCommand } from "../learn/types";
import type { GalleryLook } from "./feed";

export type Plan = { setup: SetupCommand[]; skipped: string[] };

/** Flattens a TOML table to dotted paths and scalar values. */
function flatten(
  table: Record<string, unknown>,
  prefix: string,
  out: [string, unknown][],
) {
  for (const [k, v] of Object.entries(table)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v))
      flatten(v as Record<string, unknown>, path, out);
    else out.push([path, v]);
  }
}

/** The setup commands of a look file, and what they leave out. */
export function planLook(
  doc: Record<string, unknown>,
  look: GalleryLook,
  keys: ReadonlySet<string>,
): Plan {
  const setup: SetupCommand[] = [];
  const skipped = [...look.left];
  if (look.leftCount > look.left.length)
    skipped.push(`${look.leftCount - look.left.length} more`);
  const {
    look: _v,
    name: _n,
    author: _a,
    description: _d,
    theme,
    glyphs,
    ...options
  } = doc;
  const pairs: [string, unknown][] = [];
  flatten(options, "", pairs);
  const ownTheme =
    theme && typeof theme === "object" && !Array.isArray(theme)
      ? (theme as Record<string, unknown>)
      : null;
  for (const [path, value] of pairs) {
    const list =
      Array.isArray(value) && value.every((v) => typeof v === "string");
    if (
      !keys.has(path) ||
      (!list &&
        typeof value !== "string" &&
        typeof value !== "number" &&
        typeof value !== "bigint" &&
        typeof value !== "boolean")
    ) {
      skipped.push(path);
      continue;
    }
    // A theme the look carries is set by themeJSON below.
    if (path === "appearance.theme" && ownTheme) continue;
    const text = list ? JSON.stringify(value) : String(value);
    setup.push({ command: "set", args: [path, text], wait: 30 });
  }
  if (ownTheme && typeof ownTheme.id === "string") {
    setup.push({
      command: "themeJSON",
      args: [ownTheme.id, JSON.stringify(ownTheme)],
      wait: 50,
    });
  }
  if (glyphs) skipped.push("glyphs (a glyph set)");
  return { setup, skipped };
}
