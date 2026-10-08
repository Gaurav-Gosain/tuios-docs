// Serves out/ through the Worker with `wrangler dev` and checks the responses
// that only the deployed setup gives: the Worker's answer to Next's prefetch
// range, and what public/_headers and public/_redirects do to static assets.
// Run it after `bun run build`: bun scripts/smoke-worker.mjs
//
// It prints one line per check and exits 1 when any check fails.
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
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
    const res = await get("/");
    await res.arrayBuffer();
    const csp = res.headers.get("content-security-policy") ?? "";
    const script = /script-src ([^;]*)/.exec(csp)?.[1] ?? "";
    const connect = /connect-src ([^;]*)/.exec(csp)?.[1] ?? "";
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
