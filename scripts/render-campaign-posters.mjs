import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = process.cwd();
const source = path.join(root, "docs", "design", "marketing-posters-xhs-v1", "render.html");
const outDir = path.join(root, "public", "images", "campaign", "xhs-posters-v1");
const posters = [
  ["#poster-scroll", "01-endless-type-scroll.png"],
  ["#poster-cast", "02-whole-cast-ensemble.png"],
  ["#poster-site", "03-one-site-16-opinions.png"],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
await page.waitForFunction(() => window.__POSTERS_READY__ === true, null, { timeout: 30000 });

for (const [selector, filename] of posters) {
  await page.locator(selector).screenshot({ path: path.join(outDir, filename), type: "png" });
}

await browser.close();
