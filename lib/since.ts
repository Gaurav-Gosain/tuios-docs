import data from "./since/data.json";
import features from "./since/features.json";

/**
 * The tuios version that added a feature, for the <Since /> badge and the
 * versions page. lib/since/data.json maps each config key, command, action,
 * verb and named feature to the first tag that has it, or "unreleased". It is
 * written by scripts/since.mjs, so a page names a key and never a version.
 */

export type SinceKind = "config" | "command" | "action" | "verb" | "feature";

export interface SinceProps {
  /** A version to show as is, for a feature no key names. */
  version?: string;
  config?: string;
  command?: string;
  action?: string;
  verb?: string;
  feature?: string;
}

const tables: Record<SinceKind, Record<string, string>> = {
  config: data.config,
  command: data.commands,
  action: data.actions,
  verb: data.verbs,
  feature: data.features,
};

/** The newest tuios release the data knows, such as "0.9.2". */
export const latestRelease = data.latest;

/** Where the data came from, for the versions page. */
export const sinceSource = data.source;

/**
 * A badge for a version older than this shows nothing. Most keys came before
 * it, so a badge on each would only add noise to every table.
 */
export const badgeFloor = "0.8.0";

/** The named feature's one-line title, for the versions page. */
export function featureTitle(id: string): string | undefined {
  return (features as Record<string, { title: string }>)[id]?.title;
}

/** Every item of one kind and its version. */
export function sinceTable(kind: SinceKind): Record<string, string> {
  return tables[kind];
}

/**
 * The version of what the props name. An unknown name throws, so a typo in a
 * page fails the build instead of showing no badge.
 */
export function resolveSince(props: SinceProps): string {
  if (props.version) return props.version.replace(/^v/, "");
  for (const kind of Object.keys(tables) as SinceKind[]) {
    const name = props[kind];
    if (name === undefined) continue;
    const version = tables[kind][name];
    if (version === undefined) {
      throw new Error(
        `<Since ${kind}="${name}" />: tuios has no ${kind} of that name. Check lib/since/data.json, or run scripts/since.mjs again.`,
      );
    }
    return version;
  }
  throw new Error(
    "<Since />: name a config key, command, action, verb or feature, or give a version.",
  );
}

/** -1, 0 or 1, as a is older than, the same as, or newer than b. */
export function compareVersions(a: string, b: string): number {
  if (a === b) return 0;
  if (a === "unreleased") return 1;
  if (b === "unreleased") return -1;
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/** Whether a badge for this version shows. */
export function showsBadge(version: string): boolean {
  return compareVersions(version, badgeFloor) >= 0;
}

/**
 * The text of a badge: "Unreleased" for a feature on tuios main that is in
 * no release yet, else "Added in vX.Y.Z". The badge and the markdown twin of
 * a page both read it, so the two never disagree.
 */
export function sinceLabel(version?: string): string {
  if (!version || version === "unreleased") return "Unreleased";
  return `Added in v${version.replace(/^v/, "")}`;
}
