import type { TillyMood } from "@/lib/learn/tilly";

/**
 * Tilly's face, drawn on a canvas that becomes the 3D screen's texture.
 *
 * The coordinates are the 2D figure's (components/learn/tilly-figure.tsx)
 * with the screen's top left corner, (26, 44) in that drawing, moved to 0,0.
 * The screen is 68 by 52 of those units, and the canvas is scaled to fit, so
 * the 3D face is the 2D face: two panes on top with the eyes, a wide pane below
 * with the >_ prompt, and a focus border that moves between the panes.
 */

export const SCREEN_W = 68;
export const SCREEN_H = 52;

const C = {
  screen: "#11111b",
  screenGlow: "#1b1b2b",
  pane: "#262637",
  paneEdge: "#45475a",
  focus: "#74c7ec",
  eye: "#89dceb",
  prompt: "#a6e3a1",
  blush: "#f5c2e7",
};

type Rect = { x: number; y: number; w: number; h: number };

export const PANES: Rect[] = [
  { x: 4, y: 4, w: 28.5, h: 25 },
  { x: 35.5, y: 4, w: 28.5, h: 25 },
  { x: 4, y: 31.5, w: 60, h: 16.5 },
];

const EYES: Rect[] = [
  { x: 14, y: 9.5, w: 8.5, h: 14 },
  { x: 45.5, y: 9.5, w: 8.5, h: 14 },
];

export type FaceState = {
  mood: TillyMood;
  /** 1 is open, 0 is shut. */
  open: number;
  /** Where the eyes look, each in -1..1. Positive y looks down. */
  lookX: number;
  lookY: number;
  /** The focused pane, 0 to 2, and how far its border has lit, 0..1. */
  focus: number;
  focusIn: number;
  cursor: boolean;
  /** 0..1, the pointer is on Tilly. */
  hover: number;
  /** Seconds, for the thinking dots. */
  time: number;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  radius: number,
): void {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
}

/** Draws the whole face. The canvas can be any size with the screen's aspect. */
export function drawFace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  s: FaceState,
): void {
  ctx.save();
  ctx.setTransform(width / SCREEN_W, 0, 0, height / SCREEN_H, 0, 0);
  const px = SCREEN_W / width;

  // The glass: dark, a little lighter in the middle like a warm tube.
  const bg = ctx.createRadialGradient(34, 24, 4, 34, 26, 44);
  bg.addColorStop(0, C.screenGlow);
  bg.addColorStop(1, C.screen);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Panes. The focused one gets the sky border, lit with a short glow.
  ctx.lineWidth = 1.8;
  PANES.forEach((pane, i) => {
    roundRect(ctx, pane, 3.5);
    ctx.fillStyle = C.pane;
    ctx.fill();
    ctx.strokeStyle = C.paneEdge;
    ctx.stroke();
    if (i === s.focus && s.focusIn > 0) {
      ctx.save();
      ctx.globalAlpha = s.focusIn;
      ctx.shadowColor = C.focus;
      ctx.shadowBlur = 3;
      ctx.strokeStyle = C.focus;
      ctx.stroke();
      ctx.restore();
    }
  });

  const happy = s.mood === "happy" || s.mood === "cheer" || s.mood === "wave";
  const think = s.mood === "think";
  // Eyes move inside their panes. Thinking looks up and to the left.
  const lx = think ? -2.5 : s.lookX * 3.2;
  const ly = think ? -3 : s.lookY * 2.6;

  ctx.save();
  ctx.shadowColor = C.eye;
  ctx.shadowBlur = 2.5;
  if (happy) {
    ctx.strokeStyle = C.eye;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const eye of EYES) {
      const cx = eye.x + eye.w / 2 + lx * 0.6;
      const cy = eye.y + 9 + ly * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - 4.75, cy + 0.5);
      ctx.lineTo(cx, cy - 5);
      ctx.lineTo(cx + 4.75, cy + 0.5);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = C.eye;
    // Wider eyes while the pointer is on Tilly.
    const grow = 1 + 0.08 * s.hover;
    for (const eye of EYES) {
      const h = eye.h * grow * Math.max(0.1, s.open);
      const w = eye.w * grow;
      const cx = eye.x + eye.w / 2 + lx;
      const cy = eye.y + eye.h / 2 + ly;
      roundRect(
        ctx,
        { x: cx - w / 2, y: cy - h / 2, w, h },
        Math.min(2.2, h / 2),
      );
      ctx.fill();
    }
  }
  ctx.restore();

  // The >_ prompt, with a blinking cursor, or three dots while thinking.
  ctx.save();
  ctx.strokeStyle = C.prompt;
  ctx.fillStyle = C.prompt;
  ctx.shadowColor = C.prompt;
  ctx.shadowBlur = 2;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(27, 35.5);
  ctx.lineTo(31.5, 39.5);
  ctx.lineTo(27, 43.5);
  ctx.stroke();
  if (think) {
    const step = Math.floor(s.time * 3) % 4;
    for (let i = 0; i < step; i++) {
      ctx.beginPath();
      ctx.arc(36 + i * 3.6, 43.2, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (s.cursor || s.mood === "cheer") {
    ctx.beginPath();
    ctx.moveTo(34.5, 44);
    ctx.lineTo(41, 44);
    ctx.stroke();
  }
  ctx.restore();

  // Blush, stronger when happy or when the pointer is on Tilly.
  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.72 + 0.28 * Math.max(s.hover, happy ? 1 : 0));
  ctx.fillStyle = C.blush;
  roundRect(ctx, { x: 8, y: 37.5, w: 9, h: 4 }, 2);
  ctx.fill();
  roundRect(ctx, { x: 51, y: 37.5, w: 9, h: 4 }, 2);
  ctx.fill();
  ctx.restore();

  // Faint scanlines, one every two canvas rows at most.
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  const gap = Math.max(1.2, px * 3);
  for (let y = 0; y < SCREEN_H; y += gap) {
    ctx.fillRect(0, y, SCREEN_W, px);
  }
  ctx.restore();
}

/** A key that changes only when the drawing would, to skip redundant redraws. */
export function faceKey(s: FaceState): string {
  const q = (v: number, n = 40) => Math.round(v * n);
  return [
    s.mood,
    q(s.open, 20),
    q(s.lookX),
    q(s.lookY),
    s.focus,
    q(s.focusIn, 10),
    s.cursor ? 1 : 0,
    q(s.hover, 10),
    s.mood === "think" ? Math.floor(s.time * 3) % 4 : 0,
  ].join(",");
}
