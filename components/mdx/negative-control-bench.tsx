"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface Outcome {
  pass: boolean;
  message: string;
}

interface Case {
  id: string;
  name: string;
  file: string;
  fault: string;
  modelled: boolean;
  oldCode: string;
  newCode: string;
  // [fix in place, fix removed]
  oldResult: [Outcome, Outcome];
  newResult: [Outcome, Outcome];
}

/**
 * The three tests from the post, each run against a tree with its fix in
 * place and with the fix removed. The palette and mark flood rows are the
 * results of real runs (see the post); the resize row models a fault, because
 * the old check could not see any fault at all.
 */
const CASES: Case[] = [
  {
    id: "resize",
    name: "FuzzEmulatorResize",
    file: "internal/vt/fuzz_test.go",
    fault: "a resize that renders more rows than the new screen has",
    modelled: true,
    oldCode: `if _ = emu.String(); false {
    _ = io.Discard
}`,
    newCode: `if bad := invariants(emu); bad != "" {
    t.Fatalf("after a resize to %dx%d: %s", ...)
}
out := emu.String()
if lines := strings.Count(out, "\\n") + 1; lines > height {
    t.Fatalf("rendered %d lines for a %d-row screen after a resize", ...)
}`,
    oldResult: [
      { pass: true, message: "ok" },
      { pass: true, message: "ok: the condition is the constant false" },
    ],
    newResult: [
      { pass: true, message: "ok" },
      {
        pass: false,
        message: "rendered 24 lines for a 3-row screen after a resize",
      },
    ],
  },
  {
    id: "palette",
    name: "TestPaletteFromParams",
    file: "internal/session/resolve_sgr_test.go",
    fault:
      "an empty palette returns [16]color.Color{} instead of the xterm table",
    modelled: false,
    oldCode: `if len(pal) != 16 {
    t.Fatalf("xterm palette len = %d, want 16", len(pal))
}`,
    newCode: `for i, c := range pal {
    if c == nil {
        t.Fatalf("the default palette has no colour at %d", i)
    }
}
if got, want := ResolveSGR("\\x1b[31m", pal),
    ResolveSGR("\\x1b[31m", xtermPalette()); got != want {
    t.Fatalf("an empty palette resolved red to %q, want the xterm %q", got, want)
}`,
    oldResult: [
      { pass: true, message: "ok" },
      { pass: true, message: "ok: len of a [16] array is 16" },
    ],
    newResult: [
      { pass: true, message: "ok" },
      {
        pass: false,
        message:
          "resolve_sgr_test.go:144: the default palette has no colour at 0",
      },
    ],
  },
  {
    id: "flood",
    name: "TestVTGenRepros/mark-flood-stays-cheap",
    file: "internal/vt/testdata/vtgen-repros/mark-flood-stays-cheap.json",
    fault: "the 64-byte cap on what one cell holds (76c5ebf0) is removed",
    modelled: false,
    oldCode: `120 steps, budget_ms 1500
step 22: "Bytes": "\uFFFD?7l"
         "Desc": "reset DECAWM autowrap, using eight-bit controls"`,
    newCode: `4 steps, budget_ms 1500, budget_alloc_mb 64
step 1: "BytesQuoted": "\\\\x9b?7l"
step 2: resize to 120x40
step 3: a tag sequence flag
step 4: REP with a count of 99999999999999999999`,
    oldResult: [
      { pass: true, message: "ok" },
      {
        pass: true,
        message: "ok in 0.08s: the script never turns autowrap off",
      },
    ],
    newResult: [
      { pass: true, message: "ok" },
      {
        pass: false,
        message:
          "the oracles took 18.77s, over the 1500ms budget; the oracles allocated 3561 MB, over the 64 MB budget",
      },
    ],
  },
];

function Result({ outcome }: { outcome: Outcome }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-xs">
      <span
        className={cn(
          "shrink-0 font-semibold",
          outcome.pass ? "text-fd-foreground" : "text-fd-primary",
        )}
      >
        {outcome.pass ? "PASS" : "FAIL"}
      </span>
      <span className="break-words text-fd-muted-foreground">
        {outcome.message}
      </span>
    </div>
  );
}

function Column({
  title,
  code,
  outcome,
}: {
  title: string;
  code: string;
  outcome: Outcome;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 font-mono text-xs text-fd-muted-foreground">
        {title}
      </div>
      <pre
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a region that scrolls must be reachable by keyboard
        tabIndex={0}
        className="mb-3 max-w-full overflow-x-auto rounded border border-fd-border bg-fd-background p-2 font-mono text-[11px] leading-snug text-fd-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-primary"
      >
        {code}
      </pre>
      <Result outcome={outcome} />
    </div>
  );
}

const buttonClass =
  "rounded-md border px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary";

/**
 * Pick one of the three tests, then run it with its fix in place or removed.
 * The old form of each test passes both ways. The form that replaced it goes
 * red when the fix is gone, which is what a negative control asks.
 */
export function NegativeControlBench() {
  const [caseId, setCaseId] = useState(CASES[1].id);
  const [removed, setRemoved] = useState(false);
  const c = CASES.find((k) => k.id === caseId) ?? CASES[0];
  const idx = removed ? 1 : 0;
  const oldOut = c.oldResult[idx];
  const newOut = c.newResult[idx];

  let verdict: string;
  if (!removed) {
    verdict =
      "Both forms pass on the fixed tree. So far this tells you nothing.";
  } else if (oldOut.pass && !newOut.pass) {
    verdict =
      "The old test passes on broken code, so it could never fail. The new one fails, so it guards the fix.";
  } else {
    verdict = "Both forms fail on broken code.";
  }

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-3 p-4">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Which test</legend>
          {CASES.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={k.id === caseId}
              onClick={() => setCaseId(k.id)}
              className={cn(
                buttonClass,
                "max-w-full break-all text-left font-mono text-xs",
                k.id === caseId
                  ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/60",
              )}
            >
              {k.name}
            </button>
          ))}
        </fieldset>
        <div className="font-mono text-[11px] text-fd-muted-foreground break-all">
          {c.file}
        </div>
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">The fix under test</legend>
          {[false, true].map((r) => (
            <button
              key={String(r)}
              type="button"
              aria-pressed={removed === r}
              onClick={() => setRemoved(r)}
              className={cn(
                buttonClass,
                removed === r
                  ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/60",
              )}
            >
              {r ? "fix removed" : "fix in place"}
            </button>
          ))}
        </fieldset>
        <p className="text-sm text-fd-muted-foreground">
          <span className="text-fd-foreground">Fault:</span> {c.fault}
          {c.modelled ? " (modelled)" : ""}.
        </p>
      </div>

      <div className="grid gap-4 border-t border-fd-border p-4 md:grid-cols-2">
        <Column title="the test as it was" code={c.oldCode} outcome={oldOut} />
        <Column
          title="the test as it is now"
          code={c.newCode}
          outcome={newOut}
        />
      </div>

      <p
        className="border-t border-fd-border px-4 py-3 text-sm text-fd-foreground"
        aria-live="polite"
      >
        {verdict}
      </p>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        A negative control runs a test against a tree with its fix taken out.
        The palette and mark flood results are from real runs on tuios main; the
        resize fault is modelled, because the old check had no body that could
        run, so no fault could reach it.
      </figcaption>
    </figure>
  );
}
