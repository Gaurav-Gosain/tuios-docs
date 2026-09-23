/**
 * The share card and text for a finished track. The card is drawn on a canvas
 * in the browser, so nothing is stored or sent anywhere.
 */
import { formatTime, type StepResult } from "./engine";

export type ShareData = {
  trackTitle: string;
  seconds: number;
  results: StepResult[];
  keys: string[];
};

const W = 1200;
const H = 630;
const MONO = '"Monaspace Neon", ui-monospace, Menlo, monospace';

export const LEARN_URL = "tuios.gaurav.zip/learn";

/** Spoiler free, Wordle style. */
export function shareText(d: ShareData) {
  const grid = d.results.map((r) => (r === "clean" ? "▰" : "▱")).join("");
  const clean = d.results.filter((r) => r === "clean").length;
  return `I learned tuios in ${formatTime(d.seconds)} (${d.trackTitle})\n${grid} ${clean}/${d.results.length}\n${LEARN_URL}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Draw a keycap with a thick bottom edge. Returns its width. */
function keycap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
) {
  ctx.font = `600 26px ${MONO}`;
  const w = Math.max(56, ctx.measureText(label).width + 36);
  const h = 54;
  roundRect(ctx, x, y + 6, w, h, 10);
  ctx.fillStyle = "#0b0b13";
  ctx.fill();
  roundRect(ctx, x, y, w, h, 10);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, "#2a2a40");
  g.addColorStop(1, "#1e1e2e");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(187,154,247,0.45)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#e6e6ef";
  ctx.textBaseline = "middle";
  ctx.fillText(
    label,
    x + (w - ctx.measureText(label).width) / 2,
    y + h / 2 + 1,
  );
  return w;
}

/** A little BSP desktop, the tuios look, in the corner of the card. */
function tiles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const panes: [number, number, number, number][] = [
    [0, 0, 0.5, 1],
    [0.5, 0, 0.5, 0.5],
    [0.5, 0.5, 0.25, 0.5],
    [0.75, 0.5, 0.25, 0.5],
  ];
  const colors = ["#bb9af7", "#7aa2f7", "#9ece6a", "#f7768e"];
  panes.forEach(([px, py, pw, ph], i) => {
    const gap = 8;
    const rx = x + px * w + gap / 2;
    const ry = y + py * h + gap / 2;
    const rw = pw * w - gap;
    const rh = ph * h - gap;
    roundRect(ctx, rx, ry, rw, rh, 10);
    ctx.fillStyle = "rgba(17,17,27,0.85)";
    ctx.fill();
    ctx.strokeStyle = colors[i];
    ctx.globalAlpha = i === 0 ? 1 : 0.7;
    ctx.lineWidth = i === 0 ? 3 : 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    // A few lines of "output".
    ctx.fillStyle = colors[i];
    ctx.globalAlpha = 0.35;
    const lines = Math.max(1, Math.floor((rh - 30) / 18));
    for (let l = 0; l < lines; l++) {
      const lw = (rw - 36) * (0.35 + ((l * 37 + i * 17) % 50) / 100);
      roundRect(ctx, rx + 16, ry + 18 + l * 18, lw, 7, 3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

export async function drawShareCard(
  canvas: HTMLCanvasElement,
  d: ShareData,
  icon?: HTMLImageElement,
) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  try {
    await document.fonts.load(`700 64px "Monaspace Neon"`);
  } catch {
    // The fallback face is fine.
  }

  ctx.fillStyle = "#11111b";
  ctx.fillRect(0, 0, W, H);
  const glowA = ctx.createRadialGradient(W * 0.9, 0, 0, W * 0.9, 0, W * 0.6);
  glowA.addColorStop(0, "rgba(187,154,247,0.32)");
  glowA.addColorStop(1, "rgba(187,154,247,0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, W, H);
  const glowB = ctx.createRadialGradient(0, H, 0, 0, H, W * 0.5);
  glowB.addColorStop(0, "rgba(122,162,247,0.2)");
  glowB.addColorStop(1, "rgba(122,162,247,0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, W, H);

  // Gradient frame.
  const frame = ctx.createLinearGradient(0, 0, W, H);
  frame.addColorStop(0, "#bb9af7");
  frame.addColorStop(1, "#7aa2f7");
  roundRect(ctx, 14, 14, W - 28, H - 28, 26);
  ctx.strokeStyle = frame;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Header.
  let hx = 72;
  if (icon?.complete && icon.naturalWidth) {
    ctx.drawImage(icon, 72, 62, 48, 48);
    hx = 136;
  }
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e6e6ef";
  ctx.font = `700 32px ${MONO}`;
  ctx.fillText("TUIOS", hx, 87);
  const pillX = hx + ctx.measureText("TUIOS").width + 18;
  ctx.font = `500 20px ${MONO}`;
  const pillW = ctx.measureText("Learn").width + 28;
  roundRect(ctx, pillX, 70, pillW, 34, 17);
  ctx.strokeStyle = "rgba(187,154,247,0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#bb9af7";
  ctx.fillText("Learn", pillX + 14, 88);

  // Headline.
  // Headline on two lines, so it never runs into the tiles on the right.
  ctx.font = `700 54px ${MONO}`;
  ctx.fillStyle = "#e6e6ef";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("I learned tuios in", 72, 196);
  const time = formatTime(d.seconds);
  ctx.font = `800 92px ${MONO}`;
  const tg = ctx.createLinearGradient(
    72,
    0,
    72 + ctx.measureText(time).width,
    0,
  );
  tg.addColorStop(0, "#bb9af7");
  tg.addColorStop(1, "#7aa2f7");
  ctx.fillStyle = tg;
  ctx.fillText(time, 68, 290);
  const tw = ctx.measureText(time).width;

  ctx.font = `500 26px ${MONO}`;
  ctx.fillStyle = "#a9a9bd";
  ctx.fillText(d.trackTitle, 72 + tw + 28, 288);

  // Step grid: filled is clean, hollow used a hint or a skip.
  let gx = 72;
  for (const r of d.results) {
    roundRect(ctx, gx, 326, 30, 14, 5);
    if (r === "clean") {
      ctx.fillStyle = "#bb9af7";
      ctx.fill();
    } else {
      ctx.strokeStyle = r === "hinted" ? "#7aa2f7" : "#585b70";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    gx += 38;
  }

  // Keys learned.
  let kx = 72;
  const ky = 392;
  for (const k of d.keys.slice(0, 6)) {
    const next = kx + keycap(ctx, kx, ky, k) + 14;
    if (next > 700) break;
    kx = next;
  }

  tiles(ctx, 770, 150, 360, 300);

  ctx.textBaseline = "alphabetic";
  ctx.font = `500 24px ${MONO}`;
  ctx.fillStyle = "#7f7f95";
  ctx.fillText("Your turn: 5 minutes, in the browser", 72, 548);
  ctx.fillStyle = "#e6e6ef";
  const url = LEARN_URL;
  ctx.fillText(url, W - 72 - ctx.measureText(url).width, 548);
}

export function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
}
