/**
 * The gallery feed: the list of setups the /gallery page shows. The sync
 * (scripts/gallery-sync.ts) writes it to the MEDIA bucket as
 * gallery/gallery.json, and the Worker serves it at /gallery/feed. The page
 * merges it with the reviewed seed in gallery-seed.json.
 *
 * The page checks every entry again with parseFeed before it shows it. The
 * sync is the real boundary, but a feed that somehow carries a foreign URL or
 * a handle with markup in it is dropped here too.
 */

/** Where the Worker serves the synced feed. */
export const FEED_PATH = "/gallery/feed";

/** The discussion that takes submissions. */
export const DISCUSSION_URL =
  "https://github.com/Gaurav-Gosain/tuios/discussions/849";

/** The longest config text an entry shows, in characters. */
export const MAX_TEXT = 4000;

/** A file shown with an entry: a config or a theme, as plain text. */
export type GalleryFile = {
  /** A short label: "config", "theme", or the code block's language. */
  label: string;
  text: string;
};

export type GalleryEntry = {
  /** The comment's database ID, or "seed-<name>" for a seed entry. */
  id: string;
  /** The GitHub handle of the person who posted it. */
  login: string;
  /** The comment on GitHub, or the discussion for a seed entry. */
  url: string;
  /** When the comment was posted, as an ISO 8601 date. */
  date: string;
  /** The 800 px wide still. */
  thumb: string;
  /** The still at most 1600 px wide. */
  full: string;
  /** The size of the full still in pixels. */
  width: number;
  height: number;
  files: GalleryFile[];
  /** The name of a seed setup, such as "amber". Synced entries have none. */
  title?: string;
  /**
   * The first 32 hex digits of the SHA-256 of the image as it was
   * downloaded. The image URLs are built from it.
   */
  hash?: string;
  /**
   * The first 32 hex digits of the SHA-256 of the image's source URL. The
   * sync uses it to skip the download of an image it has already published.
   */
  src?: string;
};

export type GalleryFeed = {
  version: 1;
  /** When the sync built the feed, as an ISO 8601 time. */
  updated: string;
  entries: GalleryEntry[];
};

const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const HEX32 = /^[0-9a-f]{32}$/;
const SYNCED_IMAGE = /^\/gallery\/img\/[0-9a-f]{32}\/(?:full|thumb)$/;
const SEED_IMAGE = /^\/gallery-seed\/[a-z0-9-]{1,40}(?:-thumb)?\.webp$/;
const LABEL = /^[a-z0-9+#.-]{1,20}$/;

/** The image path the Worker serves for a hash and a size. */
export function imagePath(hash: string, size: "full" | "thumb") {
  return `/gallery/img/${hash}/${size}`;
}

/** Whether a login is a valid GitHub handle. */
export function isLogin(value: unknown): value is string {
  return typeof value === "string" && LOGIN.test(value);
}

/** Whether a URL is the discussion or one of its comments. */
export function isDiscussionUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value === DISCUSSION_URL) return true;
  return new RegExp(
    `^${DISCUSSION_URL.replaceAll(".", "\\.")}#discussioncomment-\\d{1,12}$`,
  ).test(value);
}

function isImagePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (SYNCED_IMAGE.test(value) || SEED_IMAGE.test(value))
  );
}

function isSize(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 1600 * 16
  );
}

function parseFile(value: unknown): GalleryFile | null {
  if (!value || typeof value !== "object") return null;
  const { label, text } = value as Record<string, unknown>;
  if (typeof label !== "string" || !LABEL.test(label)) return null;
  if (typeof text !== "string" || text.length > MAX_TEXT) return null;
  return { label, text };
}

/** One entry checked field by field, or null when any field is wrong. */
export function parseEntry(value: unknown): GalleryEntry | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    !/^(?:\d{1,12}|seed-[a-z0-9-]{1,40})$/.test(v.id)
  )
    return null;
  if (!isLogin(v.login) || !isDiscussionUrl(v.url)) return null;
  if (typeof v.date !== "string" || Number.isNaN(Date.parse(v.date)))
    return null;
  if (!isImagePath(v.thumb) || !isImagePath(v.full)) return null;
  if (!isSize(v.width) || !isSize(v.height)) return null;
  if (!Array.isArray(v.files) || v.files.length > 2) return null;
  const files: GalleryFile[] = [];
  for (const raw of v.files) {
    const file = parseFile(raw);
    if (!file) return null;
    files.push(file);
  }
  const entry: GalleryEntry = {
    id: v.id,
    login: v.login,
    url: v.url,
    date: v.date,
    thumb: v.thumb,
    full: v.full,
    width: v.width,
    height: v.height,
    files,
  };
  if (typeof v.title === "string" && /^[a-z0-9-]{1,40}$/.test(v.title))
    entry.title = v.title;
  if (typeof v.hash === "string" && HEX32.test(v.hash)) entry.hash = v.hash;
  if (typeof v.src === "string" && HEX32.test(v.src)) entry.src = v.src;
  return entry;
}

/** The valid entries of a feed. Anything else in it is dropped. */
export function parseFeed(value: unknown): GalleryEntry[] {
  if (!value || typeof value !== "object") return [];
  const entries = (value as Record<string, unknown>).entries;
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((raw) => {
    const entry = parseEntry(raw);
    return entry ? [entry] : [];
  });
}

/**
 * The synced entries and the seed as one list, newest first. A synced entry
 * wins over a seed entry with the same ID.
 */
export function mergeEntries(
  synced: GalleryEntry[],
  seed: GalleryEntry[],
): GalleryEntry[] {
  const byId = new Map<string, GalleryEntry>();
  for (const entry of seed) byId.set(entry.id, entry);
  for (const entry of synced) byId.set(entry.id, entry);
  return [...byId.values()].sort(
    (a, b) =>
      Date.parse(b.date) - Date.parse(a.date) || a.id.localeCompare(b.id),
  );
}
