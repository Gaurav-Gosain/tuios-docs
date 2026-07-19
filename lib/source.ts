import { blog, docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

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

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
