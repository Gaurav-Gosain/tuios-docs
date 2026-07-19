import { cn } from "@/lib/cn";

export interface ShrinkStage {
  /** Commands still in the candidate at this stage. */
  commands: string[];
  /** Commands the pass just deleted, shown in place so the collapse is visible. */
  removed?: number[];
  note: string;
}

/**
 * The command list is positional and never reordered, so position is the only
 * thing that distinguishes two identical commands. It is folded into a stable
 * key here rather than at the call site.
 */
function toCells(stage: ShrinkStage) {
  const removed = new Set(stage.removed ?? []);
  return stage.commands.map((cmd, i) => ({
    key: `${i}:${cmd}`,
    cmd,
    gone: removed.has(i),
  }));
}

/**
 * A static illustration of delta debugging collapsing a command sequence. It is
 * plain markup rather than an animation: the whole point is comparing the
 * stages against each other, which is easier when they are all on screen.
 */
export function ShrinkTrace({
  stages,
  caption,
}: {
  stages: ShrinkStage[];
  caption: string;
}) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <ol className="m-0 flex list-none flex-col p-0">
        {stages.map((stage, i) => (
          <li
            key={stage.note}
            className={cn("px-4 py-4", i > 0 && "border-fd-border border-t")}
          >
            <div className="mb-2 text-fd-muted-foreground text-xs uppercase tracking-wide">
              {i === 0
                ? "the failing input"
                : i === stages.length - 1
                  ? "minimised"
                  : `pass ${i}`}
              <span className="ml-2 normal-case tracking-normal">
                {stage.commands.length - (stage.removed?.length ?? 0)} commands
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {toCells(stage).map((cell) => (
                <code
                  key={cell.key}
                  className={cn(
                    "rounded border px-2 py-1 text-xs",
                    cell.gone
                      ? "border-fd-border border-dashed text-fd-muted-foreground/60 line-through"
                      : "border-fd-primary/40 bg-fd-primary/10 text-fd-foreground",
                  )}
                >
                  {cell.cmd}
                </code>
              ))}
            </div>
            <p className="mt-3 mb-0 text-fd-muted-foreground text-xs leading-relaxed">
              {stage.note}
            </p>
          </li>
        ))}
      </ol>
      <figcaption className="border-fd-border border-t px-4 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        {caption}
      </figcaption>
    </figure>
  );
}
