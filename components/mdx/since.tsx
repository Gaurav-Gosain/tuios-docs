import { cn } from "@/lib/cn";
import {
  resolveSince,
  type SinceProps,
  showsBadge,
  sinceLabel,
} from "@/lib/since";

/**
 * A quiet label for the tuios version that added a feature. Name what it
 * labels and the version comes from lib/since/data.json:
 *
 *   <Since config="appearance.link_hover" />
 *   <Since command="notify push" />
 *   <Since action="next_workspace" />
 *   <Since verb="stream-pane" />
 *   <Since feature="mail-seen" />
 *
 * "Unreleased" means the feature is on tuios main and in no release yet. A
 * version older than the badge floor shows nothing.
 */
export function Since({
  className,
  ...props
}: SinceProps & { className?: string }) {
  const version = resolveSince(props);
  if (!showsBadge(version)) return null;
  const unreleased = version === "unreleased";
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
          : `First in tuios v${version}`
      }
    >
      {sinceLabel(version)}
    </span>
  );
}
