"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { bootTuios, loadEngine, type TuiosInstance } from "@/lib/learn/runtime";
import { BspLoader } from "./bsp-loader";
import { useEngineStatus } from "./hooks";

/** Esc presses this close together leave the terminal. */
const ESCAPE_WINDOW_MS = 900;

/**
 * A live tuios in a dark stage. The BSP loader covers it until the first
 * frame is drawn. The instance is created on mount and quit on unmount.
 *
 * The terminal keeps tab and esc, since both are tuios keys, so a keyboard
 * alone could not get out of it. With `escapable` on, esc three times inside a
 * second moves focus to the stage itself, and the next tab goes on to the
 * rest of the page. A lesson turns it off and handles the same keys itself.
 */
export function LiveTerminal({
  fontSize = 14,
  className,
  onReady,
  onFocusChange,
  label = "tuios, running live",
  children,
  stageRef,
  escapable = true,
}: {
  fontSize?: number;
  className?: string;
  onReady?: (tuios: TuiosInstance) => void;
  onFocusChange?: (focused: boolean) => void;
  label?: string;
  children?: React.ReactNode;
  stageRef?: React.RefObject<HTMLDivElement | null>;
  escapable?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const status = useEngineStatus();
  const [shown, setShown] = useState(false);
  const [focused, setFocused] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const ready = useRef(onReady);
  ready.current = onReady;
  const focusChange = useRef(onFocusChange);
  focusChange.current = onFocusChange;

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new attempt boots a fresh instance after Retry
  useEffect(() => {
    const parent = host.current;
    if (!parent) return;
    let alive = true;
    let instance: TuiosInstance | null = null;
    const el = document.createElement("div");
    el.className = "learn-term webterm";
    parent.appendChild(el);
    bootTuios(el, { fontSize })
      .then((t) => {
        if (!alive) {
          t.dispose();
          return;
        }
        instance = t;
        t.onFirstFrame(() => {
          if (alive) setShown(true);
        });
        ready.current?.(t);
      })
      .catch(() => {
        // The loader shows the failure.
      });
    return () => {
      alive = false;
      instance?.dispose();
      el.remove();
    };
  }, [fontSize, attempt]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    // The stage itself takes focus when the reader leaves the terminal, and
    // that does not count as being in it.
    const inside = () =>
      document.activeElement !== el && el.contains(document.activeElement);
    const update = () => {
      const f = inside();
      setFocused(f);
      focusChange.current?.(f);
    };
    // Focus has not moved yet when focusout fires.
    const later = () => setTimeout(update, 0);
    el.addEventListener("focusin", update);
    el.addEventListener("focusout", later);
    return () => {
      el.removeEventListener("focusin", update);
      el.removeEventListener("focusout", later);
    };
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !escapable) return;
    const times: number[] = [];
    const onKey = (e: KeyboardEvent) => {
      // On the stage, tab goes past the terminal inside it.
      if (e.key === "Tab" && !e.shiftKey && document.activeElement === el) {
        const next = nextTabStop(el);
        if (next) {
          e.preventDefault();
          next.focus();
        }
        return;
      }
      if (e.key !== "Escape") return;
      const now = performance.now();
      times.push(now);
      while (times.length && now - times[0] > ESCAPE_WINDOW_MS) times.shift();
      if (times.length < 3) return;
      times.length = 0;
      el.focus();
    };
    // Capture, so this sees the key before the terminal does.
    el.addEventListener("keydown", onKey, true);
    return () => el.removeEventListener("keydown", onKey, true);
  }, [escapable]);

  const setRefs = (node: HTMLDivElement | null) => {
    wrap.current = node;
    if (stageRef) stageRef.current = node;
  };

  return (
    <div
      ref={setRefs}
      role="application"
      aria-label={label}
      tabIndex={escapable ? -1 : undefined}
      data-focused={focused || undefined}
      className={cn(
        "learn-stage relative overflow-hidden rounded-xl outline-none transition-[border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-fd-ring",
        className,
      )}
    >
      <div ref={host} className="absolute inset-0" />
      <BspLoader
        status={status}
        gone={shown}
        onRetry={() => {
          loadEngine().catch(() => undefined);
          setAttempt((n) => n + 1);
        }}
      />
      {children}
    </div>
  );
}

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The first element after `el`, and not inside it, that tab would reach. */
function nextTabStop(el: HTMLElement): HTMLElement | null {
  for (const node of document.querySelectorAll<HTMLElement>(TABBABLE)) {
    if (el.contains(node)) continue;
    if (!(el.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING))
      continue;
    if (node.tabIndex < 0 || node.closest("[inert]")) continue;
    if (!node.getClientRects().length) continue;
    return node;
  }
  return null;
}
