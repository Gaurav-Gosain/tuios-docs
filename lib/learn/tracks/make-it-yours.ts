import { closed, on, opened, ran, seq, setting } from "../matchers";
import type { Track } from "../types";

/** Themes, the settings page, glyph sets, borders and the screen saver. */
export const makeItYours: Track = {
  id: "make-it-yours",
  title: "Make it yours",
  blurb: "Hundreds of themes, borders, glyphs and a screen saver.",
  audience: "Ricers",
  minutes: 3,
  next: ["power-moves", "agents"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["terminal"], wait: 150 },
    { command: "type", args: ["neofetch\r"], wait: 300 },
    // top redraws every second, so a theme shows on it straight away.
    { command: "newWindow", wait: 250 },
    { command: "type", args: ["top\r"], wait: 300 },
    { command: "mode", args: ["window"] },
  ],
  steps: [
    {
      id: "theme",
      title: "Try on a theme",
      note: "Type to filter, arrows to browse. Watch top change color.",
      keys: [
        "ctrl+p",
        { text: "theme" },
        "enter",
        { text: "gruvbox" },
        "enter",
      ],
      done: seq(opened("themePicker"), on("theme"), closed("themePicker")),
      hint: "ctrl+p, type theme, enter. In the picker type gruvbox, or browse with the arrows. Enter keeps it.",
      learned: "themes",
    },
    {
      id: "settings",
      title: "Open the settings",
      note: "Everything in the config file, live.",
      keys: ["ctrl+b", ","],
      done: opened("settings"),
      hint: "ctrl+b, then the comma key.",
      learned: "settings",
    },
    {
      id: "glyphs",
      title: "Pick heavy glyphs",
      note: "The shapes tuios draws its frames and marks with.",
      keys: ["down", "right"],
      done: setting("glyphs"),
      hint: "Down once to Glyph set, then right to change it.",
      learned: "glyphs",
    },
    {
      id: "borders",
      title: "Draw borders with them",
      note: "Set Border style to glyphs and the frames turn heavy. Esc closes, so you can look.",
      keys: ["down", "left", "esc"],
      done: seq(setting("borderStyle"), closed("settings")),
      hint: "Down once to Border style, left to glyphs, then esc.",
      learned: "border style",
    },
    {
      id: "screensaver",
      title: "Start the screen saver",
      note: "It kicks in by itself when you step away. Give it a few seconds, then any key wakes it.",
      keys: ["S", "esc"],
      needs: "window",
      done: seq(opened("screensaver"), closed("screensaver")),
      hint: "Capital S, so shift and s. Enjoy it, then press any key.",
      learned: "screen saver",
    },
    {
      id: "config",
      title: "Keep it forever",
      note: "Your picks, saved in one file.",
      keys: ["i", { text: "cat .config/tuios/config.toml" }, "enter"],
      // The window neofetch ran in has a prompt. top is in the other one.
      setup: [{ command: "action", args: ["select_window_1"], wait: 200 }],
      done: ran("cat"),
      hint: "Press i to type, then cat .config/tuios/config.toml and enter.",
      learned: "config file",
    },
  ],
};
