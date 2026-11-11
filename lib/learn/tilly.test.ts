import { describe, expect, test } from "bun:test";
import { coach, tracks } from "./lessons";
import { SOUNDS } from "./sound";
import {
  fill,
  HINTED_LEAD,
  isNudge,
  LinePicker,
  NUDGE_LINES,
  POKE_LINES,
  REACTION_LINES,
  type Reaction,
  reactionFor,
  slotsFor,
  TillyScript,
} from "./tilly";
import type { TuiosEvent } from "./types";

const ev = (type: string, data: Record<string, unknown> = {}): TuiosEvent => ({
  type,
  data,
});

/** A random source that walks through the given values, then repeats. */
function seq(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("reactionFor", () => {
  const cases: [string, TuiosEvent | null, string, Reaction][] = [
    ["no event", null, "", "generic"],
    ["new window", ev("window.open"), "prefix_new_window", "open"],
    ["n key", ev("window.open"), "new_window", "open"],
    ["split right", ev("window.open"), "prefix_split_vertical", "split"],
    ["split down", ev("window.open"), "prefix_split_horizontal", "split"],
    ["close", ev("window.close"), "", "close"],
    ["focus", ev("window.focus", { to: "2" }), "", "focus"],
    ["zoom", ev("window.zoom", { zoomed: false }), "", "zoom"],
    ["float", ev("window.float", { floating: true }), "", "float"],
    ["rotate", ev("window.move"), "rotate_split", "rotate"],
    ["swap", ev("window.move"), "swap_left", "swap"],
    ["resize", ev("window.move"), "resize_master_grow", "resize"],
    ["drag", ev("window.move"), "", "move"],
    ["workspace", ev("workspace", { from: 1, to: 2 }), "", "workspace"],
    [
      "send",
      ev("workspace", { from: 1, to: 3 }),
      "workspace_prefix_move_3",
      "send",
    ],
    ["layout", ev("layout", { to: "scrolling" }), "", "layout"],
    ["theme", ev("theme", { to: "nord" }), "", "theme"],
    ["glyphs", ev("setting", { name: "glyphs" }), "", "look"],
    ["help closed", ev("overlay.close", { name: "help" }), "", "help"],
    ["palette", ev("overlay.open", { name: "commandPalette" }), "", "palette"],
    ["search", ev("overlay.close", { name: "copyMode" }), "", "copy"],
    ["sidebar", ev("overlay.open", { name: "sidebar" }), "", "sidebar"],
    ["unknown overlay", ev("overlay.open", { name: "x" }), "", "generic"],
    ["typing", ev("mode", { to: "terminal" }), "", "typing"],
    ["window mode", ev("mode", { to: "window" }), "", "windowMode"],
    ["which key", ev("prefix", { from: "window", to: "" }), "", "menu"],
    ["fastfetch", ev("shell.command", { command: "fastfetch" }), "", "command"],
    ["top", ev("shell.start", { command: "top" }), "", "command"],
    ["tape", ev("tape.finish"), "", "tape"],
    ["agent works", ev("agent", { to: "working" }), "", "agentWorking"],
    ["agent done", ev("agent", { to: "done" }), "", "agentDone"],
    [
      "showkeys",
      ev("notification", { message: "Showkeys: ON" }),
      "",
      "showkeys",
    ],
    ["yank", ev("notification", { message: "Yanked 3 lines" }), "", "yank"],
    ["other note", ev("notification", { message: "hello" }), "", "generic"],
  ];
  for (const [name, event, action, want] of cases) {
    test(name, () => {
      expect(reactionFor(event, action)).toBe(want);
    });
  }

  test("every reaction has lines", () => {
    for (const lines of Object.values(REACTION_LINES)) {
      expect(lines.length).toBeGreaterThan(0);
    }
  });
});

describe("LinePicker", () => {
  test("never repeats a line back to back", () => {
    const picker = new LinePicker(Math.random);
    const pool = ["a", "b", "c"];
    let last = "";
    for (let i = 0; i < 500; i++) {
      const line = picker.pick(pool);
      expect(line).not.toBe(last);
      last = line;
    }
  });

  test("uses the whole pool before coming back to a line", () => {
    // Always the first choice left: a picker with no memory would say "a"
    // every time.
    const picker = new LinePicker(() => 0);
    expect([1, 2, 3, 4].map(() => picker.pick(["a", "b", "c", "d"]))).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  test("a pool of one says its line", () => {
    const picker = new LinePicker(() => 0.99);
    expect(picker.pick(["only"])).toBe("only");
    expect(picker.pick(["only"])).toBe("only");
  });

  test("an empty pool says nothing", () => {
    expect(new LinePicker().pick([])).toBe("");
  });

  test("a random value of 1 stays in range", () => {
    expect(new LinePicker(() => 1).pick(["a", "b"])).toBe("b");
  });
});

describe("fill and slots", () => {
  test("fills named slots", () => {
    expect(fill("Workspace {n}, {layout}.", { n: 2, layout: "BSP" })).toBe(
      "Workspace 2, BSP.",
    );
  });

  test("reads slots from the event", () => {
    expect(slotsFor(ev("workspace", { to: 4 })).n).toBe(4);
    expect(slotsFor(ev("layout", { to: "master-stack" })).layout).toBe(
      "Master and stack",
    );
    expect(slotsFor(ev("shell.command", { command: "ls" })).command).toBe("ls");
  });
});

describe("TillyScript", () => {
  test("reacts to the event that finished the step", () => {
    const script = new TillyScript(() => 0);
    const said = script.react({
      explainer: false,
      event: ev("window.open"),
      lastAction: "prefix_split_vertical",
      result: "clean",
    });
    expect(REACTION_LINES.split).toContain(said.text);
    expect(said.mood).toBe("happy");
    expect(said.sound).toBe("chime");
  });

  test("fills the workspace number, and skips lines it cannot fill", () => {
    const script = new TillyScript(seq(0, 0.5, 0.99));
    for (let i = 0; i < 6; i++) {
      const said = script.react({
        explainer: false,
        event: ev("workspace", { from: 1, to: 2 }),
        result: "clean",
      });
      expect(said.text).not.toContain("{");
      expect(said.text).toContain("2");
    }
    const noSlot = script.react({
      explainer: false,
      event: ev("layout", {}),
      result: "clean",
    });
    expect(noSlot.text).not.toContain("{");
  });

  test("leads with a nod when the step needed help", () => {
    const script = new TillyScript(() => 0);
    const said = script.react({
      explainer: false,
      event: ev("window.close"),
      result: "hinted",
    });
    expect(HINTED_LEAD.some((l) => said.text.startsWith(`${l} `))).toBe(true);
  });

  test("a skipped step gets no chime", () => {
    const said = new TillyScript().react({
      explainer: false,
      event: ev("window.open"),
      result: "skipped",
    });
    expect(REACTION_LINES.skipped).toContain(said.text);
    expect(said.sound).toBe("blip");
  });

  test("an explainer step", () => {
    const said = new TillyScript().react({
      explainer: true,
      event: null,
      result: "clean",
    });
    expect(REACTION_LINES.explainer).toContain(said.text);
  });

  test("greets and cheers every track in its own words", () => {
    for (const track of tracks) {
      const script = new TillyScript();
      const hi = script.greet(track);
      expect(hi.mood).toBe("wave");
      expect(track.coach?.greet ?? coach.greet).toContain(hi.text);
      const bye = script.finish(track, ["clean", "hinted"]);
      expect(bye.mood).toBe("cheer");
      expect(bye.sound).toBe("fanfare");
      expect(bye.text).not.toContain("{");
      expect([...(track.coach?.finish ?? []), ...coach.finish]).toContain(
        bye.text,
      );
    }
  });

  test("nudges think and use the nudge tone", () => {
    const said = new TillyScript().nudge("altBlocked");
    expect(said.mood).toBe("think");
    expect(said.sound).toBe("nudge");
    expect(said.text).toContain("Option");
  });
});

describe("isNudge", () => {
  test("every nudge the engine names has lines", () => {
    for (const n of [
      "idle",
      "wrongKeys",
      "wrongModeWindow",
      "wrongModeTerminal",
      "showMe",
      "altBlocked",
      "noWindow",
    ]) {
      expect(isNudge(n)).toBe(true);
      expect(NUDGE_LINES[n as keyof typeof NUDGE_LINES].length).toBeGreaterThan(
        0,
      );
    }
    expect(isNudge("")).toBe(false);
  });
});

// En and em dashes, spelled as escapes so this file has none.
const DASHES = /[\u2013\u2014]/;

describe("the lines", () => {
  const all = [
    ...Object.values(REACTION_LINES).flat(),
    ...coach.greet,
    ...coach.finish,
    ...tracks.flatMap((t) => [
      ...(t.coach?.greet ?? []),
      ...(t.coach?.finish ?? []),
    ]),
    ...Object.values(NUDGE_LINES).flat(),
    ...HINTED_LEAD,
    ...POKE_LINES,
  ];

  test("plain text: no em dashes, no emojis, no exclamation marks", () => {
    for (const line of all) {
      expect(line).not.toMatch(DASHES);
      expect(line).not.toMatch(/--|!/);
      expect(line).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  test("short enough for the bubble", () => {
    for (const line of all) expect(line.length).toBeLessThanOrEqual(130);
  });

  test("every track has a greeting", () => {
    for (const t of tracks) expect(t.coach?.greet?.length).toBeGreaterThan(0);
  });
});

describe("sounds", () => {
  test("every sound is short and quiet", () => {
    for (const notes of Object.values(SOUNDS)) {
      expect(notes.length).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n.gain).toBeLessThanOrEqual(0.5);
        expect(n.at + n.dur).toBeLessThan(1.2);
      }
    }
  });
});
