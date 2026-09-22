import { getDocsInSidebarOrder, getLLMText } from '@/lib/source';

export const dynamic = 'force-static';
export const revalidate = false;

/** Every docs page as one text file, in sidebar order. */
export async function GET() {
  const scanned = await Promise.all(
    getDocsInSidebarOrder().map(({ page }) => getLLMText(page)),
  );

  return new Response(scanned.join('\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
