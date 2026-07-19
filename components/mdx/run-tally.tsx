import { cn } from "@/lib/cn";

export interface TallyGroup {
  label: string;
  runs: number;
  failures: number;
}

/**
 * Pass and fail runs as a grid of cells. Flakiness is a rate, and a rate is
 * easier to judge as a block of outcomes than as a fraction in a sentence.
 * Failures are placed at the front of each row so the two blocks can be
 * compared at a glance; the ordering carries no information about which run
 * failed.
 */
export function RunTally({
  groups,
  caption,
}: {
  groups: TallyGroup[];
  caption: string;
}) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-5 p-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-fd-foreground text-sm">
                {group.label}
              </span>
              <span className="text-fd-muted-foreground text-xs tabular-nums">
                {group.failures} failures in {group.runs} runs
              </span>
            </div>
            <div
              className="flex flex-wrap gap-1"
              role="img"
              aria-label={`${group.label}: ${group.failures} failing runs out of ${group.runs}.`}
            >
              {Array.from({ length: group.runs }, (_, i) => (
                <span
                  key={`${group.label}-${i}`}
                  className={cn(
                    "size-3.5 rounded-[3px]",
                    i < group.failures
                      ? "bg-red-500 dark:bg-red-400"
                      : "bg-fd-primary/25 ring-1 ring-fd-primary/40 ring-inset",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <figcaption className="border-fd-border border-t px-5 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        {caption}
      </figcaption>
    </figure>
  );
}
