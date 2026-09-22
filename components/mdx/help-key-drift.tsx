"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * What a key did while the help overlay was open, per mode, before and after
 * cb66fc2c. Read from keyboard_terminal.go and keyboard_wm.go at cb66fc2c~1,
 * and from overlay_keys.go at cb66fc2c.
 */
type Key = "esc" | "?" | "q";
type State = "browsing" | "searching";

const OUTCOME: Record<
  "terminal" | "window" | "shared",
  Record<State, Record<Key, string>>
> = {
  terminal: {
    browsing: { esc: "closes help", "?": "closes help", q: "nothing" },
    searching: { esc: "leaves search", "?": "closes help", q: "types q" },
  },
  window: {
    browsing: { esc: "closes help", "?": "closes help", q: "closes help" },
    searching: {
      esc: "leaves search",
      "?": "leaves search",
      q: "leaves search",
    },
  },
  shared: {
    browsing: { esc: "closes help", "?": "closes help", q: "closes help" },
    searching: { esc: "leaves search", "?": "closes help", q: "types q" },
  },
};

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-fd-muted-foreground text-xs">
        {label}
      </span>
      <div
        className="inline-flex overflow-hidden rounded-md border border-fd-border"
        role="group"
        aria-label={label}
      >
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={cn(
              "min-w-10 px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none",
              value === o
                ? "bg-fd-primary text-fd-primary-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HelpKeyDrift() {
  const [key, setKey] = useState<Key>("q");
  const [state, setState] = useState<State>("searching");

  const term = OUTCOME.terminal[state][key];
  const win = OUTCOME.window[state][key];
  const now = OUTCOME.shared[state][key];
  const agree = term === win;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 border-fd-border border-b p-4 sm:flex-row sm:gap-6">
        <Segmented
          label="help is"
          options={["browsing", "searching"] as const}
          value={state}
          onChange={setState}
        />
        <Segmented
          label="press"
          options={["esc", "?", "q"] as const}
          value={key}
          onChange={setKey}
        />
      </div>

      <div
        className="grid gap-px bg-fd-border sm:grid-cols-3"
        aria-live="polite"
      >
        <Cell title="terminal mode, before" value={term} flag={!agree} />
        <Cell title="window mode, before" value={win} flag={!agree} />
        <Cell title="both modes, after" value={now} />
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        {agree
          ? "The two copies agreed on this one."
          : "The two copies disagreed here."}{" "}
        Three of the six combinations agreed and three did not. The search
        footer in both modes says <code>? close</code>.
      </figcaption>
    </figure>
  );
}

function Cell({
  title,
  value,
  flag,
}: {
  title: string;
  value: string;
  flag?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 bg-fd-card p-4">
      <span className="text-fd-muted-foreground text-xs">{title}</span>
      <span
        className={cn(
          "font-mono text-sm",
          flag ? "text-fd-primary" : "text-fd-foreground",
        )}
      >
        {value}
        {flag ? <span className="sr-only"> (the modes disagree)</span> : null}
      </span>
    </div>
  );
}
