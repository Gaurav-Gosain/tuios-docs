"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The tuios release binary (CGO_ENABLED=0, -trimpath, -ldflags "-s -w"),
 * through the seven size cuts of 2026-09-25 and the effect pack experiment
 * that was measured and dropped the same day.
 *
 * Every before and after size is copied from the "Size, stripped" lines in
 * the body of the commit named on the row. They were measured in order, each
 * on top of the one before, so turning a cut off here subtracts its measured
 * delta from the total. Out of order the deltas are an estimate, not a
 * measurement; the caption says so.
 *
 * The net/http cut depends on the tailscale cut: tailscale's local API client
 * also linked net/http, so removing the two callers in 161c3508 only dropped
 * the package once 758103a5 had removed the client.
 */

type Target = "darwin" | "linux";

interface Step {
  id: string;
  label: string;
  detail: string;
  commit: string;
  /** [before, after] in bytes, per target. */
  darwin: [number, number];
  linux: [number, number];
  requires?: string;
}

const STEPS: Step[] = [
  {
    id: "lexers",
    label: "88 chroma lexers, not 279",
    detail: "2.4 MB of XML lexer definitions, now 150 KB gzipped",
    commit: "642cbf30",
    darwin: [29_971_890, 27_516_770],
    linux: [31_559_840, 29_094_048],
  },
  {
    id: "lipgloss",
    label: "lipgloss v1 tables to v2",
    detail: "three tables kept v1, termenv and cellbuf linked",
    commit: "e9a06c81",
    darwin: [27_516_770, 27_380_754],
    linux: [29_094_048, 28_934_304],
  },
  {
    id: "tailscale",
    label: "tailscale status --json",
    detail: "tailscale's local API client, linked for one call",
    commit: "758103a5",
    darwin: [27_380_754, 26_792_738],
    linux: [28_934_304, 28_307_616],
  },
  {
    id: "nethttp",
    label: "no net/http, no crypto/tls",
    detail: "--pprof served by hand, tuios update through curl",
    commit: "161c3508",
    darwin: [26_792_738, 24_352_290],
    linux: [28_307_616, 25_776_288],
    requires: "tailscale",
  },
  {
    id: "fonts",
    label: "Go Mono fonts gzipped",
    detail: "352 KB of []byte literals, now 157 KB",
    commit: "55273c94",
    darwin: [24_352_290, 24_170_706],
    linux: [25_776_288, 25_583_776],
  },
  {
    id: "themes",
    label: "342 themes from one table",
    detail: "6,840 color pointers, now one string of RGB bytes",
    commit: "835be997",
    darwin: [24_170_706, 24_050_466],
    linux: [25_583_776, 25_510_048],
  },
  {
    id: "fang",
    label: "fang without x/text and mango",
    detail: "258 KB of Unicode case tables and a man page generator",
    commit: "45424d06",
    darwin: [24_050_466, 23_797_538],
    linux: [25_510_048, 25_231_520],
  },
];

const PACK_BYTES = 23_500;
const BUDGET: Record<Target, number> = {
  darwin: 24_600_000,
  linux: 26_000_000,
};
const TARGET_LABEL: Record<Target, string> = {
  darwin: "darwin/arm64",
  linux: "linux/amd64",
};

/** The chart's axis. It starts at 22 MB so that a 120 KB step is visible. */
const AXIS_MIN = 22_000_000;
const AXIS_MAX = 32_000_000;
const TICKS = [22, 24, 26, 28, 30, 32];

function mb(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

function kb(bytes: number) {
  const value = Math.abs(bytes) / 1000;
  const text =
    value >= 1000
      ? `${(value / 1000).toFixed(2)} MB`
      : `${value.toFixed(1)} KB`;
  return `${bytes < 0 ? "-" : "+"}${text}`;
}

function bytes(value: number) {
  return value.toLocaleString("en-US");
}

function pos(value: number) {
  const clamped = Math.min(Math.max(value, AXIS_MIN), AXIS_MAX);
  return ((clamped - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;
}

export function BinarySizeWaterfall() {
  const id = useId();
  const [target, setTarget] = useState<Target>("darwin");
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(STEPS.map((s) => [s.id, true])),
  );
  const [pack, setPack] = useState(false);

  const rows = useMemo(() => {
    let running = STEPS[0][target][0];
    return STEPS.map((step) => {
      const [before, after] = step[target];
      const delta = after - before;
      const start = running;
      const applied = on[step.id] && (!step.requires || on[step.requires]);
      if (applied) running += delta;
      return { step, delta, start, end: running, applied };
    });
  }, [target, on]);

  const start = STEPS[0][target][0];
  const afterCuts = rows[rows.length - 1].end;
  const total = afterCuts + (pack ? PACK_BYTES : 0);
  const budget = BUDGET[target];
  const allOn = STEPS.every((s) => on[s.id]);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Target</legend>
            {(Object.keys(TARGET_LABEL) as Target[]).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={target === t}
                onClick={() => setTarget(t)}
                className={cn(
                  "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                  target === t
                    ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                    : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
                )}
              >
                {TARGET_LABEL[t]}
              </button>
            ))}
          </fieldset>
          <button
            type="button"
            onClick={() =>
              setOn(Object.fromEntries(STEPS.map((s) => [s.id, !allOn])))
            }
            className="rounded-md border border-fd-border px-2.5 py-1 text-fd-muted-foreground text-xs hover:text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
          >
            {allOn ? "Undo every cut" : "Apply every cut"}
          </button>
        </div>

        <output
          htmlFor={`${id}-steps`}
          aria-live="polite"
          className="block rounded-md bg-fd-muted/50 px-3 py-2 text-sm"
        >
          <span className="font-semibold text-fd-foreground tabular-nums">
            {mb(total)}
          </span>{" "}
          <span className="text-fd-muted-foreground">
            ({bytes(total)} bytes) for {TARGET_LABEL[target]}.{" "}
            {total > budget
              ? `Over the CI budget of ${bytes(budget)} by ${bytes(total - budget)}.`
              : `Inside the CI budget of ${bytes(budget)}.`}
          </span>
        </output>

        <div aria-hidden="true" className="flex flex-col gap-1">
          <div className="relative h-4 text-[10px] text-fd-muted-foreground tabular-nums">
            {TICKS.map((t) => (
              <span
                key={t}
                className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                style={{ left: `${pos(t * 1_000_000)}%` }}
              >
                {t} MB
              </span>
            ))}
          </div>
          <div className="relative h-5 rounded-sm bg-fd-muted/60">
            <div
              className="absolute inset-y-0 left-0 rounded-sm bg-fd-muted-foreground/30"
              style={{ width: `${pos(start)}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-sm bg-fd-primary transition-[width] duration-300"
              style={{ width: `${pos(total)}%` }}
            />
            <div
              className="absolute -inset-y-1 w-0.5 bg-fd-foreground"
              style={{ left: `${pos(budget)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fd-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-sm bg-fd-muted-foreground/30" />
              before the cuts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-sm bg-fd-primary" />
              now
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-0.5 bg-fd-foreground" />
              CI budget
            </span>
            <span>axis starts at 22 MB</span>
          </div>
        </div>

        <ol id={`${id}-steps`} className="flex flex-col gap-1.5">
          {rows.map(({ step, delta, start: from, end, applied }) => {
            const blocked = !!step.requires && !on[step.requires];
            return (
              <li key={step.id}>
                <button
                  type="button"
                  aria-pressed={on[step.id]}
                  onClick={() =>
                    setOn((prev) => ({ ...prev, [step.id]: !prev[step.id] }))
                  }
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                    applied
                      ? "border-fd-border bg-fd-background"
                      : "border-fd-border border-dashed bg-transparent",
                  )}
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        applied
                          ? "text-fd-foreground"
                          : "text-fd-muted-foreground line-through",
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="font-mono text-fd-muted-foreground text-xs tabular-nums">
                      {step.commit} {kb(delta)}
                    </span>
                  </span>
                  <span className="text-fd-muted-foreground text-xs">
                    {blocked
                      ? "Has no effect while tailscale's client is linked: it pulls in net/http too."
                      : step.detail}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative mt-0.5 block h-2 rounded-sm bg-fd-muted/60"
                  >
                    <span
                      className={cn(
                        "absolute inset-y-0 rounded-sm",
                        applied ? "bg-fd-primary" : "bg-fd-muted-foreground/40",
                      )}
                      style={{
                        left: `${pos(from + delta)}%`,
                        width: `${Math.max(pos(from) - pos(from + delta), 0.8)}%`,
                      }}
                    />
                  </span>
                  <span className="sr-only">
                    {applied
                      ? `Applied. ${mb(from)} to ${mb(end)}.`
                      : "Not applied."}
                  </span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-pressed={pack}
              onClick={() => setPack((p) => !p)}
              className={cn(
                "flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary",
                pack
                  ? "border-fd-foreground bg-fd-background"
                  : "border-fd-border border-dashed bg-transparent",
              )}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-medium text-fd-foreground text-sm">
                  Effect packs (tried, not merged)
                </span>
                <span className="font-mono text-fd-muted-foreground text-xs tabular-nums">
                  +23.5 KB
                </span>
              </span>
              <span className="text-fd-muted-foreground text-xs">
                Move the screen saver's photo frames out so the binary could
                leave them behind. It came out bigger.
              </span>
              <span
                aria-hidden="true"
                className="relative mt-0.5 block h-2 rounded-sm bg-fd-muted/60"
              >
                <span
                  className="absolute inset-y-0 rounded-sm bg-fd-foreground"
                  style={{
                    left: `${pos(afterCuts)}%`,
                    width: `${Math.max(pos(afterCuts + PACK_BYTES) - pos(afterCuts), 0.8)}%`,
                  }}
                />
              </span>
            </button>
          </li>
        </ol>
      </div>

      <div
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a region that scrolls must be reachable by keyboard
        tabIndex={0}
        className="overflow-x-auto border-fd-border border-t focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-primary"
      >
        <table className="w-full min-w-[34rem] border-collapse text-xs">
          <caption className="sr-only">
            Release binary size in bytes before and after each cut, per target
          </caption>
          <thead>
            <tr className="text-fd-muted-foreground">
              <th scope="col" className="p-2.5 text-left font-medium">
                commit
              </th>
              <th scope="col" className="p-2.5 text-right font-medium">
                darwin/arm64 after
              </th>
              <th scope="col" className="p-2.5 text-right font-medium">
                change
              </th>
              <th scope="col" className="p-2.5 text-right font-medium">
                linux/amd64 after
              </th>
              <th scope="col" className="p-2.5 text-right font-medium">
                change
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-fd-border border-t">
              <th scope="row" className="p-2.5 text-left font-normal">
                before (dd7921ff)
              </th>
              <td className="p-2.5 text-right">{bytes(STEPS[0].darwin[0])}</td>
              <td className="p-2.5 text-right" />
              <td className="p-2.5 text-right">{bytes(STEPS[0].linux[0])}</td>
              <td className="p-2.5 text-right" />
            </tr>
            {STEPS.map((s) => (
              <tr key={s.id} className="border-fd-border border-t">
                <th
                  scope="row"
                  className="p-2.5 text-left font-mono font-normal"
                >
                  {s.commit}
                </th>
                <td className="p-2.5 text-right">{bytes(s.darwin[1])}</td>
                <td className="p-2.5 text-right">
                  {bytes(s.darwin[1] - s.darwin[0])}
                </td>
                <td className="p-2.5 text-right">{bytes(s.linux[1])}</td>
                <td className="p-2.5 text-right">
                  {bytes(s.linux[1] - s.linux[0])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed sm:px-5">
        Stripped release builds, sizes from each commit's message, measured in
        the order shown. Turning a cut off subtracts its measured change; any
        other order is an estimate. The effect pack figure is the one
        measurement taken before the branch was deleted. MB here is a million
        bytes.
      </figcaption>
    </figure>
  );
}
