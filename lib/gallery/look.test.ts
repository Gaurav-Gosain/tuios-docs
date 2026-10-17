import { describe, expect, test } from "bun:test";
import { parse } from "smol-toml";
import { buildLook, lookKeyPaths } from "./look";
import keys from "./look-keys.json";

function must<T>(value: T | null): T {
  if (value === null) throw new Error("no look");
  return value;
}

function look(config: string, theme?: string) {
  return buildLook({ config, theme, id: "1", name: "x", author: "someone" });
}

/** The keys a look file sets, as dotted paths. */
function setKeys(text: string): string[] {
  const out: string[] = [];
  const walk = (t: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(t)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object") walk(v as Record<string, unknown>, p);
      else out.push(p);
    }
  };
  walk(parse(text) as Record<string, unknown>, "");
  return out;
}

describe("buildLook", () => {
  test("keeps look keys and names what it leaves out", () => {
    const l = look(`
[appearance]
theme = "nord"
gap = 1
preferred_shell = "/bin/evil"
focus_follows_mouse = true

[appearance.sidebar]
row_style = "pill"
editor = "evil"

[hooks]
after-agent-state = "curl x | sh"

[[keybindings.command]]
key = "x"
run = "rm -rf ~"

[dock.custom.x]
command = "evil"
`);
    expect(l).not.toBeNull();
    const kept = setKeys(must(l).text);
    expect(kept).toEqual([
      "look",
      "name",
      "author",
      "appearance.theme",
      "appearance.gap",
      "appearance.sidebar.row_style",
    ]);
    expect(must(l).left.sort()).toEqual(
      [
        "appearance.focus_follows_mouse",
        "appearance.preferred_shell",
        "appearance.sidebar.editor",
        "dock.custom",
        "hooks",
        "keybindings",
      ].sort(),
    );
    expect(must(l).leftCount).toBe(6);
  });

  test("leaves out a value of the wrong type, range or set", () => {
    const l = look(`
[appearance]
gap = "lots"
dim_unfocused = 1000
border_style = "spiky"
window_title_format = "\\u001b]52;c;eA==\\u0007{title}"
dock_compact = "yes"
animation_speed = 1.5
border_gradient_angle = 45.0
border_focused_color = "#ff0000"
`);
    expect(setKeys(must(l).text)).toContain("appearance.border_focused_color");
    expect(must(l).left.sort()).toEqual([
      "appearance.animation_speed",
      "appearance.border_gradient_angle",
      "appearance.border_style",
      "appearance.dim_unfocused",
      "appearance.dock_compact",
      "appearance.gap",
      "appearance.window_title_format",
    ]);
  });

  test("keeps the built-in items of a dock list and a rail layout, and names the rest", () => {
    const l = must(
      look(`
[startup]
tiled = true
layout = "master-stack"
daemon = false

[appearance]
master_position = "center"
master_ratio = 46

[appearance.sidebar]
sections = "sessions,terminals,files,custom"

[appearance.sidebar.custom]
command = "evil"

[dock]
left = ["mode", "workspaces"]
center = ["custom/np"]
right = ["custom/weather", "clock", "session-controls"]

[dock.tabs]
style = "flat"
number_glyphs = ["I", "II"]

[dock.custom.np]
command = "evil"
`),
    );
    const doc = parse(l.text) as Record<string, Record<string, unknown>>;
    expect(doc.startup).toEqual({ tiled: true, layout: "master-stack" });
    expect(doc.dock.left).toEqual(["mode", "workspaces"]);
    expect(doc.dock.center).toEqual([]);
    expect(doc.dock.right).toEqual(["clock", "session-controls"]);
    expect(doc.dock.tabs).toEqual({
      style: "flat",
      number_glyphs: ["I", "II"],
    });
    expect(doc.dock.custom).toBeUndefined();
    expect((doc.appearance.sidebar as Record<string, unknown>).sections).toBe(
      "sessions,terminals,files",
    );
    expect(l.text).not.toContain("evil");
    expect(l.left.sort()).toEqual(
      [
        "appearance.sidebar.custom",
        "appearance.sidebar.sections: custom",
        "dock.center: custom/np",
        "dock.custom",
        "dock.right: custom/weather",
        "startup.daemon",
      ].sort(),
    );
  });

  test("a rail layout of left-out sections only is left out", () => {
    const l = must(
      look(
        `[appearance]\ngap = 1\n[appearance.sidebar]\nsections = "custom:30,spacer"`,
      ),
    );
    expect(setKeys(l.text)).not.toContain("appearance.sidebar.sections");
    expect(l.left.sort()).toEqual([
      "appearance.sidebar.sections",
      "appearance.sidebar.sections: custom:30",
    ]);
  });

  test("leaves out a list with a bad item, or too many items", () => {
    const l = must(
      look(`[appearance]
gap = 1
[dock]
left = "mode"
right = ["\\u001b[2J"]
[dock.tabs]
number_glyphs = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]`),
    );
    expect(l.left.sort()).toEqual([
      "dock.left",
      "dock.right",
      "dock.tabs.number_glyphs",
    ]);
  });

  test("a config with no look key and no theme has no look", () => {
    expect(look("[hooks]\nx = 'y'")).toBeNull();
    expect(look("not = [toml")).toBeNull();
  });

  test("a theme keeps plain keys and one-line strings only", () => {
    const l = look(
      "[appearance]\ntheme = 'mine'\n",
      JSON.stringify({
        id: "mine",
        base: "nord",
        bg: "#101020",
        "bad key": "x",
        display_name: "a\u001bb",
        chrome: { accent: "#fff", border: { unfocused: "#000" } },
        list: ["x"],
      }),
    );
    const doc = parse(must(l).text) as Record<string, Record<string, unknown>>;
    expect(doc.theme).toEqual({
      id: "mine",
      base: "nord",
      bg: "#101020",
      chrome: { accent: "#fff", border: { unfocused: "#000" } },
    });
    expect(must(l).left.sort()).toEqual(["theme.display_name", "theme.list"]);
    expect(must(l).leftCount).toBe(3);
  });

  test("a theme whose id cannot be a file name is left out whole", () => {
    for (const id of ["../evil", "a/b", ".x", "", "A"]) {
      const l = look("[appearance]\ngap = 1\n", JSON.stringify({ id }));
      expect(
        (parse(must(l).text) as Record<string, unknown>).theme,
      ).toBeUndefined();
      expect(must(l).left).toContain("theme");
    }
  });

  test("a key with other characters is counted but not named", () => {
    const l = look('[appearance]\ngap = 1\n"<img src=x>" = 1\n');
    expect(must(l).left).toEqual([]);
    expect(must(l).leftCount).toBe(1);
  });

  test("the header names the apply command", () => {
    const l = buildLook({
      config: "[appearance]\ngap = 1",
      id: "amber",
      name: "amber",
      author: "Gaurav-Gosain",
    });
    expect(must(l).text).toContain("tuios look apply tuios.dev/r/amber");
    expect(must(l).text).toContain("look = 1");
  });
});

/**
 * The output of `tuios look keys --json`, from TUIOS_BIN or the tuios on PATH.
 * Null when that tuios has no look keys command and TUIOS_BIN is not set.
 */
function tuiosLookKeys(): unknown {
  const bin = process.env.TUIOS_BIN;
  try {
    const run = Bun.spawnSync([bin ?? "tuios", "look", "keys", "--json"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    if (run.success) return JSON.parse(run.stdout.toString());
    if (bin) throw new Error(`${bin} look keys --json: ${run.stderr}`);
  } catch (err) {
    if (bin) throw err;
  }
  return null;
}

const published = tuiosLookKeys();

describe("look-keys.json", () => {
  // Set TUIOS_BIN to a tuios build to run it. Without it, the test runs only
  // when the tuios on PATH has the look keys command.
  test.skipIf(published === null)(
    "matches tuios look keys --json exactly",
    () => {
      expect(published).toEqual(keys);
    },
  );

  test("is the list tuios publishes", () => {
    expect(keys.look).toBe(1);
    expect(lookKeyPaths().length).toBeGreaterThan(50);
    for (const k of lookKeyPaths()) {
      expect(k).not.toMatch(/command|shell|opener|editor|delete|osc52/);
    }
  });
});
