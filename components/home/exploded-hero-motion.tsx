"use client";

import { useEffect } from "react";

/**
 * The exploded view's motion where the browser has no scroll timelines. The
 * CSS gives every moving part a paused one-second animation. This sets each
 * one's time from how far the section has scrolled, once per frame while
 * the page scrolls. With scroll timelines, or with reduced motion, it does
 * nothing.
 */
export function ExplodedHeroMotion() {
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = document.getElementById("xh-track");
    if (!track) return;
    const anims = track.getAnimations({ subtree: true });
    let frame = 0;
    const apply = () => {
      frame = 0;
      const r = track.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      for (const a of anims) a.currentTime = p * 1000;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    apply();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
