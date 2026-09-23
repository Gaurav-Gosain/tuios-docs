import { agent, changed, on, opened } from "../matchers";
import type { Track } from "../types";
import { sampleAgain, sampleWindow } from "./scenes";

/**
 * A pretend Claude Code in a pane: it works, asks, gets an answer and
 * finishes, and tuios follows it in the rail and the dock. Then what a real
 * machine adds: mail, fan-out and worktrees.
 */
export const agents: Track = {
  id: "agents",
  title: "Agents",
  blurb: "Run coding agents side by side and never miss a question.",
  audience: "Agent herders",
  minutes: 4,
  next: ["automation", "workspaces"],
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
        body: "On a real machine agents find each other with tuios list-agents, leave messages, and ask you questions. ctrl+b M opens your inbox.",
        href: "/docs/agent-messaging",
        linkText: "Agent messaging",
      },
      learned: "mail",
    },
    {
      id: "fanout",
      title: "One prompt, three agents",
      keys: [{ text: "tuios fan 3" }],
      setup: sampleAgain("tuios fan 3 --agent claude 'add dark mode'"),
      hint: "",
      explainer: {
        art: "fanout",
        body: "tuios fan starts the same prompt in several agents, each in its own git worktree and session. Compare them, keep the best.",
        href: "/docs/worktrees",
        linkText: "Fan-out and worktrees",
      },
      learned: "fan-out",
    },
    {
      id: "worktree",
      title: "A worktree per agent",
      keys: [{ text: "tuios worktree new" }],
      setup: sampleAgain("tuios worktree new feat/retry"),
      hint: "",
      explainer: {
        art: "worktree",
        body: "A worktree is a second checkout on its own branch. One command makes it and a session inside it, and the rail groups them by repo.",
        href: "/docs/worktrees",
        linkText: "Worktrees",
      },
      learned: "worktrees",
    },
  ],
};
