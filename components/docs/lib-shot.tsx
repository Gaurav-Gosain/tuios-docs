import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import shots from "@/lib/libshots.json";

type Entry = { w: number; h: number; light: boolean };

/**
 * A picture of a library page, drawn from real code by
 * scripts/gen-library-shots.sh as /libs/NAME.webp, and NAME-light.webp when
 * it has a light twin. The page shows the one that matches the site theme.
 * The other stays hidden, and a hidden lazy image is not fetched.
 *
 * The files are drawn at twice the size in lib/libshots.json, so the picture
 * shows at that size and is sharp on a dense screen. A picture wider than the
 * column shrinks to fit, and a click opens it at full size. An unknown name
 * fails the build.
 */
export function LibShot({
  name,
  alt,
  caption,
  className,
}: {
  name: string;
  alt: string;
  caption?: ReactNode;
  className?: string;
}) {
  const entry = (shots as Record<string, Entry>)[name];
  if (!entry) {
    throw new Error(
      `<LibShot name="${name}" />: no such picture. Run scripts/gen-library-shots.sh, or check lib/libshots.json.`,
    );
  }
  const img = (file: string, extra?: string) => (
    <a
      href={`/libs/${file}.webp`}
      target="_blank"
      rel="noopener"
      className={cn("block", extra)}
    >
      {/* biome-ignore lint/performance/noImgElement: a static export has no image optimizer, and these are already sized WebP files */}
      <img
        src={`/libs/${file}.webp`}
        alt={alt}
        width={entry.w}
        height={entry.h}
        loading="lazy"
        decoding="async"
        className="block h-auto max-w-full"
      />
    </a>
  );
  return (
    <figure className={cn("not-prose my-6", className)}>
      <div
        className="w-fit max-w-full overflow-hidden rounded-xl border border-fd-border"
        style={{ width: entry.w }}
      >
        {entry.light ? (
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

/**
 * Pictures side by side on a wide screen, one under the other on a phone.
 */
export function LibGallery({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "not-prose my-6 grid items-start gap-x-6 gap-y-2 [&>figure]:my-0",
        cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {children}
    </div>
  );
}
