import { describe, expect, test } from "bun:test";
import lookKeys from "./look-keys.json";
import { planLook } from "./try-plan";

const KEYS = new Set(lookKeys.keys.map((k) => k.path));

const look = {
  id: "amber",
  left: ["dock.tabs"],
  leftCount: 1,
  hash: "0".repeat(32),
};

describe("planLook", () => {
  test("sets each key, then loads the look's own theme last", () => {
    const plan = planLook(
      {
        look: 1,
        name: "amber",
        author: "x",
        appearance: { theme: "amber-crt", gap: 1, sidebar: { enabled: true } },
        theme: { id: "amber-crt", base: "nord", chrome: { accent: "#fff" } },
      },
      look,
      KEYS,
    );
    expect(plan.setup).toEqual([
      { command: "set", args: ["appearance.gap", "1"], wait: 30 },
      {
        command: "set",
        args: ["appearance.sidebar.enabled", "true"],
        wait: 30,
      },
      {
        command: "themeJSON",
        args: [
          "amber-crt",
          JSON.stringify({
            id: "amber-crt",
            base: "nord",
            chrome: { accent: "#fff" },
          }),
        ],
        wait: 50,
      },
    ]);
    expect(plan.skipped).toEqual(["dock.tabs"]);
  });

  test("a look without a theme sets appearance.theme, and a glyph set is skipped", () => {
    const plan = planLook(
      { look: 1, appearance: { theme: "nord" }, glyphs: { id: "g" } },
      { ...look, left: [], leftCount: 3 },
      KEYS,
    );
    expect(plan.setup).toEqual([
      { command: "set", args: ["appearance.theme", "nord"], wait: 30 },
    ]);
    expect(plan.skipped).toEqual(["3 more", "glyphs (a glyph set)"]);
  });

  test("a list is set as a JSON array", () => {
    const plan = planLook(
      {
        look: 1,
        startup: { tiled: true },
        dock: {
          left: ["mode", "workspaces"],
          center: [],
          tabs: { number_glyphs: ["一"] },
        },
        appearance: { sidebar: { sections: "sessions,files" } },
      },
      { ...look, left: ["dock.right: custom/clock"], leftCount: 1 },
      KEYS,
    );
    expect(plan.setup).toEqual([
      { command: "set", args: ["startup.tiled", "true"], wait: 30 },
      {
        command: "set",
        args: ["dock.left", '["mode","workspaces"]'],
        wait: 30,
      },
      { command: "set", args: ["dock.center", "[]"], wait: 30 },
      { command: "set", args: ["dock.tabs.number_glyphs", '["一"]'], wait: 30 },
      {
        command: "set",
        args: ["appearance.sidebar.sections", "sessions,files"],
        wait: 30,
      },
    ]);
    expect(plan.skipped).toEqual(["dock.right: custom/clock"]);
  });

  test("a path that is not a look key is skipped, never set", () => {
    const plan = planLook(
      {
        look: 1,
        appearance: { gap: 1, preferred_shell: "/bin/sh" },
        hooks: { on_start: "touch /tmp/x" },
      },
      { ...look, left: [], leftCount: 0 },
      KEYS,
    );
    expect(plan.setup).toEqual([
      { command: "set", args: ["appearance.gap", "1"], wait: 30 },
    ]);
    expect(plan.skipped).toEqual([
      "appearance.preferred_shell",
      "hooks.on_start",
    ]);
  });
});
