import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const entry = process.env.ARCBTI_XHS_ENTRY
  ? path.resolve(process.env.ARCBTI_XHS_ENTRY)
  : path.join(miniRoot, "dist", "index.html");
const output = path.join(miniRoot, "qa", "offline-smoke.json");
const errors = [];
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ""}`));
  await page.goto(pathToFileURL(entry).href, { waitUntil: "load" });
  await page.locator(".home-screen").waitFor();
  await page.getByRole("button", { name: /看命，直接抽卡！/ }).click();
  await page.locator(".draw-page").waitFor();
  await page.locator("[data-action='draw-card']").nth(2).click();
  await page.locator(".result-screen").waitFor();
  await page.getByRole("button", { name: /看看其他 15 种人格/ }).click();
  await page.locator(".directory-screen").waitFor();
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 480) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
  });
  const broken = await page.locator("img").evaluateAll((images) => images
    .filter((image) => image.hasAttribute("src"))
    .filter((image) => !image.complete || image.naturalWidth < 1)
    .map((image) => image.getAttribute("src")));
  if (broken.length) errors.push(`broken images: ${broken.join(", ")}`);
  if (await page.locator(".persona-card").count() !== 16) errors.push("persona directory count is not 16");
  await context.close();
} finally {
  await browser.close();
}

const report = {
  status: errors.length ? "failed" : "passed",
  entry: pathToFileURL(entry).href,
  viewport: "390x844",
  errors,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
