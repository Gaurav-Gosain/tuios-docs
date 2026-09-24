import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const revalidate = false;

const icon = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/tuios-icon.png"),
).toString("base64")}`;

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
        fontWeight: 700,
        color: lit ? "#ffffff" : "#e6e6ef",
        background: lit
          ? "linear-gradient(180deg, #bb9af7, #7aa2f7)"
          : "linear-gradient(180deg, #2a2a40, #1e1e2e)",
        border: lit ? "2px solid #bb9af7" : "2px solid #3a3a55",
        boxShadow: lit
          ? "0 3px 0 0 #0b0b13, 0 0 36px 0 rgba(187,154,247,0.55)"
          : "0 8px 0 0 #0b0b13",
      }}
    >
      {label}
    </div>
  );
}

const PANES: [number, number, number, number, string][] = [
  [0, 0, 50, 100, "#bb9af7"],
  [50, 0, 50, 50, "#7aa2f7"],
  [50, 50, 25, 50, "#9ece6a"],
  [75, 50, 25, 50, "#f7768e"],
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
        padding: "60px 72px",
        color: "#e6e6ef",
        backgroundColor: "#11111b",
        backgroundImage:
          "radial-gradient(circle at 90% 0%, rgba(187, 154, 247, 0.32) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(122, 162, 247, 0.18) 0%, transparent 50%)",
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
          Learn
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 26, flex: 1 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1,
            }}
          >
            <span>Learn tuios</span>
            <span>in 5 minutes.</span>
            <span style={{ color: "#bb9af7" }}>In your browser.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Cap label="ctrl" lit />
            <div style={{ display: "flex", fontSize: 30, color: "#7f7f95" }}>
              +
            </div>
            <Cap label="b" lit />
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: "#7f7f95",
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
          color: "#7f7f95",
        }}
      >
        <div style={{ display: "flex" }}>
          The real app, a pretend shell, nothing to install
        </div>
        <div style={{ display: "flex" }}>tuios.dev/learn</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
