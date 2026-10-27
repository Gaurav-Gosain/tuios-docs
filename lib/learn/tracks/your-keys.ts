import { closed, on, opened, seq, via, zoomed } from "../matchers";
import type { Track } from "../types";

/** The preset a keys event moved to. */
const presetIs = (name: string) =>
  on("keys", (e) => (e.data?.to as { preset?: string })?.preset === name);

/**
 * Keybind presets, run on the GNU screen keys as the example, then actions
 * by name and the list of every key. The screen keys are in tuios's
 * internal/config/presets/screen.toml.
 */
export const yourKeys: Track = {
  id: "your-keys",
  title: "Your keys, your way",
  blurb: "Presets for tmux, screen and zellij, actions by name, every key.",
  audience: "Keyboard owners",
  group: "yours",
  minutes: 4,
  next: ["make-it-yours", "power-moves"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["window"] },
  ],
  steps: [
    {
      id: "presets",
      title: "Open the keybind presets",
      note: "Each preset gives you the keys of another multiplexer.",
      keys: ["U"],
      needs: "window",
      done: opened("presets"),
      hint: "Press capital U, so shift and u.",
      learned: "presets",
    },
    {
      id: "screen",
      title: "Try the screen keys",
      note: "The panel says which keys your programs lose. Screen's leader is ctrl+a.",
      keys: ["down", "down", "enter"],
      done: presetIs("screen"),
      hint: "Press down twice to screen, then enter.",
      learned: "screen preset",
    },
    {
      id: "split",
      title: "Split the screen way",
      note: "ctrl+a, then capital S, as in screen.",
      keys: ["ctrl+a", "S"],
      done: via(["prefix_split_horizontal"], on("window.open")),
      hint: "Hold ctrl and tap a, let go. Then shift and s.",
      learned: "split, screen keys",
    },
    {
      id: "next",
      title: "Hop with tab",
      note: "ctrl+a, then tab moves to the next region.",
      keys: ["ctrl+a", "tab"],
      done: via(["prefix_next_window"], on("window.focus")),
      hint: "ctrl+a, then tab.",
      learned: "next pane, screen keys",
    },
    {
      id: "back",
      title: "Back to the tuios keys",
      note: "Every preset is a row in the palette too.",
      keys: ["ctrl+p", { text: "preset" }, "enter", "up", "up", "enter"],
      done: presetIs("tuios"),
      hint: "ctrl+p, type preset, enter. Up twice to tuios, then enter.",
      learned: "switch presets",
    },
    {
      id: "by-name",
      title: "Run any action by name",
      note: "In the palette, # searches every action and shows its keys.",
      keys: ["ctrl+p", { text: "#zoom" }, "enter"],
      done: zoomed(true),
      hint: "ctrl+p, type #zoom, then enter on Toggle zoom.",
      learned: "actions by name",
    },
    {
      id: "every-key",
      title: "Every key in one list",
      note: "Search it with /. Esc closes it.",
      keys: ["ctrl+b", "k", "esc"],
      done: seq(opened("keybinds"), closed("keybinds")),
      hint: "ctrl+b, then k. Look around, then esc.",
      learned: "keybinds list",
    },
  ],
};
