"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { bootTuios, loadEngine, type TuiosInstance } from "@/lib/learn/runtime";
import { BspLoader } from "./bsp-loader";
import { useEngineStatus } from "./hooks";

/**
 * A live tuios in a dark stage. The BSP loader covers it until the first
 * frame is drawn. The instance is created on mount and quit on unmount.
 */
export function LiveTerminal({
  fontSize = 14,
  className,
  onReady,
  onFocusChange,
  label = "tuios, running live",
  children,
  stageRef,
}: {
  fontSize?: number;
  className?: string;
  onReady?: (tuios: TuiosInstance) => void;
  onFocusChange?: (focused: boolean) => void;
  label?: string;
  children?: React.ReactNode;
  stageRef?: React.RefObject<HTMLDivElement | null>;
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
    const inside = () => el.contains(document.activeElement);
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

  const setRefs = (node: HTMLDivElement | null) => {
    wrap.current = node;
    if (stageRef) stageRef.current = node;
  };

  return (
    <div
      ref={setRefs}
      role="application"
      aria-label={label}
      data-focused={focused || undefined}
      className={cn(
        "learn-stage relative overflow-hidden rounded-xl transition-[border-color,box-shadow] duration-200",
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
