import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const projectRoot = path.resolve(miniRoot, "..");
const releaseTarget = process.env.ARCBTI_RELEASE_TARGET === "web" ? "web" : "xhs";
const xhsDistRoot = path.join(miniRoot, "dist");
const webDistRoot = path.join(projectRoot, "web-release", "dist");
const requestedOutput = process.env.ARCBTI_OUTPUT_DIR?.trim();
const distRoot = requestedOutput ? path.resolve(projectRoot, requestedOutput) : xhsDistRoot;
const expectedDistRoot = releaseTarget === "web" ? webDistRoot : xhsDistRoot;
if (path.resolve(distRoot) !== path.resolve(expectedDistRoot)) {
  throw new Error(`Refusing to smoke-test ${releaseTarget} from unexpected output directory: ${distRoot}`);
}
const entry = process.env.ARCBTI_ENTRY
  ? path.resolve(process.env.ARCBTI_ENTRY)
  : process.env.ARCBTI_XHS_ENTRY
    ? path.resolve(process.env.ARCBTI_XHS_ENTRY)
    : path.join(distRoot, "index.html");
const output = releaseTarget === "web"
  ? path.join(projectRoot, "web-release", "qa", "offline-smoke.json")
  : path.join(miniRoot, "qa", "offline-smoke.json");
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
  const communityModules = await page.locator(".github-community").count();
  if (releaseTarget === "web" && communityModules !== 1) errors.push(`web release contains ${communityModules} GitHub community modules`);
  if (releaseTarget === "xhs" && communityModules !== 0) errors.push(`XHS release contains ${communityModules} GitHub community modules`);
  if (releaseTarget === "web") {
    const communityLinks = await page.locator(".github-community-link").count();
    if (communityLinks !== 2) errors.push(`expected two GitHub community links; found ${communityLinks}`);
  }
  await page.getByRole("button", { name: /看命，直接抽卡！/ }).click();
  await page.locator(".draw-page").waitFor();
  await page.locator("[data-action='draw-card']").nth(2).click();
  await page.locator(".result-screen").waitFor();
  const saveButtons = await page.getByRole("button", { name: "保存人格卡", exact: true }).count();
  if (saveButtons !== 1) errors.push(`expected one save button; found ${saveButtons}`);
  const postButtons = await page.getByRole("button", { name: "发小红书", exact: true }).count();
  if (releaseTarget === "web" && postButtons !== 0) errors.push(`web release contains ${postButtons} Xiaohongshu publish buttons`);
  if (releaseTarget === "xhs" && postButtons !== 1) errors.push(`XHS release contains ${postButtons} publish buttons`);
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
  releaseTarget,
  entry: pathToFileURL(entry).href,
  viewport: "390x844",
  errors,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
