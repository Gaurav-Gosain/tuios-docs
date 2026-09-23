"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Below this width the portrait cut replaces the landscape one. */
const NARROW = "(max-width: 639px)";

/**
 * A recorded clip of tuios for a release note. `src` is the clip's path
 * without an extension: the component expects `src.webm`, `src.mp4` and the
 * poster `src.jpg` next to each other under public/.
 *
 * - The poster shows at once, and the page loads no video bytes until the clip
 *   is close to the viewport (preload none, sources attached on intersection).
 * - In view it plays muted and loops, like a GIF. Out of view it pauses, so a
 *   page of clips decodes one or two at a time.
 * - The clips are narrated. The sound button turns the voice on (and starts
 *   the clip); browsers only autoplay muted video, so it starts off. The
 *   narration's captions are `src.vtt`, a track the reader can turn on.
 * - With prefers-reduced-motion it never starts by itself. The button starts
 *   it, and the button pauses it in every case, because moving content longer
 *   than five seconds needs a way to stop it.
 * - `steps` is the text of what the clip shows, one line per caption, so a
 *   reader who cannot see or play the video gets the same content.
 * - On a narrow screen it shows the portrait cut instead, `src-vertical.mp4`
 *   with the poster `src-vertical.jpg`. The landscape cut draws a 116 column
 *   terminal, which at phone width is too small to read; the portrait cut
 *   follows the action with a closer camera.
 */
export function ReleaseClip({
  src,
  label,
  caption,
  steps,
}: {
  src: string;
  label: string;
  caption?: string;
  steps?: string[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [playing, setPlaying] = useState(false);
  // Null until the reader asks: then true or false wins over the automatic
  // play and pause that follow the viewport.
  const [wanted, setWanted] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [sound, setSound] = useState(false);
  const stepsId = useId();

  // React sets the muted attribute only on mount, so follow the state by hand.
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !sound;
  }, [sound]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(NARROW);
    setNarrow(query.matches);
    const onChange = () => setNarrow(query.matches);
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
    // Attach the sources a little before the clip scrolls in, so it is ready
    // to play when it arrives.
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

  // A video element does not notice sources added or swapped after it
  // mounted, so load them by hand once they are attached or the cut changes.
  // data-cut records which cut is loaded. A reload stops playback; the effect
  // below starts it again.
  const cut = narrow ? "portrait" : "landscape";
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !near || video.dataset.cut === cut) return;
    video.dataset.cut = cut;
    video.load();
  }, [near, cut]);

  useEffect(() => {
    const video = videoRef.current;
    // Wait for the effect above to load the cut this render asks for.
    if (!video || !near || video.dataset.cut !== cut) return;
    const shouldPlay = visible && (wanted ?? !reduced);
    if (shouldPlay && video.paused) {
      video.play().catch(() => {
        // Autoplay refused (a data saver, a browser policy). The poster and
        // the play button stay, which is the right fallback.
      });
    } else if (!shouldPlay && !video.paused) {
      video.pause();
    }
  }, [near, visible, wanted, reduced, cut]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    setNear(true);
    setWanted(video.paused);
  };

  const toggleSound = () => {
    setNear(true);
    if (!sound) setWanted(true);
    setSound(!sound);
  };

  return (
    <figure className="not-prose my-8">
      <div className="group relative overflow-hidden rounded-xl border border-fd-border bg-[#11111b] shadow-lg shadow-fd-primary/5">
        <video
          ref={videoRef}
          className={cn(
            "block h-auto w-full",
            narrow ? "aspect-[9/16]" : "aspect-video",
          )}
          poster={narrow ? `${src}-vertical.jpg` : `${src}.jpg`}
          width={narrow ? 1080 : 1920}
          height={narrow ? 1920 : 1080}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          aria-describedby={steps?.length ? stepsId : undefined}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          {near && narrow ? (
            <source src={`${src}-vertical.mp4`} type="video/mp4" />
          ) : null}
          {near ? (
            <track
              kind="captions"
              src={`${src}.vtt`}
              srcLang="en"
              label="English"
            />
          ) : null}
          {near && !narrow ? (
            <>
              <source src={`${src}.webm`} type="video/webm" />
              <source src={`${src}.mp4`} type="video/mp4" />
            </>
          ) : null}
        </video>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={`Narration sound: ${label}`}
          aria-pressed={sound}
          className={cn(
            "absolute right-14 bottom-3 inline-flex size-9 items-center justify-center rounded-full",
            "border border-white/15 bg-black/60 text-white backdrop-blur-sm transition-opacity",
            "hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2",
            playing && !sound
              ? "opacity-60 group-hover:opacity-100"
              : "opacity-100",
          )}
        >
          {sound ? (
            <Volume2 className="size-4" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause: ${label}` : `Play: ${label}`}
          className={cn(
            "absolute right-3 bottom-3 inline-flex size-9 items-center justify-center rounded-full",
            "border border-white/15 bg-black/60 text-white backdrop-blur-sm transition-opacity",
            "hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-fd-primary focus-visible:outline-offset-2",
            // Never fully hidden while playing: a touch screen has no hover
            // to bring it back, and the reader must always be able to stop it.
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
      {caption || steps?.length ? (
        <figcaption className="mt-3 text-sm text-fd-muted-foreground">
          {caption ? <p>{caption}</p> : null}
          {steps?.length ? (
            <details className={cn(caption && "mt-2")}>
              <summary className="cursor-pointer select-none text-fd-muted-foreground hover:text-fd-foreground">
                What the clip shows
              </summary>
              <ol
                id={stepsId}
                className="mt-2 list-decimal space-y-1 pl-5 marker:text-fd-muted-foreground/70"
              >
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </details>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
