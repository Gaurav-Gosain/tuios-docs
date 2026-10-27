import { changed, closed, on, opened, seq, times } from "../matchers";
import type { Track, TuiosEvent } from "../types";

/** An agent event for the agent of this harness moving to `to`. */
function agentOf(harness: string, to: string) {
  return on(
    "agent",
    (e: TuiosEvent) => e.data?.harness === harness && e.data?.to === to,
  );
}

/**
 * The agents view, ctrl+b i, with three pretend agents at work: one asks
 * to edit a file, one asks a question, one is done. The reader answers
 * both from the view, replies to the finished one, then starts three
 * attempts at a new task and compares them.
 */
export const cockpit: Track = {
  id: "cockpit",
  title: "The agent cockpit",
  blurb: "Answer, reply to and start agents from one view.",
  audience: "Agent herders",
  group: "agents",
  minutes: 5,
  next: ["automation", "power-moves"],
  setup: [
    { command: "newWindow", wait: 300 },
    { command: "mode", args: ["terminal"], wait: 100 },
    { command: "type", args: ["claude\r"], wait: 300 },
    { command: "newWindow", wait: 300 },
    { command: "type", args: ["gemini\r"], wait: 300 },
    { command: "newWindow", wait: 300 },
    { command: "type", args: ["codex\r"], wait: 300 },
    { command: "newWindow", wait: 300 },
  ],
  steps: [
    {
      id: "elsewhere",
      title: "Go do something else",
      note: "Three agents work in the other panes. They keep working while you are away.",
      keys: ["ctrl+b", "w", "2"],
      done: changed("workspace", 2),
      hint: "ctrl+b, then w, then 2.",
      learned: "switch workspace",
    },
    {
      id: "open",
      title: "Open the agents view",
      note: "Every agent on every workspace, grouped by what it needs from you.",
      keys: ["ctrl+b", "i"],
      done: opened("agents"),
      hint: "ctrl+b, then i. The agents that need you are at the top.",
      learned: "agents view",
    },
    {
      id: "changes",
      title: "Read the edit first",
      note: "claude wants to edit style.css. ] goes to the next tab: the changes of its turn.",
      keys: ["]"],
      done: on("agents.tab", (e) => e.data?.to === "changes"),
      hint: "Press ]. [ goes back to the thread.",
      learned: "focus tabs",
    },
    {
      id: "allow",
      title: "Allow the edit",
      note: "a allows it once. A always allows it. r rejects it, and R rejects it with a reason.",
      keys: ["a"],
      done: agentOf("claude-code", "working"),
      hint: "Press a. claude goes back to work.",
      learned: "allow",
    },
    {
      id: "peek",
      title: "Peek at the question",
      note: "g goes to the top row: gemini asks which colors to use. Space reads its question.",
      keys: ["g", "space"],
      done: opened("peek"),
      hint: "Press g, then space.",
      learned: "peek",
    },
    {
      id: "answer",
      title: "Pick an answer",
      note: "The number of an option answers. tuios presses it in gemini's pane.",
      keys: ["2"],
      done: agentOf("gemini-cli", "working"),
      hint: "Press 2 for Tokyo Night.",
      learned: "answer",
    },
    {
      id: "reply",
      title: "Reply to a finished agent",
      note: "codex is done and waits at the top. r writes to it, and enter sends.",
      keys: ["g", "r", { text: "add a test for an empty name" }, "enter"],
      done: agentOf("codex", "working"),
      hint: "Press g, then r. Type the reply and press enter.",
      learned: "reply",
    },
    {
      id: "new",
      title: "Start three attempts",
      note: "n opens the New agent sheet. Type the task. shift+tab goes back to Attempts, and + adds one.",
      keys: [
        "n",
        { text: "add a footer" },
        "shift+tab",
        "shift+tab",
        "shift+tab",
        "+",
        "+",
        "enter",
      ],
      done: seq(opened("newAgent"), times(3, on("window.open"))),
      hint: "Press n and type the task. Press shift+tab three times, + twice, then enter.",
      learned: "new agent",
    },
    {
      id: "compare",
      title: "Compare, then open one",
      note: "G goes to the last row, an attempt. c shows the attempts side by side, and enter opens the one under the cursor.",
      keys: ["G", "c", "enter"],
      done: seq(opened("compare"), closed("agents")),
      hint: "Press G, then c. Wait for the attempts to finish, then press enter.",
      learned: "compare",
    },
  ],
};
