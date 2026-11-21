// web-client.mjs: the browser of a web scene (see "client": "web" in
// media/rig.py).
//
// Usage: node web-client.mjs URL SHOTS_DIR WIDTH HEIGHT
//
// Opens URL, the tuios-web page, in headless Chromium at WIDTH by HEIGHT CSS
// pixels and a device scale of 2, so a shot is as sharp as the other docs
// shots. It prints "ready" once the page is up, then reads one command a line
// on stdin and answers "ok" on stdout, or the error:
//
//   shot            save the page as the next PNG in SHOTS_DIR
//   click SELECTOR  click the element SELECTOR names
//   quit            close the browser and exit
//
// The rig names the PNGs by the order they were taken, as it does for
// screenshot_screen.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import puppeteer from "puppeteer-core";

const [url, dir, width, height] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--force-color-profile=srgb",
    "--hide-scrollbars",
  ],
});
const page = await browser.newPage();
await page.setViewport({
  width: Number(width),
  height: Number(height),
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: "load" });
// The settings button is part of every tuios-web page. The terminal draws
// once its connection is up, which takes a moment more.
await page.waitForSelector("#settings-toggle", { timeout: 30000 });
await new Promise((r) => setTimeout(r, 2000));
console.log("ready");

let taken = 0;
const lines = readline.createInterface({ input: process.stdin });
for await (const line of lines) {
  const [command, ...rest] = line.trim().split(" ");
  try {
    if (command === "shot") {
      taken += 1;
      const file = path.join(dir, `page-${String(taken).padStart(3, "0")}.png`);
      await page.screenshot({ path: file });
      // The rig sorts the shots by time. Two shots in one second must not
      // tie on a coarse clock.
      fs.utimesSync(file, new Date(), new Date(Date.now() + taken));
    } else if (command === "click") {
      await page.click(rest.join(" "));
    } else if (command === "quit") {
      break;
    } else {
      throw new Error(`unknown command ${command}`);
    }
    console.log("ok");
  } catch (err) {
    console.log(String(err.message || err).split("\n")[0]);
  }
}
await browser.close();
