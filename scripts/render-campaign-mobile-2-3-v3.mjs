import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = process.cwd();
const source = path.join(root, "docs", "design", "marketing-posters-xhs-v2", "render-mobile-2-3.html");
const outDir = path.join(root, "public", "images", "campaign", "xhs-posters-v2");
const posters = [
  ["#poster-scroll-mobile-v3", "01-endless-type-scroll-mobile-v3.png"],
  ["#poster-site-mobile-v3", "03-one-site-16-opinions-mobile-v3.png"],
];

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 2160, height: 1440 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
await page.waitForFunction(() => window.__POSTER_READY__ === true, null, { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

for (const [selector, filename] of posters) {
  await page.locator(selector).screenshot({ path: path.join(outDir, filename), type: "png" });
}

await browser.close();
for (const [, filename] of posters) console.log(path.join(outDir, filename));
