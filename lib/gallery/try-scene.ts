/**
 * The scene the gallery's Try it puts a look on (components/gallery/
 * try-it-dialog.tsx). A look styles panes, borders, the dock and the rail, so
 * an empty desktop shows almost none of it. The scene is a small desktop
 * with something in each part:
 *
 * - four panes on workspace 1: fastfetch, a file open in the viewer, the
 *   colour table and a file tree. The compact scene, for a phone, has the
 *   first two only, so each is wide enough to read;
 * - one pane each on workspaces 2 and 3, so the dock has tabs to style;
 * - the rail and the clock on.
 *
 * The /learn engine starts with the looks the lessons were written against,
 * which are older than the shipped defaults (internal/config/prev080.go in
 * tuios). A look in the gallery was made on the shipped defaults, so the
 * scene puts those back first. The look's own keys come after and win, so a
 * look that turns the rail off has no rail.
 */

import type { SetupCommand } from "../learn/types";

/** A look key as look-keys.json lists it. */
export type LookKey = { path: string; default?: string };

/**
 * The keys the engine pins to its pre-v0.8 look, and that a look may set.
 * The scene sets each to its shipped default.
 */
const PINNED = [
  "appearance.sidebar.enabled",
  "appearance.sidebar.position",
  "appearance.sidebar.width",
  "appearance.dockbar_position",
  "appearance.window_title_position",
];

/** What the scene turns on so the look has something to style. */
const SHOWN: [string, string][] = [
  ["appearance.sidebar.enabled", "true"],
  ["appearance.show_clock", "true"],
  ["appearance.dock_workspace_tabs", "true"],
];

/** One pane: its title and the command line it runs. */
const PANES: {
  workspace: number;
  title: string;
  line: string;
  /** Left out of the compact scene, for a narrow screen. */
  wide?: boolean;
}[] = [
  { workspace: 3, title: "notes", line: "cat todo.md" },
  {
    workspace: 2,
    title: "git",
    line: "cd ~/projects/hello && git log",
  },
  { workspace: 1, title: "fastfetch", line: "fastfetch" },
  {
    workspace: 1,
    title: "main.go",
    line: "cd ~/projects/hello && vim main.go",
  },
  { workspace: 1, title: "colors", line: "colors", wide: true },
  { workspace: 1, title: "files", line: "tree ~/projects", wide: true },
];

/** The settings that come before the look: shipped defaults, then the scene's. */
export function sceneBefore(keys: readonly LookKey[]): SetupCommand[] {
  const byPath = new Map(keys.map((k) => [k.path, k]));
  const out: SetupCommand[] = [];
  for (const path of PINNED) {
    const def = byPath.get(path)?.default;
    if (def !== undefined)
      out.push({ command: "set", args: [path, def], wait: 20 });
  }
  for (const [path, value] of SHOWN) {
    if (byPath.has(path))
      out.push({ command: "set", args: [path, value], wait: 20 });
  }
  return out;
}

/**
 * The commands after the look: its layout, then the panes. The look's
 * startup keys only shape a new session, and this one is already running,
 * so they are applied here as the commands they stand for.
 */
export function sceneAfter(
  doc: Record<string, unknown>,
  { compact = false }: { compact?: boolean } = {},
): SetupCommand[] {
  const out: SetupCommand[] = [];
  const startup =
    doc.startup && typeof doc.startup === "object"
      ? (doc.startup as Record<string, unknown>)
      : {};
  const layout = startup.layout;
  if (layout === "bsp" || layout === "master-stack" || layout === "scrolling") {
    out.push({ command: "layout", args: [layout], wait: 30 });
  }
  let workspace = 1;
  for (const pane of PANES) {
    if (compact && pane.wide) continue;
    if (pane.workspace !== workspace) {
      out.push({
        command: "workspace",
        args: [String(pane.workspace)],
        wait: 60,
      });
      workspace = pane.workspace;
    }
    out.push({ command: "newWindow", args: [pane.title], wait: 220 });
    out.push({ command: "mode", args: ["terminal"], wait: 20 });
    out.push({ command: "type", args: [`${pane.line}\r`], wait: 120 });
  }
  if (startup.tiled === false) {
    out.push({ command: "tiling", args: ["off"], wait: 30 });
    out.push({ command: "cascade", wait: 30 });
  }
  return out;
}

/**
 * The commands that take a look off again before the next one goes on:
 * every key it set back to its default. `reset` (which the caller runs
 * first) closes the panes and restores the theme, but not the options.
 */
export function undoLook(
  setup: readonly SetupCommand[],
  keys: readonly LookKey[],
): SetupCommand[] {
  const byPath = new Map(keys.map((k) => [k.path, k]));
  const out: SetupCommand[] = [];
  const seen = new Set<string>();
  for (const step of setup) {
    if (!("command" in step) || step.command !== "set" || !step.args) continue;
    const path = step.args[0];
    if (seen.has(path)) continue;
    seen.add(path);
    const def = byPath.get(path)?.default;
    if (def !== undefined)
      out.push({ command: "set", args: [path, def], wait: 10 });
  }
  return out;
}
