/**
 * The gallery feed: the list of setups the /gallery page shows. The sync
 * (scripts/gallery-sync.ts) writes it to the MEDIA bucket as
 * gallery/gallery.json, and the Worker serves it at /gallery/feed. The page
 * reads it after it loads.
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
  /** Notes on the config's keys (see annotate.ts). */
  notes?: GalleryNote[];
};

/**
 * A note on one key of a config: where it is, by line and by UTF-16 offset
 * in that line, and what it is. See annotate.ts.
 */
export type GalleryNote = {
  line: number;
  start: number;
  end: number;
  /** The key's dotted path. */
  path: string;
  kind: "doc" | "bad" | "left" | "unknown";
  /** Why a bad value is bad. */
  why?: string;
  /** Where a bad value is on the line. */
  valueStart?: number;
  valueEnd?: number;
};

const NOTE_KINDS = new Set(["doc", "bad", "left", "unknown"]);
const NOTE_PATH = /^[A-Za-z0-9_.-]{1,120}$/;
// biome-ignore lint/suspicious/noControlCharactersInRegex: refusing controls is the point
const NOTE_WHY = /^[^\u0000-\u001f\u007f-\u009f]{1,300}$/;

function isOffset(value: unknown, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max
  );
}

function parseNote(value: unknown, text: string[]): GalleryNote | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (!isOffset(v.line, text.length - 1)) return null;
  const width = text[v.line].length;
  if (!isOffset(v.start, width) || !isOffset(v.end, width) || v.end <= v.start)
    return null;
  if (typeof v.path !== "string" || !NOTE_PATH.test(v.path)) return null;
  if (typeof v.kind !== "string" || !NOTE_KINDS.has(v.kind)) return null;
  const note: GalleryNote = {
    line: v.line,
    start: v.start,
    end: v.end,
    path: v.path,
    kind: v.kind as GalleryNote["kind"],
  };
  if (typeof v.why === "string" && NOTE_WHY.test(v.why)) note.why = v.why;
  if (
    isOffset(v.valueStart, width) &&
    isOffset(v.valueEnd, width) &&
    v.valueEnd > v.valueStart &&
    v.valueStart >= v.end
  ) {
    note.valueStart = v.valueStart;
    note.valueEnd = v.valueEnd;
  }
  return note;
}

export type GalleryEntry = {
  /** The comment's database ID. */
  id: string;
  /** The GitHub handle of the person who posted it. */
  login: string;
  /** The look's name, from the name line of its code block. */
  title?: string;
  /** The comment on GitHub. */
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
  /** The entry's look file, when its config sets a look key. */
  look?: GalleryLook;
  /**
   * The people who reacted to the comment on GitHub, each counted once. The
   * approver's rocket and the author's own reactions do not count.
   */
  github?: number;
};

/** An entry's look file, served at /r/<id>.toml. */
export type GalleryLook = {
  /** The id in tuios.dev/r/<id>: the comment ID. */
  id: string;
  /** Left-out key names the card shows. */
  left: string[];
  /** How many keys the look left out in all. */
  leftCount: number;
  /** The first 32 hex digits of the SHA-256 of the look file. */
  hash: string;
};

/** A look id: a comment ID. */
export const LOOK_ID = /^\d{1,12}$/;
/** A left-out name: a key, or a key and an item (see look.ts). */
const LEFT_NAME = /^(?=.{1,60}$)[A-Za-z0-9_.-]+(?:: [A-Za-z0-9_.:/-]+)?$/;

function parseLook(value: unknown): GalleryLook | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { id, left, leftCount, hash } = value as Record<string, unknown>;
  if (typeof id !== "string" || !LOOK_ID.test(id)) return undefined;
  if (typeof hash !== "string" || !HEX32.test(hash)) return undefined;
  if (!Array.isArray(left) || left.length > 12) return undefined;
  if (!left.every((n) => typeof n === "string" && LEFT_NAME.test(n)))
    return undefined;
  if (
    typeof leftCount !== "number" ||
    !Number.isInteger(leftCount) ||
    leftCount < left.length ||
    leftCount > 10_000
  )
    return undefined;
  return { id, left: left as string[], leftCount, hash };
}

export type GalleryFeed = {
  version: 1;
  /** When the sync built the feed, as an ISO 8601 time. */
  updated: string;
  entries: GalleryEntry[];
};

/** The longest title an entry keeps, in characters. */
export const MAX_TITLE = 60;
// Controls, and the bidirectional and invisible characters cleanText removes
// (text.ts), so a feed written by anything but the sync cannot reorder a card.
const TITLE_BAD =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: matching controls is the point
  /[\u0000-\u001f\u007f-\u009f\u061c\u180e\u200b\u200e\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff\ufff9-\ufffb\u{e0000}-\u{e007f}]/u;

/** Whether a title is one an entry may carry. */
export function isTitle(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    value.length > 0 &&
    [...value].length <= MAX_TITLE &&
    !TITLE_BAD.test(value)
  );
}

/**
 * What a card and the Try it dialog call an entry: "Neon 84 by @login", or
 * "@login's setup" when the look has no name.
 */
export function entryTitle(entry: Pick<GalleryEntry, "login" | "title">) {
  return entry.title
    ? `${entry.title} by @${entry.login}`
    : `@${entry.login}'s setup`;
}

const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const HEX32 = /^[0-9a-f]{32}$/;
const SYNCED_IMAGE = /^\/gallery\/img\/[0-9a-f]{32}\/(?:full|thumb)$/;
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
  return typeof value === "string" && SYNCED_IMAGE.test(value);
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
  const file: GalleryFile = { label, text };
  const notes = (value as Record<string, unknown>).notes;
  if (Array.isArray(notes) && notes.length <= 200) {
    const lines = text.split("\n");
    const kept = notes.flatMap((n) => {
      const note = parseNote(n, lines);
      return note ? [note] : [];
    });
    if (kept.length > 0) file.notes = kept;
  }
  return file;
}

/** One entry checked field by field, or null when any field is wrong. */
export function parseEntry(value: unknown): GalleryEntry | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || !/^\d{1,12}$/.test(v.id)) return null;
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
  if (isTitle(v.title)) entry.title = v.title;
  if (typeof v.hash === "string" && HEX32.test(v.hash)) entry.hash = v.hash;
  if (typeof v.src === "string" && HEX32.test(v.src)) entry.src = v.src;
  const look = parseLook(v.look);
  if (look) entry.look = look;
  if (
    typeof v.github === "number" &&
    Number.isInteger(v.github) &&
    v.github >= 0 &&
    v.github <= 1_000_000
  )
    entry.github = v.github;
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
