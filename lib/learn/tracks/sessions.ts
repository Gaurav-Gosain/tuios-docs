import { on, opened, ranLine, seq } from "../matchers";
import type { Track } from "../types";
import { sampleAgain } from "./setups";

/**
 * What the daemon adds: sessions that outlive the terminal, the ways to move
 * between them and between machines, and the tools that come with it. A
 * browser tab has no daemon, so most steps show what a real machine prints.
 * The rail and the go-to picker are real. The samples print in a zoomed
 * window, so a wide table has the whole width.
 */
export const sessions: Track = {
  id: "sessions",
  title: "Sessions and machines",
  blurb: "Sessions that outlive the terminal, other machines, and your phone.",
  audience: "Power users",
  group: "yours",
  minutes: 5,
  next: ["agents", "automation"],
  setup: [
    { command: "newWindow", args: ["api"], wait: 250 },
    { command: "newWindow", args: ["notes"], wait: 250 },
    { command: "action", args: ["toggle_zoom"], wait: 250 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "detach",
      title: "Sessions outlive the terminal",
      keys: ["ctrl+b", "d"],
      setup: sampleAgain("tuios new -d work"),
      hint: "",
      explainer: {
        art: "detach",
        body: "A session holds your workspaces and panes. The daemon keeps it running after you close the terminal. ctrl+b d detaches, and tuios attach work brings it back.",
        href: "/docs/sessions",
        linkText: "Sessions",
      },
      learned: "sessions",
    },
    {
      id: "list",
      title: "List your sessions",
      note: "The demo prints what a real machine shows. There, ctrl+b S switches between them.",
      keys: [{ text: "tuios ls" }, "enter"],
      needs: "terminal",
      setup: [
        { command: "mode", args: ["terminal"] },
        { command: "type", args: ["clear\r"], wait: 150 },
      ],
      done: ranLine(/^tuios (ls|list-sessions)\b/),
      hint: "Type tuios ls and press enter.",
      learned: "list sessions",
    },
    {
      id: "rail",
      title: "Find sessions in the rail",
      note: "The demo has one session, local. On your machine, every session is here.",
      keys: ["ctrl+b", "b"],
      done: opened("sidebar"),
      hint: "ctrl+b, then b. The rail opens on the left.",
      learned: "rail",
    },
    {
      id: "goto",
      title: "Go to anything",
      note: "One list of agents, sessions, workspaces and panes. Type to filter.",
      keys: ["ctrl+b", "G", { text: "api" }, "enter"],
      done: seq(
        opened("goto"),
        on("window.focus", (e) => e.data?.title === "api"),
      ),
      hint: "ctrl+b, then shift+g. Type api and press enter.",
      learned: "go to",
    },
    {
      id: "move",
      title: "Move a window elsewhere",
      keys: [{ text: "tuios move-window" }],
      // The rail has done its part. Closed, it leaves the samples the
      // whole width.
      setup: [
        { command: "action", args: ["prefix_toggle_sidebar"], wait: 300 },
        ...sampleAgain(
          "tuios move-window -s work -w build --to-session review",
        ),
      ],
      hint: "",
      explainer: {
        art: "clients",
        body: "tuios move-window sends a window to another session. The program in it keeps running, with its scrollback.",
        href: "/docs/sessions#move-a-window-to-another-session",
        linkText: "Move a window",
      },
      learned: "move window",
    },
    {
      id: "note",
      title: "Leave a note for later",
      keys: ["ctrl+b", "I"],
      setup: sampleAgain("tuios note set next: run the migration"),
      hint: "",
      explainer: {
        art: "detach",
        body: "A return note says what comes next. Press ctrl+b, then shift+i, to write one for the session. The dock shows it when you come back.",
        href: "/docs/sessions",
        linkText: "Sessions",
      },
      learned: "return note",
    },
    {
      id: "restart",
      title: "Restart the daemon",
      keys: [{ text: "tuios restart-server" }],
      setup: sampleAgain("tuios restart-server --dry-run"),
      hint: "",
      explainer: {
        art: "detach",
        body: "A new tuios needs a new daemon. --dry-run shows what stops and what comes back. Each session comes back with its layout and pane history.",
        href: "/docs/daemon-restart",
        linkText: "Restart the daemon",
      },
      learned: "restart",
    },
    {
      id: "hosts",
      title: "Your other machines",
      keys: [{ text: "tuios hosts" }],
      setup: sampleAgain("tuios hosts"),
      hint: "",
      explainer: {
        art: "remote",
        body: "tuios hosts add links another machine over ssh. Its sessions and agents show in your rail, and a pane can run there.",
        href: "/docs/remote-hosts",
        linkText: "Remote hosts",
      },
      learned: "hosts",
    },
    {
      id: "phones",
      title: "Your phone and the browser",
      keys: [{ text: "tuios-web" }],
      hint: "",
      explainer: {
        art: "clients",
        body: "tuios-web shows your sessions in a browser, on a phone too. Web Push tells your phone when an agent needs you.",
        href: "/docs/phones",
        linkText: "Phones",
      },
      learned: "phones",
    },
    {
      id: "tasks",
      title: "Hand out work as cards",
      keys: [{ text: "tuios task add" }],
      setup: sampleAgain(
        "tuios task add -p 'Add a jitter option, with a test' make the backoff jitter configurable",
      ),
      hint: "",
      explainer: {
        art: "agents",
        body: "A task card is one piece of work in a session. An agent takes the oldest open card with tuios task claim --next. The card moves from todo to done.",
        href: "/docs/agent-messaging",
        linkText: "Agents that talk",
      },
      learned: "task cards",
    },
  ],
};
