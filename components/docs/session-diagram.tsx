"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Who owns what between a tuios client, the daemon on this machine and the
 * daemon on another one. Each scenario lights the parts that take part in it
 * and says what happens. The facts are those of internal/session and
 * internal/federation: the daemon owns every PTY and keeps an emulator fed
 * for each, clients and scripts talk to it over a Unix socket, and other
 * machines are reached by one ssh link per host, held by the local daemon.
 */

type Part =
  | "clientA"
  | "clientB"
  | "script"
  | "socket"
  | "daemon"
  | "sessWork"
  | "paneLocal"
  | "paneHosted"
  | "link"
  | "host"
  | "sessApi"
  | "procHosted";

interface Scenario {
  id: string;
  label: string;
  command: string;
  on: Part[];
  off?: Part[];
  broken?: Part[];
  text: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "attach",
    label: "Attach",
    command: "tuios attach work",
    on: ["clientA", "socket", "daemon", "sessWork", "paneLocal"],
    off: ["clientB"],
    text: "The client is only a view. The daemon owns the shells and runs an emulator for each pane. The client asks it for each pane's screen and scrollback, draws them and sends your keys back.",
  },
  {
    id: "detach",
    label: "Detach",
    command: "Ctrl+B d",
    on: ["daemon", "sessWork", "paneLocal"],
    off: ["clientA", "clientB", "socket"],
    text: "With no client attached the shells keep running and the daemon keeps parsing their output, so nothing is lost. Attach again from this terminal or any other.",
  },
  {
    id: "share",
    label: "Two clients",
    command: "tuios attach work   # in a second terminal",
    on: ["clientA", "clientB", "socket", "daemon", "sessWork", "paneLocal"],
    text: "Two clients on one session see the same panes. Layout settings that decide how many cells a pane gets are shared by the session; the theme and borders stay per client.",
  },
  {
    id: "script",
    label: "Script",
    command: "tuios send-text -s work 'make\\n'",
    on: ["script", "socket", "daemon", "sessWork", "paneLocal"],
    off: ["clientB"],
    text: "Scripts use the same socket. send-text, capture-pane, wait-for and the JSON control protocol reach a session whether or not a client is attached.",
  },
  {
    id: "remote",
    label: "Session on a host",
    command: "tuios attach --host build api",
    on: ["clientA", "socket", "daemon", "link", "host", "sessApi"],
    off: ["clientB"],
    text: "The session runs on build and is drawn in your client, with your theme, config and prefix key. Nothing is nested: the client talks to your daemon, which holds one ssh link to build's daemon.",
  },
  {
    id: "hosted",
    label: "Pane on a host",
    command: "tuios new-window deploy --host build",
    on: [
      "clientA",
      "socket",
      "daemon",
      "sessWork",
      "paneHosted",
      "link",
      "host",
      "procHosted",
    ],
    off: ["clientB"],
    text: "One pane of a local session runs its process on build. The pane is drawn and laid out here; build runs only the process and its pty. Its title reads build:deploy.",
  },
  {
    id: "drop",
    label: "Link drops",
    command: "(the network goes away)",
    on: [
      "clientA",
      "socket",
      "daemon",
      "sessWork",
      "paneHosted",
      "host",
      "procHosted",
    ],
    off: ["clientB"],
    broken: ["link"],
    text: "The host keeps the process running for its hosted_grace (10 minutes by default) and keeps its last 64 KB of output. The title reads [reconnecting] and keys are refused, not queued. When the link is back, what the pane printed meanwhile is written to it.",
  },
];

export function SessionDiagram() {
  const [id, setId] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
  const textId = useId();

  const state = (p: Part) =>
    scenario.broken?.includes(p)
      ? "broken"
      : scenario.on.includes(p)
        ? "on"
        : scenario.off?.includes(p)
          ? "off"
          : "idle";

  return (
    <figure
      data-widget="session-diagram"
      className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card"
    >
      <fieldset className="flex flex-wrap gap-1.5 border-fd-border border-b bg-fd-muted/40 p-3">
        <legend className="sr-only">Scenario</legend>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={s.id === id}
            aria-controls={textId}
            onClick={() => setId(s.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
              s.id === id
                ? "border-fd-primary bg-fd-primary/15 text-fd-foreground"
                : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </fieldset>

      <div className="px-3 pt-3">
        <code className="block overflow-x-auto whitespace-pre rounded-md bg-fd-background px-3 py-2 font-mono text-fd-foreground text-xs">
          <span className="select-none text-fd-muted-foreground">$ </span>
          {scenario.command}
        </code>
      </div>

      <div
        className="flex flex-col items-stretch gap-0 p-3 md:flex-row md:items-center"
        aria-hidden="true"
      >
        {/* Clients and scripts. */}
        <div className="flex gap-2 md:w-36 md:flex-col">
          <Box state={state("clientA")} title="client" note="terminal 1" />
          <Box state={state("clientB")} title="client" note="terminal 2" />
          <Box state={state("script")} title="script" note="CLI, JSON" />
        </div>

        <Wire state={state("socket")} label="Unix socket" />

        {/* This machine's daemon. */}
        <Machine name="this machine" state={state("daemon")}>
          <Box state={state("sessWork")} title="session work">
            <div className="mt-1.5 flex flex-col gap-1">
              <Pane
                state={state("paneLocal")}
                title="shell"
                note="pty + emulator"
              />
              <Pane
                state={state("paneHosted")}
                title={
                  scenario.id === "drop"
                    ? "[reconnecting] build:deploy"
                    : "build:deploy"
                }
                note="emulator here, process on build"
              />
            </div>
          </Box>
        </Machine>

        <Wire state={state("link")} label="ssh link" />

        <Machine name="build" state={state("host")}>
          <Box
            state={state("sessApi")}
            title="session api"
            note="panes, ptys, emulators"
          />
          <Box
            state={state("procHosted")}
            title="deploy process"
            note={scenario.id === "drop" ? "kept for hosted_grace" : "pty only"}
          />
        </Machine>
      </div>

      <figcaption
        id={textId}
        aria-live="polite"
        className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-sm"
      >
        <span className="font-medium text-fd-foreground">
          {scenario.label}.{" "}
        </span>
        {scenario.text}
      </figcaption>
    </figure>
  );
}

type State = "on" | "off" | "idle" | "broken";

function Machine({
  name,
  state,
  children,
}: {
  name: string;
  state: State;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-dashed p-2.5 transition-opacity duration-300 motion-reduce:transition-none",
        state === "on" ? "border-fd-primary/60" : "border-fd-border",
        state === "idle" && "opacity-50",
      )}
    >
      <span className="font-mono text-fd-muted-foreground text-xs">
        {name}: daemon
      </span>
      {children}
    </div>
  );
}

function Box({
  state,
  title,
  note,
  children,
}: {
  state: State;
  title: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-md border px-2.5 py-2 transition-all duration-300 motion-reduce:transition-none",
        state === "on" && "border-fd-primary bg-fd-primary/10",
        state === "idle" && "border-fd-border opacity-50",
        state === "off" && "border-fd-border border-dashed opacity-30",
      )}
    >
      <p className="truncate font-mono text-fd-foreground text-xs">{title}</p>
      {note ? (
        <p className="truncate text-[11px] text-fd-muted-foreground">{note}</p>
      ) : null}
      {children}
    </div>
  );
}

function Pane({
  state,
  title,
  note,
}: {
  state: State;
  title: string;
  note: string;
}) {
  return (
    <div
      className={cn(
        "rounded border px-2 py-1 transition-all duration-300 motion-reduce:transition-none",
        state === "on"
          ? "border-fd-primary/70 bg-fd-background"
          : "border-fd-border opacity-50",
      )}
    >
      <p className="truncate font-mono text-[11px] text-fd-foreground">
        {title}
      </p>
      <p className="truncate text-[10px] text-fd-muted-foreground">{note}</p>
    </div>
  );
}

function Wire({ state, label }: { state: State; label: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 py-2 md:w-24 md:flex-col md:py-0">
      <span
        className={cn(
          "h-6 w-0.5 rounded md:h-0.5 md:w-full",
          state === "on" && "bg-fd-primary",
          state === "broken" &&
            "border border-red-600 border-dashed bg-transparent dark:border-red-400",
          (state === "idle" || state === "off") && "bg-fd-border",
        )}
      />
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[11px]",
          state === "on" ? "text-fd-primary" : "text-fd-muted-foreground",
          state === "broken" && "text-red-600 line-through dark:text-red-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}
