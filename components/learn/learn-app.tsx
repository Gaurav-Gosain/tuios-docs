"use client";

import { useCallback, useEffect, useState } from "react";
import { type Progress, readProgress } from "@/lib/learn/progress";
import { loadEngine } from "@/lib/learn/runtime";
import { findTrack, tracks } from "@/lib/learn/tracks";
import type { Track } from "@/lib/learn/types";
import { useSmallScreen } from "./hooks";
import { Hub } from "./hub";
import { Lesson } from "./lesson";
import { MobileLearn } from "./mobile-learn";

/**
 * The /learn page: the hub with its live hero and the track list, and a
 * lesson on top when a track is picked. `?t=<track>` opens a track directly,
 * and the back button closes it.
 */
export function LearnApp() {
  const small = useSmallScreen();
  const [forceLive, setForceLive] = useState(false);
  const [progress, setProgress] = useState<Progress>({});
  const [active, setActive] = useState<Track | null>(null);
  const [run, setRun] = useState(0);
  const mobile = small === true && !forceLive;

  const refresh = useCallback(() => setProgress(readProgress()), []);

  useEffect(() => {
    refresh();
    const sync = () =>
      setActive(findTrack(new URLSearchParams(location.search).get("t")));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [refresh]);

  // Start the download as soon as we know this is a computer. Picking a
  // track takes a few seconds, which hides most of it.
  useEffect(() => {
    if (small === false || forceLive) loadEngine().catch(() => undefined);
  }, [small, forceLive]);

  const start = useCallback((track: Track) => {
    history.pushState(null, "", `/learn?t=${track.id}`);
    setRun((n) => n + 1);
    setActive(track);
  }, []);

  const exit = useCallback(() => {
    history.pushState(null, "", "/learn");
    setActive(null);
    refresh();
  }, [refresh]);

  // Keys 1 to 9 pick a track, unless focus is in a terminal or a field.
  useEffect(() => {
    if (active || mobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement;
      if (el?.closest("[role=application], input, textarea, [contenteditable]"))
        return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= tracks.length) {
        e.preventDefault();
        start(tracks[n - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, mobile, start]);

  if (small === null) return <div className="min-h-[80vh]" />;

  if (mobile) return <MobileLearn onTryAnyway={() => setForceLive(true)} />;

  return (
    <>
      <Hub progress={progress} onStart={start} />
      {active ? (
        <Lesson
          key={`${active.id}-${run}`}
          track={active}
          onExit={exit}
          onRestart={() => setRun((n) => n + 1)}
          onPickTrack={(id) => {
            const t = findTrack(id);
            if (t) start(t);
          }}
          onProgress={refresh}
        />
      ) : null}
    </>
  );
}
