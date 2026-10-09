// Checks the `tags` of every blog post against lib/topics.ts, with the same
// rule as the frontmatter schema in source.config.ts. fumadocs-mdx checks the
// schema only when a page is built, so types:check runs this to catch a typo
// or a post with no topic before the build does.
//
//   bun scripts/check-tags.mjs
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { topicSlugs } from "../lib/topics.ts";

const dir = path.resolve("content/blog");
const tags = z.array(z.enum(topicSlugs)).min(1);
let bad = 0;
for (const name of (await readdir(dir)).filter((f) => f.endsWith(".mdx"))) {
  const text = await readFile(path.join(dir, name), "utf8");
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  const front = match ? Bun.YAML.parse(match[1]) : {};
  const result = tags.safeParse(front.tags);
  if (!result.success) {
    bad++;
    console.error(
      `content/blog/${name}: tags must be one or more of ${topicSlugs.join(", ")}. Found: ${JSON.stringify(front.tags ?? null)}.`,
    );
  }
}
if (bad > 0) process.exit(1);
