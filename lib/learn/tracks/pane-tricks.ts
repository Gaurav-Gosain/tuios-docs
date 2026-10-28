import { closed, on, opened, seq } from "../matchers";
import type { Track } from "../types";

/**
 * Small tools for a busy screen: the scratch pane, picture-in-picture, the
 * pane numbers, hints that copy what you see, and the spotlight.
 */
export const paneTricks: Track = {
  id: "pane-tricks",
  title: "Pane tricks",
  blurb:
    "A scratch pane, a pane in the corner, numbers, hints and the spotlight.",
  audience: "Busy screens",
  group: "everyday",
  minutes: 4,
  next: ["your-keys", "power-moves"],
  setup: [
    // Rain on the left fills its pane, so the corner view of it is full.
    // The git log on the right has hashes for hints to label.
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["terminal"], wait: 150 },
    { command: "type", args: ["rain\r"], wait: 300 },
    { command: "newWindow", wait: 250 },
    {
      command: "type",
      args: ["cd projects/hello && git log --oneline\r"],
      wait: 300,
    },
    { command: "action", args: ["select_window_1"] },
  ],
  steps: [
    {
      id: "scratch",
      title: "Open a scratch pane",
      note: "A pane that floats over the rest, for a quick job.",
      keys: ["ctrl+b", "g"],
      done: opened("scratch"),
      hint: "Hold ctrl and tap b, let go, then g.",
      learned: "scratch pane",
    },
    {
      id: "scratch-hide",
      title: "Hide it, keep it",
      note: "The same keys hide it. It keeps running for next time.",
      keys: ["ctrl+b", "g"],
      done: closed("scratch"),
      hint: "ctrl+b, then g again.",
      learned: "hide scratch",
    },
    {
      id: "pin",
      title: "Pin a pane",
      note: "p in window mode pins the pane you are on, the rain.",
      keys: ["ctrl+b", "esc", "p"],
      done: on("pip", (e) => Boolean(e.data?.to)),
      hint: "ctrl+b, then esc for window mode. Then p.",
      learned: "pin a pane",
    },
    {
      id: "pip",
      title: "Watch it from another pane",
      note: "The pinned pane shows in a small corner window.",
      keys: ["tab"],
      needs: "window",
      done: on(
        "window.focus",
        (e) => Boolean(e.state?.pip) && e.state?.pip !== e.data?.to,
      ),
      hint: "Press tab. The rain keeps falling in the corner.",
      learned: "picture in picture",
    },
    {
      id: "unpin",
      title: "Unpin it",
      note: "p again puts it away.",
      keys: ["p"],
      needs: "window",
      done: on("pip", (e) => !e.data?.to),
      hint: "Press p.",
      learned: "unpin",
    },
    {
      id: "labels",
      title: "Jump by number",
      note: "Every pane gets a big number. Type one to go there.",
      keys: ["ctrl+b", "Q", "1"],
      done: seq(opened("paneLabels"), on("window.focus")),
      hint: "ctrl+b, then shift+q. Then press 1 for the rain.",
      learned: "pane numbers",
    },
    {
      id: "hints",
      title: "Copy what you see",
      note: "Hints put a letter on each hash, path and link. Type it to copy.",
      keys: ["ctrl+b", "2", "ctrl+b", "F", "a"],
      done: seq(opened("hints"), closed("hints")),
      hint: "ctrl+b 2 goes to the git log. ctrl+b F shows the letters. Press a.",
      learned: "hints",
    },
    {
      id: "spotlight",
      title: "Light up one pane",
      note: "The spotlight dims the rest of the screen. Good for a demo.",
      keys: ["ctrl+b", "B", "esc"],
      done: seq(opened("spotlight"), closed("spotlight")),
      hint: "ctrl+b, then shift+b. Look, then esc turns it off.",
      learned: "spotlight",
    },
  ],
};
