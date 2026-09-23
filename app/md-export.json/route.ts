import { markdownForAgents } from "@/lib/feed";
import { markdownPath } from "@/lib/markdown-path";
import { absoluteUrl, site } from "@/lib/site";
import {
  getBlogPosts,
  getDocsInSidebarOrder,
  getReleases,
} from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Every page's markdown twin, keyed by the path it is served at: the page's URL
 * with ".md" added ("/docs/sessions.md", "/blog.md"), and "/index.md" for the
 * home page. A static export cannot give a dynamic route a ".md" suffix, so
 * this route builds them all as one JSON file and scripts/export-markdown.mjs
 * writes each entry to its own file after the build and deletes this one.
 */
export async function GET() {
  const files: Record<string, string> = {};

  const docs = getDocsInSidebarOrder().map(({ page }) => page);
  const posts = getBlogPosts();
  const releases = getReleases();

  for (const page of [...docs, ...posts, ...releases]) {
    files[markdownPath(page.url)] = await pageMarkdown(page);
  }

  files["/index.md"] = listing(
    site.name,
    site.description,
    "/",
    [
      ["Docs", docs],
      ["Blog", posts],
      ["Releases", releases],
    ],
  );
  files["/blog.md"] = listing("Blog", "Posts about how TUIOS is built.", "/blog", [
    ["Posts", posts],
  ]);
  files["/releases.md"] = listing(
    "Releases",
    "What changed in each release of TUIOS.",
    "/releases",
    [["Releases", releases]],
  );

  return Response.json(files);
}

type TextPage = {
  url: string;
  data: {
    title: string;
    description?: string;
    getText: (type: "processed") => Promise<string>;
  };
};

async function pageMarkdown(page: TextPage) {
  const url = absoluteUrl(page.url);
  const description = page.data.description
    ? `\n\n> ${page.data.description.trim().replace(/\s+/g, " ")}`
    : "";
  const body = markdownForAgents(await page.data.getText("processed"), url);
  return `# ${page.data.title}\n\nURL: ${url}${description}\n\n${body}`;
}

function listing(
  title: string,
  description: string,
  path: string,
  sections: [string, TextPage[]][],
) {
  const lines = [`# ${title}`, "", `URL: ${absoluteUrl(path)}`, "", `> ${description}`];
  for (const [heading, pages] of sections) {
    lines.push("", `## ${heading}`, "");
    for (const page of pages) {
      const text = page.data.description?.trim().replace(/\s+/g, " ");
      lines.push(
        `- [${page.data.title}](${absoluteUrl(markdownPath(page.url))})${text ? `: ${text}` : ""}`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
