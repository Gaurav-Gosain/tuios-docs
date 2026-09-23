import { on, ranLine } from "../matchers";
import type { Track } from "../types";
import { sampleAgain, sampleWindow } from "./scenes";

/** Tapes that drive tuios, then the control protocol and hooks. */
export const automation: Track = {
  id: "automation",
  title: "Automation",
  blurb: "Tapes that drive tuios, a JSON protocol, and hooks.",
  audience: "Scripters",
  minutes: 4,
  next: ["agents", "power-moves"],
  setup: [
    { command: "newWindow", wait: 250 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "read",
      title: "Read a tape",
      note: "A tape is a script of keys and commands.",
      keys: [{ text: "cat demo.tape" }, "enter"],
      needs: "terminal",
      done: ranLine(/^cat\s+demo\.tape/),
      hint: "Type cat demo.tape and press enter.",
      learned: "tape files",
    },
    {
      id: "play",
      title: "Press play",
      note: "Hands off. tuios types it all.",
      keys: [{ text: "tuios tape play demo.tape" }, "enter"],
      needs: "terminal",
      done: on("tape.finish"),
      hint: "Type tuios tape play demo.tape and press enter. Then watch.",
      learned: "play a tape",
    },
    {
      id: "list",
      title: "Find more tapes",
      keys: [{ text: "tuios tape list" }, "enter"],
      needs: "terminal",
      done: ranLine(/^tuios\s+tape\s+(list|ls)/),
      hint: "Type tuios tape list and press enter.",
      learned: "list tapes",
    },
    {
      id: "party",
      title: "Play the party tape",
      note: "Three programs, a zoom and a trip to workspace 2.",
      keys: [{ text: "tuios tape play party.tape" }, "enter"],
      needs: "terminal",
      done: on("tape.finish"),
      hint: "Type tuios tape play party.tape and press enter.",
      learned: "tapes",
    },
    {
      id: "protocol",
      title: "Drive it with JSON",
      keys: [{ text: "tuios list-verbs" }],
      setup: sampleWindow("real machine", "tuios list-verbs"),
      hint: "",
      explainer: {
        art: "protocol",
        body: "The daemon speaks JSON lines on its socket. Open windows, type, read panes and wait for output from any script. tuios list-verbs lists it all.",
        href: "/docs/control-protocol",
        linkText: "The control protocol",
      },
      learned: "control protocol",
    },
    {
      id: "hooks",
      title: "Run a command on events",
      keys: [{ text: "tuios list-hooks" }],
      setup: sampleAgain("tuios list-hooks"),
      hint: "",
      explainer: {
        art: "hooks",
        body: "Hooks run your shell commands when a window opens, focus moves, or an agent finishes. Put them in [hooks] in your config.",
        href: "/docs/hooks",
        linkText: "Hooks",
      },
      learned: "hooks",
    },
  ],
};
