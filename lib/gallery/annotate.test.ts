import { describe, expect, test } from "bun:test";
import { annotate, isConfigKey } from "./annotate";
import type { GalleryNote } from "./feed";
import { isColour } from "./look-check";

const CONFIG = `# my setup
[appearance]
theme = "nord" # a comment with "quotes"
gap = "lots"
dim_unfocused = 1000
border_style = "spiky"
border_focused_color = "notacolour"
border_unfocused_color = "#4c566a"
preferred_shell = "/bin/zsh"
made_up = 1
selection.bold = true
window_title_format = """
gap = 99
"""
panel_padding = [
  1,
  2,
]

[appearance.sidebar]
header_style = "icon"

[hooks]
after-agent-state = "x"

[nonsense]
x = 1
`;

function byPath(notes: GalleryNote[]) {
  return Object.fromEntries(notes.map((n) => [n.path, n]));
}

describe("annotate", () => {
  const notes = annotate(CONFIG);
  const lines = CONFIG.split("\n");
  const at = byPath(notes);

  test("every note points at its key", () => {
    for (const n of notes) {
      const key = lines[n.line].slice(n.start, n.end);
      const last = n.path.split(".").at(-1) as string;
      expect(key).toContain(last);
    }
  });

  test("a look key with a good value is a doc note", () => {
    expect(at["appearance.theme"].kind).toBe("doc");
    expect(at["appearance.border_unfocused_color"].kind).toBe("doc");
    expect(at["appearance.sidebar.header_style"].kind).toBe("doc");
    expect(at["appearance.selection.bold"].kind).toBe("doc");
  });

  test("a bad value says why and where", () => {
    expect(at["appearance.gap"].why).toBe("expected a whole number");
    expect(at["appearance.dim_unfocused"].why).toMatch(/^out of range: /);
    expect(at["appearance.border_style"].why).toMatch(/^expected one of: /);
    expect(at["appearance.border_focused_color"].why).toBe("not a colour");
    const n = at["appearance.gap"];
    expect(
      lines[n.line].slice(n.valueStart as number, n.valueEnd as number),
    ).toBe('"lots"');
  });

  test("a tuios key outside the look is left out, a made-up key is unknown", () => {
    expect(at["appearance.preferred_shell"].kind).toBe("left");
    expect(at["appearance.made_up"].kind).toBe("unknown");
    expect(at.hooks.kind).toBe("left");
    expect(at.nonsense.kind).toBe("unknown");
    // The keys inside a left-out table get no note of their own.
    expect(at["hooks.after-agent-state"]).toBeUndefined();
    expect(at["nonsense.x"]).toBeUndefined();
  });

  test("lines inside a multi-line string or array are not keys", () => {
    expect(notes.filter((n) => n.path === "appearance.gap")).toHaveLength(1);
    expect(at["appearance.panel_padding"].kind).toBe("bad");
    expect(at["appearance.panel_padding"].valueStart).toBeUndefined();
  });

  test("a float for a whole-number key is bad, as tuios refuses it", () => {
    const [n] = annotate("[appearance]\nanimation_speed = 100.0");
    expect(n.kind).toBe("bad");
    expect(n.why).toBe("expected a whole number");
  });

  test("an inline table of look keys is not called left out", () => {
    for (const text of [
      "appearance = { gap = 1 }",
      "[appearance]\nsidebar = { enabled = true }",
    ]) {
      expect(annotate(text)).toEqual([]);
    }
  });

  test("text that is not TOML has no notes", () => {
    expect(annotate("[appearance\ngap = 1")).toEqual([]);
  });
});

describe("isConfigKey", () => {
  test("maps and named tables", () => {
    expect(isConfigKey(["hooks", "anything"])).toBe(true);
    expect(isConfigKey(["dock", "custom", "mine", "command"])).toBe(true);
    expect(isConfigKey(["appearance", "made_up"])).toBe(false);
  });
});

describe("isColour", () => {
  const good = [
    "#fff",
    "#4C566A",
    "0",
    "255",
    "accent",
    "border.unfocused",
    "bright_magenta",
    "Bright-Purple",
    "fg",
    "sapphire",
    "",
  ];
  const bad = ["#ff", "#gggggg", "256", "1.5", "notacolour", "rgb(1,2,3)"];
  for (const c of good)
    test(`"${c}" is a colour`, () => expect(isColour(c)).toBe(true));
  for (const c of bad)
    test(`"${c}" is not`, () => expect(isColour(c)).toBe(false));
});
