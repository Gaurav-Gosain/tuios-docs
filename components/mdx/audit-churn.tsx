"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Lines of Go added and removed by the September 2026 audit, per package.
 *
 * Source: `git diff --numstat cc2e5455~1..166f1945 -- '*.go'` in the tuios
 * repository, grouped by the first two path segments (internal/app, cmd/tuios)
 * or the first one (e2e). A file is a test when its name ends in `_test.go`,
 * which is how Go decides, so internal/testutil and internal/fuzz count as
 * production. The two renames into internal/ptyspawn are counted there.
 */
type Row = readonly [pkg: string, added: number, removed: number];

const PRODUCTION: readonly Row[] = [
  ["internal/app", 1189, 1700],
  ["internal/session", 578, 975],
  ["internal/input", 324, 539],
  ["internal/terminal", 191, 440],
  ["internal/config", 164, 389],
  ["internal/vt", 363, 80],
  ["cmd/tuios-web", 260, 238],
  ["internal/server", 86, 168],
  ["cmd/tuios", 62, 117],
  ["internal/testutil", 0, 117],
  ["internal/fuzz", 53, 103],
  ["internal/tape", 16, 88],
  ["internal/cliflags", 89, 0],
  ["internal/served", 83, 0],
  ["internal/ptyspawn", 54, 17],
  ["pkg/tuios", 30, 39],
  ["internal/guestenv", 70, 0],
  ["internal/overlay", 58, 4],
  ["internal/ui", 11, 47],
  ["internal/worktree", 6, 42],
  ["internal/federation", 17, 26],
  ["internal/layout", 20, 22],
  ["internal/shot", 19, 22],
  ["internal/pool", 0, 36],
  ["internal/transcript", 4, 23],
  ["internal/theme", 11, 15],
  ["internal/harness", 8, 10],
  ["internal/hooks", 5, 8],
  ["internal/gitstate", 6, 5],
  ["internal/scrollback", 4, 4],
  ["internal/capture", 3, 3],
  ["internal/netutil", 2, 3],
];

const TESTS: readonly Row[] = [
  ["internal/session", 741, 311],
  ["internal/app", 668, 357],
  ["internal/vt", 492, 44],
  ["internal/input", 324, 31],
  ["cmd/tuios-web", 204, 0],
  ["internal/terminal", 160, 9],
  ["internal/pool", 1, 139],
  ["internal/ui", 11, 113],
  ["internal/served", 92, 0],
  ["e2e", 43, 43],
  ["internal/cliflags", 84, 0],
  ["internal/overlay", 64, 0],
  ["internal/config", 55, 10],
  ["cmd/tuios", 34, 24],
  ["internal/shot", 62, 0],
  ["pkg/tuios", 30, 2],
  ["internal/server", 47, 8],
  ["internal/worktree", 51, 0],
  ["internal/ptyspawn", 43, 2],
  ["internal/guestenv", 40, 0],
  ["internal/federation", 1, 17],
  ["internal/tape", 0, 17],
];

type View = "production" | "tests";

const VIEWS: Record<View, readonly Row[]> = {
  production: PRODUCTION,
  tests: TESTS,
};

/** Packages that moved fewer lines than this are folded into one row. */
const SMALL = 60;

/** One scale for both views, so a test bar and a production bar compare. */
const SCALE = Math.max(
  ...PRODUCTION.flatMap(([, a, r]) => [a, r]),
  ...TESTS.flatMap(([, a, r]) => [a, r]),
);

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function signed(n: number) {
  if (n === 0) return "0";
  return `${n > 0 ? "+" : "−"}${fmt(Math.abs(n))}`;
}

function totals(rows: readonly Row[]) {
  let added = 0;
  let removed = 0;
  for (const [, a, r] of rows) {
    added += a;
    removed += r;
  }
  return { added, removed, net: added - removed };
}

function Bar({
  pkg,
  added,
  removed,
}: {
  pkg: string;
  added: number;
  removed: number;
}) {
  const net = added - removed;
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[11rem_1fr_4.5rem]">
      <span className="min-w-0 truncate font-mono text-fd-foreground text-xs">
        {pkg}
      </span>
      <span
        className={cn(
          "text-right font-mono text-xs tabular-nums sm:order-3",
          net < 0 ? "text-fd-muted-foreground" : "text-fd-primary",
        )}
      >
        {signed(net)}
      </span>
      {/* Removed grows left from the centre line, added grows right. */}
      <div className="col-span-2 grid grid-cols-2 items-center sm:order-2 sm:col-span-1">
        <div className="flex h-4 items-center justify-end border-fd-border border-r">
          <div
            className="h-3 rounded-l-sm bg-fd-muted-foreground/45"
            style={{ width: `${(removed / SCALE) * 100}%` }}
          />
        </div>
        <div className="flex h-4 items-center">
          <div
            className="h-3 rounded-r-sm bg-fd-primary"
            style={{ width: `${(added / SCALE) * 100}%` }}
          />
        </div>
      </div>
    </li>
  );
}

export function AuditChurn() {
  const [view, setView] = useState<View>("production");
  const [expanded, setExpanded] = useState(false);

  const rows = VIEWS[view];
  const sum = useMemo(() => totals(rows), [rows]);
  const big = rows.filter(([, a, r]) => a + r >= SMALL);
  const small = rows.filter(([, a, r]) => a + r < SMALL);
  const smallSum = totals(small);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-fd-border border-b p-4">
        <div
          className="inline-flex overflow-hidden rounded-md border border-fd-border"
          role="group"
          aria-label="Which Go files to count"
        >
          {(["production", "tests"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary motion-reduce:transition-none",
                view === v
                  ? "bg-fd-primary text-fd-primary-foreground"
                  : "text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <p
          className="font-mono text-fd-muted-foreground text-xs tabular-nums"
          aria-live="polite"
        >
          <span className="text-fd-primary">+{fmt(sum.added)}</span>{" "}
          <span>
            {"−"}
            {fmt(sum.removed)}
          </span>{" "}
          <span className="text-fd-foreground">net {signed(sum.net)}</span>
        </p>
      </div>

      <div className="p-4" aria-hidden="true">
        <div className="mb-3 grid grid-cols-2 font-mono text-[11px] text-fd-muted-foreground sm:ml-[11.75rem] sm:mr-[5.25rem]">
          <span className="pr-2 text-right">removed</span>
          <span className="pl-2">added</span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {big.map(([pkg, a, r]) => (
            <Bar key={pkg} pkg={pkg} added={a} removed={r} />
          ))}
          {expanded ? (
            small.map(([pkg, a, r]) => (
              <Bar key={pkg} pkg={pkg} added={a} removed={r} />
            ))
          ) : small.length > 0 ? (
            <Bar
              pkg={`${small.length} smaller packages`}
              added={smallSum.added}
              removed={smallSum.removed}
            />
          ) : null}
        </ul>
      </div>

      {small.length > 0 && (
        <div className="border-fd-border border-t px-4 py-2">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            className="font-mono text-fd-muted-foreground text-xs hover:text-fd-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-fd-primary"
          >
            {expanded
              ? "fold the smaller packages"
              : `show the ${small.length} packages under ${SMALL} lines`}
          </button>
        </div>
      )}

      {/* The wrapper carries sr-only: a table sizes to its content and ignores
          the 1px width sr-only sets on it directly. */}
      <div className="sr-only">
        <table>
          <caption>
            Lines of Go {view === "tests" ? "test" : "production"} code added
            and removed per package
          </caption>
          <thead>
            <tr>
              <th scope="col">package</th>
              <th scope="col">added</th>
              <th scope="col">removed</th>
              <th scope="col">net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([pkg, a, r]) => (
              <tr key={pkg}>
                <th scope="row">{pkg}</th>
                <td>{a}</td>
                <td>{r}</td>
                <td>{signed(a - r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        From <code>git diff --numstat</code> over the 92 commits of the audit,
        Go files only, grouped by package. A file counts as a test when its name
        ends in <code>_test.go</code>, so the test helpers in{" "}
        <code>internal/testutil</code> count as production. Both views share one
        scale.
      </figcaption>
    </figure>
  );
}
