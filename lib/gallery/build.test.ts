import { describe, expect, test } from "bun:test";
import { buildFeed, hash32 } from "./build";
import { entryTitle, parseFeed } from "./feed";
import type { DiscussionComment } from "./filter";
import { ImageRejected } from "./image";

const A =
  "https://github.com/user-attachments/assets/aaaaaaaa-0000-4000-8000-000000000000";
const B =
  "https://github.com/user-attachments/assets/bbbbbbbb-0000-4000-8000-000000000000";

/** A stand-in for GitHub's rendering: each Markdown image as an img. */
function rendered(body: string) {
  return body.replace(
    /!\[[^\]]*\]\(([^)\s]+)\)/g,
    '<a href="$1"><img src="$1" alt="" style="max-width: 100%;"></a>',
  );
}

function comment(
  id: string,
  body: string,
  bodyHTML = rendered(body),
): DiscussionComment {
  return {
    id,
    author: `user${id}`,
    body,
    bodyHTML,
    createdAt: "2026-10-17T10:00:00Z",
    lastEditedAt: null,
    isMinimized: false,
    rockets: [],
  };
}

function deps() {
  const downloads: string[] = [];
  let encodes = 0;
  return {
    downloads,
    encodes: () => encodes,
    deps: {
      download: async (url: string) => {
        downloads.push(url);
        if (url.includes("dddd"))
          throw new ImageRejected("the image does not decode");
        return new TextEncoder().encode(
          url.includes("aaaa") ? "image-a" : "image-b",
        );
      },
      reencode: async () => {
        encodes++;
        return {
          full: Buffer.from("full"),
          thumb: Buffer.from("thumb"),
          width: 1600,
          height: 900,
        };
      },
    },
  };
}

describe("buildFeed", () => {
  test("a new image is downloaded, encoded and queued once", async () => {
    const d = deps();
    const r = await buildFeed(
      [comment("1", `![x](${A})\n\`\`\`toml\na = 1\n\`\`\``)],
      [],
      d.deps,
    );
    expect(d.downloads).toEqual([A]);
    expect(r.uploads.map((u) => u.hash)).toEqual([hash32("image-a")]);
    const e = r.feed.entries[0];
    expect(e.url).toBe(
      "https://github.com/Gaurav-Gosain/tuios/discussions/849#discussioncomment-1",
    );
    expect(e.thumb).toBe(`/gallery/img/${hash32("image-a")}/thumb`);
    expect(e.files).toEqual([
      {
        label: "toml",
        text: "a = 1",
        notes: [{ line: 0, start: 0, end: 1, path: "a", kind: "unknown" }],
      },
    ]);
  });

  test("an image the previous feed has is not downloaded again", async () => {
    const d = deps();
    const first = await buildFeed([comment("1", `![x](${A})`)], [], d.deps);
    const again = deps();
    const second = await buildFeed(
      [comment("1", `![x](${A})`)],
      first.feed.entries,
      again.deps,
    );
    expect(again.downloads).toEqual([]);
    expect(second.uploads).toEqual([]);
    expect(second.orphans).toEqual([]);
    expect(second.feed.entries[0].hash).toBe(first.feed.entries[0].hash);
  });

  test("the same bytes under a new URL are downloaded but not uploaded", async () => {
    const d = deps();
    const r = await buildFeed(
      [comment("1", `![x](${A})`), comment("2", `![x](${A}?again)`)],
      [],
      d.deps,
    );
    expect(r.uploads).toHaveLength(1);
    expect(d.encodes()).toBe(1);
    expect(r.feed.entries).toHaveLength(2);
  });

  test("a removed entry's image is an orphan", async () => {
    const d = deps();
    const first = await buildFeed(
      [comment("1", `![x](${A})`), comment("2", `![x](${B})`)],
      [],
      d.deps,
    );
    const second = await buildFeed(
      [comment("1", `![x](${A})`)],
      first.feed.entries,
      deps().deps,
    );
    expect(second.orphans).toEqual([hash32("image-b")]);
  });

  test("no image, a foreign host and a failed decode are skipped and logged", async () => {
    const d = deps();
    const r = await buildFeed(
      [
        comment("1", "just text"),
        comment("2", "![x](https://evil.com/a.png)"),
        comment(
          "3",
          "![x](https://github.com/user-attachments/assets/dddddddd-0000)",
        ),
      ],
      [],
      d.deps,
    );
    expect(r.feed.entries).toEqual([]);
    expect(d.downloads).toEqual([
      "https://github.com/user-attachments/assets/dddddddd-0000",
    ]);
    expect(r.log.join("\n")).toMatch(/#1.*no image/);
    expect(r.log.join("\n")).toMatch(/#2.*not on a GitHub image host/);
    expect(r.log.join("\n")).toMatch(/#3.*does not decode/);
  });

  // Each body below makes GitHub show one image (or none) while a pattern
  // read of the Markdown takes another. The HTML is what GitHub's renderer
  // answered for the body. The sync must skip each one, and download nothing.
  describe("an image the approver did not see is refused", () => {
    const shown = (url: string) =>
      `<a target="_blank" rel="noopener noreferrer" href="${url}"><img src="${url}" alt="" style="max-width: 100%;"></a>`;
    const cases: [string, string, string, RegExp][] = [
      [
        "an image in another image's alt text",
        `![a ![b](${A}) c](${B})`,
        `<p dir="auto"><a target="_blank" rel="noopener noreferrer" href="${B}"><img src="${B}" alt="a b c" style="max-width: 100%;"></a></p>`,
        /not the first one GitHub shows/,
      ],
      [
        "a src inside an alt attribute",
        `<img alt="x src=${A}" src="${B}">`,
        `<p dir="auto"><a target="_blank" rel="noopener noreferrer" href="${B}"><img alt="x src=${A}" src="${B}" style="max-width: 100%;"></a></p>`,
        /not the first one GitHub shows/,
      ],
      [
        "Markdown inside an HTML block, shown as text",
        `<div>\n![](${A})\n</div>\n\n![](${B})`,
        `<div dir="auto">\n![](${A})\n</div>\n<p dir="auto">${shown(B)}</p>`,
        /not the first one GitHub shows/,
      ],
      [
        "an escaped bang, shown as an empty link",
        `\\![](${A})`,
        `<p dir="auto">!<a href="${A}"></a></p>`,
        /GitHub shows no image/,
      ],
      [
        "a picture element with a source per theme",
        `<picture><source media="(prefers-color-scheme: dark)" srcset="${B}"><img src="${A}"></picture>`,
        `<p dir="auto"><themed-picture data-catalyst-inline="true"><picture><source media="(prefers-color-scheme: dark)" srcset="${B}"><img src="${A}"></picture></themed-picture></p>`,
        /picture element/,
      ],
      [
        "an image drawn one pixel wide",
        `<img width="1" height="1" src="${A}">\n![](${B})`,
        `<p dir="auto"><a target="_blank" rel="noopener noreferrer" href="${A}"><img width="1" height="1" src="${A}" style="max-width: 100%; height: auto; max-height: 1px;" class="js-gh-image-fallback"></a></p>\n![](${B})`,
        /too small/,
      ],
      [
        "an image for the light theme only",
        `![](${A}#gh-light-mode-only)![](${B}#gh-dark-mode-only)`,
        `<p dir="auto">${shown(`${A}#gh-light-mode-only`)}${shown(`${B}#gh-dark-mode-only`)}</p>`,
        /fragment/,
      ],
      [
        "an image in a collapsed section",
        `<details><summary>x</summary>\n\n![](${A})\n</details>`,
        `<details><summary>x</summary>\n<p dir="auto">${shown(A)}</p>\n</details>`,
        /collapsed/,
      ],
    ];
    for (const [name, body, html, why] of cases) {
      test(name, async () => {
        const d = deps();
        const r = await buildFeed([comment("1", body, html)], [], d.deps);
        expect(r.feed.entries).toEqual([]);
        expect(d.downloads).toEqual([]);
        expect(r.log.join("\n")).toMatch(why);
      });
    }

    test("the first image GitHub shows passes, with an emoji before it", async () => {
      const d = deps();
      const r = await buildFeed(
        [
          comment(
            "1",
            `:octocat: <img width="1920" height="1075" alt="image" src="${A}" />`,
            `<p dir="auto"><img class="emoji" title=":octocat:" alt=":octocat:" src="https://github.githubassets.com/images/icons/emoji/octocat.png" height="20" width="20" align="absmiddle"> <a target="_blank" rel="noopener noreferrer" href="https://private-user-images.githubusercontent.com/1/676548387-aaaaaaaa-0000-4000-8000-000000000000.png?jwt=x"><img width="1920" height="1075" alt="image" src="https://private-user-images.githubusercontent.com/1/676548387-aaaaaaaa-0000-4000-8000-000000000000.png?jwt=x" style="max-width: 100%;"></a></p>`,
          ),
        ],
        [],
        d.deps,
      );
      expect(r.feed.entries).toHaveLength(1);
      expect(d.downloads).toEqual([A]);
    });
  });
});

describe("looks and votes", () => {
  const body = `![x](${A})\n\`\`\`toml\n[appearance]\ngap = 1\n[hooks]\nx = "evil"\n\`\`\``;

  test("an entry gets a look of the allowed keys and its GitHub votes", async () => {
    const c = comment("7", body);
    c.reactions = [
      { login: "Gaurav-Gosain", content: "ROCKET" },
      { login: "bob", content: "HEART" },
      { login: "bob", content: "THUMBS_UP" },
      { login: "user7", content: "HEART" },
    ];
    const r = await buildFeed([c], [], deps().deps);
    const e = r.feed.entries[0];
    expect(e.github).toBe(1);
    expect(e.look?.id).toBe("7");
    expect(e.look?.left).toEqual(["hooks"]);
    expect(r.looks).toHaveLength(1);
    expect(r.looks[0].text).toContain("gap = 1");
    expect(r.looks[0].text).not.toContain("evil");
    expect(e.look?.hash).toBe(hash32(r.looks[0].text));
  });

  test("an entry takes its title from the look's name line", async () => {
    const named = `![x](${A})\n\`\`\`toml\nlook = 1\nname = "  Neon\\u001b[2J   84 "\n[appearance]\ngap = 1\n\`\`\``;
    const long = `![x](${B})\n\`\`\`toml\nname = "${"x".repeat(61)}"\n[appearance]\ngap = 1\n\`\`\``;
    const r = await buildFeed(
      [comment("7", named), comment("8", long), comment("9", body)],
      [],
      deps().deps,
    );
    const [a, b, c] = r.feed.entries;
    expect(a.title).toBe("Neon 84");
    expect(entryTitle(a)).toBe("Neon 84 by @user7");
    expect(r.looks[0].text).toContain('name = "Neon 84"');
    expect(b.title).toBeUndefined();
    expect(c.title).toBeUndefined();
    expect(entryTitle(c)).toBe("@user9's setup");
    expect(parseFeed(r.feed).map((e) => e.title)).toEqual([
      "Neon 84",
      undefined,
      undefined,
    ]);
  });

  test("an unchanged look is not uploaded again, a removed one is deleted", async () => {
    const first = await buildFeed([comment("7", body)], [], deps().deps);
    const again = await buildFeed(
      [comment("7", body)],
      first.feed.entries,
      deps().deps,
    );
    expect(again.looks).toEqual([]);
    expect(again.lookOrphans).toEqual([]);
    const gone = await buildFeed([], first.feed.entries, deps().deps);
    expect(gone.lookOrphans).toEqual(["7"]);
  });

  test("a JSON first block or a config with no look key has no look", async () => {
    const r = await buildFeed(
      [
        comment("8", `![x](${A})\n\`\`\`json\n{"id": "x"}\n\`\`\``),
        comment("9", `![x](${B})\n\`\`\`toml\n[hooks]\nx = 1\n\`\`\``),
      ],
      [],
      deps().deps,
    );
    expect(r.feed.entries.map((e) => e.look)).toEqual([undefined, undefined]);
    expect(r.looks).toEqual([]);
  });
});
