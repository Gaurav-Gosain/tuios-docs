import { buildBrandKit } from "@/lib/brand-kit";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Every file the brand page lists, and the terms for using them, as one zip.
 * Built from public/ during the static export, so the zip always holds the
 * files the page links to.
 */
export function GET() {
  return new Response(buildBrandKit(), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="tuios-brand-kit.zip"',
    },
  });
}
