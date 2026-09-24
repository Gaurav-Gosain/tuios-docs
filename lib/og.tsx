import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The social card for every page type. Titles run to two lines and
 * descriptions are a full sentence, so the text is laid out as a flex column
 * and the description is clipped to a length that fits under either.
 */

const icon = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/tuios-icon.png"),
).toString("base64")}`;

function clip(text: string, limit: number) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}...`;
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
  const long = title.length > 48;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        color: "#e6e6ef",
        backgroundColor: "#11111b",
        backgroundImage:
          "radial-gradient(circle at 90% 0%, rgba(187, 154, 247, 0.28) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(122, 162, 247, 0.14) 0%, transparent 50%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* biome-ignore lint/performance/noImgElement: satori renders plain img elements */}
        <img src={icon} width={52} height={52} alt="" />
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700 }}>
          TUIOS
        </div>
        <div
          style={{
            display: "flex",
            marginLeft: 8,
            padding: "6px 14px",
            borderRadius: 999,
            border: "1px solid rgba(187, 154, 247, 0.45)",
            color: "#bb9af7",
            fontSize: 22,
          }}
        >
          {kind}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            fontSize: long ? 56 : 68,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.4,
              color: "#a9a9bd",
            }}
          >
            {clip(description, long ? 130 : 160)}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#7f7f95",
        }}
      >
        <div style={{ display: "flex" }}>{footer ?? ""}</div>
        <div style={{ display: "flex" }}>tuios.dev</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
