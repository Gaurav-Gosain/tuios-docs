"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Mode = "json" | "quoted";

interface Stage {
  label: string;
  body: string;
  bytes?: { hex: string; lost?: boolean }[];
}

const IN_MEMORY: Stage = {
  label: "the step in memory",
  body: "reset DECAWM autowrap, using eight-bit controls",
  bytes: [{ hex: "9B" }, { hex: "3F" }, { hex: "37" }, { hex: "6C" }],
};

/**
 * One step of the mark flood repro, the one that turns autowrap off, taken
 * through the pinned file and back. encoding/json replaces the eight-bit CSI
 * byte with U+FFFD; BytesQuoted stores it as a Go string literal.
 */
const STAGES: Record<Mode, Stage[]> = {
  json: [
    IN_MEMORY,
    {
      label: "written to the .json file by encoding/json",
      body: '"Bytes": "�?7l"',
    },
    {
      label: "read back from the file",
      body: "U+FFFD ? 7 l",
      bytes: [
        { hex: "EF", lost: true },
        { hex: "BF", lost: true },
        { hex: "BD", lost: true },
        { hex: "3F" },
        { hex: "37" },
        { hex: "6C" },
      ],
    },
    {
      label: "what the emulator does with it",
      body: "Prints four characters of text. Autowrap stays on, so REP wraps the flag onto the next cell and the next row. Every cell holds one flag. No flood, and the test passes with or without the cap.",
    },
  ],
  quoted: [
    IN_MEMORY,
    {
      label: "written to the .json file through BytesQuoted",
      body: '"BytesQuoted": "\\\\x9b?7l"',
    },
    {
      label: "read back from the file",
      body: "CSI ? 7 l",
      bytes: [{ hex: "9B" }, { hex: "3F" }, { hex: "37" }, { hex: "6C" }],
    },
    {
      label: "what the emulator does with it",
      body: "Turns autowrap off. REP now writes every repeat into the last column, and the flag’s tag characters stack on that one cell. Without the 64-byte cap the oracles take seconds and gigabytes.",
    },
  ],
};

const buttonClass =
  "rounded-md border px-3 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary";

export function JsonByteLoss() {
  const [mode, setMode] = useState<Mode>("json");
  const stages = STAGES[mode];

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <fieldset className="flex min-w-0 flex-wrap gap-2 p-4">
        <legend className="sr-only">How the step is stored</legend>
        {(
          [
            ["json", "plain encoding/json (1d925fd7)"],
            ["quoted", "BytesQuoted (33fc841f)"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              buttonClass,
              mode === m
                ? "border-fd-primary bg-fd-primary/10 text-fd-foreground"
                : "border-fd-border text-fd-muted-foreground hover:border-fd-primary/60",
            )}
          >
            {label}
          </button>
        ))}
      </fieldset>

      <ol
        className="flex flex-col border-t border-fd-border"
        aria-live="polite"
      >
        {stages.map((s, i) => (
          <li
            key={s.label}
            className={cn(
              "flex flex-col gap-2 px-4 py-3",
              i > 0 && "border-t border-fd-border",
            )}
          >
            <span className="font-mono text-xs text-fd-muted-foreground">
              {i + 1}. {s.label}
            </span>
            {s.bytes ? (
              <div className="flex flex-wrap gap-1">
                <span className="sr-only">bytes</span>
                {s.bytes.map((b, j) => (
                  <span
                    key={`${b.hex}-${j}`}
                    className={cn(
                      "rounded border px-1.5 py-0.5 font-mono text-xs",
                      b.lost
                        ? "border-fd-primary bg-fd-primary/15 text-fd-foreground"
                        : "border-fd-border bg-fd-background text-fd-foreground",
                    )}
                  >
                    {b.hex}
                  </span>
                ))}
              </div>
            ) : null}
            <span
              className={cn(
                "break-words text-sm",
                i === 1 ? "font-mono text-fd-foreground" : "text-fd-foreground",
              )}
            >
              {s.body}
            </span>
          </li>
        ))}
      </ol>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        One step of the pinned repro, the one that turns autowrap off. 0x9B is
        CSI written as a single eight-bit byte, which is not valid UTF-8 on its
        own. encoding/json replaces it with the three bytes of U+FFFD and keeps
        the step&apos;s description, so the file still says what the step was
        meant to do.
      </figcaption>
    </figure>
  );
}
