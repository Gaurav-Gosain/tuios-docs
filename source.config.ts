import {
  rehypeCodeDefaultOptions,
  remarkMdxMermaid,
} from "fumadocs-core/mdx-plugins";
import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import type { ShikiTransformer } from "shiki";
import { z } from "zod";
import { topicSlugs } from "./lib/topics";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const blog = defineDocs({
  dir: "content/blog",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string().date(),
      author: z.string(),
      // Topic slugs from lib/topics.ts. The blog index and the topic pages
      // list posts by them. A typo or a post with no topic fails the build.
      tags: z.array(z.enum(topicSlugs)).min(1),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const releases = defineDocs({
  dir: "content/releases",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string().date(),
      author: z.string(),
      // A line short enough for the Open Graph card, used there in place of
      // the description when set.
      summary: z.string().max(150).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// Marks a code block that draws with box-drawing characters, such as a table
// printed by the CLI. Those blocks get a line height the glyphs fill, so the
// vertical lines join from one row to the next (see .box-drawing in
// app/global.css).
const transformerBoxDrawing: ShikiTransformer = {
  name: "box-drawing",
  pre(node) {
    if (/[─-╿]/.test(this.source)) {
      this.addClassToHast(node, "box-drawing");
    }
  },
};

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerBoxDrawing,
      ],
    },
  },
});
