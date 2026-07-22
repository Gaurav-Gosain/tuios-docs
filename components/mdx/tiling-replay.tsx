'use client';

import { useEffect, useRef } from 'react';
import 'asciinema-player/dist/bundle/asciinema-player.css';

/**
 * A real tuios session, replayed. The .cast under /casts was recorded by
 * driving tuios in a pty with keystrokes (not a mockup, and not `tape exec`, so
 * no automation HUD): fish is the shell, the prompt and output are genuine.
 * asciinema-player feeds the byte stream through its own VT at the original
 * timing, so pause, scrub, and speed all work.
 *
 * Box-drawing fidelity: asciinema-player lays each terminal cell out as a
 * percentage of the terminal's pixel width. When that width is not a whole
 * multiple of the column count the cell edges land on fractional pixels and the
 * box-drawing borders develop hairline seams. We size the player to the largest
 * multiple of COLS that fits the card, so every cell is an integer number of
 * pixels and the borders join cleanly. The leftover (< COLS px) becomes even
 * side margin. This is recomputed on resize.
 *
 * The terminal keeps its own dark theme in both site themes: it reads as a
 * device screen framed by the card, legible on a light page with no re-coloring
 * of the captured ANSI. The frame uses fd-* tokens so the chrome follows the
 * site theme.
 */
const COLS = 100;
const ROWS = 30;

export function TilingReplay() {
  const measure = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measureEl = measure.current;
    const wrapEl = wrap.current;
    const hostEl = host.current;
    if (!measureEl || !wrapEl || !hostEl) return;

    // Snap the player width to a whole multiple of COLS so cells are integer px.
    const fit = () => {
      const avail = measureEl.getBoundingClientRect().width;
      const w = Math.max(COLS, Math.floor(avail / COLS) * COLS);
      wrapEl.style.width = `${w}px`;
    };
    fit();

    let disposed = false;
    // biome-ignore lint/suspicious/noExplicitAny: player instance type is internal
    let player: any = null;

    import('asciinema-player').then((mod) => {
      if (disposed || !hostEl) return;
      player = mod.create('/casts/tuios-tiling.cast', hostEl, {
        cols: COLS,
        rows: ROWS,
        autoPlay: true,
        loop: true,
        preload: true,
        controls: true,
        fit: 'width',
        theme: 'asciinema',
        // Compress the recorded pauses so the replay stays lively.
        idleTimeLimit: 1,
        poster: 'npt:0:12',
      });
    });

    const ro = new ResizeObserver(fit);
    ro.observe(measureEl);

    return () => {
      disposed = true;
      ro.disconnect();
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
        <div ref={measure} className="bg-black">
          <div ref={wrap} style={{ margin: '0 auto' }}>
            <div ref={host} />
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-fd-muted-foreground">
        I recorded this by driving a real tuios session in a pty and replaying
        the exact byte stream, so what tiles here is the window manager itself,
        running my own fish shell, not a mockup.
      </figcaption>
    </figure>
  );
}
