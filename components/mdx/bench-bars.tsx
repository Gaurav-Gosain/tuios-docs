import { cn } from "@/lib/cn";

export interface BenchSeries {
  /** Short label for the series, e.g. "before". */
  label: string;
  /** One value per group, in the same order as `groups`. */
  values: number[];
  /** Colour role. `subject` is the thing being argued about. */
  tone?: "subject" | "baseline";
}

export interface BenchBarsProps {
  /** Category labels along the axis, e.g. window counts. */
  groups: string[];
  series: BenchSeries[];
  /** Unit suffix rendered after every value, e.g. "us". */
  unit: string;
  /** What the axis categories are, e.g. "windows". */
  groupLabel: string;
  caption: string;
  /**
   * Bars are scaled inside each group rather than across the whole chart when
   * the point is the ratio within a group rather than the absolute size.
   */
  scale?: "chart" | "group";
}

const TONE: Record<"subject" | "baseline", string> = {
  subject: "bg-fd-primary",
  baseline: "bg-fd-muted-foreground/45",
};

function format(value: number) {
  return value.toLocaleString("en-GB");
}

/**
 * A bar chart built from divs, because two charts do not justify a charting
 * dependency. The underlying data is also present as a real table for screen
 * readers and for anyone whose CSS did not load; the bars are decorative and
 * hidden from the accessibility tree.
 */
export function BenchBars({
  groups,
  series,
  unit,
  groupLabel,
  caption,
  scale = "chart",
}: BenchBarsProps) {
  const chartMax = Math.max(...series.flatMap((s) => s.values));

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
      <div className="flex flex-col gap-6 p-5" aria-hidden="true">
        {groups.map((group, gi) => {
          const groupMax =
            scale === "group"
              ? Math.max(...series.map((s) => s.values[gi]))
              : chartMax;

          return (
            <div key={group} className="flex flex-col gap-2">
              <div className="font-medium text-fd-muted-foreground text-xs uppercase tracking-wide">
                {group} {groupLabel}
              </div>
              {series.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                >
                  {/* Wraps to two rows on narrow screens: label and value on
                      the first, the bar across the full width below. */}
                  <span className="order-1 min-w-0 flex-1 text-fd-muted-foreground text-xs sm:w-28 sm:flex-none">
                    {s.label}
                  </span>
                  <span className="order-2 shrink-0 text-right font-medium text-fd-foreground text-xs tabular-nums sm:order-3 sm:w-24">
                    {format(s.values[gi])} {unit}
                  </span>
                  <div className="order-3 h-5 w-full min-w-0 rounded-sm bg-fd-muted/60 sm:order-2 sm:w-auto sm:flex-1">
                    <div
                      className={cn(
                        "h-full rounded-sm",
                        TONE[s.tone ?? "subject"],
                      )}
                      style={{
                        width: `${Math.max((s.values[gi] / groupMax) * 100, 0.6)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto border-fd-border border-t">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="p-3 text-left font-medium">
                {groupLabel}
              </th>
              {series.map((s) => (
                <th
                  key={s.label}
                  scope="col"
                  className="p-3 text-right font-medium"
                >
                  {s.label} ({unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group, gi) => (
              <tr key={group} className="border-fd-border border-t">
                <th scope="row" className="p-3 text-left font-normal">
                  {group}
                </th>
                {series.map((s) => (
                  <td key={s.label} className="p-3 text-right tabular-nums">
                    {format(s.values[gi])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <figcaption className="border-fd-border border-t px-5 py-3 text-fd-muted-foreground text-xs leading-relaxed">
        {caption}
      </figcaption>
    </figure>
  );
}
