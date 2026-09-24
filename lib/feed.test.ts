import { describe, expect, test } from "bun:test";
import { type Feed, feedId, renderAtom, renderRss } from "./feed";
import { absoluteUrl, legacyOrigin, site } from "./site";

describe("site origin", () => {
  test("is tuios.dev", () => {
    expect(site.url).toBe("https://tuios.dev");
    expect(absoluteUrl("/docs")).toBe("https://tuios.dev/docs");
  });
});

describe("feedId", () => {
  test("keeps ids on the first origin", () => {
    expect(feedId("https://tuios.dev/blog/a-post")).toBe(
      "https://tuios.gaurav.zip/blog/a-post",
    );
    expect(feedId("https://tuios.dev/blog")).toBe(`${legacyOrigin}/blog`);
  });

  test("leaves other URLs alone", () => {
    expect(feedId("https://example.com/x")).toBe("https://example.com/x");
  });
});

const feed = {
  title: "t",
  description: "d",
  path: "/blog",
  feedPath: "/blog/rss.xml",
  items: [
    {
      title: "A post",
      description: "about it",
      url: "https://tuios.dev/blog/a-post",
      date: "2026-09-01",
      author: "someone",
      html: "<p>hi</p>",
    },
  ],
} as unknown as Feed;

describe("feeds", () => {
  test("RSS links to tuios.dev and keeps the old guid", () => {
    const xml = renderRss(feed);
    expect(xml).toContain("<link>https://tuios.dev/blog/a-post</link>");
    expect(xml).toContain(
      '<guid isPermaLink="false">https://tuios.gaurav.zip/blog/a-post</guid>',
    );
    expect(xml).toContain('href="https://tuios.dev/blog/rss.xml"');
  });

  test("Atom links to tuios.dev and keeps the old ids", () => {
    const xml = renderAtom({ ...feed, feedPath: "/blog/atom.xml" });
    expect(xml).toContain('href="https://tuios.dev/blog/a-post"');
    expect(xml).toContain("<id>https://tuios.gaurav.zip/blog/a-post</id>");
    expect(xml).toContain("<id>https://tuios.gaurav.zip/blog</id>");
    expect(xml).toContain('href="https://tuios.dev/blog/atom.xml"');
  });
});
