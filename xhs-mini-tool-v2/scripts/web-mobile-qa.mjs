import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium, webkit } from "@playwright/test";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const projectRoot = path.resolve(miniRoot, "..");
const distRoot = path.join(projectRoot, "web-release", "dist");
const outputRoot = path.join(projectRoot, "web-release", "qa", "compatibility");

if (!fs.existsSync(path.join(distRoot, "index.html"))) {
  throw new Error("Web release is missing. Build it before running mobile compatibility QA.");
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const absolute = path.resolve(distRoot, relative);
  if (!absolute.startsWith(`${path.resolve(distRoot)}${path.sep}`) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": mimeTypes[path.extname(absolute).toLowerCase()] ?? "application/octet-stream",
  });
  fs.createReadStream(absolute).pipe(response);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not resolve the local QA server port");
const target = `http://127.0.0.1:${address.port}/`;

const engines = [
  {
    name: "android-chromium",
    type: chromium,
    userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0 Mobile Safari/537.36",
  },
  {
    name: "iphone-webkit",
    type: webkit,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  },
];
const viewports = [
  { name: "short", width: 375, height: 667 },
  { name: "standard", width: 390, height: 844 },
];
const report = { target, status: "passed", runs: [], errors: [] };
let currentRunLabel = "startup";
let currentCheckpoint = "initializing";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const openPersona = async (page, code, slug, outputName) => {
  currentCheckpoint = `opening ${code}`;
  await page.locator(`.persona-card[data-code='${code}']`).click();
  currentCheckpoint = `waiting for ${code} result`;
  await page.locator(".result-screen.release-web").waitFor();
  const metrics = await page.locator(".result-hero img").evaluate((image) => ({
    marginTop: Number.parseFloat(getComputedStyle(image).marginTop),
    width: image.getBoundingClientRect().width,
    source: image.getAttribute("src") || "",
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  assert(metrics.source.includes(slug), `${code}: wrong poster source ${metrics.source}`);
  assert(metrics.naturalWidth > 0 && metrics.naturalHeight > 0, `${code}: poster did not load`);
  assert(Math.abs(metrics.marginTop / metrics.width + 0.0745) < 0.002, `${code}: blank-canvas trim is incorrect`);
  assert(metrics.scrollWidth <= metrics.innerWidth + 1, `${code}: horizontal overflow`);
  assert(await page.getByRole("button", { name: "保存人格卡", exact: true }).count() === 1, `${code}: save button is missing`);
  assert(await page.getByRole("button", { name: "发小红书", exact: true }).count() === 0, `${code}: publish button leaked into web release`);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存人格卡", exact: true }).click();
  const download = await downloadPromise;
  assert(download.suggestedFilename().endsWith(`-${slug}.webp`), `${code}: wrong download ${download.suggestedFilename()}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(outputRoot, outputName), fullPage: false });
};

try {
  for (const engine of engines) {
    const browser = await engine.type.launch({ headless: true });
    try {
      for (const viewport of viewports) {
        currentRunLabel = `${engine.name}/${viewport.name}`;
        currentCheckpoint = "creating browser context";
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          isMobile: true,
          hasTouch: true,
          locale: "zh-CN",
          userAgent: engine.userAgent,
        });
        const page = await context.newPage();
        const runtimeErrors = [];
        page.on("console", (message) => {
          if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
        });
        page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
        page.on("requestfailed", (request) => runtimeErrors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ""}`));

        currentCheckpoint = "loading homepage";
        await page.goto(target, { waitUntil: "networkidle" });
        currentCheckpoint = "waiting for homepage";
        await page.locator(".home-screen.release-web").waitFor();
        assert(await page.locator(".github-community-link").count() === 2, `${engine.name}/${viewport.name}: community module is incomplete`);
        const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert(homeOverflow <= 1, `${engine.name}/${viewport.name}: homepage horizontal overflow ${homeOverflow}`);

        currentCheckpoint = "opening draw page";
        await page.getByRole("button", { name: /看命，直接抽卡！/ }).click();
        await page.locator(".draw-page").waitFor();
        await page.waitForTimeout(650);
        currentCheckpoint = "drawing a card";
        await page.locator("[data-action='draw-card']").nth(2).click();
        currentCheckpoint = "waiting for drawn result";
        await page.locator(".result-screen").waitFor();
        currentCheckpoint = "opening persona directory";
        await page.getByRole("button", { name: /看看其他 15 种人格/ }).click();
        await page.locator(".directory-screen").waitFor();
        await openPersona(page, "TIDE", "tide", `${engine.name}-${viewport.name}-tide.png`);
        currentCheckpoint = "returning to directory after TIDE";
        await page.getByRole("button", { name: /看看其他 15 种人格/ }).click();
        await page.locator(".directory-screen").waitFor();
        await openPersona(page, "RUIN", "ruin", `${engine.name}-${viewport.name}-ruin.png`);

        assert(runtimeErrors.length === 0, `${engine.name}/${viewport.name}: ${runtimeErrors.join(" | ")}`);
        report.runs.push({ engine: engine.name, ...viewport, status: "passed", runtimeErrors });
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
} catch (error) {
  report.status = "failed";
  const detail = error instanceof Error ? error.message : String(error);
  const message = `${currentRunLabel} · ${currentCheckpoint}: ${detail}`;
  report.errors.push(message);
  console.error(`::error title=ArcBTI mobile compatibility QA::${message}`);
  process.exitCode = 1;
} finally {
  server.close();
  fs.writeFileSync(path.join(outputRoot, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}
