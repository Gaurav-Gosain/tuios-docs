import { changed, closed, on, opened, seq, via, zoomed } from "../matchers";
import type { Track } from "../types";
import { sampleWindow } from "./scenes";

/**
 * For zellij users. The zellij keys in the notes are its default preset. The
 * browser keeps ctrl+t, ctrl+n and ctrl+w, so no step asks for them.
 */
export const fromZellij: Track = {
  id: "from-zellij",
  title: "Coming from zellij",
  blurb: "Modes, panes, tabs and floats. Same ideas, fewer menus.",
  audience: "zellij users",
  minutes: 4,
  next: ["layouts", "workspaces"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "locked",
      title: "Typing is locked mode",
      note: "Every key goes to the program, except ctrl+b. No ctrl+g needed.",
      keys: [{ text: "top" }, "enter"],
      needs: "terminal",
      done: on("shell.start", (e) => e.data?.command === "top"),
      hint: "Type top and press enter. It keeps running while you work.",
      learned: "run a program",
    },
    {
      id: "new-pane",
      title: "New pane",
      note: "zellij used alt+n. Here alt+n hops to the next pane.",
      keys: ["ctrl+b", "c"],
      done: via(["prefix_new_window"], on("window.open")),
      hint: "Hold ctrl and tap b, let go, then press c. top keeps running.",
      learned: "new pane",
    },
    {
      id: "split-right",
      title: "Split right",
      note: "zellij used ctrl+p, then r.",
      keys: ["ctrl+b", "|"],
      done: via(["prefix_split_vertical"], on("window.open")),
      hint: "ctrl+b, then | (shift and backslash).",
      learned: "split right",
    },
    {
      id: "focus",
      title: "Move with alt and arrows",
      note: "Same as zellij.",
      keys: ["alt+left"],
      needs: "terminal",
      done: via(
        [
          "terminal_focus_left",
          "terminal_focus_right",
          "terminal_focus_up",
          "terminal_focus_down",
        ],
        on("window.focus"),
      ),
      hint: "Hold alt (option on a Mac) and press an arrow. ctrl+b then an arrow works too.",
      learned: "move focus",
    },
    {
      id: "fullscreen",
      title: "Fullscreen, then back",
      note: "zellij used ctrl+p, then f.",
      keys: ["ctrl+b", "z", "ctrl+b", "z"],
      done: seq(zoomed(true), zoomed(false)),
      hint: "ctrl+b z fills the screen with one pane. Again to put it back.",
      learned: "fullscreen",
    },
    {
      id: "float",
      title: "Float a pane",
      note: "zellij used alt+f. Drag its title bar with the mouse to move it.",
      keys: ["ctrl+p", { text: "float" }, "enter"],
      done: on("window.float", (e) => e.data?.floating === true),
      hint: "ctrl+p opens the command palette. Type float and press enter.",
      learned: "floating pane",
    },
    {
      id: "search",
      title: "Scroll and search",
      note: "zellij used ctrl+s, then s. Here it is copy mode.",
      keys: ["ctrl+b", "[", "/", { text: "tuios" }, "enter", "q"],
      done: seq(opened("copyMode"), opened("search"), closed("copyMode")),
      hint: "ctrl+b [ enters copy mode. / searches, enter jumps, q leaves.",
      learned: "search",
    },
    {
      id: "tabs",
      title: "Tabs are workspaces",
      note: "zellij used ctrl+t, then 2. tuios has nine, each a whole desktop.",
      keys: ["ctrl+b", "w", "2"],
      done: changed("workspace", 2),
      hint: "ctrl+b, then w, then 2. alt+2 works too, if your browser lets it.",
      learned: "workspaces",
    },
    {
      id: "sessions",
      title: "Sessions and detach",
      keys: ["ctrl+b", "d"],
      setup: sampleWindow("sessions", "tuios ls"),
      hint: "",
      explainer: {
        art: "detach",
        body: "zellij used ctrl+o, then d. Here ctrl+b d detaches and a daemon keeps it all running. ctrl+b S is the session manager.",
        href: "/docs/sessions",
        linkText: "How sessions work",
      },
      learned: "detach",
    },
  ],
};
