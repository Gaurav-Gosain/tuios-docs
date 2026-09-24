import Link from "next/link";
import { BrandLockup } from "@/components/brand";

const columns = [
  {
    title: "Docs",
    links: [
      { text: "Getting started", href: "/docs/getting-started" },
      { text: "Keybindings", href: "/docs/keybindings" },
      { text: "Configuration", href: "/docs/configuration" },
      { text: "CLI reference", href: "/docs/cli-reference" },
    ],
  },
  {
    title: "Project",
    links: [
      { text: "Blog", href: "/blog" },
      { text: "Releases", href: "/releases" },
      { text: "Contributing", href: "/docs/contributing" },
      { text: "Brand and logo", href: "/brand" },
      { text: "Blog RSS feed", href: "/blog/rss.xml" },
      { text: "llms.txt", href: "/llms.txt" },
      { text: "llms-full.txt", href: "/llms-full.txt" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { text: "GitHub", href: "https://github.com/Gaurav-Gosain/tuios" },
      {
        text: "Issues",
        href: "https://github.com/Gaurav-Gosain/tuios/issues",
      },
      {
        text: "Release downloads",
        href: "https://github.com/Gaurav-Gosain/tuios/releases",
      },
    ],
  },
];

/** Footer for the landing page, the blog and the release notes. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-fd-border border-t">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center">
            <BrandLockup size={26} />
          </Link>
          <p className="mt-3 max-w-60 text-fd-muted-foreground text-sm leading-relaxed">
            A terminal window manager that knows what your agents are doing.
            MIT licensed.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-3 font-medium text-fd-muted-foreground text-xs uppercase tracking-wider">
              {column.title}
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fd-foreground/80 transition-colors hover:text-fd-primary"
                    >
                      {link.text}
                    </a>
                  ) : /\.(xml|txt)$/.test(link.href) ? (
                    // A feed or text file, not a page the router can render.
                    <a
                      href={link.href}
                      className="text-fd-foreground/80 transition-colors hover:text-fd-primary"
                    >
                      {link.text}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-fd-foreground/80 transition-colors hover:text-fd-primary"
                    >
                      {link.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
