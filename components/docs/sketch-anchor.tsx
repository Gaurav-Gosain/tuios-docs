"use client";

import { useEffect } from "react";

let installed = false;

/**
 * Keeps the tab a reader clicks in a sketch gallery figure at the same place
 * in the viewport. The Picture, Text and Source tabs of every figure on the
 * page switch together, and each figure keeps its height (see .sk-tabs in
 * app/global.css), so nothing should move. This is the guard for anything
 * that still does: it reads where the tab is before the switch and scrolls
 * by the difference after it. Radix switches a tab on pointer down, and on
 * focus from the keyboard, so both are watched in the capture phase, before
 * the switch. It renders nothing, and one listener serves every figure.
 */
export function SketchAnchor() {
  useEffect(() => {
    if (installed) return;
    installed = true;
    const hold = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const tab = target.closest('.sk-tabs [role="tab"]');
      if (!tab) return;
      const before = tab.getBoundingClientRect().top;
      const restore = () => {
        const moved = tab.getBoundingClientRect().top - before;
        if (Math.abs(moved) >= 0.5) window.scrollBy(0, moved);
      };
      requestAnimationFrame(() => {
        restore();
        requestAnimationFrame(restore);
      });
    };
    document.addEventListener("pointerdown", hold, true);
    document.addEventListener("keydown", hold, true);
  }, []);
  return null;
}
