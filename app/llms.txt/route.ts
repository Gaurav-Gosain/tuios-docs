import { markdownPath } from "@/lib/markdown-path";
import { absoluteUrl, feeds, site } from "@/lib/site";
import {
  getBlogPosts,
  getDocsInSidebarOrder,
  getReleases,
  getReleaseTag,
} from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * An index of the site for language models, in the llms.txt format: a title, a
 * summary, then sections of links with one line each. The docs follow the
 * sidebar order and its section names. Each link is the page's markdown twin
 * (its URL with ".md" added). The full text of the docs is in /llms-full.txt.
 */
export function GET() {
  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `tuios is written in Go and MIT licensed. Source: ${site.repository}`,
  ];

  const latest = getReleases().find((release) => getReleaseTag(release));
  const tag = latest ? getReleaseTag(latest) : null;
  if (latest && tag) {
    lines.push(
      "",
      `The latest release is ${tag}, from ${latest.data.date}. Release notes: ${absoluteUrl(markdownPath(latest.url))}. Install: ${absoluteUrl(markdownPath("/docs/getting-started"))}`,
    );
  }

  lines.push(
    "",
    `To set up another machine for tuios, run \`tuios hosts setup user@machine --dry-run\`, then the same with \`--install copy --yes --json\`. It tests ssh, installs tuios, starts it and adds the machine. Without a terminal it never prompts: exit 2 names a missing flag, exit 3 means a step needs the person. Run \`tuios --skill hosts\` for the rest. Details: ${absoluteUrl(markdownPath("/docs/remote-hosts"))}`,
  );

  let section = "";
  for (const entry of getDocsInSidebarOrder()) {
    if (entry.section !== section) {
      section = entry.section;
      const heading = section === "Docs" ? "Docs" : `Docs: ${section}`;
      lines.push("", `## ${heading}`, "");
    }
    const { page } = entry;
    lines.push(
      link(page.data.title, markdownPath(page.url), page.data.description),
    );
  }

  lines.push("", "## Blog", "");
  for (const post of getBlogPosts()) {
    lines.push(
      link(post.data.title, markdownPath(post.url), post.data.description),
    );
  }
  lines.push("", "## Releases", "");
  for (const release of getReleases()) {
    lines.push(
      link(
        release.data.title,
        markdownPath(release.url),
        release.data.description,
      ),
    );
  }
  lines.push(
    "",
    "## Optional",
    "",
    link("Full docs text", "/llms-full.txt", "Every docs page as one file"),
    link(
      "Blog feed",
      feeds.blog.atom,
      "Every post with its full text, as Atom",
    ),
    link(
      "Releases feed",
      feeds.releases.atom,
      "Every release note with its full text, as Atom",
    ),
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function link(title: string, path: string, description?: string) {
  const text = description?.trim().replace(/\s+/g, " ");
  return `- [${title}](${absoluteUrl(path)})${text ? `: ${text}` : ""}`;
}
