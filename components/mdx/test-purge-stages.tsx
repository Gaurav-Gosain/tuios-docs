"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Unit test functions in tuios at each step of the 25 September 2026 test
 * passes, per package group.
 *
 * Source: `git grep -E '^func Test[A-Z_]' <rev> -- '*_test.go' ':!e2e/**'`
 * in the tuios repository, one row per package directory and test name, so a
 * name is counted once per package. cmd is every package under cmd/, and
 * "other" is every remaining package (pkg/ and the smaller internal ones).
 */
type Group =
  | "internal/app"
  | "internal/session"
  | "internal/input"
  | "internal/vt"
  | "internal/config"
  | "cmd"
  | "other";

const GROUPS: readonly Group[] = [
  "internal/app",
  "internal/session",
  "internal/input",
  "internal/vt",
  "internal/config",
  "cmd",
  "other",
];

type Stage = {
  id: string;
  label: string;
  rev: string;
  note: string;
  counts: Record<Group, number>;
};

const STAGES: readonly Stage[] = [
  {
    id: "before",
    label: "before",
    rev: "94dbf2bd",
    note: "The suite as it stood on the morning of 25 September.",
    counts: {
      "internal/app": 2076,
      "internal/session": 1025,
      "internal/input": 339,
      "internal/vt": 303,
      "internal/config": 231,
      cmd: 224,
      other: 1014,
    },
  },
  {
    id: "first",
    label: "first pass",
    rev: "7445c658",
    note: "Drop, then keep what no E2E test covers, one package at a time. 1,127 names went.",
    counts: {
      "internal/app": 1575,
      "internal/session": 823,
      "internal/input": 287,
      "internal/vt": 267,
      "internal/config": 173,
      cmd: 136,
      other: 826,
    },
  },
  {
    id: "strict-start",
    label: "midday",
    rev: "8f181f43",
    note: "The agent review work and new fuzz targets landed, each held to the same bar.",
    counts: {
      "internal/app": 1602,
      "internal/session": 882,
      "internal/input": 291,
      "internal/vt": 268,
      "internal/config": 173,
      cmd: 148,
      other: 875,
    },
  },
  {
    id: "strict",
    label: "strict pass",
    rev: "d905b69e",
    note: "Only the kept kinds stay. 2,671 tests dropped, 130 folded into 32 tables.",
    counts: {
      "internal/app": 369,
      "internal/session": 414,
      "internal/input": 17,
      "internal/vt": 229,
      "internal/config": 20,
      cmd: 44,
      other: 377,
    },
  },
  {
    id: "review",
    label: "review",
    rev: "2863b287",
    note: "Deleted tests that catch a bug no E2E test catches come back. 1,395 names return.",
    counts: {
      "internal/app": 1034,
      "internal/session": 708,
      "internal/input": 245,
      "internal/vt": 231,
      "internal/config": 91,
      cmd: 77,
      other: 478,
    },
  },
];

/** The strict pass is measured against this stage, so it is drawn as a ghost. */
const REFERENCE = STAGES[2];

const SCALE = Math.max(
  ...STAGES.flatMap((s) => GROUPS.map((g) => s.counts[g])),
);

function total(stage: Stage) {
  return GROUPS.reduce((sum, g) => sum + stage.counts[g], 0);
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function signed(n: number) {
  if (n === 0) return "0";
  return `${n > 0 ? "+" : "−"}${fmt(Math.abs(n))}`;
}

export function TestPurgeStages() {
  const [index, setIndex] = useState(3);
  const stage = STAGES[index];
  const previous = index > 0 ? STAGES[index - 1] : null;
  const sum = total(stage);
  const change = previous ? sum - total(previous) : 0;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 border-fd-border border-b p-4">
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">
            Which step of the test passes to show
          </legend>
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-md border border-fd-border px-2.5 py-1 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary motion-reduce:transition-none",
                i === index
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </fieldset>
        <div aria-live="polite" className="flex flex-col gap-1">
          <p className="font-mono text-fd-foreground text-sm tabular-nums">
            {fmt(sum)} test functions
            {previous && (
              <span className="text-fd-muted-foreground">
                {" "}
                ({signed(change)} on the step before)
              </span>
            )}
          </p>
          <p className="text-fd-muted-foreground text-xs leading-relaxed">
            <code className="text-fd-foreground">{stage.rev}</code> {stage.note}
          </p>
        </div>
      </div>

      <div className="p-4" aria-hidden="true">
        <ul className="flex flex-col gap-2.5">
          {GROUPS.map((g) => {
            const n = stage.counts[g];
            const ref = REFERENCE.counts[g];
            return (
              <li
                key={g}
                className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[9rem_1fr_3.5rem]"
              >
                <span className="min-w-0 truncate font-mono text-fd-foreground text-xs">
                  {g}
                </span>
                <span className="text-right font-mono text-fd-muted-foreground text-xs tabular-nums sm:order-3">
                  {fmt(n)}
                </span>
                <div className="relative col-span-2 h-4 sm:order-2 sm:col-span-1">
                  {/* The midday count, the base the strict pass cut from. */}
                  <div
                    className="absolute inset-y-0.5 left-0 rounded-sm border border-fd-muted-foreground/50 border-dashed"
                    style={{ width: `${(ref / SCALE) * 100}%` }}
                  />
                  <div
                    className="absolute inset-y-0.5 left-0 rounded-sm bg-fd-primary transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${(n / SCALE) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-fd-muted-foreground">
          <span className="inline-block h-2.5 w-5 rounded-sm border border-fd-muted-foreground/50 border-dashed" />
          midday, before the strict pass
        </p>
      </div>

      <div className="sr-only">
        <table>
          <caption>
            Unit test functions per package group at each step of the test
            passes
          </caption>
          <thead>
            <tr>
              <th scope="col">package group</th>
              {STAGES.map((s) => (
                <th key={s.id} scope="col">
                  {s.label} ({s.rev})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <tr key={g}>
                <th scope="row">{g}</th>
                {STAGES.map((s) => (
                  <td key={s.id}>{s.counts[g]}</td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">total</th>
              {STAGES.map((s) => (
                <td key={s.id}>{total(s)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        Test functions outside <code>e2e/</code>, counted with{" "}
        <code>git grep</code> at each commit, one per package and name. Fuzz
        targets are not counted here: there were 32 at midday and 32 after every
        later step. All five steps happened on 25 September 2026.
      </figcaption>
    </figure>
  );
}
