"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Where a daemon pane's TERM comes from, before and after tuios b0ab22a1.
 *
 * The client that runs `tuios new --detach` sends a hello carrying the TERM
 * and COLORTERM that guestenv.DetectTerm finds for its own stdout. DetectTerm
 * trusts the environment as it is when COLORTERM=truecolor and TERM is set and
 * not dumb. Otherwise colorprofile.Detect decides, and with no terminal on
 * stdout it answers NoTTY, which maps to dumb. The daemon stores the pair in
 * the session's config and builds every pane's environment from it: an empty
 * TERM becomes xterm-256color and an empty COLORTERM becomes truecolor.
 * The fix in sendHello (internal/session/client.go) names no TERM when
 * detection answers dumb and stdout is not a terminal.
 */
type CreatorId = "terminal" | "agent" | "ci" | "service" | "script" | "dumbtty";
type Build = "before" | "after";

interface Creator {
  id: CreatorId;
  label: string;
  term: string | null;
  colorTerm: string | null;
  tty: boolean;
}

const CREATORS: Creator[] = [
  {
    id: "terminal",
    label: "a terminal",
    term: "xterm-256color",
    colorTerm: "truecolor",
    tty: true,
  },
  {
    id: "agent",
    label: "a script or agent, no COLORTERM",
    term: "xterm-256color",
    colorTerm: null,
    tty: false,
  },
  {
    id: "ci",
    label: "a CI runner",
    term: "dumb",
    colorTerm: "",
    tty: false,
  },
  {
    id: "service",
    label: "cron or a service",
    term: null,
    colorTerm: null,
    tty: false,
  },
  {
    id: "script",
    label: "a script or agent with COLORTERM=truecolor",
    term: "xterm-256color",
    colorTerm: "truecolor",
    tty: false,
  },
  {
    id: "dumbtty",
    label: "a real terminal set to dumb",
    term: "dumb",
    colorTerm: null,
    tty: true,
  },
];

interface Trace {
  detectHow: string;
  detected: [string, string];
  hello: [string, string];
  helloWhy: string;
  pane: [string, string];
}

function trace(c: Creator, build: Build): Trace {
  const envTerm = c.term ?? "";
  const envColor = c.colorTerm ?? "";
  let detected: [string, string];
  let detectHow: string;
  if (envColor === "truecolor" && envTerm !== "" && envTerm !== "dumb") {
    detected = [envTerm, envColor];
    detectHow = "COLORTERM=truecolor and a real TERM: trusted as set";
  } else if (!c.tty || envTerm === "dumb" || envTerm === "") {
    detected = ["dumb", ""];
    detectHow = c.tty
      ? "colorprofile.Detect: TERM=dumb, so NoTTY"
      : "colorprofile.Detect: stdout is not a terminal, so NoTTY";
  } else {
    detected = ["xterm-256color", ""];
    detectHow = "colorprofile.Detect: ANSI256";
  }

  let hello = detected;
  let helloWhy = "sent as detected";
  if (build === "after" && detected[0] === "dumb") {
    if (!c.tty) {
      hello = ["", ""];
      helloWhy = "dumb and stdout is not a terminal: names no TERM";
    } else {
      helloWhy = "dumb, but stdout is a real terminal: kept";
    }
  }

  const pane: [string, string] = [
    hello[0] || "xterm-256color",
    hello[1] || "truecolor",
  ];
  return { detectHow, detected, hello, helloWhy, pane };
}

function envValue(v: string | null): string {
  if (v === null) return "(unset)";
  if (v === "") return "(empty)";
  return v;
}

function q(v: string): string {
  return `"${v}"`;
}

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-mono text-xs text-fd-muted-foreground">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={o.id === value}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
              o.id === value
                ? "border-fd-primary/60 bg-fd-primary/10 text-fd-foreground"
                : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/40",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 py-1.5 sm:grid-cols-[9rem_1fr]">
      <dt className="font-mono text-xs text-fd-muted-foreground sm:pt-0.5">
        {label}
      </dt>
      <dd className="min-w-0 break-words font-mono text-sm text-fd-foreground">
        {children}
      </dd>
    </div>
  );
}

export function HeadlessTerm() {
  const [creatorId, setCreatorId] = useState<CreatorId>("ci");
  const [build, setBuild] = useState<Build>("before");
  const creator = CREATORS.find((c) => c.id === creatorId) ?? CREATORS[0];
  const t = trace(creator, build);
  const dumb = t.pane[0] === "dumb";

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="grid gap-4 p-4">
        <Choice
          legend="who runs tuios new --detach"
          value={creatorId}
          onChange={setCreatorId}
          options={CREATORS.map((c) => ({ id: c.id, label: c.label }))}
        />
        <Choice
          legend="tuios build"
          value={build}
          onChange={setBuild}
          options={[
            { id: "before", label: "before the fix" },
            { id: "after", label: "after b0ab22a1" },
          ]}
        />
      </div>

      <dl
        className="divide-y divide-fd-border/60 border-t border-fd-border px-4 py-2"
        aria-live="polite"
      >
        <Row label="its environment">
          TERM={envValue(creator.term)} COLORTERM=
          {envValue(creator.colorTerm)}
          <span className="text-fd-muted-foreground">
            , stdout is {creator.tty ? "a terminal" : "a pipe or a file"}
          </span>
        </Row>
        <Row label="DetectTerm">
          {q(t.detected[0])}, {q(t.detected[1])}
          <div className="text-xs text-fd-muted-foreground">{t.detectHow}</div>
        </Row>
        <Row label="hello to daemon">
          term {q(t.hello[0])}, color_term {q(t.hello[1])}
          <div className="text-xs text-fd-muted-foreground">{t.helloWhy}</div>
        </Row>
        <Row label="every pane gets">
          <span className={cn(dumb && "text-fd-primary")}>
            TERM={t.pane[0]} COLORTERM={t.pane[1]}
          </span>
          <div className="text-xs text-fd-muted-foreground">
            empty fields fall back to xterm-256color and truecolor; kept for the
            session&apos;s life, including panes opened after someone attaches
          </div>
        </Row>
        <Row label="in the pane">
          {dumb ? (
            <>
              <div>clear: writes 0 bytes, exits 1</div>
              <div>tput cup 0 0: fails, no cursor addressing</div>
              <div>tput colors: -1</div>
              <div>less: WARNING: terminal is not fully functional</div>
            </>
          ) : (
            <>
              <div>clear: clears the screen</div>
              <div>tput cup 0 0: moves the cursor home</div>
              <div>tput colors: 256</div>
              <div>less: full screen</div>
            </>
          )}
        </Row>
      </dl>

      <div className="border-t border-fd-border p-4">
        <p className="mb-2 font-mono text-xs text-fd-muted-foreground">
          the pane after typing clear; echo ready
        </p>
        <pre
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a region that scrolls must be reachable by keyboard
          tabIndex={0}
          className="overflow-x-auto rounded-md border border-fd-border bg-fd-background px-3 py-2 font-mono text-sm leading-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-primary"
        >
          {dumb ? (
            <>
              <div className="text-fd-muted-foreground">
                $ clear; echo ready
              </div>
              <div>ready</div>
              <div className="text-fd-muted-foreground">$</div>
            </>
          ) : (
            <>
              <div>ready</div>
              <div className="text-fd-muted-foreground">$</div>
              <div>&nbsp;</div>
            </>
          )}
        </pre>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Before the fix, every creator without a terminal gets a dumb session,
        unless its environment happens to carry COLORTERM=truecolor. After it,
        they all get xterm-256color. A real terminal that says dumb keeps its
        answer on both builds. The command outputs are from ncurses on macOS.
      </figcaption>
    </figure>
  );
}
