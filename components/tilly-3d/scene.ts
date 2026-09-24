/**
 * The 3D Tilly: three.js, the model in public/tilly/tilly.glb, and a face
 * drawn on a canvas. This module is only loaded with a dynamic import from
 * tilly-3d.tsx, after the page has painted, so three.js never weighs on the
 * first load.
 *
 * The canvas sits over the 2D figure (the "anchor") and can be larger than
 * it. The camera is framed from the two boxes, so the 3D Tilly lands on the
 * same pixels as the drawing it replaces and the swap does not jump.
 */
import {
  BackSide,
  CanvasTexture,
  Color,
  DirectionalLight,
  Euler,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { TillyMood } from "@/lib/learn/tilly";
import {
  drawFace,
  type FaceState,
  faceKey,
  SCREEN_H,
  SCREEN_W,
} from "@/lib/tilly-3d/face";
import {
  blinkDelay,
  blinkOpen,
  clamp,
  damp,
  hopCurve,
  lookAt,
  type Spring,
  stepSpring,
} from "@/lib/tilly-3d/motion";

/** One unit of the 2D drawing's viewBox in model units (see tilly.py). */
const S = 1.9 / 86;
/** The drawing's 120 by 128 viewBox, centred on (60, 64), in model units. */
const VIEW_H = 128 * S;
const VIEW_CENTER_Y = (117 - 64) * S;

export type TillyVariant = "hero" | "viewer";

export type TillyOptions = {
  canvas: HTMLCanvasElement;
  /** The element with the 2D figure's box. The 3D Tilly is framed on it. */
  anchor: HTMLElement;
  variant: TillyVariant;
  modelUrl: string;
  reducedMotion: boolean;
  dark: boolean;
  /** Called if the GPU drops the context, so the page can show the drawing. */
  onLost?: () => void;
};

export type TillyController = {
  /**
   * Plays a mood's move. With `hold` the face and pose stay on that mood;
   * without it they go back after the move.
   */
  play(mood: TillyMood, hold?: boolean): void;
  /** The reaction to a click or tap: a hop, and a cheer after a few. */
  poke(): void;
  setHover(on: boolean): void;
  setDark(dark: boolean): void;
  /** Rendering runs only while this is true: on screen and the tab shown. */
  setActive(active: boolean): void;
  /** Average milliseconds per frame over the first frames, or 0 before. */
  frameCost(): number;
  dispose(): void;
};

type Move = {
  kind: "hop" | "wave" | "cheer" | "wiggle";
  start: number;
  duration: number;
};

const LIGHT = {
  dark: { env: 0.62, key: 1.6, rim: 1.7, fill: 0.35, shadow: 0.62 },
  light: { env: 0.75, key: 1.45, rim: 0.8, fill: 0.3, shadow: 0.3 },
};

/** Inverted hull outline, offset in view space so node scale does not matter. */
function outlineMaterial(thickness: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      thickness: { value: thickness },
      color: { value: new Color("#11111b") },
    },
    vertexShader: `
      uniform float thickness;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        mv.xyz += n * thickness;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
    side: BackSide,
  });
}

/** A soft oval shadow with two darker spots under the feet. */
function shadowTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  const blob = (x: number, y: number, rx: number, ry: number, a: number) => {
    g.save();
    g.translate(x, y);
    g.scale(rx / ry, 1);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, ry);
    grad.addColorStop(0, `rgba(255,255,255,${a})`);
    grad.addColorStop(0.55, `rgba(255,255,255,${a * 0.45})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(0, 0, ry, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  blob(128, 80, 124, 70, 0.55);
  blob(84, 84, 40, 30, 0.6);
  blob(172, 84, 40, 30, 0.6);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export async function createTilly(
  opts: TillyOptions,
): Promise<TillyController> {
  const { canvas, anchor, variant, reducedMotion } = opts;
  let dark = opts.dark;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  // Neutral keeps the Catppuccin colours close to their hex values.
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  scene.environment = envTarget.texture;
  room.dispose();
  pmrem.dispose();

  const camera = new PerspectiveCamera(20, 1, 1, 40);
  const key = new DirectionalLight("#fff4ea", 1.5);
  key.position.set(-3, 5, 5);
  const rim = new DirectionalLight("#cba6f7", 1.5);
  rim.position.set(3.5, 3, -4);
  const fill = new DirectionalLight("#89b4fa", 0.35);
  fill.position.set(4, 1, 3);
  scene.add(key, rim, fill);

  // The model.
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(opts.modelUrl);
  const model = gltf.scene;
  scene.add(model);

  const find = (name: string) => model.getObjectByName(name) as Object3D;
  const root = find("Tilly");
  const body = find("Body");
  const antennas = [find("AntennaL"), find("AntennaR")];
  const hands = [find("HandL"), find("HandR")];
  const bodyBase = body.position.clone();
  const handBase = hands.map((h) => h.position.clone());
  const antennaBase = antennas.map((a) => a.quaternion.clone());

  // The face: a canvas drawn at the screen's aspect, used as the glow.
  const faceScale = variant === "viewer" ? 10 : 6;
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = SCREEN_W * faceScale;
  faceCanvas.height = SCREEN_H * faceScale;
  const faceCtx = faceCanvas.getContext("2d") as CanvasRenderingContext2D;
  const faceTex = new CanvasTexture(faceCanvas);
  faceTex.colorSpace = SRGBColorSpace;
  // glTF texture coordinates start at the top, like a canvas.
  faceTex.flipY = false;
  faceTex.minFilter = LinearMipmapLinearFilter;
  faceTex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const screenMat = new MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.32,
    metalness: 0,
    clearcoat: 0.25,
    clearcoatRoughness: 0.28,
    // A faint reflection reads as glass. The full studio light is a glare.
    envMapIntensity: 0.18,
    emissive: 0xffffff,
    emissiveMap: faceTex,
    emissiveIntensity: 1.05,
  });

  const outline = outlineMaterial(variant === "viewer" ? 0.018 : 0.022);
  const outlined = new Set([
    "Shell",
    "Tube",
    "FootL",
    "FootR",
    "HandLMesh",
    "HandRMesh",
    "AntennaBase",
    "TipL",
    "TipR",
  ]);
  const hulls: Mesh[] = [];
  model.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    if (mesh.name === "Screen") {
      (mesh.material as MeshPhysicalMaterial).dispose();
      mesh.material = screenMat;
    }
    if (outlined.has(mesh.name)) {
      const hull = new Mesh(mesh.geometry, outline);
      hull.name = `${mesh.name}Outline`;
      hulls.push(hull);
    }
  });
  // Added after the traverse, so it does not visit them.
  for (const hull of hulls)
    model.getObjectByName(hull.name.replace(/Outline$/, ""))?.add(hull);

  // Contact shadow on the ground, outside the root so it stays down on a hop.
  const shadowMat = new MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const shadow = new Mesh(new PlaneGeometry(2.9, 1.8), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.003, -0.02);
  shadow.renderOrder = -1;
  scene.add(shadow);

  const applyTheme = () => {
    const l = dark ? LIGHT.dark : LIGHT.light;
    scene.environmentIntensity = l.env;
    key.intensity = l.key;
    rim.intensity = l.rim;
    fill.intensity = l.fill;
    shadowMat.color.set(dark ? "#000000" : "#4c4f69");
    shadowMat.opacity = l.shadow;
  };
  applyTheme();

  // Framing: the anchor's box is the drawing's viewBox, so find where the
  // viewBox centre and scale land in this canvas and aim the camera there.
  const DIST = 14;
  const target = new Vector3(0, VIEW_CENTER_Y, 0);
  let orbit: {
    update(): boolean;
    dispose(): void;
    target: Vector3;
    addEventListener(t: string, f: () => void): void;
  } | null = null;

  const frame = () => {
    const cr = canvas.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    if (cr.width < 2 || cr.height < 2 || ar.height < 2) return;
    renderer.setSize(cr.width, cr.height, false);
    // SVG "meet": the 120 by 128 viewBox fits the anchor's height or width.
    const pxPerUnit = Math.min(ar.height / VIEW_H, ar.width / (120 * S));
    const worldH = cr.height / pxPerUnit;
    camera.aspect = cr.width / cr.height;
    camera.fov = (2 * Math.atan(worldH / 2 / DIST) * 180) / Math.PI;
    const offX =
      (cr.left + cr.width / 2 - (ar.left + ar.width / 2)) / pxPerUnit;
    const offY =
      (ar.top + ar.height / 2 - (cr.top + cr.height / 2)) / pxPerUnit;
    target.set(offX, VIEW_CENTER_Y + offY, 0);
    if (!orbit) {
      const elev = 0.07;
      camera.position.set(
        target.x,
        target.y + DIST * Math.sin(elev),
        DIST * Math.cos(elev),
      );
      camera.lookAt(target);
    } else {
      orbit.target.copy(target);
      orbit.update();
    }
    camera.updateProjectionMatrix();
    renderOnce();
  };

  if (variant === "viewer") {
    const { OrbitControls } = await import(
      "three/examples/jsm/controls/OrbitControls.js"
    );
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = DIST * 0.75;
    controls.maxDistance = DIST * 1.25;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.rotateSpeed = 0.8;
    camera.position.set(0, VIEW_CENTER_Y + DIST * 0.12, DIST);
    controls.target.copy(target);
    controls.addEventListener("change", () => renderOnce());
    // OrbitControls turns touch scrolling off. Keep vertical page scrolling,
    // so on a phone a drag across Tilly turns it and a swipe up scrolls.
    canvas.style.touchAction = "pan-y";
    orbit = controls;
  }

  // ---------------------------------------------------------------- state
  const clock = { t: 0 };
  let mood: TillyMood = "idle";
  let moodUntil = 0;
  let baseMood: TillyMood = "idle";
  const moves: Move[] = [];
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  let pointerAt = -1e9;
  let wanderAt = 0;
  let hover = 0;
  let hoverTarget = 0;
  let nextBlink = 1.2;
  let blinkStart = -1;
  let doubleBlink = false;
  let pokes: number[] = [];
  let tilt = 0;
  const ant: Spring[] = [
    { x: 0, v: 0 },
    { x: 0, v: 0 },
  ];
  const antFwd: Spring[] = [
    { x: 0, v: 0 },
    { x: 0, v: 0 },
  ];
  let lastLift = 0;
  let liftVel = 0;
  let lastFaceKey = "";
  // A held pose, for reduced motion: the brand page's still moods.
  let pose: "none" | "wave" | "cheer" = "none";
  const start = (kind: Move["kind"], duration: number, delay = 0) =>
    moves.push({ kind, start: clock.t + delay, duration });

  const setTempMood = (m: TillyMood, seconds: number) => {
    mood = m;
    moodUntil = clock.t + seconds;
  };

  const wiggle = (strength: number) => {
    ant[0].v -= strength;
    ant[1].v += strength;
    antFwd[0].v += strength * 0.5;
    antFwd[1].v -= strength * 0.3;
  };

  // --------------------------------------------------------------- pointer
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch" || reducedMotion) return;
    const r = (variant === "viewer" ? canvas : anchor).getBoundingClientRect();
    const reach =
      variant === "viewer"
        ? Math.max(160, r.width * 0.55)
        : Math.max(280, window.innerWidth * 0.3);
    const l = lookAt(
      e.clientX,
      e.clientY,
      r.left + r.width / 2,
      r.top + r.height * 0.45,
      reach,
    );
    look.tx = l.x;
    look.ty = l.y;
    pointerAt = clock.t;
  };
  const pointerTarget: EventTarget = variant === "viewer" ? canvas : window;
  pointerTarget.addEventListener(
    "pointermove",
    onPointerMove as EventListener,
    {
      passive: true,
    },
  );

  // Viewer: a click that is not a drag pokes Tilly.
  let downAt: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6) {
      controller.poke();
    }
    downAt = null;
  };
  if (variant === "viewer") {
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
  }

  // ---------------------------------------------------------------- update
  const hopHeight = (kind: Move["kind"]) => (kind === "cheer" ? 0.42 : 0.3);

  const update = (frameDt: number) => {
    const t = clock.t;
    // With reduced motion every eased value jumps straight to its target.
    const dt = reducedMotion ? 10 : frameDt;
    if (moodUntil && t > moodUntil) {
      mood = baseMood;
      moodUntil = 0;
    }

    // Where to look: the pointer, or a slow wander when it is still or absent.
    if (t - pointerAt > 4 && !reducedMotion) {
      if (t > wanderAt) {
        const centre = Math.random() < 0.35;
        look.tx = centre ? 0 : (Math.random() * 2 - 1) * 0.55;
        look.ty = centre ? 0 : (Math.random() * 2 - 1) * 0.3;
        wanderAt = t + 1.6 + Math.random() * 2.8;
      }
    }
    const lookRate = t - pointerAt > 4 ? 3 : 7;
    look.x = damp(look.x, look.tx, lookRate, dt);
    look.y = damp(look.y, look.ty, lookRate, dt);
    hover = damp(hover, hoverTarget, 8, dt);

    // Blinks, sometimes two in a row.
    if (blinkStart < 0 && t > nextBlink) {
      blinkStart = t;
      doubleBlink = Math.random() < 0.2;
    }
    let open = 1;
    if (blinkStart >= 0) {
      const bt = t - blinkStart;
      open = blinkOpen(bt);
      if (doubleBlink && bt > 0.2) open = blinkOpen(bt - 0.2);
      if (bt > (doubleBlink ? 0.4 : 0.2)) {
        blinkStart = -1;
        nextBlink = t + blinkDelay(Math.random());
      }
    }

    // Moves.
    let lift = 0;
    let squash = 1;
    let wave = 0;
    let arms = 0;
    for (let i = moves.length - 1; i >= 0; i--) {
      const m = moves[i];
      const u = (t - m.start) / m.duration;
      if (u < 0) continue;
      if (u >= 1) {
        moves.splice(i, 1);
        continue;
      }
      if (m.kind === "hop" || m.kind === "cheer") {
        const h = hopCurve(u);
        lift = Math.max(lift, h.lift * hopHeight(m.kind));
        squash *= h.squash;
        if (m.kind === "cheer")
          arms = Math.max(arms, Math.sin(Math.min(1, u * 1.1) * Math.PI));
      } else if (m.kind === "wave") {
        wave = Math.max(wave, Math.sin(u * Math.PI));
        const env = Math.min(1, u * 5, (1 - u) * 5);
        hands[1].rotation.z = 0.35 * Math.sin(u * Math.PI * 6) * env;
      }
    }
    if (pose === "wave") wave = 1;
    if (pose === "cheer") arms = 1;
    if (wave === 0) hands[1].rotation.z = damp(hands[1].rotation.z, 0, 10, dt);
    if (pose === "wave") hands[1].rotation.z = -0.2;

    // Antennas: a spring each, pushed by the body's vertical motion.
    const vel = (lift - lastLift) / Math.max(frameDt, 1e-3);
    const acc = (vel - liftVel) / Math.max(frameDt, 1e-3);
    lastLift = lift;
    liftVel = vel;
    const push = clamp(acc * 0.012, -6, 6);
    const breeze = reducedMotion ? 0 : 0.05 * Math.sin(t * 1.9);
    const sdt = reducedMotion ? 0 : frameDt;
    ant[0] = stepSpring(ant[0], breeze - 0.04 * hover, 70, 5, -push, sdt);
    ant[1] = stepSpring(ant[1], -breeze * 0.8 + 0.04 * hover, 70, 5, push, sdt);
    antFwd[0] = stepSpring(antFwd[0], 0.04 * Math.sin(t * 1.3), 60, 5, 0, sdt);
    antFwd[1] = stepSpring(
      antFwd[1],
      0.04 * Math.sin(t * 1.3 + 1),
      60,
      5,
      0,
      sdt,
    );
    for (let i = 0; i < 2; i++) {
      const q = new Quaternion().setFromEuler(
        new Euler(antFwd[i].x - look.y * 0.08, 0, ant[i].x - look.x * 0.12),
      );
      antennas[i].quaternion.copy(antennaBase[i]).multiply(q);
    }

    // Body: bob, squash, lean and look.
    const bob = reducedMotion ? 0 : Math.sin((t * Math.PI * 2) / 2.6);
    const breathe = 1 + 0.012 * bob;
    const sy = squash * breathe * (1 + 0.02 * hover);
    const sxz = (1 / Math.sqrt(squash)) * (1 + 0.02 * hover);
    body.scale.set(sxz, sy, sxz);
    body.position.set(
      bodyBase.x,
      bodyBase.y + 0.025 * Math.max(0, bob),
      bodyBase.z,
    );
    const thinking = mood === "think";
    tilt = damp(tilt, thinking ? 0.11 : 0, 6, dt);
    const yawRange = variant === "viewer" ? 0.25 : 0.38;
    body.rotation.set(
      look.y * 0.2 + 0.05 * hover,
      look.x * yawRange,
      tilt - look.x * 0.04,
    );
    root.position.y = lift;
    shadow.scale.setScalar(1 - lift * 0.9);
    shadowMat.opacity =
      (dark ? LIGHT.dark : LIGHT.light).shadow * (1 - lift * 1.2);

    // Hands: a wave lifts the right one, a cheer lifts both.
    const up = Math.max(arms, 0);
    hands[0].position.set(
      handBase[0].x - 0.155 * up,
      handBase[0].y + 0.72 * up,
      handBase[0].z + 0.05 * up,
    );
    hands[0].rotation.z = -0.3 * up;
    hands[1].position.set(
      handBase[1].x + 0.13 * Math.max(wave, up) + 0.02 * Math.max(0, up - wave),
      handBase[1].y + 0.55 * wave + 0.72 * Math.max(0, up - wave),
      handBase[1].z + 0.06 * Math.max(wave, up),
    );
    if (up > wave) hands[1].rotation.z = 0.3 * up;
    const sway = reducedMotion ? 0 : 0.04 * Math.sin(t * 2.4);
    if (!wave && !up && !reducedMotion) {
      hands[0].rotation.z = sway;
      hands[1].rotation.z = -sway;
    }

    // Face.
    const face: FaceState = {
      mood,
      open,
      lookX: look.x,
      lookY: look.y,
      focus: Math.floor(t / 3) % 3,
      focusIn: reducedMotion ? 1 : Math.min(1, (t % 3) / 0.12),
      cursor: reducedMotion || t % 1.1 < 0.55,
      hover,
      time: t,
    };
    const k = faceKey(face);
    if (k !== lastFaceKey) {
      drawFace(faceCtx, faceCanvas.width, faceCanvas.height, face);
      faceTex.needsUpdate = true;
      lastFaceKey = k;
    }
  };

  // ------------------------------------------------------------------ loop
  let active = false;
  let raf = 0;
  let lastFrame = 0;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const minFrame = 1000 / (coarse ? 30 : 60) - 1;
  const costs: number[] = [];

  function renderOnce() {
    if (reducedMotion || !active) {
      update(0);
      renderer.render(scene, camera);
    }
  }

  const tick = (ms: number) => {
    raf = requestAnimationFrame(tick);
    if (ms - lastFrame < minFrame) return;
    const dt = Math.min(0.1, lastFrame ? (ms - lastFrame) / 1000 : 1 / 60);
    lastFrame = ms;
    clock.t += dt;
    orbit?.update();
    update(dt);
    renderer.render(scene, camera);
    // The time between frames: a device that cannot keep up shows it here.
    if (costs.length < 90) costs.push(dt * 1000);
  };

  // Compile shaders off the main thread where the browser can, then draw.
  await renderer.compileAsync(scene, camera);
  const resize = new ResizeObserver(() => frame());
  resize.observe(canvas);
  frame();
  update(0);
  renderer.render(scene, camera);

  const onLost = (e: Event) => {
    e.preventDefault();
    opts.onLost?.();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const controller: TillyController = {
    play(m, hold = true) {
      if (hold) {
        baseMood = m;
        mood = m;
        moodUntil = 0;
      }
      if (reducedMotion) {
        // A still pose for each mood, the way the brand page shows them.
        pose = hold && (m === "wave" || m === "cheer") ? m : "none";
        renderOnce();
        return;
      }
      if (!hold) setTempMood(m, m === "cheer" ? 2.2 : m === "wave" ? 1.9 : 1.4);
      if (m === "happy") {
        start("hop", 0.62);
        wiggle(2.5);
      } else if (m === "cheer") {
        start("cheer", 0.8);
        start("cheer", 0.8, 0.85);
        wiggle(4);
      } else if (m === "wave") {
        start("wave", 1.7);
        start("hop", 0.45);
        wiggle(1.5);
      } else if (m === "think") {
        wiggle(1.2);
      }
    },
    poke() {
      const t = clock.t;
      pokes = pokes.filter((p) => t - p < 1.6);
      pokes.push(t);
      if (reducedMotion) {
        setTempMood("happy", 1.2);
        renderOnce();
        window.setTimeout(() => renderOnce(), 1300);
        return;
      }
      if (moves.some((m) => m.kind === "hop" || m.kind === "cheer")) return;
      if (pokes.length >= 3) {
        pokes = [];
        controller.play("cheer", false);
      } else {
        controller.play("happy", false);
      }
    },
    setHover(on) {
      hoverTarget = on && !reducedMotion ? 1 : 0;
    },
    setDark(d) {
      dark = d;
      applyTheme();
      renderOnce();
    },
    setActive(a) {
      if (a === active) return;
      active = a;
      if (reducedMotion) {
        renderOnce();
        return;
      }
      if (a) {
        lastFrame = 0;
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    },
    frameCost() {
      if (costs.length < 45) return 0;
      const tail = costs.slice(15);
      return tail.reduce((a, b) => a + b, 0) / tail.length;
    },
    dispose() {
      cancelAnimationFrame(raf);
      resize.disconnect();
      pointerTarget.removeEventListener(
        "pointermove",
        onPointerMove as EventListener,
      );
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("webglcontextlost", onLost);
      orbit?.dispose();
      scene.traverse((obj) => {
        const mesh = obj as Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const mat of mats) mat.dispose();
        }
      });
      faceTex.dispose();
      shadowMat.map?.dispose();
      envTarget.dispose();
      renderer.dispose();
    },
  };

  return controller;
}
