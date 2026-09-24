import { ogImage } from "@/lib/og";

export const revalidate = false;

/** The social card for the brand page. */
export function GET() {
  return ogImage({
    kind: "Brand",
    title: "The tuios logo, Tilly, colours and downloads",
    description:
      "The mark and lockups, the Catppuccin palette, the type, and every file in the brand kit.",
  });
}
