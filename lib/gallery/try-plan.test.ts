import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "smol-toml";
import seed from "./gallery-seed.json";
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

  test("every seed look plans with no key skipped but its left-out ones", () => {
    const root = path.join(import.meta.dir, "../..");
    for (const entry of seed.entries) {
      const text = readFileSync(
        path.join(root, "public/gallery-seed", `${entry.title}.look.toml`),
        "utf8",
      );
      const l = (entry as { look: typeof look }).look;
      const plan = planLook(parse(text) as Record<string, unknown>, l, KEYS);
      expect(plan.skipped).toEqual(l.left);
      expect(plan.setup.length).toBeGreaterThan(0);
    }
  });
});
