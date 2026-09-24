import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The social card for every page type, built from the brand OG template
 * (direction A): the Catppuccin Mocha background with a dot grid and a mauve
 * glow, Tilly's head and the wordmark, a kind pill, the title and
 * description in Fredoka, and Tilly standing on the right. Titles run to two
 * lines and descriptions are a full sentence, so the text is a flex column and
 * the description is clipped to a length that fits under either.
 */

function svgUri(path: string) {
  return `data:image/svg+xml;base64,${readFileSync(
    join(process.cwd(), path),
  ).toString("base64")}`;
}

/** The pieces the cards share, read once at build time. */
export const og = {
  background: svgUri("assets/og/background.svg"),
  mark: svgUri("public/brand/mark-32.svg"),
  tilly: svgUri("assets/og/tilly.svg"),
  colors: {
    text: "#cdd6f4",
    muted: "#a6adc8",
    faint: "#7f849c",
    mauve: "#cba6f7",
    blue: "#89b4fa",
    green: "#a6e3a1",
    red: "#f38ba8",
    crust: "#11111b",
    base: "#1e1e2e",
    surface: "#313244",
  },
};

/**
 * Fredoka, the wordmark face (SIL Open Font License, assets/fonts/Fredoka-OFL.txt).
 * satori needs TTF, so these are static instances of the variable font.
 */
export const ogFonts = [
  {
    name: "Fredoka",
    data: readFileSync(
      join(process.cwd(), "assets/fonts/Fredoka-SemiBold.ttf"),
    ),
    weight: 600 as const,
    style: "normal" as const,
  },
  {
    name: "Fredoka",
    data: readFileSync(join(process.cwd(), "assets/fonts/Fredoka-Regular.ttf")),
    weight: 400 as const,
    style: "normal" as const,
  },
];

function clip(text: string, limit: number) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}...`;
}

/** The full card background, drawn behind everything else. */
export function OgBackground() {
  return (
    // biome-ignore lint/performance/noImgElement: satori renders plain img elements
    <img
      src={og.background}
      width={1200}
      height={630}
      alt=""
      style={{ position: "absolute", left: 0, top: 0 }}
    />
  );
}

/** Tilly's head, the wordmark and the kind pill, top left. */
export function OgHeader({ kind }: { kind: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 58,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: satori renders plain img elements */}
      <img src={og.mark} width={60} height={60} alt="" />
      <div
        style={{
          display: "flex",
          marginLeft: 14,
          fontSize: 50,
          fontWeight: 600,
          letterSpacing: -0.5,
          color: og.colors.text,
          lineHeight: 1,
          paddingBottom: 4,
        }}
      >
        tuios
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: 24,
          height: 40,
          padding: "0 18px",
          borderRadius: 20,
          border: "1.5px solid rgba(203, 166, 247, 0.5)",
          color: og.colors.mauve,
          fontSize: 22,
          fontWeight: 400,
        }}
      >
        {kind}
      </div>
    </div>
  );
}

export function ogImage({
  kind,
  title,
  description,
  footer,
}: {
  kind: string;
  title: string;
  description?: string;
  footer?: string;
}) {
  const long = title.length > 40;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "Fredoka",
        color: og.colors.text,
        backgroundColor: og.colors.crust,
      }}
    >
      <OgBackground />
      <OgHeader kind={kind} />

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 150,
          width: 760,
          height: 360,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: long ? 56 : 68,
            fontWeight: 600,
            lineHeight: 1.12,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 400,
              lineHeight: 1.45,
              color: og.colors.muted,
            }}
          >
            {clip(description, long ? 110 : 150)}
          </div>
        ) : null}
      </div>

      {/* biome-ignore lint/performance/noImgElement: satori renders plain img elements */}
      <img
        src={og.tilly}
        width={246}
        height={262}
        alt=""
        style={{ position: "absolute", left: 900, top: 318 }}
      />

      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 50,
          display: "flex",
          gap: 28,
          fontSize: 22,
          color: og.colors.faint,
        }}
      >
        <div style={{ display: "flex" }}>tuios.dev</div>
        {footer ? <div style={{ display: "flex" }}>{footer}</div> : null}
      </div>
    </div>,
    { width: 1200, height: 630, fonts: ogFonts },
  );
}
