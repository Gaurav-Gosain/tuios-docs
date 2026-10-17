import { describe, expect, test } from "bun:test";
import {
  DISCUSSION_URL,
  type GalleryEntry,
  mergeEntries,
  parseEntry,
  parseFeed,
} from "./feed";
import seed from "./gallery-seed.json";

const HASH = "0123456789abcdef0123456789abcdef";

function entry(over: Record<string, unknown> = {}) {
  return {
    id: "123",
    login: "someone",
    url: `${DISCUSSION_URL}#discussioncomment-123`,
    date: "2026-10-17T10:00:00Z",
    thumb: `/gallery/img/${HASH}/thumb`,
    full: `/gallery/img/${HASH}/full`,
    width: 1600,
    height: 900,
    files: [{ label: "toml", text: "a = 1" }],
    hash: HASH,
    ...over,
  };
}

describe("parseEntry", () => {
  test("a good entry", () => expect(parseEntry(entry())).not.toBeNull());

  const bad: [string, Record<string, unknown>][] = [
    ["a handle with markup", { login: "<b>x</b>" }],
    ["a handle with a space", { login: "a b" }],
    ["a link off the discussion", { url: "https://evil.com" }],
    ["a javascript link", { url: "javascript:alert(1)" }],
    [
      "a link to another discussion",
      { url: `${DISCUSSION_URL}0#discussioncomment-1` },
    ],
    ["an image off the site", { thumb: "https://evil.com/a.webp" }],
    ["an image path that climbs", { full: "/gallery/img/../../x" }],
    ["a bad date", { date: "yesterday" }],
    ["a bad size", { width: -1 }],
    [
      "text over the cap",
      { files: [{ label: "toml", text: "x".repeat(5000) }] },
    ],
    ["a label with markup", { files: [{ label: "<i>", text: "x" }] }],
    [
      "three files",
      { files: [1, 2, 3].map(() => ({ label: "a", text: "b" })) },
    ],
    ["a bad id", { id: "1; drop" }],
  ];
  for (const [name, over] of bad)
    test(name, () => expect(parseEntry(entry(over))).toBeNull());
});

describe("parseFeed", () => {
  test("drops the bad entries and keeps the good", () =>
    expect(
      parseFeed({ entries: [entry(), entry({ login: "<x>" }), 7] }),
    ).toHaveLength(1));
  test("anything that is not a feed is empty", () => {
    for (const v of [null, "x", 1, {}, { entries: "x" }])
      expect(parseFeed(v)).toEqual([]);
  });
});

describe("mergeEntries", () => {
  test("newest first, and a synced entry wins over a seed with its ID", () => {
    const a = parseEntry(
      entry({ id: "1", date: "2026-10-01T00:00:00Z" }),
    ) as GalleryEntry;
    const b = parseEntry(
      entry({ id: "2", date: "2026-10-05T00:00:00Z" }),
    ) as GalleryEntry;
    const b2 = { ...b, login: "other" };
    const merged = mergeEntries([b2], [a, b]);
    expect(merged.map((e) => [e.id, e.login])).toEqual([
      ["2", "other"],
      ["1", "someone"],
    ]);
  });
});

describe("gallery-seed.json", () => {
  test("every seed entry is valid, and its images exist", async () => {
    const entries = (seed as { entries: unknown[] }).entries;
    expect(parseFeed(seed)).toHaveLength(entries.length);
    for (const e of parseFeed(seed)) {
      for (const path of [e.thumb, e.full]) {
        expect(
          await Bun.file(`${import.meta.dir}/../../public${path}`).exists(),
        ).toBe(true);
      }
    }
  });
});
