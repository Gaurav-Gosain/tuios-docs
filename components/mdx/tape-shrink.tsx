import { cn } from '@/lib/cn';

export interface ShrinkStage {
  /** The tape at this point, one command per line. */
  lines: string[];
  /** Indices of `lines` the shrinker deleted to reach the next stage. */
  cut: number[];
  note: string;
}

export interface TapeShrinkProps {
  stages: ShrinkStage[];
  caption: string;
}

/**
 * Delta debugging shown on the artefact it operates on: a tape file, with the
 * commands each pass deleted struck through in place. Keeping every stage
 * visible and aligned is the point, because the argument is about which lines
 * get removed and in what order, not about the sizes involved.
 */
export function TapeShrink({ stages, caption }: TapeShrinkProps) {
  return (
    <figure className="not-prose my-8">
      <ol className="flex flex-col gap-3">
        {stages.map((stage, si) => {
          const cut = new Set(stage.cut);
          const kept = stage.lines.length - cut.size;

          return (
            <li
              key={si}
              className="overflow-hidden rounded-lg border border-fd-border bg-fd-card"
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-fd-border bg-fd-muted/40 px-3 py-1.5">
                <span className="font-mono text-xs text-fd-muted-foreground">
                  pass {si + 1}
                </span>
                <span className="font-mono text-xs tabular-nums text-fd-muted-foreground">
                  {kept} of {stage.lines.length} kept
                </span>
              </div>

              <div className="overflow-x-auto">
                <pre className="min-w-max px-4 py-3 font-mono text-sm leading-6">
                  {stage.lines.map((line, li) =>
                    cut.has(li) ? (
                      <div
                        key={li}
                        className="text-fd-muted-foreground/60 line-through decoration-fd-primary/70"
                      >
                        {line}
                      </div>
                    ) : (
                      <div key={li} className="text-fd-foreground">
                        {line}
                      </div>
                    ),
                  )}
                </pre>
              </div>

              <p
                className={cn(
                  'border-t border-fd-border px-4 py-2.5 text-sm',
                  'text-fd-muted-foreground',
                )}
              >
                {stage.note}
              </p>
            </li>
          );
        })}
      </ol>

      <figcaption className="mt-3 text-sm text-fd-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
