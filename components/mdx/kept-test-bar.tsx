"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Real tests the strict pass deleted on 25 September 2026, the reason it
 * recorded for each (quoted from the commit bodies), and what the review that
 * evening decided. Every name is checked against the tuios history: deleted
 * between 8f181f43 and d905b69e, and either present again at 2863b287 or not.
 */
type Sample = {
  id: string;
  label: string;
  test: string;
  pkg: string;
  bug: string | null;
  strict: string;
  e2eFails: boolean;
  why: string;
  back: string | null;
};

const SAMPLES: readonly Sample[] = [
  {
    id: "tab",
    label: "Tab with auto-enter on",
    test: "TestNextWindowFromWindowModeEntersTerminalMode",
    pkg: "internal/input",
    bug: 'With auto_enter_terminal_on_focus set to "all", Tab moves the focus and leaves you in window mode.',
    strict:
      "focus policy behaviour; E2E TestFocusAutoEnterAddsNoLine drives it",
    e2eFails: false,
    why: "TestFocusAutoEnterAddsNoLine presses the same keys, but it counts resizes and new lines in the shells. It never checks which mode you end up in.",
    back: "1358f7c7",
  },
  {
    id: "gesture",
    label: "A retile during a drag",
    test: "TestALayoutUpdateInsideAGestureDoesNotEndItsHold",
    pkg: "internal/app",
    bug: "A retile in the middle of a drag ends the drag’s hold on size announcements, so the pane is told a size before the drag is over.",
    strict: "nested hold, covered by E2E drag_announce (a drag resizes once)",
    e2eFails: false,
    why: 'NEGATIVE_CONTROLS.md records the run: with the fault put back, no E2E test fails. This test does, with "a layout update inside the gesture told the pane [[58 28]]".',
    back: "2863b287",
  },
  {
    id: "mouse",
    label: "A click with the cell size known",
    test: "TestEncodeMouseCellModeUnchanged",
    pkg: "internal/vt",
    bug: "With the cell size known and SGR pixel mode (1016) off, a click is reported in pixels, so every click in vim or htop lands in the wrong cell.",
    strict:
      "SGR cell reports are covered by the e2e mouse tests (wheel 64 and bare motion 35 reports)",
    e2eFails: false,
    why: "The E2E mouse tests accept any coordinates and never set a cell size, so pixel scaling leaking into cell mode passes them.",
    back: "85e736c9",
  },
  {
    id: "flap",
    label: "An agent state that flaps",
    test: "TestAgentHoldCollapsesAFlap",
    pkg: "internal/session",
    bug: "An agent clears its progress bar between two steps and sets it again, and the pane blinks through idle.",
    strict: "hold timing policy, not a kept kind",
    e2eFails: false,
    why: "The test places each report at an exact time, 50 ms and 120 ms after the first. The E2E suite sets agent states by hand and checks the glyph, and a real run cannot land inside the hold window on purpose.",
    back: "f7196831",
  },
  {
    id: "migration",
    label: "A config from an older tuios",
    test: "TestCornerSnapMigrationMovesTheStaleDigits",
    pkg: "internal/config",
    bug: 'Configs written before the corner snap fix keep snap_corner_N = ["N"], so an upgraded install still reports four key conflicts.',
    strict: "a config migration, not a kept kind",
    e2eFails: false,
    why: "No E2E test loads a config file an older tuios wrote. The test carries its own negative control: drop the migration call and it fails.",
    back: "5bd9055f",
  },
  {
    id: "shots",
    label: "A screenshot writer",
    test: "TestReviewShots",
    pkg: "internal/app",
    bug: null,
    strict: "writes screenshots for a person on request, asserts nothing",
    e2eFails: false,
    why: "There is no bug for it to catch. It skips unless TUIOS_REVIEW_SHOTS is set, and it never checks what it draws.",
    back: null,
  },
  {
    id: "helper",
    label: "A test of a helper",
    test: "TestIsBlankRender",
    pkg: "internal/app",
    bug: null,
    strict:
      "restates the helper; TestBlankAltScreenFrameIsNotCached covers its use",
    e2eFails: false,
    why: "A broken helper already fails the test that uses it, and that test stayed. This one adds a second place to update and no new failure.",
    back: null,
  },
];

function Answer({ yes, children }: { yes: boolean; children: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        yes
          ? "bg-fd-primary text-fd-primary-foreground"
          : "border border-fd-border text-fd-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function KeptTestBar() {
  const [id, setId] = useState(SAMPLES[0].id);
  const sample = SAMPLES.find((s) => s.id === id) ?? SAMPLES[0];
  const panelId = useId();

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="border-fd-border border-b p-4">
        <p className="mb-2 font-mono text-fd-muted-foreground text-xs">
          pick a test the strict pass deleted
        </p>
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">Deleted tests</legend>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === id}
              aria-controls={panelId}
              onClick={() => setId(s.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-left text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary motion-reduce:transition-none",
                s.id === id
                  ? "border-fd-primary bg-fd-primary text-fd-primary-foreground"
                  : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </fieldset>
      </div>

      <div id={panelId} aria-live="polite" className="flex flex-col gap-4 p-4">
        <div>
          <p className="break-all font-mono text-fd-foreground text-sm">
            {sample.test}
          </p>
          <p className="font-mono text-fd-muted-foreground text-xs">
            {sample.pkg}
          </p>
          <p className="mt-2 text-fd-foreground text-sm leading-relaxed">
            <span className="text-fd-muted-foreground">The bug it names: </span>
            {sample.bug ?? "none."}
          </p>
        </div>

        <ol className="flex flex-col gap-3">
          <li className="rounded-md border border-fd-border p-3">
            <p className="mb-1.5 flex flex-wrap items-center gap-2 text-fd-foreground text-sm">
              <span className="font-mono text-fd-muted-foreground text-xs">
                afternoon
              </span>
              Is it one of the kept kinds, with no E2E test for it?
              <Answer yes={false}>no, deleted</Answer>
            </p>
            <p className="text-fd-muted-foreground text-sm leading-relaxed">
              The recorded reason: <q>{sample.strict}</q>
            </p>
          </li>
          <li className="rounded-md border border-fd-border p-3">
            <p className="mb-1.5 flex flex-wrap items-center gap-2 text-fd-foreground text-sm">
              <span className="font-mono text-fd-muted-foreground text-xs">
                evening
              </span>
              {sample.bug
                ? "Put the bug back. Does an E2E test fail?"
                : "Is there a bug for it to catch?"}
              <Answer yes={sample.e2eFails}>
                {sample.e2eFails ? "yes" : "no"}
              </Answer>
            </p>
            <p className="text-fd-muted-foreground text-sm leading-relaxed">
              {sample.why}
            </p>
          </li>
        </ol>

        <p className="flex flex-wrap items-center gap-2 text-sm">
          <Answer yes={sample.back !== null}>
            {sample.back ? "came back" : "stayed deleted"}
          </Answer>
          <span className="text-fd-muted-foreground">
            {sample.back ? (
              <>
                restored in{" "}
                <code className="text-fd-foreground">{sample.back}</code>
              </>
            ) : (
              "nothing is lost without it"
            )}
          </span>
        </p>
      </div>

      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        Seven of the 2,671 test functions the strict pass deleted. The quoted
        reasons are from the strict pass commit bodies. The answers in the
        second question are from the restore commits and{" "}
        <code>e2e/tui/NEGATIVE_CONTROLS.md</code>.
      </figcaption>
    </figure>
  );
}
