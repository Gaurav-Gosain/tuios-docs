import { cn } from "@/lib/cn";

/**
 * Labels for a release note. A note with no tag covers unreleased work on main
 * and says so. The newest tag is marked as the latest release. The version
 * chip is left out when the title already is the version.
 */
export function ReleaseTag({
  tag,
  title,
  latest = false,
  className,
}: {
  tag: string | null;
  title: string;
  latest?: boolean;
  className?: string;
}) {
  const showVersion = tag !== null && tag !== title;
  if (!showVersion && tag !== null && !latest) return null;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {showVersion ? <Chip className={versionChip}>{tag}</Chip> : null}
      {tag === null ? (
        <Chip className="border border-fd-border border-dashed text-fd-muted-foreground">
          main, unreleased
        </Chip>
      ) : null}
      {latest ? (
        <Chip className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          latest release
        </Chip>
      ) : null}
    </span>
  );
}

const versionChip =
  "border border-fd-primary/30 bg-fd-primary/10 text-fd-primary";

function Chip({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-1 font-mono text-xs leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
