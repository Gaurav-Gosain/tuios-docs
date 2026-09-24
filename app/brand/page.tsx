import { ArrowDown, Check, Download, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand";
import { CopyButton } from "@/components/brand-page/copy-button";
import { TillyLarge, TillyMoods } from "@/components/brand-page/tilly-moods";
import { breadcrumbLd, JsonLd } from "@/components/json-ld";
import {
  type BrandFile,
  type DownloadItem,
  downloads,
  kitPath,
  palette,
  tagline,
  terms,
} from "@/lib/brand";
import { buildBrandKit, fileSize, formatBytes } from "@/lib/brand-kit";
import { pageMetadata } from "@/lib/metadata";
import { absoluteUrl, site } from "@/lib/site";

const description =
  "The tuios logo, Tilly the mascot, the Catppuccin colours and the type, with every logo file to download and the terms for using them.";

export const metadata: Metadata = pageMetadata({
  title: "Brand",
  cardTitle: "The tuios brand: logo, Tilly, colours and downloads",
  description,
  path: "/brand",
  image: "/og/brand/image.png",
});

/** Mocha Base and Latte Base, the backgrounds the logo files are made for. */
const DARK = "#1e1e2e";
const LIGHT = "#eff1f5";

const sections = [
  { id: "tilly", label: "Tilly" },
  { id: "logo", label: "Logo" },
  { id: "colours", label: "Colours" },
  { id: "type", label: "Type" },
  { id: "downloads", label: "Downloads" },
  { id: "terms", label: "Terms" },
];

export default function BrandPage() {
  const kitSize = formatBytes(buildBrandKit().length);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-24 md:px-6 md:pt-20">
      <JsonLd
        data={[
          {
            "@type": "WebPage",
            name: "Brand",
            description,
            url: absoluteUrl("/brand"),
            inLanguage: "en",
            about: { "@type": "SoftwareApplication", name: site.name },
          },
          breadcrumbLd([
            { name: site.name, path: "/" },
            { name: "Brand", path: "/brand" },
          ]),
        ]}
      />

      <header className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="mb-3 font-mono text-fd-primary text-sm">Brand</p>
          <h1 className="font-bold text-3xl text-fd-foreground leading-tight md:text-4xl">
            {tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-fd-muted-foreground text-lg leading-relaxed">
            tuios is a terminal window manager. It opens panes, tiles them and
            keeps nine workspaces inside the terminal you already use. A daemon
            keeps sessions running when you detach, and the panes that run a
            coding agent show whether it is working, idle or waiting for you.
            This page has the logo, the mascot and the colours, and the files to
            use when you write about it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={kitPath}
              download
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 font-medium font-mono text-fd-primary-foreground text-sm shadow-sm transition-opacity hover:opacity-90"
            >
              <Download className="size-4" />
              Download the kit
              <span className="opacity-80">zip, {kitSize}</span>
            </a>
            <a
              href="#terms"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 font-medium font-mono text-fd-foreground text-sm transition-colors hover:border-fd-primary/50 hover:text-fd-primary"
            >
              Terms of use
              <ArrowDown className="size-4" />
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 rounded-2xl border border-fd-border bg-fd-card px-6 py-10 text-[var(--brand-ink)]">
          <TillyLarge className="size-24 sm:size-32" />
          <Wordmark className="h-14 w-auto sm:h-20" height={80} />
        </div>
      </header>

      <nav
        aria-label="On this page"
        className="mt-12 flex flex-wrap gap-2 border-fd-border border-y py-4"
      >
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-fd-border px-3 py-1 font-mono text-fd-muted-foreground text-sm transition-colors hover:border-fd-primary/50 hover:text-fd-foreground"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <Section
        id="tilly"
        eyebrow="Mascot"
        title="Tilly"
        intro="Tilly is a small CRT monitor whose screen face is a tiled window layout: two panes on top are the eyes, a wide pane below holds a >_ prompt for a mouth, and the focused pane has a blue border. Tilly guides the Learn tour and stands for tuios wherever a friendly face fits better than a logo."
      >
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center rounded-2xl bg-[#1e1e2e] p-8 md:p-10">
            <TillyLarge className="size-48 sm:size-56" />
          </div>
          <div className="text-sm leading-relaxed">
            <h3 className="font-semibold text-base text-fd-foreground">
              Using Tilly
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-fd-muted-foreground">
              <Rule ok>
                Use Tilly for friendly, informal places: a talk slide, a
                sticker, a blog post header, a tutorial.
              </Rule>
              <Rule ok>
                Pick the mood that fits the moment. Idle is the default.
              </Rule>
              <Rule ok>
                Tilly keeps the same colours on dark and light backgrounds.
              </Rule>
              <Rule>
                Do not redraw Tilly, change the colours, or give Tilly new
                clothes, props or words in a speech bubble that the project did
                not write.
              </Rule>
              <Rule>
                Do not put Tilly next to another project's logo as if tuios
                endorsed it.
              </Rule>
            </ul>
            <p className="mt-4 text-fd-muted-foreground">
              Meet Tilly in the{" "}
              <Link href="/learn" className={linkClass}>
                Learn tour
              </Link>
              . Click any Tilly on this page to play a move.
            </p>
          </div>
        </div>
        <h3 className="mt-12 mb-4 font-semibold text-fd-foreground">Moods</h3>
        <TillyMoods />
      </Section>

      <Section
        id="logo"
        eyebrow="Logo"
        title="Mark, wordmark and lockups"
        intro="The mark is Tilly. The wordmark is tuios in lowercase, set in Fredoka SemiBold. The lockups put the two together. Every file comes in a version for dark backgrounds and one for light."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Tile bg={DARK} caption="Mark on Mocha Base">
            <Img src="/brand/mark.svg" className="h-32" />
          </Tile>
          <Tile bg={LIGHT} caption="Mark on Latte Base">
            <Img src="/brand/mark.svg" className="h-32" />
          </Tile>
          <Tile bg={DARK} caption="Wordmark for dark backgrounds">
            <Img src="/brand/wordmark-dark.svg" className="h-20" />
          </Tile>
          <Tile bg={LIGHT} caption="Wordmark for light backgrounds">
            <Img src="/brand/wordmark-light.svg" className="h-20" />
          </Tile>
          <Tile bg={DARK} caption="Horizontal lockup, dark">
            <Img src="/brand/lockup-horizontal-dark.svg" className="h-28" />
          </Tile>
          <Tile bg={LIGHT} caption="Horizontal lockup, light">
            <Img src="/brand/lockup-horizontal-light.svg" className="h-28" />
          </Tile>
          <Tile bg={DARK} caption="Stacked lockup, dark">
            <Img src="/brand/lockup-stacked-dark.svg" className="h-40" />
          </Tile>
          <Tile bg={LIGHT} caption="Stacked lockup, light">
            <Img src="/brand/lockup-stacked-light.svg" className="h-40" />
          </Tile>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold text-fd-foreground">Clear space</h3>
            <p className="mt-2 text-fd-muted-foreground text-sm leading-relaxed">
              Keep a margin around the logo of at least one quarter of the
              mark&apos;s height, marked x. The lockup files already include it,
              so place them edge to edge with other content.
            </p>
            <figure className="mt-4">
              <div
                className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-fd-border border-dashed"
                style={{ background: DARK }}
              >
                <Img
                  src="/brand/lockup-horizontal-dark.svg"
                  className="w-full"
                />
                <div
                  aria-hidden
                  className="absolute rounded-sm border border-[#cba6f7]/70 border-dashed"
                  style={{
                    inset: `${(60 / 360) * 100}% ${(60 / 678) * 100}%`,
                  }}
                />
                <span
                  aria-hidden
                  className="absolute top-0 left-1/2 flex -translate-x-1/2 items-center font-mono text-[#cba6f7] text-xs"
                  style={{ height: `${(60 / 360) * 100}%` }}
                >
                  x
                </span>
                <span
                  aria-hidden
                  className="absolute top-1/2 left-0 flex -translate-y-1/2 justify-center font-mono text-[#cba6f7] text-xs"
                  style={{ width: `${(60 / 678) * 100}%` }}
                >
                  x
                </span>
              </div>
              <figcaption className="mt-2 text-center text-fd-muted-foreground text-xs">
                x = one quarter of the mark&apos;s height
              </figcaption>
            </figure>
          </div>
          <div>
            <h3 className="font-semibold text-fd-foreground">Minimum size</h3>
            <p className="mt-2 text-fd-muted-foreground text-sm leading-relaxed">
              Below 48 px the full body gets too small to read, so each size has
              its own drawing. Use the one made for the size you need.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SizeCard label="Full mark" size="48 px and up">
                <Img src="/brand/mark.svg" className="size-12" />
              </SizeCard>
              <SizeCard label="32 px mark" size="24 to 47 px">
                <Img src="/brand/mark-32.svg" className="size-8" />
              </SizeCard>
              <SizeCard label="16 px mark" size="16 to 23 px">
                <Img src="/brand/mark-16.svg" className="size-4" />
              </SizeCard>
              <SizeCard label="Lockup" size="24 px tall and up">
                <span className="inline-flex items-center gap-1.5 text-[#cdd6f4]">
                  <Img src="/brand/mark-32.svg" className="size-6" />
                  <Wordmark height={16} />
                </span>
              </SizeCard>
            </ul>
          </div>
        </div>

        <h3 className="mt-12 font-semibold text-fd-foreground">
          Do and do not
        </h3>
        <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Example ok bg={DARK} text="Dark files on dark backgrounds">
            <Img src="/brand/lockup-horizontal-dark.svg" className="h-16" />
          </Example>
          <Example ok bg={LIGHT} text="Light files on light backgrounds">
            <Img src="/brand/lockup-horizontal-light.svg" className="h-16" />
          </Example>
          <Example bg={DARK} text="Do not change the colours">
            <Img
              src="/brand/lockup-horizontal-dark.svg"
              className="h-16 hue-rotate-[150deg]"
            />
          </Example>
          <Example bg={DARK} text="Do not stretch or squash">
            <Img
              src="/brand/lockup-horizontal-dark.svg"
              className="h-16 scale-x-[1.45] scale-y-75"
            />
          </Example>
          <Example bg={DARK} text="Do not add shadows or effects">
            <Img
              src="/brand/lockup-horizontal-dark.svg"
              className="h-16 -rotate-6 drop-shadow-[0_0_10px_#f9e2af]"
            />
          </Example>
          <Example bg={LIGHT} text="Do not use a file on the wrong background">
            <Img src="/brand/lockup-horizontal-dark.svg" className="h-16" />
          </Example>
        </ul>
      </Section>

      <Section
        id="colours"
        eyebrow="Colours"
        title="Catppuccin, with mauve as the accent"
        intro="tuios uses the Catppuccin palette: Mocha for dark backgrounds and Latte for light ones. These are the values the logo files, the social cards and this site use. Click a copy button to copy the hex value."
      >
        <div className="flex flex-col gap-10">
          {palette.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-fd-foreground">
                {group.title}
              </h3>
              <p className="mt-1 text-fd-muted-foreground text-sm">
                {group.blurb}
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {group.swatches.map((swatch) => (
                  <li
                    key={`${group.title}-${swatch.name}`}
                    className="overflow-hidden rounded-xl border border-fd-border bg-fd-card"
                  >
                    <div
                      className="h-16 border-fd-border border-b"
                      style={{ background: swatch.hex }}
                    />
                    <div className="flex items-start justify-between gap-1 p-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-fd-foreground text-sm">
                          {swatch.name}
                        </p>
                        <p className="font-mono text-fd-muted-foreground text-xs">
                          {swatch.hex}
                        </p>
                        {swatch.note ? (
                          <p className="mt-1 text-fd-muted-foreground text-xs">
                            {swatch.note}
                          </p>
                        ) : null}
                      </div>
                      <CopyButton
                        value={swatch.hex}
                        label={`Copy ${swatch.name} ${swatch.hex}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-fd-muted-foreground text-sm">
          Catppuccin is by the{" "}
          <a
            href="https://catppuccin.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Catppuccin project
          </a>
          , under the MIT licence.
        </p>
      </Section>

      <Section
        id="type"
        eyebrow="Type"
        title="Fonts"
        intro="One face for the wordmark and two for this site. All of them are free to use."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <TypeCard
            name="Fredoka SemiBold"
            use="The wordmark, and the titles on social cards"
            licence="SIL Open Font License 1.1"
            href="https://fonts.google.com/specimen/Fredoka"
            specimen={
              <span className="text-[var(--brand-ink)]">
                <Wordmark height={56} />
              </span>
            }
          >
            The wordmark files are outlines, so you do not need the font to use
            them. Use Fredoka for a title that sits next to the logo.
          </TypeCard>
          <TypeCard
            name="Monaspace Neon"
            use="Headings, navigation, code and keys on this site"
            licence="SIL Open Font License 1.1"
            href="https://github.com/githubnext/monaspace"
            specimen={
              <span className="font-mono text-3xl text-fd-foreground">
                tuios ls -a
              </span>
            }
          >
            A monospace face by GitHub Next. It ties the site to the terminal.
          </TypeCard>
          <TypeCard
            name="System sans-serif"
            use="Running text on this site"
            licence="The reader's own system font"
            specimen={
              <span className="font-sans text-3xl text-fd-foreground">
                Panes and agents
              </span>
            }
          >
            Long text reads faster in the sans-serif face of the reader&apos;s
            device, so the site ships no font for it.
          </TypeCard>
        </div>
      </Section>

      <Section
        id="downloads"
        eyebrow="Downloads"
        title="The brand kit"
        intro="Every file, as it is served here. Use the SVG where you can and the PNG where you cannot. The zip has all of them and the terms below."
      >
        <a
          href={kitPath}
          download
          className="flex items-center justify-between gap-4 rounded-xl border border-fd-primary/40 bg-fd-primary/10 p-5 transition-colors hover:border-fd-primary"
        >
          <span>
            <span className="block font-medium font-mono text-fd-foreground">
              tuios-brand-kit.zip
            </span>
            <span className="text-fd-muted-foreground text-sm">
              Every file on this page and the terms, {kitSize}
            </span>
          </span>
          <Download className="size-5 shrink-0 text-fd-primary" />
        </a>
        <div className="mt-8 flex flex-col gap-10">
          {downloads.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-fd-foreground">
                {group.title}
              </h3>
              <ul className="mt-3 divide-y divide-fd-border border-fd-border border-y">
                {group.items.map((item) => (
                  <DownloadRow key={item.name} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="terms"
        eyebrow="Terms"
        title="Using the logo and Tilly"
        intro={terms.intro}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-fd-border bg-fd-card p-5">
            <h3 className="font-semibold text-fd-foreground">You may</h3>
            <ul className="mt-3 flex flex-col gap-2 text-fd-muted-foreground text-sm leading-relaxed">
              {terms.allowed.map((line) => (
                <Rule key={line} ok>
                  {line}
                </Rule>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-fd-border bg-fd-card p-5">
            <h3 className="font-semibold text-fd-foreground">Not allowed</h3>
            <ul className="mt-3 flex flex-col gap-2 text-fd-muted-foreground text-sm leading-relaxed">
              {terms.notAllowed.map((line) => (
                <Rule key={line}>{line}</Rule>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-fd-foreground leading-relaxed">
          {terms.ask}{" "}
          <a
            href={`${site.repository}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Open an issue on GitHub
          </a>{" "}
          to ask.
        </p>
        <p className="mt-3 max-w-3xl text-fd-muted-foreground text-sm leading-relaxed">
          {terms.fonts}
        </p>
      </Section>
    </div>
  );
}

const linkClass =
  "text-fd-foreground underline decoration-fd-primary/50 underline-offset-4 hover:decoration-fd-primary";

function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 pt-20 md:pt-24">
      <p className="font-mono text-fd-primary text-sm">{eyebrow}</p>
      <h2 className="mt-2 font-bold text-2xl text-fd-foreground md:text-3xl">
        {title}
      </h2>
      <p className="mt-3 mb-8 max-w-3xl text-fd-muted-foreground leading-relaxed">
        {intro}
      </p>
      {children}
    </section>
  );
}

/** A static image from public/. The files are SVG or small PNG, so no loader. */
function Img({ src, className }: { src: string; className?: string }) {
  return (
    // biome-ignore lint/performance/noImgElement: static files in a static export
    <img src={src} alt="" className={`block max-w-full ${className ?? ""}`} />
  );
}

function Tile({
  bg,
  caption,
  children,
}: {
  bg: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-fd-border">
      <div
        className="flex min-h-48 items-center justify-center p-6"
        style={{ background: bg }}
      >
        {children}
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-fd-border border-t bg-fd-card px-4 py-2.5 text-fd-muted-foreground text-xs">
        <span>{caption}</span>
        <span className="font-mono">{bg}</span>
      </figcaption>
    </figure>
  );
}

function SizeCard({
  label,
  size,
  children,
}: {
  label: string;
  size: string;
  children: ReactNode;
}) {
  return (
    <li className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div
        className="flex h-20 items-center justify-center"
        style={{ background: DARK }}
      >
        {children}
      </div>
      <div className="p-2.5 text-xs">
        <p className="font-medium text-fd-foreground">{label}</p>
        <p className="text-fd-muted-foreground">{size}</p>
      </div>
    </li>
  );
}

function Rule({ ok = false, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <li className="flex gap-2">
      {ok ? (
        <Check className="mt-0.5 size-4 shrink-0 text-[#40a02b] dark:text-[#a6e3a1]" />
      ) : (
        <X className="mt-0.5 size-4 shrink-0 text-[#d20f39] dark:text-[#f38ba8]" />
      )}
      <span>{children}</span>
    </li>
  );
}

function Example({
  ok = false,
  bg,
  text,
  children,
}: {
  ok?: boolean;
  bg: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <li className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div
        className="flex h-28 items-center justify-center overflow-hidden px-4"
        style={{ background: bg }}
      >
        {children}
      </div>
      <p className="flex items-start gap-2 border-fd-border border-t px-3 py-2.5 text-fd-foreground text-xs sm:text-sm">
        {ok ? (
          <Check className="mt-0.5 size-4 shrink-0 text-[#40a02b] dark:text-[#a6e3a1]" />
        ) : (
          <X className="mt-0.5 size-4 shrink-0 text-[#d20f39] dark:text-[#f38ba8]" />
        )}
        {text}
      </p>
    </li>
  );
}

function TypeCard({
  name,
  use,
  licence,
  href,
  specimen,
  children,
}: {
  name: string;
  use: string;
  licence: string;
  href?: string;
  specimen: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex h-28 items-center border-fd-border border-b px-5">
        {specimen}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 text-sm">
        <p className="font-semibold text-base text-fd-foreground">{name}</p>
        <p className="text-fd-muted-foreground">{use}</p>
        <p className="text-fd-muted-foreground leading-relaxed">{children}</p>
        <p className="mt-auto pt-2 font-mono text-fd-foreground text-xs">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {licence}
            </a>
          ) : (
            licence
          )}
        </p>
      </div>
    </div>
  );
}

/** The background a preview of `file` needs: light for the light variants. */
function previewBg(file: BrandFile) {
  return file.path.includes("-light") ? LIGHT : DARK;
}

function DownloadRow({ item }: { item: DownloadItem }) {
  const preview = item.files[0];
  return (
    <li className="grid gap-4 py-4 sm:grid-cols-[6rem_1fr_auto] sm:items-center">
      <div
        className="hidden h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-fd-border p-2 sm:flex"
        style={{ background: previewBg(preview) }}
      >
        <Img src={preview.path} className="max-h-full" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-fd-foreground">{item.name}</p>
        <p className="mt-0.5 text-fd-muted-foreground text-sm">{item.detail}</p>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {item.files.map((file) => (
          <a
            key={file.path}
            href={file.path}
            download
            className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1.5 font-mono text-fd-foreground text-xs transition-colors hover:border-fd-primary/50 hover:text-fd-primary"
          >
            <Download className="size-3.5" />
            {file.format}
            {file.size ? (
              <span className="text-fd-muted-foreground">{file.size}</span>
            ) : null}
            <span className="border-fd-border border-l pl-1.5 text-fd-muted-foreground">
              {fileSize(file.path)}
            </span>
          </a>
        ))}
      </div>
    </li>
  );
}
