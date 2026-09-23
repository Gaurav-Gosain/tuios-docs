"use client";

import { ChevronRight } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { chordParts, keyLabel, pressedNames } from "@/lib/learn/keys";
import type { KeyItem } from "@/lib/learn/types";

type Size = "sm" | "md" | "xl";

export function Keycap({
  label,
  size = "md",
  held,
  done,
  next,
}: {
  label: string;
  size?: Size;
  held?: boolean;
  done?: boolean;
  next?: boolean;
}) {
  return (
    <kbd
      className="lk"
      data-size={size}
      data-held={held || undefined}
      data-done={done || undefined}
      data-next={next || undefined}
    >
      {label}
    </kbd>
  );
}

/**
 * A sequence of keys: chords joined with "+", steps joined with an arrow. A
 * cap lights while its key is held down, and stays tinted once pressed.
 */
export function KeySequence({
  items,
  size = "md",
  pressed = 0,
  held,
  pulseNext,
}: {
  items: KeyItem[];
  size?: Size;
  /** How many items are done. */
  pressed?: number;
  held?: Set<string>;
  pulseNext?: boolean;
}) {
  const gap = size === "xl" ? "gap-2.5" : size === "sm" ? "gap-1" : "gap-2";
  return (
    <span className={`inline-flex flex-wrap items-center ${gap}`}>
      {items.map((item, index) => {
        const done = index < pressed;
        const next = pulseNext && index === pressed;
        const key = `${index}-${typeof item === "string" ? item : item.text}`;
        return (
          <Fragment key={key}>
            {index > 0 ? (
              <ChevronRight
                aria-hidden
                className={
                  size === "sm"
                    ? "size-3 text-fd-muted-foreground"
                    : "size-4 text-fd-muted-foreground"
                }
              />
            ) : null}
            {typeof item === "string" ? (
              <span className={`inline-flex items-center ${gap}`}>
                {chordParts(item).map((part, i) => (
                  <Fragment key={part}>
                    {i > 0 ? (
                      <span
                        aria-hidden
                        className="font-mono text-fd-muted-foreground text-xs"
                      >
                        +
                      </span>
                    ) : null}
                    <Keycap
                      label={keyLabel(part)}
                      size={size}
                      held={isHeld(held, part)}
                      done={done}
                      next={next}
                    />
                  </Fragment>
                ))}
              </span>
            ) : (
              <Keycap
                label={item.text.trim()}
                size={size}
                done={done}
                next={next}
              />
            )}
          </Fragment>
        );
      })}
    </span>
  );
}

function isHeld(held: Set<string> | undefined, part: string) {
  if (!held) return false;
  return held.has(part) || held.has(part.toLowerCase());
}

/** The names of the keys held down right now, anywhere on the page. */
export function useHeldKeys() {
  const [held, setHeld] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const names = pressedNames(e);
      setHeld((prev) => {
        const next = new Set(prev);
        for (const n of names) next.add(n);
        return next;
      });
    };
    const up = (e: KeyboardEvent) => {
      const names = pressedNames(e);
      setHeld((prev) => {
        const next = new Set(prev);
        for (const n of names) next.delete(n);
        // Letting go of a modifier ends the chord.
        if (e.key === "Control") next.delete("ctrl");
        if (e.key === "Shift") next.delete("shift");
        if (e.key === "Alt") next.delete("alt");
        if (!e.ctrlKey) next.delete("ctrl");
        if (!e.shiftKey) next.delete("shift");
        if (!e.altKey) next.delete("alt");
        return next;
      });
    };
    const clear = () => setHeld(new Set());
    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      window.removeEventListener("blur", clear);
    };
  }, []);
  return held;
}
