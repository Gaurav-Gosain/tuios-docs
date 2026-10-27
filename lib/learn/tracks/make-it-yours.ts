import { closed, on, opened, ran, seq, setting } from "../matchers";
import type { Track } from "../types";

/**
 * A theme from the picker, then made your own in the theme editor. Glyphs,
 * borders, titles and the rail's current row from the settings search, the
 * screen saver, and the config file and share line that keep it.
 */
export const makeItYours: Track = {
  id: "make-it-yours",
  title: "Look and feel",
  blurb: "Themes, a theme editor, glyphs, borders, titles and a screen saver.",
  audience: "Ricers",
  group: "yours",
  minutes: 5,
  next: ["sessions", "power-moves"],
  setup: [
    // Named windows, so each frame has a title for the title style step.
    { command: "newWindow", args: ["fastfetch"], wait: 250 },
    { command: "mode", args: ["terminal"], wait: 150 },
    { command: "type", args: ["fastfetch\r"], wait: 300 },
    // top redraws every second, so a theme shows on it straight away.
    { command: "newWindow", args: ["top"], wait: 250 },
    { command: "type", args: ["top\r"], wait: 300 },
    { command: "mode", args: ["window"] },
  ],
  steps: [
    {
      id: "theme",
      title: "Try on a theme",
      note: "Type to filter, arrows to browse. Watch top change colour.",
      keys: ["ctrl+p", { text: "theme" }, "enter", { text: "nord" }, "enter"],
      done: seq(opened("themePicker"), on("theme"), closed("themePicker")),
      hint: "ctrl+p, type theme, enter. In the picker type nord, or browse with the arrows. Enter keeps it.",
      learned: "themes",
    },
    {
      id: "editor",
      title: "Open the theme editor",
      note: "ctrl+f shows only the dark themes. ctrl+e edits the theme under the cursor.",
      keys: [
        "ctrl+p",
        { text: "theme" },
        "enter",
        "ctrl+f",
        { text: "nord" },
        "ctrl+e",
      ],
      done: opened("themeEditor"),
      hint: "Open the theme picker again. ctrl+f, then type nord. ctrl+e opens the editor.",
      learned: "theme editor",
    },
    {
      id: "colour",
      title: "Change the accent colour",
      note: "Enter opens the colour picker. The arrows move the colour. Enter keeps it.",
      keys: ["enter", "right", "right", "up", "up", "enter"],
      done: on("themeEdit", (e) => e.data?.changed === true),
      hint: "The cursor is on Accent. Press enter, then the arrow keys, then enter again.",
      learned: "edit a colour",
    },
    {
      id: "drop",
      title: "Drop the change",
      note: "On your machine, ctrl+s saves it as your own theme. Here, esc twice drops it.",
      keys: ["esc", "esc"],
      done: closed("themeEditor"),
      hint: "Press esc. The dock asks first. Press esc again.",
      learned: "close the editor",
    },
    {
      id: "glyphs",
      title: "Pick heavy glyphs",
      note: "ctrl+b , opens the settings. / searches them. Glyphs are the shapes of frames and marks.",
      keys: [
        "ctrl+b",
        ",",
        "/",
        { text: "glyph" },
        "enter",
        { text: "heavy" },
        "enter",
      ],
      // The picker previews each set as you type, so the step waits for
      // enter to close it on a set that is not the shipped one.
      done: on(
        "overlay.close",
        (e) =>
          e.data?.name === "glyphPicker" &&
          (e.state?.glyphs ?? "default") !== "default",
      ),
      hint: "ctrl+b, then the comma key. Press / and type glyph. Enter opens the glyph picker. Type heavy and press enter.",
      learned: "settings",
    },
    {
      id: "borders",
      title: "Draw borders with them",
      note: "Set Border style to glyphs and the frames turn heavy.",
      keys: ["esc", "/", { text: "border style" }, "left"],
      done: setting("borderStyle"),
      hint: "Esc clears the search. Press / and type border style. Left picks glyphs.",
      learned: "border style",
    },
    {
      id: "title",
      title: "Change the title style",
      note: "A title is a pill, a tab or plain text on the border.",
      keys: ["esc", "/", { text: "title style" }, "right"],
      done: setting("appearance.window_title_style"),
      hint: "Esc clears the search. Press / and type title style. Right picks the next style.",
      learned: "title style",
    },
    {
      id: "row",
      title: "Mark the rail's current row",
      note: "The rail is open on the left. Current row sets how it marks where you are.",
      keys: ["esc", "/", { text: "current row" }, "right", "esc", "esc"],
      setup: [
        { command: "action", args: ["prefix_toggle_sidebar"], wait: 300 },
      ],
      done: seq(setting("appearance.sidebar.row_style"), closed("settings")),
      hint: "Press / and type current row. Right picks the next style. Esc twice closes the page.",
      learned: "rail row style",
    },
    {
      id: "screensaver",
      title: "Start the screen saver",
      note: "It kicks in by itself when you step away. Give it a few seconds, then any key wakes it.",
      keys: ["S", "esc"],
      needs: "window",
      done: seq(opened("screensaver"), closed("screensaver")),
      hint: "Press shift+s. Enjoy it, then press any key.",
      learned: "screen saver",
    },
    {
      id: "config",
      title: "Keep it forever",
      note: "Your picks, saved in one file.",
      keys: ["i", { text: "cat .config/tuios/config.toml" }, "enter"],
      // The window fastfetch ran in has a prompt. top is in the other one.
      setup: [{ command: "action", args: ["select_window_1"], wait: 200 }],
      done: ran("cat"),
      hint: "Press i to type, then cat .config/tuios/config.toml and enter.",
      learned: "config file",
    },
    {
      id: "share",
      title: "Share your theme",
      note: "One line holds the whole theme. Paste it in a chat.",
      keys: [{ text: "tuios theme share nord" }, "enter"],
      needs: "terminal",
      done: on(
        "shell.command",
        (e) =>
          /^tuios theme share\b/.test(String(e.data?.line ?? "")) &&
          e.data?.exitCode === 0,
      ),
      hint: "Type tuios theme share nord and press enter.",
      learned: "theme share",
    },
  ],
};
