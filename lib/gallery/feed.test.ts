import { describe, expect, test } from "bun:test";
import { DISCUSSION_URL, parseEntry, parseFeed } from "./feed";

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
