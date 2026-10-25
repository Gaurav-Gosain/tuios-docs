import { cn } from "@/lib/cn";

/**
 * The width a shot is drawn at, as an img `sizes` value. The browser picks
 * the smallest file at least this wide for the screen's pixel density.
 * Measured on the built pages: the docs column is 834 px wide at most, and a
 * blog post's is 702 px from 1280 px up. Below that, each takes most of the
 * window.
 */
export const SHOT_SIZES = {
  docs: "(min-width: 1280px) min(calc(100vw - 602px), 834px), (min-width: 768px) min(calc(100vw - 318px), 850px), calc(100vw - 34px)",
  blog: "(min-width: 1280px) 702px, (min-width: 768px) min(calc(100vw - 50px), 1102px), calc(100vw - 34px)",
} as const;

/**
 * A screenshot of tuios, drawn by tuios itself (the screenshot_screen action)
 * and written by scripts/docs-media.sh as lossless WebP: /shots/NAME.webp at
 * scale 2, and NAME-702.webp and NAME-834.webp for a 1x screen, the widest a
 * blog post and a docs page draw it. `width` and `height` are the size of
 * NAME.webp, so the page keeps the space before the picture arrives.
 *
 * With `light`, the scene was also shot in a light theme, as NAME-light.webp.
 * The page then shows the picture that matches the site theme. The other one
 * stays hidden, and a hidden lazy image is not fetched.
 *
 * With `href`, the picture links to that address, such as the full size file
 * of a screen too wide to read at the column's width.
 */
export function Shot({
  name,
  alt,
  width,
  height,
  light = false,
  caption,
  sizes = SHOT_SIZES.docs,
  href,
}: {
  name: string;
  alt: string;
  width: number;
  height: number;
  light?: boolean;
  caption?: string;
  sizes?: string;
  href?: string;
}) {
  // A picture made outside scripts/docs-media.sh, such as a blog post's chart
  // or a page of the site, is 1600 wide with an 800 wide file beside it.
  const legacy = width === 1600;
  const img = (base: string, className?: string) => (
    // biome-ignore lint/performance/noImgElement: a static export has no image optimizer, and these are already sized WebP files
    <img
      src={`/shots/${base}.webp`}
      srcSet={
        legacy
          ? `/shots/${base}-800.webp 800w, /shots/${base}.webp 1600w`
          : `/shots/${base}-702.webp 702w, /shots/${base}-834.webp 834w, /shots/${base}.webp ${width}w`
      }
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={cn("block h-auto w-full", className)}
    />
  );
  const frame = (
    <div className="overflow-hidden rounded-xl border border-fd-border">
      {light ? (
        <>
          {img(`${name}-light`, "dark:hidden")}
          {img(name, "hidden dark:block")}
        </>
      ) : (
        img(name)
      )}
    </div>
  );
  return (
    <figure className="not-prose my-6">
      {href ? (
        <a href={href} className="block">
          {frame}
        </a>
      ) : (
        frame
      )}
      {caption ? (
        <figcaption className="mt-2 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
