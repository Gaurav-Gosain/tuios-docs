import type { Metadata } from "next";
import { ExplodedHero } from "@/components/home/exploded-hero";
import { Landing } from "@/components/home/landing";

/**
 * A preview of the landing page with the exploded view in place of the
 * screenshot tabs. Not linked, not in the sitemap, and not indexed, until
 * the view replaces the tabs on the live page.
 */
export const metadata: Metadata = {
  title: "Landing preview",
  robots: { index: false, follow: false },
};

export default function ExplodedHeroPreview() {
  return <Landing hero={<ExplodedHero />} />;
}
