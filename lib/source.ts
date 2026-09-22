import { blog, docs, releases } from 'fumadocs-mdx:collections/server';
import type { Node as PageTreeNode } from 'fumadocs-core/page-tree';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { site } from './site';

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

export const blogSource = loader({
  baseUrl: '/blog',
  source: blog.toFumadocsSource(),
});

/**
 * Posts newest first. The date is validated as a plain date string by the
 * frontmatter schema, so lexicographic order is chronological order.
 */
export function getBlogPosts() {
  return blogSource
    .getPages()
    .slice()
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export const releasesSource = loader({
  baseUrl: '/releases',
  source: releases.toFumadocsSource(),
});

/**
 * Releases newest first. The date is a plain date string validated by the
 * frontmatter schema, so lexicographic order is chronological order, the same
 * ordering the blog uses.
 */
export function getReleases() {
  return releasesSource
    .getPages()
    .slice()
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

/**
 * The tag a release note describes, read from its slug: "v0-7-0" is v0.7.0.
 * A note whose slug is not a version, such as "since-v0-7-0", covers work on
 * main that no tag holds yet, and returns null.
 */
export function getReleaseTag(page: InferPageType<typeof releasesSource>) {
  const slug = page.slugs[0] ?? '';
  return /^v\d+(-\d+)*$/.test(slug) ? slug.replaceAll('-', '.') : null;
}

export function getReleasePageImage(
  page: InferPageType<typeof releasesSource>,
) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/releases/${segments.join('/')}`,
  };
}

export function getBlogPageImage(page: InferPageType<typeof blogSource>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/blog/${segments.join('/')}`,
  };
}

export function formatPostDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Minutes to read a post or release note, from the word count of its processed
 * markdown at 230 words a minute. Code blocks count as words too, which is
 * close enough: code is read slower than prose, and the interactive figures
 * add no words at all.
 */
export async function getReadingMinutes(page: {
  data: { getText: (type: 'processed') => Promise<string> };
}) {
  const words = await getWordCount(page);
  return Math.max(1, Math.round(words / 230));
}

/** Words in the processed markdown of a page, code blocks included. */
export async function getWordCount(page: {
  data: { getText: (type: 'processed') => Promise<string> };
}) {
  const text = await page.data.getText('processed');
  return text.split(/\s+/).filter(Boolean).length;
}

/** Short date for dense lists, such as "27 Aug 2026". */
export function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

/**
 * Docs pages in sidebar order, each with the name of the sidebar section it
 * sits under ("Docs" before the first separator). A page that meta.json leaves
 * out is not in the tree but is still served, so it comes last.
 */
export function getDocsInSidebarOrder() {
  const pages = new Map(source.getPages().map((page) => [page.url, page]));
  const ordered: { section: string; page: InferPageType<typeof source> }[] =
    [];
  let section = 'Docs';

  const walk = (nodes: PageTreeNode[]) => {
    for (const node of nodes) {
      if (node.type === 'separator') {
        section = typeof node.name === 'string' ? node.name : section;
      } else if (node.type === 'folder') {
        walk(node.children);
      } else {
        const page = pages.get(node.url);
        if (!page) continue;
        ordered.push({ section, page });
        pages.delete(node.url);
      }
    }
  };
  walk(source.pageTree.children);

  for (const page of pages.values()) {
    ordered.push({ section: 'Other pages', page });
  }
  return ordered;
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  const description = page.data.description
    ? `\n\n> ${page.data.description}`
    : '';

  return `# ${page.data.title}

URL: ${new URL(page.url, site.url)}${description}

${processed}`;
}
