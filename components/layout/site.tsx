import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";
import { SiteFooter } from "./site-footer";

/**
 * The layout outside the docs: the top navigation bar, the page, and the site
 * footer. Used by the landing page, the blog and the release notes.
 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()}>
      {children}
      <SiteFooter />
    </HomeLayout>
  );
}
