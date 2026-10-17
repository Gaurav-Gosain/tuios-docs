import { describe, expect, test } from "bun:test";
import keys from "./look-keys.json";
import { sceneAfter, sceneBefore, undoLook } from "./try-scene";

const args = (setup: { command?: string; args?: string[] }[], name: string) =>
  setup.filter((s) => s.command === name).map((s) => s.args ?? []);

describe("sceneBefore", () => {
  test("puts the shipped defaults back, then turns the rail and clock on", () => {
    const sets = args(sceneBefore(keys.keys), "set");
    expect(sets).toContainEqual(["appearance.dockbar_position", "top"]);
    // The rail's shipped default and the scene agree, and the scene's comes last.
    expect(sets.at(-3)).toEqual(["appearance.sidebar.enabled", "true"]);
    expect(sets).toContainEqual(["appearance.show_clock", "true"]);
    // Every path is a look key, which the engine's set takes.
    const paths = new Set(keys.keys.map((k) => k.path));
    for (const [path] of sets) expect(paths.has(path)).toBe(true);
  });
});

describe("sceneAfter", () => {
  test("opens four panes on workspace 1 and one on each of 2 and 3", () => {
    const setup = sceneAfter({});
    expect(args(setup, "newWindow")).toHaveLength(6);
    expect(args(setup, "workspace")).toEqual([["3"], ["2"], ["1"]]);
  });

  test("the compact scene has two panes on workspace 1", () => {
    expect(args(sceneAfter({}, { compact: true }), "newWindow")).toHaveLength(
      4,
    );
  });

  test("applies the look's startup layout and tiling", () => {
    const setup = sceneAfter({
      startup: { layout: "master-stack", tiled: false },
    });
    expect(args(setup, "layout")).toEqual([["master-stack"]]);
    expect(args(setup, "tiling")).toEqual([["off"]]);
    expect(args(sceneAfter({ startup: { layout: "nope" } }), "layout")).toEqual(
      [],
    );
  });
});

describe("undoLook", () => {
  test("sets each key a look set back to its default, once", () => {
    const undo = undoLook(
      [
        { command: "set", args: ["appearance.border_style", "thick"] },
        { command: "set", args: ["appearance.border_style", "double"] },
        { command: "themeJSON", args: ["x", "{}"] },
      ],
      keys.keys,
    );
    const def = keys.keys.find(
      (k) => k.path === "appearance.border_style",
    )?.default;
    expect(args(undo, "set")).toEqual([
      ["appearance.border_style", def as string],
    ]);
  });
});
