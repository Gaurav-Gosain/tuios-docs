'use client';

import { useEffect, useRef } from 'react';
import 'asciinema-player/dist/bundle/asciinema-player.css';

/**
 * A real tuios session, replayed. The .cast under /casts was recorded by
 * spawning tuios in a pty at 110x30 and driving it with a tape that types real
 * shell commands into the panes, so every byte here is genuine terminal output,
 * not a reconstruction. asciinema-player feeds the byte stream through its own
 * VT at the original timing, so pausing, scrubbing, and speed all work.
 *
 * The terminal keeps its own dark theme in both site themes: it reads as a
 * device screen framed by the card, which is legible on a light page and needs
 * no re-coloring of the captured ANSI. The frame uses fd-* tokens so the chrome
 * still follows the site theme.
 */
export function TilingReplay() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let disposed = false;
    // biome-ignore lint/suspicious/noExplicitAny: player instance type is internal
    let player: any = null;

    import('asciinema-player').then((mod) => {
      if (disposed || !el) return;
      player = mod.create('/casts/tuios-tiling.cast', el, {
        cols: 110,
        rows: 30,
        autoPlay: true,
        loop: true,
        preload: true,
        controls: true,
        fit: 'width',
        theme: 'asciinema',
        // Compress the deliberate pauses in the capture so the replay stays
        // lively; the tiling beats still read clearly.
        idleTimeLimit: 1.5,
        terminalFontSize: 'small',
        poster: 'npt:0:15',
      });
    });

    return () => {
      disposed = true;
      if (player) player.dispose();
    };
  }, []);

  return (
    <figure className="not-prose my-8">
      <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
            <span className="size-2.5 rounded-full bg-fd-muted-foreground/35" />
          </span>
          <span className="font-mono text-xs text-fd-muted-foreground">
            tuios — BSP tiling (recorded session)
          </span>
        </div>
        <div ref={host} className="tuios-replay bg-black" />
      </div>
      <figcaption className="mt-3 text-sm text-fd-muted-foreground">
        I recorded this by driving a real tuios session in a pty and replaying
        the exact byte stream, so what tiles here is the window manager itself,
        not a mockup.
      </figcaption>
    </figure>
  );
}
