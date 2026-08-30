/** Headless screenshot of the nav at a few widths, to check the crest. */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:4400/";
const PORT = 9355;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "shot-"));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--hide-scrollbars",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
);
let err = "";
chrome.stderr.on("data", (d) => (err += d));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ws() {
  for (let i = 0; i < 60; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("devtools down\n" + err);
}

let id = 1;
const pending = new Map();

async function main() {
  const sock = new WebSocket(await ws());
  await new Promise((r, j) => ((sock.onopen = r), (sock.onerror = j)));
  sock.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) {
      const { resolve, reject } = pending.get(d.id);
      pending.delete(d.id);
      d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
    }
  };
  const raw = (method, params, sessionId) =>
    new Promise((resolve, reject) => {
      const myId = id++;
      pending.set(myId, { resolve, reject });
      sock.send(JSON.stringify({ id: myId, method, params, sessionId }));
    });

  const { targetId } = await raw("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await raw("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => raw(m, p, sessionId);

  await S("Page.enable");
  await S("Runtime.enable");

  for (const [w, h, name] of [
    [1440, 900, "desktop"],
    [1000, 800, "mid"],
    [430, 800, "mobile"],
  ]) {
    await S("Emulation.setDeviceMetricsOverride", {
      width: w,
      height: h,
      deviceScaleFactor: 2,
      mobile: w < 500,
    });
    await S("Page.navigate", { url: BASE });
    await sleep(w === 1440 ? 9000 : 4000);

    // Report the crest's real rendered box + whether the image loaded.
    const probe = await S("Runtime.evaluate", {
      expression: `(() => {
        const chip = document.querySelector('[class*="brandMark"]');
        const img = chip && chip.querySelector('img');
        const name = document.querySelector('[class*="brandName"]');
        const nav = document.querySelector('nav');
        const r = (e)=>{ if(!e) return null; const b=e.getBoundingClientRect(); return {w:Math.round(b.width),h:Math.round(b.height)}; };
        return JSON.stringify({
          chip: r(chip),
          imgComplete: img ? img.complete : null,
          imgNatural: img ? img.naturalWidth+'x'+img.naturalHeight : null,
          brandNameWidth: name ? Math.round(name.getBoundingClientRect().width) : null,
          navH: r(nav) && r(nav).h,
          linksVisible: !!document.querySelector('[class*="links"]') && getComputedStyle(document.querySelector('[class*="links"]')).display !== 'none',
        });
      })()`,
      returnByValue: true,
    });
    console.log(name.padEnd(8), probe.result.value);

    // Crop to the nav strip so the crest is easy to inspect.
    const shot = await S("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width: w, height: 90, scale: 2 },
    });
    fs.writeFileSync(`/tmp/nav-${name}.png`, Buffer.from(shot.data, "base64"));
  }

  // Full hero at desktop for overall context.
  await S("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await S("Page.navigate", { url: BASE });
  await sleep(9000);
  const full = await S("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("/tmp/nav-full.png", Buffer.from(full.data, "base64"));

  sock.close();
  chrome.kill("SIGKILL");
  process.exit(0);
}
main().catch((e) => {
  console.error("FAILED:", e.message);
  chrome.kill("SIGKILL");
  process.exit(1);
});
