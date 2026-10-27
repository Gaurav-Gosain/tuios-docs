import { changed, closed, on, opened, seq, via, zoomed } from "../matchers";
import type { Track } from "../types";
import { sampleWindow } from "./setups";

/**
 * For tmux users. The track turns on the tmux preset first, so every key
 * after that is tmux's own default, from its man page. The keys are in
 * tuios's internal/config/presets/tmux.toml.
 */
export const fromTmux: Track = {
  id: "from-tmux",
  title: "Coming from tmux",
  blurb: "Turn on the tmux keys. Your fingers already know the rest.",
  audience: "tmux users",
  group: "start",
  minutes: 5,
  next: ["your-keys", "workspaces"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["window"] },
  ],
  steps: [
    {
      id: "preset",
      title: "Pick the tmux keys",
      note: "U opens the keybind presets. tmux is the second row.",
      keys: ["U", "down", "enter"],
      needs: "window",
      done: on(
        "keys",
        (e) => (e.data?.to as { preset?: string })?.preset === "tmux",
      ),
      hint: "Press capital U. Press down once to tmux, then enter.",
      learned: "tmux preset",
    },
    {
      id: "split-right",
      title: "Split right",
      note: "Same as tmux. A tmux pane is a tuios window.",
      keys: ["ctrl+b", "%"],
      done: via(["prefix_split_vertical"], on("window.open")),
      hint: "Hold ctrl and tap b, let go, then % (shift and 5).",
      learned: "split right",
    },
    {
      id: "split-down",
      title: "Split down",
      note: "Same as tmux.",
      keys: ["ctrl+b", '"'],
      done: via(["prefix_split_horizontal"], on("window.open")),
      hint: 'ctrl+b, then " (shift and the quote key).',
      learned: "split down",
    },
    {
      id: "move",
      title: "Move between panes",
      note: "Same arrows as tmux. One ctrl+b covers a few arrows in a row.",
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
      hint: "ctrl+b, then any arrow key.",
      learned: "move focus",
    },
    {
      id: "display-panes",
      title: "Jump by number",
      note: "ctrl+b q shows a number on each pane. Type one to go there.",
      keys: ["ctrl+b", "q", "1"],
      done: seq(opened("paneLabels"), on("window.focus")),
      hint: "ctrl+b, then q. Big numbers show. Press 1.",
      learned: "pane numbers",
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
      id: "new-window",
      title: "A new window",
      note: "A tmux window is a tuios workspace. Each one has its own panes.",
      keys: ["ctrl+b", "c"],
      done: via(["new_workspace"], on("workspace")),
      hint: "ctrl+b, then c. The dock shows the new window.",
      learned: "new window",
    },
    {
      id: "workspace",
      title: "Back to the last one",
      note: "ctrl+b p for the previous window, as in tmux.",
      keys: ["ctrl+b", "p"],
      done: changed("workspace", 1),
      hint: "ctrl+b, then p. Your panes wait on window 1.",
      learned: "previous window",
    },
    {
      id: "copy-mode",
      title: "Copy mode, vim keys built in",
      note: "tmux used emacs keys unless you set mode-keys vi.",
      keys: ["ctrl+b", "[", "/", { text: "tuios" }, "enter", "q"],
      done: seq(opened("copyMode"), opened("search"), closed("copyMode")),
      hint: "ctrl+b [ enters copy mode. / searches, enter jumps to the match, q leaves.",
      learned: "copy mode",
    },
    {
      id: "window-mode",
      title: "Meet window mode",
      note: "New: a mode with no prefix at all. Single keys move windows.",
      keys: ["ctrl+b", "esc"],
      done: changed("mode", "window"),
      hint: "ctrl+b, then esc. The badge flips to WINDOWS. i goes back to typing.",
      learned: "window mode",
    },
    {
      id: "detach",
      title: "Detach, same as ever",
      keys: ["ctrl+b", "d"],
      setup: sampleWindow("sessions", "tuios ls"),
      hint: "",
      explainer: {
        art: "detach",
        body: 'ctrl+b d detaches, like tmux. A daemon keeps every pane running. tuios ls lists sessions, and ctrl+b s switches between them. Put preset = "tmux" under [keybindings] to keep these keys.',
        href: "/docs/sessions",
        linkText: "Sessions and attach",
      },
      learned: "detach",
    },
  ],
};
