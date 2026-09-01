import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const outputRoot = path.join(miniRoot, "qa");
const target = process.env.ARCBTI_XHS_URL || "http://127.0.0.1:4188/";
const viewports = [
  { name: "compact", width: 360, height: 800 },
  { name: "short", width: 375, height: 667 },
  { name: "standard", width: 390, height: 844 },
  { name: "large", width: 430, height: 932 },
];

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  target,
  checkedAt: new Date().toISOString(),
  status: "passed",
  viewports: [],
  errors: [],
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertNoOverflow = async (page, label) => {
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  assert(metrics.scrollWidth <= metrics.innerWidth + 1, `${label}: horizontal overflow ${metrics.scrollWidth} > ${metrics.innerWidth}`);
};

const assertImages = async (page, label) => {
  const broken = await page.locator("img").evaluateAll((images) => images
    // Card faces are intentionally lazy: the five unrevealed cards do not receive
    // a src until one is selected. Only validate images that have actually been
    // assigned a resource URL.
    .filter((image) => image.hasAttribute("src"))
    .filter((image) => !image.complete || image.naturalWidth < 1 || image.naturalHeight < 1)
    .map((image) => ({ src: image.getAttribute("src"), complete: image.complete, width: image.naturalWidth, height: image.naturalHeight })));
  assert(broken.length === 0, `${label}: broken images ${JSON.stringify(broken)}`);
};

const scrollThrough = async (page) => {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.72));
    for (let position = 0; position < document.documentElement.scrollHeight; position += step) {
      window.scrollTo(0, position);
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
    window.scrollTo(0, 0);
  });
};

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      locale: "zh-CN",
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) => runtimeErrors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ""}`));

    await page.goto(target, { waitUntil: "networkidle" });
    await page.locator(".home-screen").waitFor();
    await assertNoOverflow(page, `${viewport.name} home`);
    await assertImages(page, `${viewport.name} home`);
    assert(await page.locator(".choice-title").textContent() === "算算你上辈子是哪个建筑大师！", `${viewport.name}: home title drifted`);
    assert(await page.locator(".choice-button").count() === 2, `${viewport.name}: home must expose exactly two choices`);
    const homeArtwork = await page.locator(".choice-visual img").evaluate((image) => ({
      natural: [image.naturalWidth, image.naturalHeight],
      renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
      naturalRatio: image.naturalWidth / image.naturalHeight,
      width: image.getBoundingClientRect().width,
      containerWidth: image.parentElement?.getBoundingClientRect().width || 0,
    }));
    assert(homeArtwork.natural[0] === 900 && homeArtwork.natural[1] === 1050, `${viewport.name}: wrong supplied home crop loaded`);
    assert(Math.abs(homeArtwork.renderedRatio - homeArtwork.naturalRatio) < 0.01, `${viewport.name}: home artwork was cropped or stretched`);
    assert(Math.abs(homeArtwork.width - homeArtwork.containerWidth) < 1, `${viewport.name}: home artwork does not fill its container`);
    const homeExtension = await page.locator(".choice-panel-backdrop").evaluate((image) => ({
      natural: [image.naturalWidth, image.naturalHeight],
      fit: getComputedStyle(image).objectFit,
      panelWidth: image.parentElement?.getBoundingClientRect().width || 0,
      width: image.getBoundingClientRect().width,
    }));
    assert(homeExtension.natural[0] === 900 && homeExtension.natural[1] === 620, `${viewport.name}: seamless home extension is missing`);
    assert(homeExtension.fit === "fill", `${viewport.name}: home extension can be recropped at the seam`);
    assert(Math.abs(homeExtension.width - homeExtension.panelWidth) < 1, `${viewport.name}: home extension does not align with the hero width`);
    await page.screenshot({ path: path.join(outputRoot, `${viewport.name}-home.png`), fullPage: true });

    await page.getByRole("button", { name: /看命，直接抽卡！/ }).click();
    await page.locator(".draw-page").waitFor();
    await page.waitForTimeout(160);
    await assertNoOverflow(page, `${viewport.name} draw`);
    await assertImages(page, `${viewport.name} draw`);
    assert(await page.locator(".draw-card").count() === 5, `${viewport.name}: draw deck does not contain five cards`);
    const drawMetrics = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      background: (() => {
        const image = document.querySelector(".draw-paper-background");
        return image instanceof HTMLImageElement ? [image.naturalWidth, image.naturalHeight] : [0, 0];
      })(),
      cards: [...document.querySelectorAll(".draw-card")].map((card) => ({
        background: getComputedStyle(card).backgroundColor,
        border: getComputedStyle(card).borderTopWidth,
      })),
    }));
    assert(drawMetrics.scrollHeight <= drawMetrics.innerHeight + 1, `${viewport.name}: draw page should fit without vertical scrolling ${JSON.stringify({ scrollHeight: drawMetrics.scrollHeight, innerHeight: drawMetrics.innerHeight })}`);
    assert(drawMetrics.background[0] === 768 && drawMetrics.background[1] === 1312, `${viewport.name}: supplied blueprint background is missing`);
    assert(drawMetrics.cards.every((card) => card.background === "rgba(0, 0, 0, 0)" && card.border === "0px"), `${viewport.name}: opaque card wrapper can expose black corners`);
    await page.screenshot({ path: path.join(outputRoot, `${viewport.name}-draw.png`), fullPage: false });
    if (viewport.name === "standard") {
      await page.getByRole("button", { name: "抽第 3 张建筑人格牌", exact: true }).click();
      await page.waitForTimeout(330);
      await page.screenshot({ path: path.join(outputRoot, "standard-draw-flip.png"), fullPage: false });
    }

    await page.goto(target, { waitUntil: "networkidle" });
    await page.locator(".home-screen").waitFor();

    await page.getByRole("button", { name: /开测！开测！/ }).click();
    await page.locator(".question-page").waitFor();
    await assertNoOverflow(page, `${viewport.name} question 1`);

    let answered = 0;
    while (answered < 20 && await page.locator(".quiz-screen").count()) {
      const questionNumber = Number((await page.locator(".progress-label").textContent())?.split("/")[0].trim() || "0");
      if (questionNumber === 13) {
        await assertImages(page, `${viewport.name} visual question`);
        await page.waitForTimeout(280);
        await page.screenshot({ path: path.join(outputRoot, `${viewport.name}-question-13.png`), fullPage: true });
      }
      const optionIndex = answered % 3;
      await page.locator("[data-action='choose-option']").nth(optionIndex).click();
      answered += 1;
      await page.waitForTimeout(210);
    }

    await page.locator(".result-screen").waitFor();
    await page.waitForTimeout(300);
    await assertNoOverflow(page, `${viewport.name} result`);
    await assertImages(page, `${viewport.name} result`);
    const hero = await page.locator(".result-hero img").evaluate((image) => ({
      naturalRatio: image.naturalWidth / image.naturalHeight,
      renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
      width: image.getBoundingClientRect().width,
      containerWidth: image.parentElement?.getBoundingClientRect().width || 0,
      top: image.getBoundingClientRect().top,
      containerTop: image.parentElement?.getBoundingClientRect().top || 0,
      marginTop: Number.parseFloat(getComputedStyle(image).marginTop),
    }));
    assert(Math.abs(hero.naturalRatio - hero.renderedRatio) < 0.01, `${viewport.name}: result hero ratio changed`);
    assert(Math.abs(hero.width - hero.containerWidth) < 1, `${viewport.name}: result hero does not fill its container`);
    assert(hero.marginTop < -hero.containerWidth * 0.04, `${viewport.name}: result poster source-canvas trim is missing`);
    assert(hero.top < hero.containerTop, `${viewport.name}: result poster still exposes its blank top canvas`);
    await page.screenshot({ path: path.join(outputRoot, `${viewport.name}-result-top.png`), fullPage: false });
    if (viewport.name === "standard") {
      await page.screenshot({ path: path.join(outputRoot, `${viewport.name}-result-full.png`), fullPage: true });
    }

    await page.getByRole("button", { name: /保存人格卡/ }).click();
    await page.locator("#toast").waitFor({ state: "visible" });
    assert((await page.locator("#toast").textContent())?.includes("小红书小工具"), `${viewport.name}: save fallback is unclear`);

    await page.getByRole("button", { name: /看看其他 15 种人格/ }).click();
    await page.locator(".directory-screen").waitFor();
    assert(await page.locator(".persona-card").count() === 16, `${viewport.name}: directory does not contain 16 personas`);
    const directoryPosters = await page.locator(".persona-card").evaluateAll((cards) => cards.map((card) => {
      const frame = card.querySelector(".persona-card-visual");
      const image = frame?.querySelector("img");
      if (!(frame instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return null;
      const frameBox = frame.getBoundingClientRect();
      const imageBox = image.getBoundingClientRect();
      return {
        code: card.getAttribute("data-code"),
        imageTop: imageBox.top,
        frameTop: frameBox.top,
        marginTop: Number.parseFloat(getComputedStyle(image).marginTop),
        frameWidth: frameBox.width,
      };
    }));
    assert(directoryPosters.every((poster) => poster && poster.marginTop < -poster.frameWidth * 0.04 && poster.imageTop < poster.frameTop), `${viewport.name}: one or more directory posters still expose blank top canvas`);
    await scrollThrough(page);
    await assertImages(page, `${viewport.name} directory`);
    await assertNoOverflow(page, `${viewport.name} directory`);
    if (viewport.name === "standard") {
      await page.screenshot({ path: path.join(outputRoot, `${viewport.name}-directory.png`), fullPage: true });

      const codes = await page.locator(".persona-card").evaluateAll((cards) => cards.map((card) => card.getAttribute("data-code")));
      for (const code of codes) {
        await page.locator(`.persona-card[data-code='${code}']`).click();
        await page.locator(".result-screen").waitFor();
        await scrollThrough(page);
        await page.waitForTimeout(120);
        await assertImages(page, `persona ${code}`);
        await assertNoOverflow(page, `persona ${code}`);
        assert((await page.locator(".result-code").textContent())?.includes(code), `persona ${code}: wrong result content`);
        await page.getByRole("button", { name: /看看其他 15 种人格/ }).click();
        await page.locator(".directory-screen").waitFor();
      }
    }

    assert(runtimeErrors.length === 0, `${viewport.name}: ${runtimeErrors.join(" | ")}`);
    report.viewports.push({
      ...viewport,
      answeredQuestions: answered,
      personaCards: 16,
      runtimeErrors,
      status: "passed",
    });
    await context.close();
  }
} catch (error) {
  report.status = "failed";
  report.errors.push(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await browser.close();
  fs.writeFileSync(path.join(outputRoot, "qa-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
}
