import { describe, expect, test } from "bun:test";
import type { GalleryEntry } from "./feed";
import { githubVotes, score, sortEntries } from "./votes";

const APPROVER = "Gaurav-Gosain";

describe("githubVotes", () => {
  test("the approval rocket does not count, the approver's other reactions do", () => {
    expect(
      githubVotes([{ login: APPROVER, content: "ROCKET" }], "alice", APPROVER),
    ).toBe(0);
    expect(
      githubVotes(
        [
          { login: APPROVER, content: "ROCKET" },
          { login: APPROVER, content: "HEART" },
        ],
        "alice",
        APPROVER,
      ),
    ).toBe(1);
  });

  test("each person counts once, whatever they reacted with", () => {
    expect(
      githubVotes(
        [
          { login: "bob", content: "THUMBS_UP" },
          { login: "bob", content: "HEART" },
          { login: "bob", content: "ROCKET" },
          { login: "carol", content: "EYES" },
          { login: "dave", content: "LAUGH" },
          { login: "erin", content: "HOORAY" },
        ],
        "alice",
        APPROVER,
      ),
    ).toBe(4);
  });

  test("the author, deleted accounts and other reactions do not count", () => {
    expect(
      githubVotes(
        [
          { login: "alice", content: "HEART" },
          { login: null, content: "HEART" },
          { login: "bob", content: "THUMBS_DOWN" },
          { login: "bob", content: "CONFUSED" },
        ],
        "alice",
        APPROVER,
      ),
    ).toBe(0);
    expect(githubVotes(undefined, "alice", APPROVER)).toBe(0);
  });
});

function entry(id: string, date: string, github?: number): GalleryEntry {
  return {
    id,
    login: "x",
    url: "https://github.com/Gaurav-Gosain/tuios/discussions/849",
    date,
    thumb: "/gallery-seed/a-thumb.webp",
    full: "/gallery-seed/a.webp",
    width: 1,
    height: 1,
    files: [],
    github,
  };
}

describe("sortEntries", () => {
  const list = [
    entry("1", "2026-10-01", 2),
    entry("2", "2026-10-03", 0),
    entry("3", "2026-10-02", 1),
  ];

  test("Top weighs a GitHub reaction three hearts", () => {
    expect(score(2, 1)).toBe(7);
    // 1: 6, 2: 5, 3: 3 + 3 = 6, a tie broken by the newer date.
    const order = sortEntries(list, "top", { "2": 5, "3": 3 }).map((e) => e.id);
    expect(order).toEqual(["3", "1", "2"]);
  });

  test("New is by date", () => {
    expect(sortEntries(list, "new", { "1": 100 }).map((e) => e.id)).toEqual([
      "2",
      "3",
      "1",
    ]);
  });
});
