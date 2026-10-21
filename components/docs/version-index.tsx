import { existsSync } from "node:fs";
import path from "node:path";
import {
  badgeFloor,
  compareVersions,
  featureTitle,
  latestRelease,
  type SinceKind,
  sinceLabel,
  sinceSource,
  sinceTable,
} from "@/lib/since";

const kinds: {
  kind: SinceKind;
  title: string;
  format: (id: string) => string;
}[] = [
  {
    kind: "feature",
    title: "Features",
    format: (id) => featureTitle(id) ?? id,
  },
  { kind: "command", title: "Commands", format: (id) => `tuios ${id}` },
  { kind: "config", title: "Config keys", format: (id) => id },
  { kind: "action", title: "Keybinding actions", format: (id) => id },
  { kind: "verb", title: "Protocol verbs", format: (id) => id },
];

/** The release notes page of a version, when the site has one. */
function releaseHref(version: string): string | undefined {
  const slug = `v${version.replace(/\./g, "-")}`;
  const file = path.join(process.cwd(), "content/releases", `${slug}.mdx`);
  return existsSync(file) ? `/releases/${slug}` : undefined;
}

/**
 * Every config key, command, keybinding action, protocol verb and named
 * feature, grouped by the tuios version that added it, newest first. It reads
 * lib/since/data.json, the same data as the <Since /> badge.
 */
export function VersionIndex() {
  const byVersion = new Map<string, Map<SinceKind, string[]>>();
  for (const { kind } of kinds) {
    for (const [id, version] of Object.entries(sinceTable(kind))) {
      const group = byVersion.get(version) ?? new Map<SinceKind, string[]>();
      group.set(kind, [...(group.get(kind) ?? []), id]);
      byVersion.set(version, group);
    }
  }
  const versions = [...byVersion.keys()].sort((a, b) => compareVersions(b, a));

  return (
    <div className="not-prose my-6 flex flex-col gap-3">
      {versions.map((version, index) => {
        const group = byVersion.get(version);
        if (!group) return null;
        const total = [...group.values()].reduce((n, l) => n + l.length, 0);
        const href =
          version === "unreleased" ? undefined : releaseHref(version);
        const open = index < 3 && compareVersions(version, badgeFloor) >= 0;
        return (
          <details
            key={version}
            open={open}
            className="group rounded-lg border border-fd-border bg-fd-card"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2 px-4 py-3">
              <span className="font-medium text-fd-foreground">
                {version === "unreleased" ? "Unreleased" : `v${version}`}
                {version === "unreleased" ? (
                  <span className="ms-2 text-fd-muted-foreground text-xs">
                    on main, after v{latestRelease}
                  </span>
                ) : null}
              </span>
              <span className="text-fd-muted-foreground text-xs tabular-nums">
                {total} {total === 1 ? "item" : "items"}
                {href ? (
                  <>
                    {" · "}
                    <a
                      href={href}
                      className="text-fd-primary underline-offset-2 hover:underline"
                    >
                      Release notes
                    </a>
                  </>
                ) : null}
              </span>
            </summary>
            <div className="flex flex-col gap-4 border-fd-border border-t px-4 py-3">
              {kinds.map(({ kind, title, format }) => {
                const ids = group.get(kind);
                if (!ids?.length) return null;
                return (
                  <div key={kind}>
                    <div className="mb-1.5 font-medium text-fd-muted-foreground text-xs uppercase tracking-wide">
                      {title}
                    </div>
                    <ul
                      className={
                        kind === "feature"
                          ? "flex flex-col gap-1"
                          : "flex flex-wrap gap-1.5"
                      }
                    >
                      {ids.sort().map((id) => (
                        <li key={id} className="min-w-0 max-w-full">
                          {kind === "feature" ? (
                            <span className="text-fd-foreground text-sm">
                              {format(id)}
                            </span>
                          ) : (
                            <code className="inline-block max-w-full rounded border border-fd-border bg-fd-muted px-1.5 py-0.5 font-mono text-[0.8125rem] text-fd-foreground">
                              {format(id)}
                            </code>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
      <p className="text-fd-muted-foreground text-xs">
        Generated from {sinceSource}. {sinceLabel("unreleased")} items are on
        tuios main and in no release yet.
      </p>
    </div>
  );
}
