import { ImageResponse } from "next/og";
import { OgBackground, OgHeader, og, ogFonts } from "@/lib/og";

export const revalidate = false;

const c = og.colors;

function Cap({ label, lit }: { label: string; lit?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 76,
        height: 76,
        padding: "0 22px",
        borderRadius: 16,
        fontSize: 32,
        fontWeight: 600,
        color: lit ? c.crust : c.text,
        background: lit
          ? `linear-gradient(180deg, ${c.mauve}, ${c.blue})`
          : `linear-gradient(180deg, ${c.surface}, ${c.base})`,
        border: lit ? `2px solid ${c.mauve}` : "2px solid #45475a",
        boxShadow: lit
          ? "0 3px 0 0 #0b0b13, 0 0 36px 0 rgba(203,166,247,0.5)"
          : "0 8px 0 0 #0b0b13",
      }}
    >
      {label}
    </div>
  );
}

const PANES: [number, number, number, number, string][] = [
  [0, 0, 50, 100, c.mauve],
  [50, 0, 50, 50, c.blue],
  [50, 50, 25, 50, c.green],
  [75, 50, 25, 50, c.red],
];

/** The social card for /learn: the promise, the keys, and a tiled desktop. */
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        padding: "58px 72px 50px",
        fontFamily: "Fredoka",
        color: c.text,
        backgroundColor: c.crust,
      }}
    >
      <OgBackground />
      <OgHeader kind="Learn" />
      {/* Holds the header's place in the column; the header itself is absolute. */}
      <div style={{ display: "flex", height: 60 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 26, flex: 1 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 66,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: -1,
            }}
          >
            <span>Learn tuios</span>
            <span>in 5 minutes.</span>
            <span style={{ color: c.mauve }}>In your browser.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Cap label="ctrl" lit />
            <div style={{ display: "flex", fontSize: 30, color: c.faint }}>
              +
            </div>
            <Cap label="b" lit />
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: c.faint,
                margin: "0 6px",
              }}
            >
              then
            </div>
            <Cap label="|" />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 330,
            height: 260,
          }}
        >
          {PANES.map(([x, y, w, h, c]) => (
            <div
              key={c}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: `${w}%`,
                height: `${h}%`,
                display: "flex",
                padding: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  border: `3px solid ${c}`,
                  background: "rgba(17,17,27,0.9)",
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "60%",
                    height: 8,
                    borderRadius: 4,
                    background: c,
                    opacity: 0.45,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    width: "40%",
                    height: 8,
                    borderRadius: 4,
                    background: c,
                    opacity: 0.3,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: c.faint,
        }}
      >
        <div style={{ display: "flex" }}>
          The real app, a pretend shell, nothing to install
        </div>
        <div style={{ display: "flex" }}>tuios.dev/learn</div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: ogFonts },
  );
}
