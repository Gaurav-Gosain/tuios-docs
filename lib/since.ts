/**
 * The text of a version badge: "Unreleased" for a feature on tuios main that
 * is in no release yet, else "Added in vX.Y.Z". The badge and the markdown
 * twin of a page both read it, so the two never disagree.
 */
export function sinceLabel(version?: string): string {
  if (!version || version === "unreleased") return "Unreleased";
  return `Added in v${version.replace(/^v/, "")}`;
}
