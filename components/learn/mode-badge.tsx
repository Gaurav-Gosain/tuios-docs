"use client";

import { Keyboard, LayoutGrid } from "lucide-react";
import type { TuiosState } from "@/lib/learn/types";

const PREFIX: Record<string, string> = {
  prefix: "ctrl+b pressed. Now the next key.",
  workspace: "Workspaces: press 1 to 9.",
  window: "Window menu open.",
  minimize: "Minimize menu open.",
  layout: "Layout menu open.",
  debug: "Debug menu open.",
  tape: "Tape menu open.",
};

/**
 * WINDOWS or TYPING, large, because which mode you are in is the thing a
 * beginner trips on. It flips with a small animation when the mode changes.
 */
export function ModeBadge({
  state,
  size = "lg",
}: {
  state: Pick<TuiosState, "mode" | "prefix"> | null;
  size?: "lg" | "sm";
}) {
  const typing = state?.mode === "terminal";
  const prefix = state?.prefix ? PREFIX[state.prefix] : null;
  const lg = size === "lg";
  return (
    <div className="flex flex-col items-start gap-1.5" aria-live="polite">
      <div className="flex items-center gap-2 [perspective:400px]">
        <span
          key={typing ? "typing" : "windows"}
          className={`learn-badge inline-flex items-center gap-2 rounded-lg font-bold font-mono tracking-[0.18em] shadow-sm ${
            lg ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-[0.7rem]"
          } ${
            typing
              ? "bg-[#9ece6a] text-[#11111b]"
              : "bg-gradient-to-r from-[var(--brand-a)] to-[var(--brand-b)] text-white"
          }`}
        >
          {typing ? (
            <Keyboard className={lg ? "size-4" : "size-3"} />
          ) : (
            <LayoutGrid className={lg ? "size-4" : "size-3"} />
          )}
          {typing ? "TYPING" : "WINDOWS"}
        </span>
        {prefix ? (
          <span className="learn-pop inline-flex items-center rounded-md border border-[var(--brand-a)]/50 bg-[var(--brand-a)]/10 px-2 py-1 font-mono text-[0.7rem] text-fd-foreground">
            {prefix}
          </span>
        ) : null}
      </div>
      {lg ? (
        <p className="text-fd-muted-foreground text-xs">
          {typing
            ? "Your keys go to the shell."
            : "Your keys move and open windows."}
        </p>
      ) : null}
    </div>
  );
}
