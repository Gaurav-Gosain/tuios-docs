'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const H = 200;
const MIN = 28;
const CELL = 8;

/**
 * Two columns, each split horizontally. Dragging the divider in the left column
 * must move the two panes it separates and nothing else.
 *
 * In geometry mode neighbours are found the way the shipped code found them: by
 * scanning every window for an edge within one cell of the dragged line. The
 * right column's divider is a different divider in a different subtree, but when
 * the two happen to sit on the same row it matches the scan and joins the
 * resize. Fresh splits are all 0.5, so they sit on the same row by default,
 * which is what made the bug intermittent rather than constant.
 */
export function DividerCollide() {
  const [tree, setTree] = useState(false);
  // One object rather than three pieces of state. The rule under test reads the
  // previous position of both dividers to decide what moves, so they have to be
  // updated together from a single snapshot. Nesting one setState inside
  // another reads a stale value and can run twice.
  const [{ leftSplit, rightSplit, moved }, setLayout] = useState({
    leftSplit: H / 2,
    rightSplit: H / 2,
    moved: [] as string[],
  });

  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const collinear = Math.abs(leftSplit - rightSplit) <= CELL / 2;

  const apply = useCallback(
    (clientY: number) => {
      const box = boxRef.current;
      if (!box) return;
      const y = Math.max(
        MIN,
        Math.min(H - MIN, clientY - box.getBoundingClientRect().top),
      );

      setLayout((prev) => {
        const delta = y - prev.leftSplit;
        if (Math.abs(delta) < 0.5) return prev;

        const sameLine = Math.abs(prev.leftSplit - prev.rightSplit) <= CELL / 2;
        if (!tree && sameLine) {
          // The scan cannot tell two dividers apart when they share a line, so
          // the right column is dragged along by an edge match.
          return {
            leftSplit: y,
            rightSplit: Math.max(MIN, Math.min(H - MIN, prev.rightSplit + delta)),
            moved: ['top left', 'bottom left', 'top right', 'bottom right'],
          };
        }
        return {
          leftSplit: y,
          rightSplit: prev.rightSplit,
          moved: ['top left', 'bottom left'],
        };
      });
    },
    [tree],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      apply(e.clientY);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [apply]);

  const pane = (label: string, style: React.CSSProperties, dim: boolean) => (
    <div
      className={cn(
        'absolute flex items-center justify-center rounded-sm font-mono text-xs',
        dim ? 'bg-fd-muted/25 text-fd-muted-foreground' : 'bg-fd-muted/55 text-fd-foreground',
      )}
      style={style}
    >
      {label}
    </div>
  );

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div
        ref={boxRef}
        className="relative mx-auto my-4 select-none"
        style={{ height: H, maxWidth: 520 }}
      >
        {pane('top left', { left: 0, right: '50.5%', top: 0, height: leftSplit - 2 }, false)}
        {pane(
          'bottom left',
          { left: 0, right: '50.5%', top: leftSplit + 2, bottom: 0 },
          false,
        )}
        {pane('top right', { left: '50.5%', right: 0, top: 0, height: rightSplit - 2 }, true)}
        {pane(
          'bottom right',
          { left: '50.5%', right: 0, top: rightSplit + 2, bottom: 0 },
          true,
        )}

        {/* The divider the reader grabs. */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Divider in the left column. Drag it, or use the arrow keys."
          aria-valuenow={Math.round(leftSplit)}
          aria-valuemin={MIN}
          aria-valuemax={H - MIN}
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = true;
            apply(e.clientY);
          }}
          onKeyDown={(e) => {
            const d = e.key === 'ArrowUp' ? -CELL : e.key === 'ArrowDown' ? CELL : 0;
            if (!d) return;
            e.preventDefault();
            const box = boxRef.current;
            if (box) apply(box.getBoundingClientRect().top + leftSplit + d);
          }}
          className="absolute left-0 h-1 cursor-row-resize bg-fd-primary focus:outline-none focus:ring-2 focus:ring-fd-primary"
          style={{ right: '50.5%', top: leftSplit - 2 }}
        />

        {/* The divider nobody grabbed. */}
        <div
          className={cn(
            'absolute h-1',
            !tree && collinear ? 'bg-fd-primary/60' : 'bg-fd-border',
          )}
          style={{ left: '50.5%', right: 0, top: rightSplit - 2 }}
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-fd-border p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={tree}
            onChange={(e) => {
              setTree(e.target.checked);
              setLayout((p) => ({ ...p, moved: [] }));
            }}
            className="size-4 accent-current"
          />
          <span className="text-fd-foreground">Find neighbours through the tree</span>
        </label>

        <button
          type="button"
          onClick={() =>
            setLayout((p) => ({
              ...p,
              // Far enough that an ordinary drag does not cross it. Dragging
              // the left divider all the way through the right one does re-
              // capture it, which is faithful: the scan runs per event, so two
              // dividers that meet mid-drag lock together from that point on.
              rightSplit:
                Math.abs(p.rightSplit - p.leftSplit) <= CELL / 2
                  ? p.leftSplit > H / 2
                    ? MIN + CELL
                    : H - MIN - CELL
                  : p.leftSplit,
              moved: [],
            }))
          }
          className="rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-foreground hover:border-fd-primary/60 focus:outline-none focus:ring-1 focus:ring-fd-primary"
        >
          {collinear ? 'nudge the right divider' : 'realign the dividers'}
        </button>

        <span className="font-mono text-xs text-fd-muted-foreground">
          dividers {collinear ? 'collinear' : 'offset'}
        </span>
      </div>

      <div className="border-t border-fd-border px-4 py-3 font-mono text-xs">
        <span className="text-fd-muted-foreground">changed on last event: </span>
        <span
          className={cn(
            moved.length > 2 ? 'text-fd-primary' : 'text-fd-foreground',
          )}
        >
          {moved.length ? moved.join(', ') : 'nothing yet, drag the divider'}
        </span>
      </div>

      <figcaption className="border-t border-fd-border px-4 py-3 text-sm text-fd-muted-foreground">
        Drag the divider in the left column. All four panes move, because the
        right column's divider sits on the same row and an edge scan cannot tell
        two dividers apart. Press <strong>nudge</strong> and drag again: the same
        gesture now leaves the right column alone. That is the whole of
        "sometimes", and fresh splits are all 0.5, so collinear is the default
        state. Switch to tree mode and alignment stops mattering, because the
        tree names exactly the two subtrees a divider separates.
      </figcaption>
    </figure>
  );
}
