/**
 * How the gallery counts and ranks votes. There are two counts, kept apart:
 *
 * - github: the people who reacted to the comment on GitHub. A GitHub
 *   account costs more to fake than a page visit, so this count is the
 *   trusted one. The sync reads it every hour (see github.ts).
 * - site: the hearts on tuios.dev, from the Worker (worker/votes.ts).
 *
 * The Top order sorts by score = github * GITHUB_WEIGHT + site, newest first
 * on a tie. The New order sorts by date only.
 */

import type { GalleryEntry } from "./feed";

/** The reactions that count as a vote. */
export const VOTE_REACTIONS = new Set([
  "THUMBS_UP",
  "HEART",
  "HOORAY",
  "ROCKET",
  "LAUGH",
  "EYES",
]);

/** How much one GitHub reaction weighs against one heart on the site. */
export const GITHUB_WEIGHT = 3;

/**
 * The people who voted on a comment on GitHub, each counted once, whatever
 * and however many reactions they gave. The approver's rocket is the review,
 * not a vote, so it does not count; the approver's other reactions do. The
 * author's own reactions do not count. A deleted account (no login) does not
 * count.
 */
export function githubVotes(
  reactions: { login: string | null; content: string }[] | undefined,
  author: string | null,
  approver: string,
): number {
  const people = new Set<string>();
  for (const r of reactions ?? []) {
    if (!r.login || !VOTE_REACTIONS.has(r.content)) continue;
    if (r.login === author) continue;
    if (r.login === approver && r.content === "ROCKET") continue;
    people.add(r.login);
  }
  return people.size;
}

/** The Top score of an entry. */
export function score(github: number, site: number): number {
  return github * GITHUB_WEIGHT + site;
}

export type SortMode = "top" | "new";

/** The entries in the chosen order. site maps an entry ID to its hearts. */
export function sortEntries(
  entries: GalleryEntry[],
  mode: SortMode,
  site: Record<string, number>,
): GalleryEntry[] {
  const byDate = (a: GalleryEntry, b: GalleryEntry) =>
    Date.parse(b.date) - Date.parse(a.date) || a.id.localeCompare(b.id);
  if (mode === "new") return [...entries].sort(byDate);
  return [...entries].sort(
    (a, b) =>
      score(b.github ?? 0, site[b.id] ?? 0) -
        score(a.github ?? 0, site[a.id] ?? 0) || byDate(a, b),
  );
}
