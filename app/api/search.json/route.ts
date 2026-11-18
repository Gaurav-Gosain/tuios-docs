import { createFromSource } from "fumadocs-core/search/server";
import reference from "@/lib/reference/pages.json";
import { source } from "@/lib/source";

export const revalidate = false;

// The reference pages written from the tuios docs (scripts/reference-docs.mjs)
// hold most of the text of the site. With their text the index was 33 MB,
// over the 25 MiB a Workers asset may be. The index takes their headings,
// which name every command, option, key and verb, and leaves out their text.
const headingsOnly = (url: string) =>
  reference.some(
    (slug) => url === `/docs/${slug}` || url.startsWith(`/docs/${slug}/`),
  );

type Page = ReturnType<typeof source.getPages>[number];
type Structured = { headings: unknown[]; contents: unknown[] };

function trim(page: Page): Page {
  if (!headingsOnly(page.url)) return page;
  const data = page.data as unknown as Record<string, unknown>;
  if ("structuredData" in data) {
    const s = data.structuredData as Structured;
    return {
      ...page,
      data: { ...page.data, structuredData: { ...s, contents: [] } },
    } as Page;
  }
  const load = data.load as
    | (() => Promise<Record<string, unknown>>)
    | undefined;
  if (!load) return page;
  return {
    ...page,
    data: {
      ...page.data,
      load: async () => {
        const loaded = await load();
        const s = loaded.structuredData as Structured;
        return { ...loaded, structuredData: { ...s, contents: [] } };
      },
    },
  } as Page;
}

const indexed = {
  ...source,
  getPages: (...args: Parameters<typeof source.getPages>) =>
    source.getPages(...args).map(trim),
  getPageTree: source.getPageTree.bind(source),
} as typeof source;

export const { staticGET: GET } = createFromSource(indexed);
