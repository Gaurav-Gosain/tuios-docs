// Serves out/ through the Worker with `wrangler dev` and checks the responses
// that only the deployed setup gives: the Worker's answer to Next's prefetch
// range, and what public/_headers and public/_redirects do to static assets.
// When the export has a /learn or /in-the-wild engine, it also checks that
// the Worker serves the engine's wasm brotli or gzip encoded. The check build
// has no engine.
// Run it after `bun run build`: bun scripts/smoke-worker.mjs
//
// It prints one line per check and exits 1 when any check fails.
import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const WRANGLER = "wrangler@4.137.0";
const port = 8700 + Math.floor(Math.random() * 200);
const base = `http://127.0.0.1:${port}`;

const chunks = await readdir("out/_next/static/chunks");
const chunk = chunks.find((name) => name.endsWith(".js"));
const shots = await readdir("public/shots");
const shot = shots.find((name) => name.endsWith(".webp"));

const server = spawn(
  "bunx",
  [
    WRANGLER,
    "dev",
    "--local",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    // Without this the Worker sees the route host (http://tuios.dev) and
    // redirects every page to https. See worker/redirect.ts.
    "--local-upstream",
    "localhost",
  ],
  {
    cwd: path.resolve("worker"),
    env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    // Its own process group, so the stop below reaches wrangler and workerd
    // under bunx too.
    detached: true,
  },
);
let log = "";
server.stdout.on("data", (d) => {
  log += d;
});
server.stderr.on("data", (d) => {
  log += d;
});

async function ready() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) break;
    try {
      await fetch(`${base}/robots.txt`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`wrangler dev did not start:\n${log}`);
}

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${detail}`);
  if (!ok) failures.push(name);
}

function get(pathname, headers = {}) {
  return fetch(`${base}${pathname}`, { headers, redirect: "manual" });
}

try {
  await ready();

  {
    const res = await get("/docs/configuration", { Range: "bytes=0-63" });
    const body = new Uint8Array(await res.arrayBuffer());
    const text = new TextDecoder().decode(body);
    check(
      "prefetch range",
      res.status === 206 &&
        body.length === 64 &&
        text.startsWith("<!DOCTYPE html><!--"),
      `${res.status}, ${body.length} bytes, ${res.headers.get("content-range")}`,
    );
  }
  {
    const res = await get("/docs/configuration");
    const n = (await res.arrayBuffer()).byteLength;
    check(
      "full page",
      res.status === 200 && n > 64,
      `${res.status}, ${n} bytes`,
    );
  }
  {
    const res = await get("/api/search.json");
    const type = res.headers.get("content-type") ?? "";
    const n = (await res.arrayBuffer()).byteLength;
    check(
      "search index type",
      res.status === 200 && type.startsWith("application/json"),
      `${res.status}, ${type || "no content-type"}, ${n} bytes`,
    );
  }
  {
    const res = await get("/api/search");
    const to = res.headers.get("location") ?? "";
    check(
      "old search path",
      res.status === 301 && to.endsWith("/api/search.json"),
      `${res.status} ${to}`,
    );
  }
  {
    const res = await get("/demo.gif");
    const to = res.headers.get("location") ?? "";
    check(
      "demo.gif",
      res.status === 301 &&
        to ===
          "https://cdn.jsdelivr.net/gh/Gaurav-Gosain/tuios@main/assets/demo.gif",
      `${res.status} ${to}`,
    );
  }
  for (const [name, pathname, immutable] of [
    ["hashed chunk", `/_next/static/chunks/${chunk}`, true],
    ["font", "/fonts/MonaspaceNeon-1.400.woff2", true],
    ["screenshot", `/shots/${shot}`, false],
  ]) {
    const res = await get(pathname);
    await res.arrayBuffer();
    const cc = res.headers.get("cache-control") ?? "";
    check(
      `${name} cache`,
      res.status === 200 && cc.includes("immutable") === immutable,
      `${res.status}, ${cc || "no cache-control"}`,
    );
  }
  {
    const res = await get("/progstatus?go-get=1");
    const body = await res.text();
    check(
      "go-import meta tag",
      res.status === 200 &&
        body.includes(
          'content="tuios.dev/progstatus git https://github.com/Gaurav-Gosain/tuios progstatus"',
        ),
      `${res.status}, ${body.length} bytes`,
    );
  }
  {
    const res = await get("/progstatus");
    const to = res.headers.get("location") ?? "";
    check(
      "library path redirect",
      res.status === 302 && to.endsWith("/docs/libraries/progstatus"),
      `${res.status} ${to}`,
    );
  }
  {
    // The local bucket is empty. A 404 in plain text shows the request
    // reached worker/gallery.ts: the page negotiation would answer this
    // Accept with a 406, and the assets with the HTML 404 page.
    const res = await get("/gallery/feed", { Accept: "application/json" });
    const type = res.headers.get("content-type") ?? "";
    await res.arrayBuffer();
    check(
      "gallery feed route",
      res.status === 404 && type.startsWith("text/plain"),
      `${res.status}, ${type || "no content-type"}`,
    );
  }
  {
    // The /in-the-wild feed comes from the bucket through worker/wild.ts: a
    // plain-text 404 when the local bucket is empty, else the JSON with
    // nosniff. The page negotiation would answer this Accept with a 406.
    const res = await get("/in-the-wild/feed", { Accept: "application/json" });
    const type = res.headers.get("content-type") ?? "";
    await res.arrayBuffer();
    check(
      "in-the-wild feed route",
      (res.status === 404 && type.startsWith("text/plain")) ||
        (res.status === 200 &&
          type.startsWith("application/json") &&
          res.headers.get("x-content-type-options") === "nosniff"),
      `${res.status}, ${type || "no content-type"}`,
    );
  }
  {
    // The bucket in wrangler dev is empty, so a look is a plain 404.
    const res = await get("/r/123.toml");
    const type = res.headers.get("content-type") ?? "";
    await res.arrayBuffer();
    check(
      "look file route",
      res.status === 404 && type.startsWith("text/plain"),
      `${res.status}, ${type || "no content-type"}`,
    );
  }
  {
    const res = await get("/r/123");
    const to = res.headers.get("location") ?? "";
    check(
      "look link to the card",
      res.status === 302 && to.endsWith("/gallery#look-123"),
      `${res.status} ${to}`,
    );
  }
  {
    const res = await get("/r/../gallery/gallery.json");
    await res.arrayBuffer();
    check("look path check", res.status !== 200, `${res.status}`);
  }
  {
    // No TURNSTILE_SECRET in wrangler dev: the hearts are read-only.
    const res = await get("/gallery/votes", { Accept: "application/json" });
    const json = await res.json().catch(() => null);
    check(
      "vote counts",
      res.status === 200 && json?.writable === false,
      `${res.status}, ${JSON.stringify(json)}`,
    );
  }
  {
    const res = await fetch(`${base}/gallery/votes`, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "application/json" },
      body: JSON.stringify({ id: "123", like: true, token: "x" }),
    });
    const json = await res.json().catch(() => null);
    check(
      "read-only vote",
      res.status === 503 && json?.readOnly === true,
      `${res.status}, ${JSON.stringify(json)}`,
    );
  }
  {
    const res = await fetch(`${base}/gallery/votes`, {
      method: "POST",
      headers: {
        Origin: "https://evil.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: "123", like: true, token: "x" }),
    });
    await res.arrayBuffer();
    check("cross-origin vote", res.status === 403, `${res.status}`);
  }
  {
    const res = await get("/gallery");
    const body = await res.text();
    check(
      "gallery page",
      res.status === 200 && body.includes("Show us your setup"),
      `${res.status}, ${body.length} bytes`,
    );
  }
  // /learn runs tuios and /in-the-wild runs hearsay. Each engine is checked
  // when the export has it.
  for (const page of ["learn", "in-the-wild"]) {
    const engine = await readFile(`out/${page}/engine.json`, "utf8")
      .then(JSON.parse)
      .catch(() => null);
    if (engine?.wasmEncoded) {
      const wasm = `${engine.base}${engine.wasmEncoded}`;
      for (const [name, accept, coding] of [
        // Only br: wrangler dev's proxy encodes for the first coding a client
        // lists, whatever the Worker returned, so "gzip, deflate, br" comes
        // back gzip here.
        [`${page} engine wasm, brotli`, "br", "br"],
        [`${page} engine wasm, gzip`, "gzip", "gzip"],
      ]) {
        const res = await get(wasm, { "Accept-Encoding": accept });
        // fetch unpacks the body, so a good one starts with "\0asm".
        const reader = res.body.getReader();
        const { value } = await reader.read();
        await reader.cancel();
        const magic =
          value?.[0] === 0 &&
          value?.[1] === 0x61 &&
          value?.[2] === 0x73 &&
          value?.[3] === 0x6d;
        const got = res.headers.get("content-encoding");
        const type = res.headers.get("content-type");
        const cc = res.headers.get("cache-control") ?? "";
        check(
          name,
          res.status === 200 &&
            got === coding &&
            type === "application/wasm" &&
            cc.includes("immutable") &&
            res.headers.get("vary") === "Accept-Encoding" &&
            magic,
          `${res.status}, ${got}, ${type}, ${cc}, ${magic ? "wasm" : "not wasm"}`,
        );
      }
      const res = await get(wasm, { "Accept-Encoding": "identity" });
      await res.arrayBuffer();
      check(
        `${page} engine wasm, no encoding`,
        res.status === 406,
        `${res.status}`,
      );
    }
  }
  {
    const res = await get("/");
    await res.arrayBuffer();
    const csp = res.headers.get("content-security-policy") ?? "";
    const script = /script-src ([^;]*)/.exec(csp)?.[1] ?? "";
    const connect = /connect-src ([^;]*)/.exec(csp)?.[1] ?? "";
    check(
      "Turnstile allowed by CSP",
      script.includes("https://challenges.cloudflare.com") &&
        csp.includes("frame-src https://challenges.cloudflare.com"),
      `script-src ${script}`,
    );
    check(
      "analytics allowed by CSP",
      script.includes("https://static.cloudflareinsights.com") &&
        connect.includes("https://cloudflareinsights.com"),
      `script-src ${script}; connect-src ${connect}`,
    );
  }
} finally {
  const exited = new Promise((resolve) => server.once("exit", resolve));
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    // Already gone.
  }
  // A process group that ignores SIGTERM would otherwise hold the job until
  // its own time limit. Give it 10 s, then kill it.
  if (server.exitCode === null) {
    let timer;
    const timedOut = new Promise((resolve) => {
      timer = setTimeout(() => resolve(true), 10_000);
    });
    if (await Promise.race([exited.then(() => false), timedOut])) {
      try {
        process.kill(-server.pid, "SIGKILL");
      } catch {
        // Already gone.
      }
      await exited;
    }
    clearTimeout(timer);
  }
}

if (failures.length > 0) {
  console.log(`${failures.length} failed`);
  process.exit(1);
}
console.log("all passed");
