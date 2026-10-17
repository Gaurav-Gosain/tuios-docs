/**
 * What the gallery takes from a comment's Markdown: the first image URL and
 * the first fenced code block. Nothing else in a comment is shown, and the
 * Markdown is never rendered. The code block is shown as plain text, so it is
 * cleaned of terminal escapes and control characters here, and React escapes
 * it when the page draws it.
 */

import { type GalleryFile, MAX_TEXT } from "./feed";

/**
 * The hosts a submission's image may come from: where GitHub stores the
 * images pasted into a comment. An image from anywhere else is skipped.
 */
export function isAllowedImageUrl(raw: string): boolean {
  const url = parseHttps(raw);
  if (!url) return false;
  switch (url.hostname) {
    case "github.com":
      return /^\/user-attachments\/assets\/[0-9a-fA-F-]{8,64}$/.test(
        url.pathname,
      );
    case "private-user-images.githubusercontent.com":
    case "user-images.githubusercontent.com":
      return url.pathname.length > 1;
    default:
      return false;
  }
}

/**
 * The hosts a download may be redirected to. github.com/user-attachments
 * answers with a redirect to GitHub's S3 bucket, which is not a host a
 * comment may name directly.
 */
export function isAllowedRedirect(raw: string): boolean {
  if (isAllowedImageUrl(raw)) return true;
  const url = parseHttps(raw);
  if (!url) return false;
  return (
    /^github-production-user-asset-[0-9a-f]+\.s3\.amazonaws\.com$/.test(
      url.hostname,
    ) || url.hostname === "objects.githubusercontent.com"
  );
}

function parseHttps(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  // No port, and no user info: an href with user info does not start with
  // the origin.
  if (url.port !== "" || !url.href.startsWith(`${url.origin}/`)) return null;
  return url;
}

/**
 * The image URL without its query, which for private-user-images holds a
 * token that changes on every read. The sync keys its download cache on it.
 */
export function normalizeImageUrl(raw: string): string {
  const url = new URL(raw);
  return `${url.origin}${url.pathname}`;
}

type Fence = { start: number; end: number; info: string; body: string };

/**
 * The fenced code blocks of a Markdown text, in order. A fence is three or
 * more backticks or tildes, indented at most three spaces. A block that never
 * closes runs to the end, as CommonMark says.
 */
function fences(markdown: string): Fence[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const found: Fence[] = [];
  let offset = 0;
  let open: {
    char: string;
    size: number;
    info: string;
    start: number;
    body: string[];
  } | null = null;
  for (const line of lines) {
    const lineStart = offset;
    offset += line.length + 1;
    if (!open) {
      const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      if (!m) continue;
      // A backtick fence's info string may not hold a backtick.
      if (m[1][0] === "`" && m[2].includes("`")) continue;
      open = {
        char: m[1][0],
        size: m[1].length,
        info: m[2].trim(),
        start: lineStart,
        body: [],
      };
      continue;
    }
    const close = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
    if (close && close[1][0] === open.char && close[1].length >= open.size) {
      found.push({
        start: open.start,
        end: offset,
        info: open.info,
        body: open.body.join("\n"),
      });
      open = null;
      continue;
    }
    open.body.push(line);
  }
  if (open) {
    found.push({
      start: open.start,
      end: offset,
      info: open.info,
      body: open.body.join("\n"),
    });
  }
  return found;
}

/**
 * Text made safe to show as plain text: no terminal escape sequences, no
 * control characters but newline and tab, no bidirectional overrides, and at
 * most MAX_TEXT characters.
 */
export function cleanText(raw: string): string {
  let text = raw.replace(/\r\n?/g, "\n");
  // ESC sequences: CSI (ESC [ ... final), OSC and the other string
  // sequences (ESC ] ... BEL or ST), and two-byte escapes. The 8-bit C1 forms
  // go with the control characters below.
  text = text.replace(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: matching escapes is the point
    /\x1b\[[0-?]*[ -/]*[@-~]|\x1b[\]PX^_][\s\S]*?(?:\x07|\x1b\\|$)|\x1b[@-Z\\-_]?/g,
    "",
  );
  text = text.replace(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: matching controls is the point
    /[\x00-\x08\x0b-\x1f\x7f-\x9f‎‏‪-‮⁦-⁩﻿]/g,
    "",
  );
  if (text.length > MAX_TEXT) {
    text = text.slice(0, MAX_TEXT);
    // Do not leave half of a surrogate pair at the end.
    if (/[\ud800-\udbff]$/.test(text)) text = text.slice(0, -1);
  }
  return text;
}

/** The label of a code block: its language when that is a plain word. */
function labelFor(info: string): string {
  const lang = info.split(/\s+/)[0]?.toLowerCase() ?? "";
  if (/^[a-z0-9+#.-]{1,20}$/.test(lang)) return lang;
  return "config";
}

/** The first fenced code block of a comment, cleaned, or null. */
export function firstCodeBlock(markdown: string): GalleryFile | null {
  const first = fences(markdown).find((fence) => fence.body.trim() !== "");
  if (!first) return null;
  const text = cleanText(first.body).replace(/^\n+|\s+$/g, "");
  if (!text) return null;
  return { label: labelFor(first.info), text };
}

/**
 * The URL of the first image in a comment, from Markdown image syntax or an
 * HTML img tag, or null. Code blocks and code spans are left out first, so an
 * image written as an example is not taken. The URL is not checked here: see
 * isAllowedImageUrl.
 */
export function firstImageUrl(markdown: string): string | null {
  let text = markdown.replace(/\r\n?/g, "\n");
  const blocks = fences(text);
  for (let i = blocks.length - 1; i >= 0; i--) {
    const { start, end } = blocks[i];
    text = text.slice(0, start) + text.slice(end);
  }
  text = text.replace(/(`+)[^`]*?\1/g, "");
  const candidates: { index: number; url: string }[] = [];
  const md = /!\[[^\]]*\]\(\s*<?([^\s)>]+)/.exec(text);
  if (md) candidates.push({ index: md.index, url: md[1] });
  const html = /<img\b[^>]*?\ssrc\s*=\s*["']?([^"'\s>]+)/i.exec(text);
  if (html) candidates.push({ index: html.index, url: html[1] });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.index - b.index);
  return candidates[0].url.replaceAll("&amp;", "&");
}
