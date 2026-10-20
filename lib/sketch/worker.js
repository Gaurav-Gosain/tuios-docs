// The Web Worker of the sketch playground. It runs tuios.dev/sketch, compiled
// to WebAssembly, off the main thread, so a slow render never holds up typing.
// scripts/sketch-engine.mjs copies it into the engine folder next to the wasm.
//
// Messages in:  {type: "init", base, wasm, gz}
//               {type: "render", id, source, options}
// Messages out: {type: "ready", themes}
//               {type: "fail", error}
//               {type: "result", id, ms, out}
// where out is {svg, width, height, type} or
// {error: {message, code, line, column}}.
//
// A Go panic ends the Go program. The worker then answers with the code
// "crash", and the page starts a new worker.

/* eslint-disable no-restricted-globals */
let ready = null;
let dead = false;

self.onmessage = async (event) => {
  const msg = event.data;
  if (msg.type === "init") {
    ready = start(msg.base, msg.wasm, msg.gz);
    try {
      const themes = await ready;
      self.postMessage({ type: "ready", themes });
    } catch (err) {
      self.postMessage({ type: "fail", error: String(err?.message ?? err) });
    }
    return;
  }
  if (msg.type === "render") {
    try {
      await ready;
    } catch {
      return;
    }
    const t0 = performance.now();
    let out;
    if (dead) {
      out = {
        error: {
          message: "The renderer stopped. Edit the diagram to try again.",
          code: "crash",
        },
      };
    } else {
      try {
        out = self.sketch.render(msg.source, msg.options ?? {});
      } catch (err) {
        dead = true;
        out = {
          error: { message: String(err?.message ?? err), code: "crash" },
        };
      }
    }
    self.postMessage({
      type: "result",
      id: msg.id,
      ms: performance.now() - t0,
      out,
    });
  }
};

async function start(base, wasm, gz) {
  importScripts(`${base}wasm_exec.js`);
  const go = new self.Go();
  const module = await compile(base, wasm, gz);
  const api = new Promise((resolve) => {
    self.onSketchReady = resolve;
  });
  const instance = await WebAssembly.instantiate(module, go.importObject);
  go.run(instance).then(() => {
    dead = true;
  });
  await api;
  return self.sketch.themes();
}

// The site's Worker answers <base>sketch.wasm with the brotli or the gzip
// file and the right Content-Encoding. A host without it, such as next dev,
// has no such file, and then the gzip file is unpacked here.
async function compile(base, wasm, gz) {
  try {
    const res = await fetch(`${base}${wasm}`);
    if (res.ok) {
      return await WebAssembly.compile(await res.arrayBuffer());
    }
  } catch {
    // Fall back to the gzip file below.
  }
  const res = await fetch(`${base}${gz}`);
  if (!res.ok) throw new Error(`cannot load ${gz}: ${res.status}`);
  const body = res.body.pipeThrough(new DecompressionStream("gzip"));
  return WebAssembly.compile(await new Response(body).arrayBuffer());
}
