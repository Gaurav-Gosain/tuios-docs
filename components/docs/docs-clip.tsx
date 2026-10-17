"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A short silent clip of tuios for a docs page. `src` is the clip's path
 * without an extension: `src.webm` (AV1), `src.mp4` (H.264) and the poster
 * `src.webp` sit next to each other under public/clips/. scripts/docs-media.sh
 * makes all three from a tape in media/scenes/.
 *
 * - Nothing loads until the clip is near the viewport: preload none, and the
 *   sources and the poster attach on intersection. The frame keeps its size
 *   from `width` and `height`, so the page does not jump.
 * - In view it plays muted and loops. Out of view it pauses.
 * - With prefers-reduced-motion it never starts by itself. The button starts
 *   it, and the button pauses it in every case.
 * - `alt` is what the clip shows, for a reader who cannot see or play it.
 */
export function DocsClip({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Null until the reader asks. Then it wins over the automatic play.
  const [wanted, setWanted] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      setVisible(true);
      return;
    }
    const nearObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: "400px 0px" },
    );
    const visibleObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          setVisible(entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35, 1] },
    );
    nearObserver.observe(video);
    visibleObserver.observe(video);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  // A video element does not notice sources added after it mounted.
  useEffect(() => {
    const video = videoRef.current;
    if (video && near && !video.dataset.loaded) {
      video.dataset.loaded = "1";
      video.load();
    }
  }, [near]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !near) return;
    const shouldPlay = visible && (wanted ?? !reduced);
    if (shouldPlay && video.paused) {
      video.play().catch(() => {
        // Autoplay refused. The poster and the play button stay.
      });
    } else if (!shouldPlay && !video.paused) {
      video.pause();
    }
  }, [near, visible, wanted, reduced]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    setNear(true);
    setWanted(video.paused);
  };

  return (
    <figure className="not-prose my-6">
      <div className="group relative overflow-hidden rounded-xl border border-fd-border bg-[#1e1e2e]">
        <video
          ref={videoRef}
          className="block h-auto w-full"
          style={{ aspectRatio: `${width} / ${height}` }}
          poster={near ? `${src}.webp` : undefined}
          width={width}
          height={height}
          muted
          loop
          playsInline
          preload="none"
          aria-label={alt}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {near ? (
            <>
              <source
                src={`${src}.webm`}
                type='video/webm; codecs="av01.0.08M.08"'
              />
              <source src={`${src}.mp4`} type="video/mp4" />
            </>
          ) : null}
        </video>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause: ${alt}` : `Play: ${alt}`}
          className={cn(
            "absolute right-3 bottom-3 inline-flex size-9 items-center justify-center rounded-full",
            "border border-white/15 bg-black/60 text-white backdrop-blur-sm transition-opacity",
            "hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2",
            // Never hidden while playing: a touch screen has no hover.
            playing ? "opacity-60 group-hover:opacity-100" : "opacity-100",
          )}
        >
          {playing ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4 translate-x-px" aria-hidden="true" />
          )}
        </button>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
