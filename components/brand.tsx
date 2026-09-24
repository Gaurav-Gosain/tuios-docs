import {
  WORDMARK_HEIGHT,
  WORDMARK_PATH,
  WORDMARK_WIDTH,
} from "@/lib/brand-wordmark";

/**
 * The tuios logo pieces. The mark is Tilly's head, drawn for small sizes. The
 * wordmark is Fredoka SemiBold as outlines in the text colour, so the header
 * and footer show it without loading a font.
 */

/** Tilly's head, the small form of the mark. Decorative next to the wordmark. */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    // biome-ignore lint/performance/noImgElement: a static SVG in a static export
    <img src="/brand/mark-32.svg" alt="" width={size} height={size} />
  );
}

/** "tuios" as the wordmark, `height` pixels tall, in the current text colour. */
export function Wordmark({
  height = 16,
  className,
}: {
  height?: number;
  className?: string;
}) {
  const width = (height * WORDMARK_WIDTH) / WORDMARK_HEIGHT;
  return (
    <svg
      role="img"
      aria-label="tuios"
      viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}
      width={width.toFixed(1)}
      height={height}
      fill="currentColor"
      className={className}
    >
      <path d={WORDMARK_PATH} />
    </svg>
  );
}

/** The mark and the wordmark side by side, as the header and footer show them. */
export function BrandLockup({ size = 24 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandMark size={size} />
      <Wordmark height={Math.round(size * 0.68)} />
    </span>
  );
}
