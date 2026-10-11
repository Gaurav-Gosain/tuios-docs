import { cn } from "@/lib/cn";
import { sinceLabel } from "@/lib/since";

/**
 * A quiet label for the tuios version that added a feature. With no version,
 * or "unreleased", it says the feature is on main and in no release yet, so a
 * reader on the last release knows why they do not have it.
 */
export function Since({
  version,
  className,
}: {
  version?: string;
  className?: string;
}) {
  const unreleased = !version || version === "unreleased";
  const label = sinceLabel(version);
  return (
    <span
      className={cn(
        "not-prose ms-1.5 inline-flex translate-y-[-0.1em] items-center whitespace-nowrap rounded-full border px-1.5 py-px align-middle font-medium text-[0.6875rem] leading-4 tracking-normal",
        unreleased
          ? "border-dashed border-fd-primary/50 text-fd-primary"
          : "border-fd-border text-fd-muted-foreground",
        className,
      )}
      title={
        unreleased
          ? "On tuios main. Not in a release yet."
          : `First in tuios v${version.replace(/^v/, "")}`
      }
    >
      {label}
    </span>
  );
}
