import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BrandLockup } from "@/components/brand";
import { ThemeSwitch } from "@/components/site-themes/theme-switch";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandLockup size={26} />,
    },
    themeSwitch: { component: <ThemeSwitch /> },
    githubUrl: "https://github.com/Gaurav-Gosain/tuios",
    links: [
      {
        text: "Documentation",
        url: "/docs",
        active: "nested-url",
      },
      {
        text: "Learn",
        url: "/learn",
        active: "nested-url",
      },
      {
        text: "Blog",
        url: "/blog",
        active: "nested-url",
      },
      {
        text: "Releases",
        url: "/releases",
        active: "nested-url",
      },
      {
        text: "Gallery",
        url: "/gallery",
        active: "nested-url",
      },
    ],
  };
}
