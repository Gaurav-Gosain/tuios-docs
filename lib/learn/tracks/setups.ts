/**
 * Setups the tracks share. The explainer steps are about things a browser tab
 * cannot run, and the fake shell prints what each command prints on a real
 * machine, so an explainer types its command into a fresh zoomed window: the
 * screen changes, and the sample has the whole width to itself.
 */
import type { SetupCommand } from "../types";

/** A new zoomed window named `title`, running `line` in its shell. */
export function sampleWindow(title: string, line: string): SetupCommand[] {
  return [
    { command: "newWindow", args: [title], wait: 350 },
    { command: "action", args: ["toggle_zoom"], wait: 250 },
    { command: "type", args: [`${line}\r`] },
  ];
}

/** Clear the focused window's shell and run `line` in it. */
export function sampleAgain(line: string): SetupCommand[] {
  return [
    { command: "type", args: ["clear\r"], wait: 150 },
    { command: "type", args: [`${line}\r`] },
  ];
}
