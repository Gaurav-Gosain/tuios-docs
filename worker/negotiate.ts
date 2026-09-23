/**
 * Content negotiation between a page and its markdown twin, following the
 * acceptmarkdown.com recipe. The site is a static export, so there is no
 * middleware to run it; this module is used by the Cloudflare Worker in
 * worker/index.ts, which sits in front of GitHub Pages.
 */

/** The types every page is offered in, in the site's order of preference. */
export const PRODUCES = ["text/html", "text/markdown"] as const;
export type Produced = (typeof PRODUCES)[number];

type AcceptEntry = {
  type: string;
  subtype: string;
  q: number;
  /** 0 for *\/*, 1 for type/*, 2 for an exact type. */
  specificity: number;
  /** Position in the header, for breaking ties. */
  index: number;
};

/** Parse an Accept header into its media ranges. Malformed ranges are skipped. */
export function parseAccept(header: string): AcceptEntry[] {
  const entries: AcceptEntry[] = [];
  header.split(",").forEach((part, index) => {
    const [range, ...params] = part.trim().split(";");
    const [type, subtype] = range.trim().toLowerCase().split("/");
    if (!type || !subtype) return;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.trim().split("=");
      if (key?.trim().toLowerCase() === "q") {
        const parsed = Number(value);
        q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
      }
    }
    const specificity = type === "*" ? 0 : subtype === "*" ? 1 : 2;
    entries.push({ type, subtype, q, specificity, index });
  });
  return entries;
}

function matches(entry: AcceptEntry, candidate: string) {
  const [type, subtype] = candidate.split("/");
  return (
    (entry.type === "*" || entry.type === type) &&
    (entry.subtype === "*" || entry.subtype === subtype)
  );
}

/**
 * The type to serve, or null when the client accepts neither. A missing or
 * empty header means anything is acceptable, so HTML. For each candidate the
 * most specific matching range decides its q-value (RFC 9110 section 12.5.1),
 * so "text/*;q=1, text/markdown;q=0" refuses markdown. Candidates are ranked by
 * q-value, then by the position of their deciding range in the header, then
 * by the site's order.
 */
export function preferredType(header: string | null): Produced | null {
  if (!header || header.trim() === "") return "text/html";
  const entries = parseAccept(header);
  if (entries.length === 0) return "text/html";

  let best: { type: Produced; q: number; index: number; order: number } | null =
    null;
  PRODUCES.forEach((candidate, order) => {
    let decider: AcceptEntry | null = null;
    for (const entry of entries) {
      if (!matches(entry, candidate)) continue;
      if (
        !decider ||
        entry.specificity > decider.specificity ||
        (entry.specificity === decider.specificity && entry.q > decider.q)
      ) {
        decider = entry;
      }
    }
    if (!decider || decider.q === 0) return;
    const next = { type: candidate, q: decider.q, index: decider.index, order };
    if (
      !best ||
      next.q > best.q ||
      (next.q === best.q && next.index < best.index) ||
      (next.q === best.q && next.index === best.index && next.order < best.order)
    ) {
      best = next;
    }
  });
  return best ? (best as { type: Produced }).type : null;
}

/**
 * The q-value the client gives one type: that of the most specific matching
 * range, or 0 when no range matches. A missing or empty header accepts
 * anything at 1.
 */
export function quality(header: string | null, candidate: string) {
  if (!header || header.trim() === "") return 1;
  const entries = parseAccept(header);
  if (entries.length === 0) return 1;
  let decider: AcceptEntry | null = null;
  for (const entry of entries) {
    if (!matches(entry, candidate)) continue;
    if (
      !decider ||
      entry.specificity > decider.specificity ||
      (entry.specificity === decider.specificity && entry.q > decider.q)
    ) {
      decider = entry;
    }
  }
  return decider ? decider.q : 0;
}

/** The markdown twin of a page path: /docs/x -> /docs/x.md, / -> /index.md. */
export function markdownPath(pathname: string) {
  if (pathname === "/" || pathname === "") return "/index.md";
  return `${pathname.replace(/\/+$/, "").replace(/\.html$/, "")}.md`;
}

/**
 * Whether a path names a page rather than a file: no extension in its last
 * segment, or a .html one. Only pages have a markdown twin to negotiate.
 */
export function isPagePath(pathname: string) {
  const last = pathname.split("/").pop() ?? "";
  return !last.includes(".") || last.endsWith(".html");
}

/** Add Accept to a Vary header value, once. */
export function appendVary(existing: string | null) {
  if (!existing) return "Accept";
  const parts = existing.split(",").map((part) => part.trim().toLowerCase());
  if (parts.includes("accept") || parts.includes("*")) return existing;
  return `${existing}, Accept`;
}
