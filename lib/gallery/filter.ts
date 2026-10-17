/**
 * Which discussion comments the gallery shows. A comment is shown only when
 * the approver has reacted to it with a rocket, it was not edited after that
 * reaction, it does not ask to stay out, and the denylist does not name it or
 * its author. Everything else is skipped, with a reason the dry run prints.
 */

/** The account whose rocket reaction approves a comment. */
export const APPROVER = "Gaurav-Gosain";

/** A top-level comment on the discussion, as the sync reads it. */
export type DiscussionComment = {
  /** The comment's database ID, which its URL anchor uses. */
  id: string;
  /** The author's login, or null for a deleted account. */
  author: string | null;
  body: string;
  /**
   * The body as GitHub renders it. The sync checks that the image it takes
   * is the first one GitHub shows, so the approver has seen it.
   */
  bodyHTML: string;
  createdAt: string;
  /** When the body last changed, or null when it never did. */
  lastEditedAt: string | null;
  /** Whether a moderator hid the comment. */
  isMinimized: boolean;
  /** Every rocket reaction on the comment. */
  rockets: { login: string | null; createdAt: string }[];
};

/** The committed denylist, gallery-deny.json. */
export type Denylist = {
  /** Comment database IDs that never show. */
  comments: string[];
  /** Logins that never show, compared without case. */
  logins: string[];
};

export type Skipped = { id: string; author: string | null; reason: string };

/**
 * Whether a comment asks to stay out of the gallery. "no gallery" is the
 * phrase the page and the discussion name. Plain variants count too, such as
 * "not for the gallery", "don't add this to the gallery" or "keep me out of
 * the gallery". A false match only keeps a comment out, so the match is wide.
 */
export function optsOut(body: string): boolean {
  const text = body.toLowerCase().replace(/[‘’ʼ]/g, "'");
  if (/(?:^|[^a-z])#?no[\s_-]*gallery\b/.test(text)) return true;
  if (/\bgallery\s*[:=]\s*(?:no|off|false)\b/.test(text)) return true;
  const negation =
    /\b(?:not|don'?t|do not|never|exclude|skip|opt(?:ing)?[\s-]?out|keep\b[^.!?\n]{0,30}\bout|leave\b[^.!?\n]{0,30}\bout)\b[^.!?\n]{0,40}\bgallery\b/;
  return negation.test(text);
}

/** Validates the shape of gallery-deny.json. */
export function parseDenylist(value: unknown): Denylist {
  const v = (value ?? {}) as Record<string, unknown>;
  const strings = (list: unknown) =>
    Array.isArray(list)
      ? list.filter((x): x is string => typeof x === "string")
      : [];
  return { comments: strings(v.comments), logins: strings(v.logins) };
}

/** The comments the gallery shows, and why each other one is skipped. */
export function selectApproved(
  comments: DiscussionComment[],
  deny: Denylist,
  approver: string = APPROVER,
): { approved: DiscussionComment[]; skipped: Skipped[] } {
  const deniedIds = new Set(deny.comments);
  const deniedLogins = new Set(deny.logins.map((l) => l.toLowerCase()));
  const approved: DiscussionComment[] = [];
  const skipped: Skipped[] = [];
  for (const comment of comments) {
    const skip = (reason: string) =>
      skipped.push({ id: comment.id, author: comment.author, reason });
    // Logins are compared exactly: GitHub logins are unique without case,
    // but the API returns the account's own spelling, so an exact match
    // cannot pass a different account.
    const approval = comment.rockets
      .filter((r) => r.login === approver)
      .map((r) => Date.parse(r.createdAt))
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => b - a)[0];
    if (approval === undefined) {
      skip("no rocket from the approver");
      continue;
    }
    if (!comment.author) {
      skip("the author's account is deleted");
      continue;
    }
    if (comment.isMinimized) {
      skip("the comment is hidden");
      continue;
    }
    if (
      deniedIds.has(comment.id) ||
      deniedLogins.has(comment.author.toLowerCase())
    ) {
      skip("on the denylist");
      continue;
    }
    // GitHub gives both times to the second, so an edit in the same second
    // as the rocket may have come after it, and counts as an edit after it.
    if (comment.lastEditedAt && Date.parse(comment.lastEditedAt) >= approval) {
      skip("edited after the rocket; react again to approve the new text");
      continue;
    }
    // An HTML comment does not show on GitHub, so it can hide an image or a
    // code block from the approver that the sync would still take.
    if (comment.body.includes("<!--")) {
      skip("holds an HTML comment, which can hide text from the review");
      continue;
    }
    if (optsOut(comment.body)) {
      skip("asks to stay out of the gallery");
      continue;
    }
    approved.push(comment);
  }
  return { approved, skipped };
}
