import { changed, closed, on, opened, seq, via, zoomed } from "../matchers";
import type { Track } from "../types";
import { sampleWindow } from "./scenes";

/**
 * For tmux users: what carries over, and the few keys that differ. The tmux
 * keys in the notes are tmux's defaults, from its man page.
 */
export const fromTmux: Track = {
  id: "from-tmux",
  title: "Coming from tmux",
  blurb: "Your fingers already know most of it. Here is what changes.",
  audience: "tmux users",
  minutes: 4,
  next: ["layouts", "workspaces"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "new-window",
      title: "New window",
      note: "Same as tmux. A tuios window is a pane you can move.",
      keys: ["ctrl+b", "c"],
      done: via(["prefix_new_window"], on("window.open")),
      hint: "Hold ctrl and tap b, let go, then press c.",
      learned: "new window",
    },
    {
      id: "split-right",
      title: "Split right",
      note: "tmux used %. Here it is |, which looks like the split.",
      keys: ["ctrl+b", "|"],
      done: via(["prefix_split_vertical"], on("window.open")),
      hint: "| is shift and backslash. The plain backslash works too.",
      learned: "split right",
    },
    {
      id: "split-down",
      title: "Split down",
      note: 'tmux used ". Here it is -.',
      keys: ["ctrl+b", "-"],
      done: via(["prefix_split_horizontal"], on("window.open")),
      hint: "ctrl+b, then the minus key.",
      learned: "split down",
    },
    {
      id: "move",
      title: "Move between panes",
      note: "Same arrows as tmux.",
      keys: ["ctrl+b", "left"],
      done: via(
        [
          "terminal_focus_left",
          "terminal_focus_right",
          "terminal_focus_up",
          "terminal_focus_down",
        ],
        on("window.focus"),
      ),
      hint: "ctrl+b, then any arrow key. One ctrl+b covers a few arrows in a row.",
      learned: "move focus",
    },
    {
      id: "zoom",
      title: "Zoom in, then out",
      note: "Same as tmux.",
      keys: ["ctrl+b", "z", "ctrl+b", "z"],
      done: seq(zoomed(true), zoomed(false)),
      hint: "ctrl+b z zooms. Do it again to unzoom.",
      learned: "zoom",
    },
    {
      id: "copy-mode",
      title: "Copy mode, vim keys built in",
      note: "tmux used [ too, with emacs keys unless you set mode-keys vi.",
      keys: ["ctrl+b", "[", "/", { text: "tuios" }, "enter", "q"],
      done: seq(opened("copyMode"), opened("search"), closed("copyMode")),
      hint: "ctrl+b [ enters copy mode. / searches, enter jumps to the match, q leaves.",
      learned: "copy mode",
    },
    {
      id: "window-mode",
      title: "Meet window mode",
      note: "New: a mode with no prefix at all.",
      keys: ["ctrl+b", "esc"],
      done: changed("mode", "window"),
      hint: "ctrl+b, then esc. The badge flips to WINDOWS. i goes back to typing.",
      learned: "window mode",
    },
    {
      id: "workspace",
      title: "Jump to workspace 2",
      note: "tmux's ctrl+b w listed windows. Here w picks one of nine desktops.",
      keys: ["ctrl+b", "w", "2"],
      done: changed("workspace", 2),
      hint: "ctrl+b, then w, then 2. Your panes wait on workspace 1.",
      learned: "workspaces",
    },
    {
      id: "detach",
      title: "Detach, same as ever",
      keys: ["ctrl+b", "d"],
      setup: sampleWindow("sessions", "tuios ls"),
      hint: "",
      explainer: {
        art: "detach",
        body: "ctrl+b d detaches, like tmux. A daemon keeps every pane running. tuios ls lists sessions, tuios attach brings one back, and ctrl+b S switches between them.",
        href: "/docs/sessions",
        linkText: "Sessions and attach",
      },
      learned: "detach",
    },
  ],
};
