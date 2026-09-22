import { toHtml } from "hast-util-to-html";
import type { Root as MdastRoot, RootContent } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { SKIP, visit } from "unist-util-visit";
import { absoluteUrl, site } from "./site";

/** One entry in a feed: a blog post or a release note. */
export type FeedItem = {
  title: string;
  description: string;
  url: string;
  date: string;
  author: string;
  html: string;
};

export type Feed = {
  title: string;
  description: string;
  /** The page the feed describes, such as "/blog". */
  path: string;
  /** Where the feed itself is served, such as "/blog/rss.xml". */
  feedPath: string;
  items: FeedItem[];
};

type TextPage = {
  url: string;
  data: {
    title: string;
    description?: string;
    date: string;
    author: string;
    getText: (type: "processed") => Promise<string>;
  };
};

/**
 * Turn a post or release note into a feed item with its full text as HTML.
 *
 * The source is the processed markdown, which still holds the MDX widgets as
 * JSX. A feed reader cannot run them, so each block-level widget becomes a
 * short note that links to the page, and an inline one keeps only its text.
 * Prose containers such as Callout are kept as blockquotes, because their text
 * is part of the post.
 * Links and images are made absolute because a feed reader has no base URL.
 * If the markdown cannot be parsed the item falls back to its description.
 */
export async function toFeedItem(page: TextPage): Promise<FeedItem> {
  const pageUrl = absoluteUrl(page.url);
  let html: string;
  try {
    html = await markdownToHtml(await page.data.getText("processed"), pageUrl);
  } catch {
    html = `<p>${escapeXml(page.data.description ?? "")}</p>`;
  }

  return {
    title: page.data.title,
    description: page.data.description ?? "",
    url: pageUrl,
    date: page.data.date,
    author: page.data.author,
    html,
  };
}

async function markdownToHtml(markdown: string, pageUrl: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMdx)
    .use(remarkRehype);
  const mdast = processor.parse(markdown) as MdastRoot;

  visit(mdast, (node, index, parent) => {
    if (!parent || index === undefined) return;
    if (
      node.type === "mdxJsxFlowElement" &&
      node.name &&
      proseContainers.has(node.name)
    ) {
      parent.children.splice(index, 1, proseContainer(node) as never);
      // Visit the replacement so its children are rewritten too.
      return index;
    }
    if (node.type === "mdxJsxFlowElement") {
      const note: RootContent = {
        type: "paragraph",
        children: [
          {
            type: "emphasis",
            children: [
              {
                type: "link",
                url: pageUrl,
                children: [
                  {
                    type: "text",
                    value:
                      "An interactive figure goes here. Open the page to use it.",
                  },
                ],
              },
            ],
          },
        ],
      };
      parent.children.splice(index, 1, note as never);
      return [SKIP, index + 1];
    }
    if (node.type === "mdxJsxTextElement") {
      parent.children.splice(index, 1, ...(node.children as never[]));
      return [SKIP, index];
    }
    if (
      node.type === "mdxjsEsm" ||
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression"
    ) {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
    if (node.type === "link" || node.type === "image") {
      node.url = new URL(node.url, pageUrl).toString();
    }
  });

  const hast = await processor.run(mdast);
  return toHtml(hast);
}

/**
 * Components that hold prose rather than draw a figure. The feed keeps their
 * text as a blockquote instead of replacing them with a link to the page.
 */
const proseContainers = new Set([
  "Callout",
  "Accordion",
  "Accordions",
  "Step",
  "Steps",
  "Tab",
  "Tabs",
]);

type JsxFlowElement = Extract<RootContent, { type: "mdxJsxFlowElement" }>;

/** A prose container as a blockquote, with its title in bold on top. */
function proseContainer(node: JsxFlowElement): RootContent {
  const title = node.attributes.find(
    (attribute) =>
      attribute.type === "mdxJsxAttribute" && attribute.name === "title",
  );
  const children = [...node.children] as RootContent[];
  if (title && typeof title.value === "string" && title.value !== "") {
    children.unshift({
      type: "paragraph",
      children: [
        { type: "strong", children: [{ type: "text", value: title.value }] },
      ],
    });
  }
  return { type: "blockquote", children } as RootContent;
}

export function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** CDATA cannot contain "]]>", so split it across two sections. */
function cdata(value: string) {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function toDate(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

/**
 * The newest item's date stands in for the build time, so a rebuild with no
 * new content produces the same feed byte for byte.
 */
function newest(feed: Feed) {
  return toDate(feed.items[0]?.date ?? "1970-01-01");
}

export function renderRss(feed: Feed) {
  const items = feed.items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <pubDate>${toDate(item.date).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(item.author)}</dc:creator>
      <description>${escapeXml(item.description)}</description>
      <content:encoded>${cdata(item.html)}</content:encoded>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(absoluteUrl(feed.path))}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>en</language>
    <lastBuildDate>${newest(feed).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl(feed.feedPath))}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${escapeXml(absoluteUrl("/tuios-icon.png"))}</url>
      <title>${escapeXml(feed.title)}</title>
      <link>${escapeXml(absoluteUrl(feed.path))}</link>
    </image>
${items}
  </channel>
</rss>
`;
}

export function renderAtom(feed: Feed) {
  const entries = feed.items
    .map(
      (item) => `  <entry>
    <title>${escapeXml(item.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(item.url)}"/>
    <id>${escapeXml(item.url)}</id>
    <published>${toDate(item.date).toISOString()}</published>
    <updated>${toDate(item.date).toISOString()}</updated>
    <author><name>${escapeXml(item.author)}</name></author>
    <summary>${escapeXml(item.description)}</summary>
    <content type="html">${escapeXml(item.html)}</content>
  </entry>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${escapeXml(feed.title)}</title>
  <subtitle>${escapeXml(feed.description)}</subtitle>
  <link rel="alternate" type="text/html" href="${escapeXml(absoluteUrl(feed.path))}"/>
  <link rel="self" type="application/atom+xml" href="${escapeXml(absoluteUrl(feed.feedPath))}"/>
  <id>${escapeXml(absoluteUrl(feed.path))}</id>
  <updated>${newest(feed).toISOString()}</updated>
  <author><name>${escapeXml(site.author.name)}</name><uri>${escapeXml(site.author.url)}</uri></author>
  <icon>${escapeXml(absoluteUrl("/tuios-icon.png"))}</icon>
${entries}
</feed>
`;
}
