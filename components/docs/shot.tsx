import { cn } from "@/lib/cn";

/**
 * A screenshot of tuios, drawn by tuios itself (the screenshot_screen action)
 * and written by scripts/docs-media.sh as /shots/NAME.webp at 1600 wide and
 * NAME-800.webp at 800 wide. `width` and `height` are the 1600 size, so the
 * page keeps the space before the picture arrives.
 *
 * With `light`, the scene was also shot in a light theme, as NAME-light.webp.
 * The page then shows the picture that matches the site theme. The other one
 * stays hidden, and a hidden lazy image is not fetched.
 */
export function Shot({
  name,
  alt,
  width,
  height,
  light = false,
  caption,
}: {
  name: string;
  alt: string;
  width: number;
  height: number;
  light?: boolean;
  caption?: string;
}) {
  const img = (base: string, className?: string) => (
    // biome-ignore lint/performance/noImgElement: a static export has no image optimizer, and these are already sized WebP files
    <img
      src={`/shots/${base}.webp`}
      srcSet={`/shots/${base}-800.webp 800w, /shots/${base}.webp 1600w`}
      sizes="(min-width: 1024px) 768px, 100vw"
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={cn("block h-auto w-full", className)}
    />
  );
  return (
    <figure className="not-prose my-6">
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
      {caption ? (
        <figcaption className="mt-2 text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
