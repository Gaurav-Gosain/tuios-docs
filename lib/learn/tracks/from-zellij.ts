import { closed, on, opened, seq, via, zoomed } from "../matchers";
import type { Track } from "../types";
import { sampleWindow } from "./setups";

/** The focus moves the zellij preset puts in its pane menu. */
const FOCUS = [
  "terminal_focus_left",
  "terminal_focus_right",
  "terminal_focus_up",
  "terminal_focus_down",
];

/**
 * For zellij users. The track turns on the zellij preset first, so every key
 * after that is zellij's own: ctrl+g, then a mode key, then one key. The
 * preset also turns on lock mode, as zellij's locked mode. The keys are in
 * tuios's internal/config/presets/zellij.toml.
 */
export const fromZellij: Track = {
  id: "from-zellij",
  title: "Coming from zellij",
  blurb: "Turn on the zellij keys, then use them: panes, tabs, floats, search.",
  audience: "zellij users",
  group: "start",
  minutes: 5,
  next: ["your-keys", "layouts"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["window"] },
  ],
  steps: [
    {
      id: "preset",
      title: "Pick the zellij keys",
      note: "U opens the keybind presets. zellij is the fourth row.",
      keys: ["U", "down", "down", "down", "enter"],
      needs: "window",
      done: on(
        "keys",
        (e) => (e.data?.to as { preset?: string })?.preset === "zellij",
      ),
      hint: "Press capital U. Press down three times to zellij, then enter.",
      learned: "zellij preset",
    },
    {
      id: "locked",
      title: "Locked, like zellij",
      note: "i starts typing. Every key now goes to the program, except ctrl+g.",
      keys: ["i", { text: "top" }, "enter"],
      done: on("shell.start", (e) => e.data?.command === "top"),
      hint: "Press i, type top and press enter. The lock in the dock means locked.",
      learned: "lock mode",
    },
    {
      id: "split-right",
      title: "Split right",
      note: "ctrl+g opens the menu. p is the pane menu, r splits right.",
      keys: ["ctrl+g", "p", "r"],
      done: via(["split_vertical"], on("window.open")),
      hint: "Hold ctrl and tap g, let go. Then p, then r.",
      learned: "split right",
    },
    {
      id: "split-down",
      title: "Split down",
      note: "Same menu, d for down.",
      keys: ["ctrl+g", "p", "d"],
      done: via(["split_horizontal"], on("window.open")),
      hint: "ctrl+g, then p, then d.",
      learned: "split down",
    },
    {
      id: "focus",
      title: "Move between panes",
      note: "h, j, k and l move. The menu stays open for more moves. Esc closes it.",
      keys: ["ctrl+g", "p", "k", "esc"],
      done: via(FOCUS, on("window.focus")),
      hint: "ctrl+g, then p, then k to move up. Esc when you are done.",
      learned: "move focus",
    },
    {
      id: "fullscreen",
      title: "Fullscreen, then back",
      note: "f in the pane menu, as in zellij.",
      keys: ["ctrl+g", "p", "f", "ctrl+g", "p", "f"],
      done: seq(zoomed(true), zoomed(false)),
      hint: "ctrl+g, p, f fills the screen. Do it again to put it back.",
      learned: "fullscreen",
    },
    {
      id: "float",
      title: "Float a pane",
      note: "e in the pane menu. Drag its title bar with the mouse to move it.",
      keys: ["ctrl+g", "p", "e"],
      done: on("window.float", (e) => e.data?.floating === true),
      hint: "ctrl+g, then p, then e.",
      learned: "floating pane",
    },
    {
      id: "tabs",
      title: "A new tab",
      note: "A zellij tab is a tuios workspace. t is the tab menu, n makes one.",
      keys: ["ctrl+g", "t", "n"],
      done: via(["new_workspace"], on("workspace")),
      hint: "ctrl+g, then t, then n. The dock shows the new tab.",
      learned: "new tab",
    },
    {
      id: "search",
      title: "Scroll and search",
      note: "s is scroll mode, here copy mode. / searches, q leaves.",
      keys: ["ctrl+g", "s", "/", { text: "tuios" }, "enter", "q"],
      done: seq(opened("copyMode"), opened("search"), closed("copyMode")),
      hint: "ctrl+g, then s. Then / and tuios and enter. q leaves.",
      learned: "search",
    },
    {
      id: "sessions",
      title: "Sessions and detach",
      keys: ["ctrl+g", "d"],
      setup: sampleWindow("sessions", "tuios ls"),
      hint: "",
      explainer: {
        art: "detach",
        body: 'ctrl+g d detaches, as in zellij, and a daemon keeps it all running. ctrl+g o is the session manager. Put preset = "zellij" under [keybindings] to keep these keys.',
        href: "/docs/sessions",
        linkText: "How sessions work",
      },
      learned: "detach",
    },
  ],
};
