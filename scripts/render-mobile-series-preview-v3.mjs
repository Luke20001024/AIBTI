import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = process.cwd();
const source = path.join(root, "docs", "design", "marketing-posters-xhs-v2", "mobile-series-preview.html");
const outDir = path.join(root, "artifacts", "qa", "xhs-posters-v2");
const output = path.join(outDir, "arcbti-mobile-series-v3-preview.png");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 560 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(source).href, { waitUntil: "load" });
await page.waitForFunction(() => window.__POSTER_READY__ === true, null, { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: output, type: "png" });
await browser.close();
console.log(output);
