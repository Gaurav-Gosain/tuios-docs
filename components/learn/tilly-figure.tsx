import { useId } from "react";
import type { TillyMood } from "@/lib/learn/tilly";

/**
 * Tilly, the tuios mascot, as layered SVG: a small CRT whose screen is a
 * tiled layout. The two top panes are the eyes, the wide pane below is the
 * mouth, a `>_` prompt. The idle bob, the blink, the cursor and the focus
 * border that hops between panes are CSS in TILLY_CSS; the one-off moves
 * (bounce, cheer, wave) are Web Animations, run by `perform` below on the
 * parts named by `data-part`.
 *
 * public/learn/tilly.svg is this figure rendered standalone, with ids on the
 * layers, by scripts/tilly-svg.tsx. Re-run it after changing the drawing.
 */

// Catppuccin, the same values as the tuios logo, so the Learn page Tilly and
// the mark in the header, favicon and social cards are one drawing.
const C = {
  outline: "#11111b",
  shellTop: "#e5cffc",
  shellMid: "#cba6f7",
  shellBottom: "#a987ea",
  back: "#a987ea",
  deep: "#8062cf",
  screen: "#11111b",
  pane: "#262637",
  paneEdge: "#45475a",
  focus: "#74c7ec",
  eye: "#89dceb",
  prompt: "#a6e3a1",
  blush: "#f5c2e7",
  rod: "#7f849c",
  ballA: "#f9e2af",
  ballB: "#89dceb",
};

/** Styles for the figure. Scoped to `.tilly`, so it can sit inline anywhere. */
export const TILLY_CSS = `
.tilly{overflow:visible}
.tilly [data-part]{transform-box:view-box}
.tilly [data-part=body]{transform-origin:60px 108px;animation:tilly-bob 2.6s ease-in-out infinite}
.tilly [data-part=tilt]{transform-origin:60px 108px;transition:transform .35s ease}
.tilly[data-mood=think] [data-part=tilt]{transform:rotate(-6deg)}
.tilly [data-part=look]{transition:transform .3s ease}
.tilly[data-mood=think] [data-part=look]{transform:translate(-2.5px,-3px)}
.tilly [data-part=eyes-open]{transform-box:fill-box;transform-origin:50% 50%;animation:tilly-blink 5.2s infinite}
.tilly [data-part=eyes-happy]{opacity:0}
.tilly[data-mood=happy] [data-part=eyes-open],.tilly[data-mood=cheer] [data-part=eyes-open]{opacity:0}
.tilly[data-mood=happy] [data-part=eyes-happy],.tilly[data-mood=cheer] [data-part=eyes-happy]{opacity:1}
.tilly [data-part=cursor]{animation:tilly-cursor 1.1s steps(1) infinite}
.tilly [data-part^=pane-]{animation:tilly-focus 9s linear infinite}
.tilly [data-part=pane-right]{animation-delay:-6s}
.tilly [data-part=pane-bottom]{animation-delay:-3s}
.tilly [data-part=arm-left]{transform-origin:25px 72px;transition:transform .3s cubic-bezier(.2,.9,.3,1.3)}
.tilly [data-part=arm-right]{transform-origin:95px 72px;transition:transform .3s cubic-bezier(.2,.9,.3,1.3)}
.tilly[data-mood=cheer] [data-part=arm-left]{transform:translate(-7px,-33px) rotate(-14deg)}
.tilly[data-mood=cheer] [data-part=arm-right]{transform:translate(7px,-33px) rotate(14deg)}
.tilly [data-part=antennas]{transform-origin:60px 36px}
.tilly[data-mood=cheer] [data-part=ball-a],.tilly[data-mood=cheer] [data-part=ball-b]{filter:brightness(1.25)}
@keyframes tilly-bob{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-1.6px) scale(1.012,.988)}}
@keyframes tilly-blink{0%,93%,100%{transform:scaleY(1)}95.5%{transform:scaleY(.1)}}
@keyframes tilly-cursor{0%{opacity:1}50%{opacity:0}}
@keyframes tilly-focus{0%,32%{stroke:${C.focus}}33.5%,98.5%{stroke:${C.paneEdge}}100%{stroke:${C.focus}}}
@media (prefers-reduced-motion:reduce){.tilly *{animation:none!important;transition:none!important}}
`;

function reducedMotion() {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** The one-off moves, as Web Animations on the figure's parts. Used by the Learn page and the brand page. */
export function perform(svg: SVGSVGElement | null, mood: TillyMood) {
  if (!svg || reducedMotion() || typeof svg.animate !== "function") return;
  const part = (name: string) =>
    svg.querySelector<SVGGElement>(`[data-part="${name}"]`);
  const jump = part("jump");
  const shadow = part("shadow");
  const antennas = part("antennas");
  const arm = part("arm-right");
  const hop = (heights: number[], duration: number) => {
    jump?.animate(
      heights.map((h) => ({ transform: `translateY(${-h}px)` })),
      { duration, easing: "ease-out" },
    );
    shadow?.animate(
      heights.map((h) => ({
        transform: `scale(${1 - h / 30})`,
        transformOrigin: "60px 121px",
      })),
      { duration, easing: "ease-out" },
    );
  };
  const wiggle = (duration: number) =>
    antennas?.animate(
      [0, -7, 6, -4, 2, 0].map((d) => ({ transform: `rotate(${d}deg)` })),
      { duration, easing: "ease-in-out" },
    );
  if (mood === "happy") {
    hop([0, 7, 0, 2, 0], 650);
  } else if (mood === "cheer") {
    hop([0, 10, 0, 10, 0, 3, 0], 1300);
    wiggle(1300);
  } else if (mood === "think") {
    wiggle(900);
  } else if (mood === "wave") {
    arm?.animate(
      [
        { transform: "none" },
        { transform: "translate(6px,-24px) rotate(-12deg)", offset: 0.2 },
        { transform: "translate(8px,-26px) rotate(14deg)", offset: 0.4 },
        { transform: "translate(6px,-24px) rotate(-12deg)", offset: 0.6 },
        { transform: "translate(8px,-26px) rotate(14deg)", offset: 0.8 },
        { transform: "none" },
      ],
      { duration: 1400, easing: "ease-in-out" },
    );
    hop([0, 3, 0], 400);
  }
}

export function TillyFigure({
  mood = "idle",
  className,
  standalone = false,
  svgRef,
  title = "Tilly, the tuios mascot",
}: {
  mood?: TillyMood;
  className?: string;
  /** Give the layers ids and include the styles, for a file of its own. */
  standalone?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
  title?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gid = standalone ? "tilly-shell-fill" : `tilly-shell-${uid}`;
  // Layer ids only in the standalone file: two inline figures would clash.
  const layer = (name: string) =>
    standalone
      ? { id: `tilly-${name}`, "data-part": name }
      : { "data-part": name };

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 128"
      className={`tilly${className ? ` ${className}` : ""}`}
      data-mood={mood}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <style>{TILLY_CSS}</style>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={C.shellTop} />
          <stop offset="0.55" stopColor={C.shellMid} />
          <stop offset="1" stopColor={C.shellBottom} />
        </linearGradient>
      </defs>

      <ellipse
        {...layer("shadow")}
        cx="60"
        cy="121"
        rx="32"
        ry="4.5"
        fill="#000"
        opacity="0.22"
      />

      <g {...layer("jump")}>
        <g {...layer("feet")} stroke={C.outline} strokeWidth="2.2">
          <rect x="33" y="103" width="20" height="14" rx="6" fill={C.deep} />
          <rect x="67" y="103" width="20" height="14" rx="6" fill={C.deep} />
        </g>

        <g {...layer("tilt")}>
          <g {...layer("body")}>
            <g {...layer("antennas")}>
              <g stroke={C.rod} strokeWidth="3" strokeLinecap="round">
                <line x1="55" y1="35" x2="43" y2="13" />
                <line x1="65" y1="35" x2="78" y2="13" />
              </g>
              <g stroke={C.outline} strokeWidth="1.8">
                <circle
                  {...layer("ball-a")}
                  cx="43"
                  cy="12"
                  r="5.5"
                  fill={C.ballA}
                />
                <circle
                  {...layer("ball-b")}
                  cx="78"
                  cy="12"
                  r="5.5"
                  fill={C.ballB}
                />
              </g>
              <ellipse
                cx="60"
                cy="36"
                rx="13"
                ry="5.5"
                fill={C.back}
                stroke={C.outline}
                strokeWidth="2"
              />
            </g>

            <g {...layer("arm-left")}>
              <ellipse
                cx="13"
                cy="76"
                rx="8"
                ry="10"
                fill={C.shellMid}
                stroke={C.outline}
                strokeWidth="2.2"
              />
            </g>
            <g {...layer("arm-right")}>
              <ellipse
                cx="107"
                cy="76"
                rx="8"
                ry="10"
                fill={C.shellMid}
                stroke={C.outline}
                strokeWidth="2.2"
              />
            </g>

            <rect
              {...layer("shell")}
              x="17"
              y="34"
              width="86"
              height="73"
              rx="22"
              fill={`url(#${gid})`}
              stroke={C.outline}
              strokeWidth="2.6"
            />
            <path
              {...layer("shine")}
              d="M30 40 q10 -3 26 -2"
              stroke="#fff"
              strokeOpacity="0.45"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            <g {...layer("screen")}>
              <rect
                x="26"
                y="44"
                width="68"
                height="52"
                rx="8"
                fill={C.screen}
                stroke={C.outline}
                strokeWidth="1.6"
              />
              <g fill={C.pane} stroke={C.paneEdge} strokeWidth="1.8">
                <rect
                  {...layer("pane-left")}
                  stroke={C.focus}
                  x="30"
                  y="48"
                  width="28.5"
                  height="25"
                  rx="3.5"
                />
                <rect
                  {...layer("pane-right")}
                  x="61.5"
                  y="48"
                  width="28.5"
                  height="25"
                  rx="3.5"
                />
                <rect
                  {...layer("pane-bottom")}
                  x="30"
                  y="75.5"
                  width="60"
                  height="16.5"
                  rx="3.5"
                />
              </g>
            </g>

            <g {...layer("face")}>
              <g {...layer("look")}>
                <g {...layer("eyes-open")} fill={C.eye}>
                  <rect x="40" y="53.5" width="8.5" height="14" rx="2.2" />
                  <rect x="71.5" y="53.5" width="8.5" height="14" rx="2.2" />
                </g>
                <g
                  {...layer("eyes-happy")}
                  fill="none"
                  stroke={C.eye}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M39.5 63 l4.75 -5.5 l4.75 5.5" />
                  <path d="M71 63 l4.75 -5.5 l4.75 5.5" />
                </g>
              </g>
              <g
                {...layer("mouth")}
                stroke={C.prompt}
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              >
                <polyline
                  points="53,79.5 57.5,83.5 53,87.5"
                  strokeLinejoin="round"
                />
                <line {...layer("cursor")} x1="60.5" y1="88" x2="67" y2="88" />
              </g>
              <g {...layer("blush")} fill={C.blush}>
                <rect x="34" y="81.5" width="9" height="4" rx="2" />
                <rect x="77" y="81.5" width="9" height="4" rx="2" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
