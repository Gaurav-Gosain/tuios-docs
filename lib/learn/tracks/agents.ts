import { agent, changed, on, opened } from "../matchers";
import type { Track } from "../types";
import { sampleWindow } from "./setups";

/**
 * A pretend Claude Code in a pane: it works, asks, gets an answer and
 * finishes, and tuios follows it in the rail and the dock. Then mail between
 * agents on a real machine, and the agents view, which the cockpit track
 * covers in depth.
 */
export const agents: Track = {
  id: "agents",
  title: "Agents",
  blurb: "Run coding agents side by side and never miss a question.",
  audience: "Agent herders",
  group: "agents",
  minutes: 4,
  next: ["cockpit", "automation"],
  setup: [
    { command: "newWindow", args: ["agent"], wait: 250 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "rail",
      title: "Open the rail",
      note: "Every agent shows up here, with what it is doing.",
      keys: ["ctrl+b", "b"],
      done: opened("sidebar"),
      hint: "ctrl+b, then b. The rail opens on the left.",
      learned: "rail",
    },
    {
      id: "start",
      title: "Start an agent",
      note: "A pretend Claude Code. It never leaves this tab.",
      keys: [{ text: "claude" }, "enter"],
      needs: "terminal",
      done: agent("working"),
      hint: "Type claude and press enter. Watch the rail.",
      learned: "run an agent",
    },
    {
      id: "elsewhere",
      title: "Go do something else",
      note: "It will ask you something soon. You will know.",
      keys: ["ctrl+b", "w", "2"],
      done: changed("workspace", 2),
      hint: "ctrl+b, then w, then 2. Keep an eye on the rail and the dock.",
      learned: "switch workspace",
    },
    {
      id: "jump",
      title: "Jump to the question",
      note: "The rail turns orange and the dock rings. ctrl+b j takes you there.",
      keys: ["ctrl+b", "j"],
      done: on("window.focus", (e) =>
        Boolean(e.state?.windowList.find((w) => w.id === e.data?.to)?.agent),
      ),
      hint: "Wait for the orange mark, then ctrl+b, then j.",
      learned: "jump to alert",
    },
    {
      id: "approve",
      title: "Say yes",
      note: "y approves. The mark turns green when it is done.",
      keys: ["y"],
      needs: "terminal",
      setup: [{ command: "mode", args: ["terminal"] }],
      done: agent("done"),
      hint: "Press y, or enter on Yes.",
      learned: "approve",
    },
    {
      id: "mail",
      title: "Agents that talk",
      keys: ["ctrl+b", "M"],
      setup: sampleWindow("real machine", "tuios list-agents"),
      hint: "",
      explainer: {
        art: "mail",
        body: "On a real machine agents find each other with tuios list-agents and mail each other. ctrl+b M opens the mail between them.",
        href: "/docs/agent-messaging",
        linkText: "Agent messaging",
      },
      learned: "mail",
    },
    {
      id: "view",
      title: "Every agent in one view",
      note: "ctrl+b i opens the agents view. The next track, The agents view, shows what it does.",
      keys: ["ctrl+b", "i"],
      done: opened("agents"),
      hint: "ctrl+b, then i. esc closes it.",
      learned: "agents view",
    },
  ],
};
