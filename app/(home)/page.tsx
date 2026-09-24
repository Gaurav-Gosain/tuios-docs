import {
  ArrowRight,
  Bot,
  Keyboard,
  LayoutDashboard,
  Network,
  ServerCog,
  SquareTerminal,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ReleaseTag } from "@/components/article/release-tag";
import { Wordmark } from "@/components/brand";
import { InstallTabs } from "@/components/home/install-tabs";
import { JsonLd, personLd } from "@/components/json-ld";
import { HeroTilly } from "@/components/tilly-3d/tilly-3d";
import { installMethods } from "@/lib/install-methods";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, site } from "@/lib/site";
import {
  formatShortDate,
  getBlogPosts,
  getReleases,
  getReleaseTag,
} from "@/lib/source";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

export default function HomePage() {
  const releases = getReleases();
  const latestTagged = releases.find((release) => getReleaseTag(release));
  const newestNote = releases[0];
  const posts = getBlogPosts().slice(0, 3);
  const latestTag = latestTagged ? getReleaseTag(latestTagged) : null;

  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            description: site.description,
            inLanguage: "en",
          },
          {
            "@type": "SoftwareApplication",
            name: site.name,
            alternateName: "Terminal UI Operating System",
            description: site.description,
            url: site.url,
            image: absoluteUrl(site.image),
            screenshot: absoluteUrl("/demo-poster.jpg"),
            applicationCategory: "DeveloperApplication",
            applicationSubCategory: "Terminal multiplexer",
            operatingSystem: "Linux, macOS, Windows, FreeBSD",
            ...(latestTag
              ? {
                  softwareVersion: latestTag.replace(/^v/, ""),
                  releaseNotes: absoluteUrl(latestTagged?.url ?? "/releases"),
                }
              : {}),
            license: "https://opensource.org/licenses/MIT",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: personLd(),
            downloadUrl: `${site.repository}/releases`,
            installUrl: absoluteUrl("/docs/getting-started"),
            softwareHelp: {
              "@type": "CreativeWork",
              url: absoluteUrl("/docs"),
            },
            sameAs: [site.repository],
            potentialAction: installMethods.map((method) => ({
              "@type": "InstallAction",
              name: `Install with ${method.label}`,
              description: method.command,
            })),
          },
          {
            "@type": "SoftwareSourceCode",
            name: site.name,
            codeRepository: site.repository,
            programmingLanguage: "Go",
            license: "https://opensource.org/licenses/MIT",
            author: personLd(),
            targetProduct: { "@type": "SoftwareApplication", name: site.name },
          },
        ]}
      />
      <section className="hero-wash">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-14 text-center md:px-6 md:pt-20">
          {newestNote ? (
            <Link
              href={newestNote.url}
              className="fade-up group mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-fd-border bg-fd-card/70 py-1 pr-3 pl-1 text-sm backdrop-blur transition-colors hover:border-fd-primary/50"
            >
              <span className="shrink-0 rounded-full bg-fd-primary px-2 py-0.5 font-mono text-fd-primary-foreground text-xs">
                New
              </span>
              <span className="truncate text-fd-muted-foreground group-hover:text-fd-foreground">
                {newestNote.data.title}
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}

          <HeroLogo />

          <h1 className="fade-up mt-8 max-w-3xl font-bold text-3xl text-fd-foreground leading-tight [animation-delay:80ms] sm:text-4xl md:text-5xl">
            A window manager for your terminal
          </h1>
          <p className="fade-up mt-5 max-w-2xl text-fd-muted-foreground text-lg leading-relaxed [animation-delay:140ms]">
            Open panes, tile them, and switch between nine workspaces without
            leaving the terminal you already use. A daemon keeps your sessions
            running when you detach, reaches your other machines, and shows what
            the coding agents in your panes are doing.
          </p>

          <div className="fade-up mt-8 flex w-full flex-col items-center justify-center gap-3 [animation-delay:200ms] sm:w-auto sm:flex-row">
            <Link
              href="/docs/getting-started"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 font-medium font-mono text-fd-primary-foreground text-sm shadow-sm transition-opacity hover:opacity-90 sm:w-auto"
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/learn"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-fd-primary/40 bg-fd-primary/10 px-5 py-2.5 font-medium font-mono text-fd-foreground text-sm transition-colors hover:border-fd-primary sm:w-auto"
            >
              <Keyboard className="size-4 text-fd-primary" />
              Try it in your browser
              <span className="rounded bg-fd-primary/15 px-1.5 py-0.5 text-fd-primary text-xs">
                5 min
              </span>
            </Link>
            <a
              href="https://github.com/Gaurav-Gosain/tuios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg border border-fd-border bg-fd-background/60 px-5 py-2.5 font-medium font-mono text-fd-foreground text-sm transition-colors hover:border-fd-primary/50 hover:text-fd-primary sm:w-auto"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="fade-up mx-auto mt-12 w-full max-w-5xl px-4 [animation-delay:260ms] md:mt-16 md:px-6">
          <div className="overflow-hidden rounded-xl border border-fd-border bg-[#11111b] shadow-2xl shadow-fd-primary/10">
            <video
              className="block aspect-video w-full"
              src="/demo.mp4"
              poster="/demo-poster.jpg"
              width={1280}
              height={720}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="A recording of tuios with tiled and floating terminal windows"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-24 md:px-6 md:pt-32">
        <SectionHeading
          eyebrow="What it does"
          title="Everything a multiplexer does, drawn like a desktop"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Keyboard />}
            title="Keyboard first"
            href="/docs/keybindings"
          >
            Window mode moves and resizes panes. Terminal mode sends every key
            to the program in the pane. Every binding can be changed in the
            config.
          </Feature>
          <Feature
            icon={<LayoutDashboard />}
            title="Tiling or floating"
            href="/docs/bsp-tiling"
          >
            BSP tiling with preselection, master-stack and scrolling layouts.
            Turn tiling off and drag windows around with the mouse instead.
          </Feature>
          <Feature
            icon={<ServerCog />}
            title="Sessions that stay"
            href="/docs/sessions"
          >
            A daemon owns the panes. Detach, close the terminal, and attach
            again later from this machine or over SSH.
          </Feature>
          <Feature
            icon={<Network />}
            title="Other machines"
            href="/docs/remote-hosts"
          >
            Name a host once with <code>tuios hosts add</code>. Then attach to
            its sessions in this client, or run a single pane on it.
          </Feature>
          <Feature
            icon={<Bot />}
            title="Built for coding agents"
            href="/docs/agents"
          >
            Panes running an agent show whether it is working, idle or waiting
            for you. Agents can message each other and fan out across git
            worktrees.
          </Feature>
          <Feature
            icon={<SquareTerminal />}
            title="Scriptable"
            href="/docs/control-protocol"
          >
            Drive a session from outside with <code>send-keys</code>,{" "}
            <code>capture-pane</code> and a JSON control protocol, or replay a
            tape script.
          </Feature>
        </div>
        <p className="mt-8 text-center text-fd-muted-foreground text-sm leading-relaxed">
          Also: kitty graphics passthrough, a vim-style copy mode, a command
          palette, 340+ themes, and a{" "}
          <Link
            href="/docs/web"
            className="text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary"
          >
            browser terminal
          </Link>
          .
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-24 md:px-6 md:pt-32">
        <SectionHeading
          eyebrow="Get started"
          title="Install it, run it, press n"
        />
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex min-w-0 flex-col gap-6">
            <Step n={1} title="Install">
              <InstallTabs className="mt-3" />
            </Step>
            <Step n={2} title="Start a session">
              <p className="mt-1 text-fd-muted-foreground text-sm leading-relaxed">
                Run <code>tuios</code>. It starts the daemon if it is not
                running and attaches you to a session.
              </p>
            </Step>
            <Step n={3} title="Learn five keys">
              <p className="mt-1 text-fd-muted-foreground text-sm leading-relaxed">
                The table has the ones you need on day one. The{" "}
                <Link
                  href="/docs/keybindings"
                  className="text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary"
                >
                  keybindings page
                </Link>{" "}
                lists the rest, or run <code>tuios keybinds list</code>. Or{" "}
                <Link
                  href="/learn"
                  className="text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary"
                >
                  learn them hands on
                </Link>
                , in your browser, before you install anything.
              </p>
            </Step>
          </div>

          <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
            <p className="border-fd-border border-b px-5 py-3 font-mono text-fd-muted-foreground text-xs">
              default keys
            </p>
            <dl className="divide-y divide-fd-border text-sm">
              <KeyRow keys={[["n"]]} action="New window" />
              <KeyRow keys={[["i"], ["Enter"]]} action="Enter terminal mode" />
              <KeyRow keys={[["Ctrl+B", "Esc"]]} action="Back to window mode" />
              <KeyRow keys={[["t"]]} action="Toggle tiling" />
              <KeyRow keys={[["Ctrl+P"]]} action="Command palette" />
              <KeyRow keys={[["Ctrl+B", "d"]]} action="Detach, keep running" />
              <KeyRow keys={[["?"]]} action="Help" />
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-24 pb-24 md:px-6 md:pt-32">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <ListHeading title="From the blog" href="/blog" more="All posts" />
            <ul className="mt-4 divide-y divide-fd-border border-fd-border border-y">
              {posts.map((post) => (
                <li key={post.url}>
                  <Link href={post.url} className="group block py-5">
                    <time
                      dateTime={post.data.date}
                      className="font-mono text-fd-muted-foreground text-xs"
                    >
                      {formatShortDate(post.data.date)}
                    </time>
                    <p className="mt-1.5 font-medium font-mono text-fd-foreground leading-snug transition-colors group-hover:text-fd-primary">
                      {post.data.title}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-fd-muted-foreground text-sm leading-relaxed">
                      {post.data.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ListHeading
              title="Releases"
              href="/releases"
              more="All releases"
            />
            <ul className="mt-4 divide-y divide-fd-border border-fd-border border-y">
              {releases.slice(0, 3).map((release) => (
                <li key={release.url}>
                  <Link href={release.url} className="group block py-5">
                    <span className="flex flex-wrap items-center gap-2">
                      <time
                        dateTime={release.data.date}
                        className="font-mono text-fd-muted-foreground text-xs"
                      >
                        {formatShortDate(release.data.date)}
                      </time>
                      <ReleaseTag
                        tag={getReleaseTag(release)}
                        title={release.data.title}
                        latest={latestTagged?.url === release.url}
                      />
                    </span>
                    <p className="mt-1.5 font-medium font-mono text-fd-foreground leading-snug transition-colors group-hover:text-fd-primary">
                      {release.data.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * The logo at the size of a heading: Tilly, resting, and the wordmark. Tilly
 * is the live figure from the Learn page, so it bobs and blinks.
 */
function HeroLogo() {
  return (
    <div className="fade-up flex items-center gap-3 text-[var(--brand-ink)] [animation-delay:40ms] sm:gap-5">
      <HeroTilly className="size-20 sm:size-28" />
      <Wordmark className="h-12 w-auto sm:h-[4.5rem]" height={72} />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="font-mono text-fd-primary text-sm">{eyebrow}</p>
      <h2 className="mt-3 font-bold text-2xl text-fd-foreground md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function Feature({
  icon,
  title,
  href,
  children,
}: {
  icon: ReactNode;
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-fd-primary/50 [&_code]:rounded [&_code]:bg-fd-accent/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8125rem]"
    >
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary [&_svg]:size-4.5">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold text-fd-foreground">{title}</h3>
      <p className="mt-2 text-fd-muted-foreground text-sm leading-relaxed">
        {children}
      </p>
    </Link>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 [&_p_code]:rounded [&_p_code]:bg-fd-accent/60 [&_p_code]:px-1 [&_p_code]:py-0.5 [&_p_code]:text-[0.8125rem] [&_p_code]:text-fd-foreground">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-fd-border bg-fd-card font-mono text-fd-muted-foreground text-xs">
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="font-semibold text-fd-foreground">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function KeyRow({ keys, action }: { keys: string[][]; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <dt className="flex flex-wrap items-center gap-1.5">
        {keys.map((combo, index) => (
          <span
            key={combo.join(" ")}
            className="inline-flex items-center gap-1.5"
          >
            {index > 0 ? (
              <span className="text-fd-muted-foreground text-xs">or</span>
            ) : null}
            {combo.map((key, keyIndex) => (
              <span key={key} className="inline-flex items-center gap-1">
                {keyIndex > 0 ? (
                  <span className="text-fd-muted-foreground text-xs">then</span>
                ) : null}
                <kbd className="keycap">{key}</kbd>
              </span>
            ))}
          </span>
        ))}
      </dt>
      <dd className="m-0 text-right text-fd-muted-foreground">{action}</dd>
    </div>
  );
}

function ListHeading({
  title,
  href,
  more,
}: {
  title: string;
  href: string;
  more: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-bold text-fd-foreground text-xl">{title}</h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 font-mono text-fd-muted-foreground text-sm transition-colors hover:text-fd-primary"
      >
        {more}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
