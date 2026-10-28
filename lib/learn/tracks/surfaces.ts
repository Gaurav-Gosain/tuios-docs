import { on, ranLine, seq, via } from "../matchers";
import type { Matcher, Track, TuiosEvent, TuiosWindow } from "../types";

/** The window an event names, from the state that came with it. */
function windowOf(event: TuiosEvent, id: unknown): TuiosWindow | undefined {
  return event.state?.windowList.find((w) => w.id === id);
}

/** The shell finished a command line that matches, with status 0. */
function ranOK(pattern: RegExp): Matcher {
  return on(
    "shell.command",
    (event) =>
      pattern.test(String(event.data?.line ?? "")) &&
      event.data?.exitCode === 0,
  );
}

/**
 * TML surfaces, Mermaid diagrams and charts, in one workflow: read a form's
 * markup, draw it as text, open it and answer it, draw the deploy flow and
 * the sales, then open a dashboard that holds all three and float it.
 */
export const surfaces: Track = {
  id: "surfaces",
  title: "Surfaces and diagrams",
  blurb: "Forms, dashboards, diagrams and charts, drawn by tuios.",
  audience: "Tool builders",
  group: "build",
  minutes: 5,
  next: ["automation", "agents"],
  setup: [
    { command: "newWindow", args: ["shell"], wait: 250 },
    { command: "mode", args: ["terminal"] },
  ],
  steps: [
    {
      id: "read",
      title: "Read the markup",
      note: "TML is the markup tuios draws forms and dashboards from. A file is a tree of parts with a JSON state.",
      keys: [{ text: "cat deploy.tml" }, "enter"],
      needs: "terminal",
      done: ranLine(/^cat\s+(~\/)?deploy\.tml/),
      hint: "Type cat deploy.tml and press enter.",
      learned: "TML files",
    },
    {
      id: "render",
      title: "Draw it as text",
      note: "tuios tml render shows the file the way a pane draws it.",
      keys: [{ text: "tuios tml render deploy.tml" }, "enter"],
      needs: "terminal",
      done: ranOK(/^tuios\s+tml\s+render\s+(~\/)?deploy\.tml/),
      hint: "Type tuios tml render deploy.tml and press enter.",
      learned: "tml render",
    },
    {
      id: "open",
      title: "Open the form",
      note: "A surface is a TML file that tuios shows live, in a popup or a pane. With --wait, the command waits for your answer.",
      keys: [{ text: "tuios tml show deploy.tml --wait" }, "enter"],
      needs: "terminal",
      done: on("tml.open", (e) => e.data?.target === "popup"),
      hint: "Type tuios tml show deploy.tml --wait and press enter.",
      learned: "tml show",
    },
    {
      id: "focus",
      title: "Move to the form",
      note: "The keyboard focus stays on your shell. ctrl+b 2 moves the focus to the form. A click works too.",
      keys: ["ctrl+b", "2"],
      done: on("window.focus", (e) => windowOf(e, e.data?.to)?.kind === "tml"),
      hint: "Press ctrl+b, then 2. Or click the form.",
      learned: "focus a surface",
    },
    {
      id: "answer",
      title: "Deploy to production",
      note: "down and enter pick production. tab goes to Deploy. enter sends the answer to the shell.",
      keys: ["down", "enter", "tab", "enter"],
      needs: "terminal",
      done: seq(
        on("tml.close", (e) => {
          const value = e.data?.value as { env?: string } | null | undefined;
          return e.data?.reason === "closed" && value?.env === "production";
        }),
        ranOK(/^tuios\s+tml\s+show\s+(~\/)?deploy\.tml/),
      ),
      hint: "Press down, enter, tab, enter. The answer prints in the shell.",
      learned: "answer a form",
    },
    {
      id: "mermaid",
      title: "Draw the deploy flow",
      note: "tuios mermaid draws a Mermaid diagram as text that fits the pane.",
      keys: [{ text: "tuios mermaid flow.mmd" }, "enter"],
      needs: "terminal",
      done: ranOK(/^tuios\s+mermaid\s+(~\/)?flow\.mmd/),
      hint: "Type tuios mermaid flow.mmd and press enter.",
      learned: "tuios mermaid",
    },
    {
      id: "chart",
      title: "Chart the sales",
      note: "tplot reads CSV and draws it in your theme's colours.",
      keys: [{ text: "tplot sales.csv --kind bar" }, "enter"],
      needs: "terminal",
      done: ranOK(/^tplot\s+(~\/)?sales\.csv/),
      hint: "Type tplot sales.csv --kind bar and press enter.",
      learned: "tplot",
    },
    {
      id: "pane",
      title: "Open a dashboard pane",
      note: "A table, a chart and a diagram in one surface. --pane tiles it beside your shell.",
      keys: [{ text: "tuios tml show status.tml --pane" }, "enter"],
      needs: "terminal",
      done: on("tml.open", (e) => e.data?.target === "pane"),
      hint: "Type tuios tml show status.tml --pane and press enter.",
      learned: "surface as a pane",
    },
    {
      id: "float",
      title: "Float the dashboard",
      note: "ctrl+b right moves to it. ctrl+b t f floats it. Press ctrl+b t f again to put it back in the tiles.",
      keys: ["ctrl+b", "right", "ctrl+b", "t", "f"],
      done: via(
        ["window_prefix_float"],
        on(
          "window.float",
          (e) =>
            e.data?.floating === true &&
            windowOf(e, e.data?.id)?.kind === "tml",
        ),
      ),
      hint: "Press ctrl+b, then right. Then ctrl+b, t, f.",
      learned: "float a surface",
    },
  ],
};
