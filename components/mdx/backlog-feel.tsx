'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Measured range for a composed frame during a tiling resize, in milliseconds.
 * The slider spans exactly this, because the whole point is that the backlog
 * appears at real frame costs rather than at invented ones.
 */
const FRAME_MIN = 3.3;
const FRAME_MAX = 6.7;

/** Terminal cell width in this mock, in CSS pixels. One motion event per cell. */
const CELL = 8;

/** The frame budget coalescing bounds redraws to, 60 FPS. */
const FRAME_BUDGET = 1000 / 60;

interface Pending {
  x: number;
}

/**
 * Drag the divider and feel the difference between a slow frame and a backlog.
 *
 * With coalescing off, every motion event composes a frame, so the queue drains
 * at one event per frame cost while a drag produces one event per cell crossed.
 * Move faster than the drain rate and the gap grows for as long as you keep
 * moving, which is the thing that reads as lag rather than as slowness.
 *
 * Geometry is applied for every event in both modes, so the divider always
 * settles exactly where the pointer released. Only redundant frames are dropped.
 */
export function BacklogFeel() {
  const [frameCost, setFrameCost] = useState(5.0);
  const [coalesce, setCoalesce] = useState(false);
  const [drawnX, setDrawnX] = useState(220);
  const [pointerX, setPointerX] = useState(220);
  const [queueDepth, setQueueDepth] = useState(0);
  const [peak, setPeak] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const queue = useRef<Pending[]>([]);
  const lastCell = useRef<number | null>(null);
  const lastDrain = useRef(0);
  const lastDraw = useRef(0);
  const raf = useRef<number | null>(null);

  // The drain loop. Without coalescing it takes one queued event per frame
  // cost, which is what caps the drain rate. With coalescing it takes the most
  // recent event once per frame budget and discards the rest, since drawing an
  // intermediate position nobody will see is the work being avoided.
  useEffect(() => {
    const step = (now: number) => {
      raf.current = requestAnimationFrame(step);
      if (!queue.current.length) {
        setQueueDepth(0);
        return;
      }

      if (coalesce) {
        if (now - lastDraw.current < FRAME_BUDGET) return;
        lastDraw.current = now;
        const latest = queue.current[queue.current.length - 1];
        queue.current = [];
        setDrawnX(latest.x);
        setQueueDepth(0);
        return;
      }

      if (now - lastDrain.current < frameCost) return;
      lastDrain.current = now;
      const next = queue.current.shift();
      if (next) setDrawnX(next.x);
      const depth = queue.current.length;
      setQueueDepth(depth);
      setPeak((p) => (depth > p ? depth : p));
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [coalesce, frameCost]);

  const clamp = (x: number) => Math.max(60, Math.min(x, 560));

  // One event per cell crossed, which is what a terminal actually reports. A
  // single pointer event that travels several cells produces one motion event
  // per cell, so a fast drag emits far more events than the browser delivers.
  // Emitting only one per pointer event would drain trivially and hide the
  // effect this figure exists to show.
  const emit = useCallback((clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const x = clamp(clientX - box.getBoundingClientRect().left);
    setPointerX(x);

    const cell = Math.round(x / CELL);
    if (lastCell.current === null) {
      lastCell.current = cell;
      return;
    }
    if (lastCell.current === cell) return;

    const step = cell > lastCell.current ? 1 : -1;
    for (let c = lastCell.current + step; ; c += step) {
      queue.current.push({ x: clamp(c * CELL) });
      if (c === cell) break;
    }
    lastCell.current = cell;
  }, []);

  // Dragging is tracked in a ref as well as in state. The window listeners below
  // are installed once and would otherwise read `dragging` from the render
  // closure they were created in, which is false for the whole first drag.
  const draggingRef = useRef(false);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    setPeak(0);
    lastCell.current = null;
    emit(e.clientX);
  };

  // Releasing settles on the final position in both modes. A drag that dropped
  // its last event would land somewhere the pointer never was, which is the
  // property the coalescing fix had to preserve.
  const settle = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const last = queue.current[queue.current.length - 1];
    queue.current = [];
    setQueueDepth(0);
    if (last) setDrawnX(last.x);
  }, []);

  // Listening on the window rather than the box means a drag survives the
  // pointer leaving the figure, which is how a real divider behaves.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      emit(e.clientX);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', settle);
    window.addEventListener('pointercancel', settle);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', settle);
      window.removeEventListener('pointercancel', settle);
    };
  }, [emit, settle]);

  const onKey = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowLeft' ? -CELL : e.key === 'ArrowRight' ? CELL : 0;
    if (!delta) return;
    e.preventDefault();
    const x = clamp(pointerX + delta);
    setPointerX(x);
    queue.current.push({ x });
  };

  const lag = Math.round(Math.abs(pointerX - drawnX));

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div
        ref={boxRef}
        className="relative h-56 select-none overflow-hidden bg-fd-background"
      >
        {/* The two panes, drawn at the position the renderer has caught up to. */}
        <div
          className="absolute inset-y-0 left-0 bg-fd-muted/50"
          style={{ width: drawnX }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-fd-muted/25"
          style={{ left: drawnX + 4 }}
        />

        {/* Where the pointer actually is. The gap between this and the divider
            is the backlog, so it is drawn even though a terminal would not. */}
        <div
          className="absolute inset-y-0 w-px bg-fd-primary/40"
          style={{ left: pointerX }}
          aria-hidden="true"
        />

        <div
          role="slider"
          tabIndex={0}
          aria-label="Pane divider. Drag it, or use the arrow keys."
          aria-valuenow={Math.round(drawnX)}
          aria-valuemin={60}
          aria-valuemax={560}
          onPointerDown={onDown}
          onKeyDown={onKey}
          className={cn(
            'absolute inset-y-0 w-1 cursor-col-resize bg-fd-primary',
            'focus:outline-none focus:ring-2 focus:ring-fd-primary focus:ring-offset-1',
          )}
          style={{ left: drawnX }}
        />

        <div className="pointer-events-none absolute right-3 top-3 rounded bg-fd-card/90 px-2.5 py-1.5 font-mono text-xs tabular-nums text-fd-muted-foreground">
          queue {String(queueDepth).padStart(3)} · lag {String(lag).padStart(3)}px
          {peak > 0 ? ` · peak ${peak}` : ''}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-fd-border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={coalesce}
            onChange={(e) => {
              setCoalesce(e.target.checked);
              queue.current = [];
              setQueueDepth(0);
              setPeak(0);
            }}
            className="size-4 accent-current"
          />
          <span className="text-fd-foreground">Coalesce redraws</span>
        </label>

        <label className="flex flex-1 items-center gap-3 text-sm">
          <span className="whitespace-nowrap text-fd-muted-foreground">frame cost</span>
          <input
            type="range"
            min={FRAME_MIN}
            max={FRAME_MAX}
            step={0.1}
            value={frameCost}
            onChange={(e) => setFrameCost(Number(e.target.value))}
            className="min-w-32 flex-1 accent-current"
            aria-label="Cost of composing one frame, in milliseconds"
          />
          <span className="w-16 font-mono text-xs tabular-nums text-fd-muted-foreground">
            {frameCost.toFixed(1)} ms
          </span>
        </label>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Drag the divider. With coalescing off, one motion event composes one
        frame, so the queue drains at one event per frame cost while the drag
        emits one event per cell crossed. Keep moving and the gap grows; stop and
        it catches up. That growth is what separates a backlog from a slow frame.
        Turn coalescing on and the same drag pins to the pointer. Either way the
        divider lands exactly where you released, because every event still
        updates the geometry and only the redundant frames are dropped. The
        slider spans the measured range for a real resize frame.
      </figcaption>
    </figure>
  );
}
