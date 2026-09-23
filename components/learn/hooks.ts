"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  type EngineStatus,
  engineStatus,
  subscribeEngine,
} from "@/lib/learn/runtime";

const idle: EngineStatus = { phase: "idle", loaded: 0, total: 0 };

export function useEngineStatus() {
  return useSyncExternalStore(subscribeEngine, engineStatus, () => idle);
}

function useMedia(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(() => {
    const m = matchMedia(query);
    const update = () => setMatches(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** True when the reader asked for less motion. */
export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)") ?? false;
}

/**
 * A phone or a small touch screen: no keyboard to learn with, so the page
 * shows a preview instead of downloading tuios. Null until mounted.
 */
export function useSmallScreen() {
  const touch = useMedia("(pointer: coarse) and (max-width: 1024px)");
  const narrow = useMedia("(max-width: 760px)");
  if (touch === null || narrow === null) return null;
  return touch || narrow;
}

/** Re-render every `ms` while `on` is true. */
export function useTicker(on: boolean, ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [on, ms]);
}
