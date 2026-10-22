"use client";
import { useSyncExternalStore } from "react";
import { appliedId, CHANGE_EVENT } from "@/lib/site-themes/store";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** The id of the tuios theme on the page, or null for the site default. */
export function useAppliedTheme(): string | null {
  return useSyncExternalStore(subscribe, appliedId, () => null);
}
