import { describe, expect, test } from "bun:test";
import { buildFeed, hash32 } from "./build";
import type { DiscussionComment } from "./filter";
import { ImageRejected } from "./image";

const A =
  "https://github.com/user-attachments/assets/aaaaaaaa-0000-4000-8000-000000000000";
const B =
  "https://github.com/user-attachments/assets/bbbbbbbb-0000-4000-8000-000000000000";

function comment(id: string, body: string): DiscussionComment {
  return {
    id,
    author: `user${id}`,
    body,
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
    expect(e.files).toEqual([{ label: "toml", text: "a = 1" }]);
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
});
