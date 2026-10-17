import { describe, expect, test } from "bun:test";
import {
  APPROVER,
  type DiscussionComment,
  optsOut,
  parseDenylist,
  selectApproved,
} from "./filter";

const none = { comments: [], logins: [] };

function comment(over: Partial<DiscussionComment> = {}): DiscussionComment {
  return {
    id: "100",
    author: "someone",
    body: "![shot](https://github.com/user-attachments/assets/0123abcd-0000-4000-8000-000000000000)",
    bodyHTML:
      '<p dir="auto"><img src="https://github.com/user-attachments/assets/0123abcd-0000-4000-8000-000000000000" alt="shot"></p>',
    createdAt: "2026-10-17T10:00:00Z",
    lastEditedAt: null,
    isMinimized: false,
    rockets: [{ login: APPROVER, createdAt: "2026-10-17T11:00:00Z" }],
    ...over,
  };
}

function reasons(c: DiscussionComment, deny = none) {
  const { approved, skipped } = selectApproved([c], deny);
  return { approved: approved.length, reason: skipped[0]?.reason };
}

describe("selectApproved", () => {
  test("a rocket from the approver approves", () =>
    expect(reasons(comment()).approved).toBe(1));

  test("no reaction at all", () =>
    expect(reasons(comment({ rockets: [] })).reason).toMatch(/no rocket/));

  test("a rocket from anyone else does not approve", () => {
    for (const login of [
      "someone",
      "gaurav-gosain",
      "GAURAV-GOSAIN",
      "Gaurav-Gosain-bot",
      "xGaurav-Gosain",
      " Gaurav-Gosain",
      null,
    ]) {
      const c = comment({
        rockets: [{ login, createdAt: "2026-10-17T11:00:00Z" }],
      });
      expect(reasons(c).approved).toBe(0);
    }
  });

  test("the author's own rocket does not approve", () => {
    const c = comment({
      author: "someone",
      rockets: [{ login: "someone", createdAt: "2026-10-17T11:00:00Z" }],
    });
    expect(reasons(c).approved).toBe(0);
  });

  test("the approver among many rockets approves", () => {
    const rockets = Array.from({ length: 150 }, (_, i) => ({
      login: `user${i}`,
      createdAt: "2026-10-17T11:00:00Z",
    }));
    rockets.push({ login: APPROVER, createdAt: "2026-10-17T11:00:00Z" });
    expect(reasons(comment({ rockets })).approved).toBe(1);
  });

  test("an edit after the rocket takes the approval away", () => {
    const c = comment({ lastEditedAt: "2026-10-17T12:00:00Z" });
    expect(reasons(c).reason).toMatch(/edited after/);
  });

  test("an edit in the same second as the rocket counts as after it", () => {
    const c = comment({ lastEditedAt: "2026-10-17T11:00:00Z" });
    expect(reasons(c).reason).toMatch(/edited after/);
  });

  test("an HTML comment, which GitHub does not show, keeps it out", () => {
    const c = comment({
      body: "<!-- ![](https://github.com/user-attachments/assets/11111111-1111-4111-8111-111111111111) -->\n![](https://github.com/user-attachments/assets/22222222-2222-4222-8222-222222222222)",
    });
    expect(reasons(c).reason).toMatch(/HTML comment/);
  });

  test("an edit before the rocket keeps the approval", () => {
    const c = comment({ lastEditedAt: "2026-10-17T10:30:00Z" });
    expect(reasons(c).approved).toBe(1);
  });

  test("a hidden comment", () =>
    expect(reasons(comment({ isMinimized: true })).reason).toMatch(/hidden/));

  test("a deleted account", () =>
    expect(reasons(comment({ author: null })).reason).toMatch(/deleted/));

  test("the denylist names the comment", () =>
    expect(
      reasons(comment(), { comments: ["100"], logins: [] }).reason,
    ).toMatch(/denylist/));

  test("the denylist names the author, in any case", () =>
    expect(
      reasons(comment(), { comments: [], logins: ["SomeOne"] }).reason,
    ).toMatch(/denylist/));

  test("an opt-out wins over the rocket", () =>
    expect(
      reasons(comment({ body: "my setup, no gallery please" })).reason,
    ).toMatch(/stay out/));
});

describe("optsOut", () => {
  const out = [
    "no gallery",
    "No Gallery please",
    "#nogallery",
    "no-gallery",
    "Not for the gallery, just sharing.",
    "Please don't add this to the gallery",
    "please don’t put it in the gallery",
    "Do not include me in the gallery.",
    "keep me out of the gallery",
    "Leave this one out of the gallery",
    "I'd like to opt out of the gallery",
    "exclude from gallery",
    "gallery: no",
    "Never show this in your gallery",
  ];
  for (const body of out)
    test(`out: ${body}`, () => expect(optsOut(body)).toBe(true));

  const stays = [
    "Here is my setup!",
    "I love the new gallery.",
    "Would be happy to see this in the gallery",
    "No worries. Add it to the gallery!",
    'theme = "nord"',
  ];
  for (const body of stays)
    test(`stays: ${body}`, () => expect(optsOut(body)).toBe(false));
});

describe("parseDenylist", () => {
  test("keeps only strings", () =>
    expect(parseDenylist({ comments: ["1", 2], logins: [null, "x"] })).toEqual({
      comments: ["1"],
      logins: ["x"],
    }));
  test("a missing file shape is empty", () =>
    expect(parseDenylist(undefined)).toEqual(none));
  test("the committed denylist parses", async () => {
    const file = await Bun.file(`${import.meta.dir}/gallery-deny.json`).json();
    const deny = parseDenylist(file);
    expect(Array.isArray(deny.comments) && Array.isArray(deny.logins)).toBe(
      true,
    );
  });
});
