import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const expectNoHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
};

test("首页在手机首屏说明 16 人格与动态题，并保留立即开始动作", async ({ page }, testInfo) => {
  await page.goto(appPath("/"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "测测你的 建筑直觉" })).toBeVisible();
  await expect(page.getByText(/匹配 16 种建筑人格/)).toBeVisible();
  await expect(page.getByRole("link", { name: /开始测试|继续上次测试|继续生成结果|查看我的/ })).toBeInViewport();
  await expect(page.locator(".home-facts").getByText("18 + 最多 2 题", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  if (["iphone-390-webkit", "android-393-chromium", "harmony-proxy-chromium"].includes(testInfo.project.name)) {
    await page.screenshot({ path: `artifacts/qa/persona-expansion-16-v1/home-${testInfo.project.name}.png`, fullPage: false });
  }
});

test("图像题保持直观、可读并满足 44px 触控尺寸", async ({ page }, testInfo) => {
  await page.goto(appPath("/quiz/"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".quiz-shell")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
  for (let index = 0; index < 12; index += 1) {
    // This case validates Q13 layout, while the full-flow suite separately exercises
    // real touch/click navigation. Dispatching avoids a WebKit retry race when the
    // keyed question subtree is replaced during pointer-up.
    await page.getByRole("radio").first().dispatchEvent("click");
    await expect(page.locator(".quiz-progress-count strong")).toHaveText(String(index + 2));
  }

  await expect(page.locator(".generated-question-visual")).toHaveCount(3);
  await expect(page.getByRole("radio")).toHaveCount(3);
  const targetSizes = await page.getByRole("radio").evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }),
  );
  expect(targetSizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  await expectNoHorizontalOverflow(page);
  if (["iphone-390-webkit", "android-393-chromium", "harmony-proxy-chromium"].includes(testInfo.project.name)) {
    await page.screenshot({ path: `artifacts/qa/persona-expansion-16-v1/quiz-q13-${testInfo.project.name}.png`, fullPage: false });
  }
});

test("结果首屏海报贴合手机内容宽度且不发生横向溢出", async ({ page }, testInfo) => {
  await page.goto(appPath("/result/root/"), { waitUntil: "domcontentloaded" });
  await expect(page.locator("#result-v7-title")).toBeAttached();
  const hero = page.locator("[data-result-v7-page] > section").first();
  const stage = await hero.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const page = element.parentElement!.getBoundingClientRect();
    const image = element.querySelector("img")!;
    const imageBox = image.getBoundingClientRect();
    return {
      left: box.left - page.left,
      right: page.right - box.right,
      width: box.width,
      height: box.height,
      imageWidth: imageBox.width,
      imageHeight: imageBox.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    };
  });
  expect(Math.abs(stage.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(stage.right)).toBeLessThanOrEqual(1);
  expect(stage.width).toBeGreaterThanOrEqual(359);
  expect(Math.abs(stage.imageWidth - stage.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(stage.imageHeight - stage.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(
    (stage.imageWidth / stage.imageHeight) - (stage.naturalWidth / stage.naturalHeight),
  )).toBeLessThanOrEqual(0.002);
  await expect(hero.locator("img")).toHaveAttribute("src", /\/images\/personas\/root\/hero-poster-v1\.webp$/);
  await expectNoHorizontalOverflow(page);
  if (["android-360-chromium", "iphone-390-webkit", "iphone-430-webkit"].includes(testInfo.project.name)) {
    await page.screenshot({
      path: `artifacts/qa/persona-expansion-16-v1/hero-responsive-${testInfo.project.name}.png`,
      fullPage: false,
    });
  }
});

test("建筑内容使用全高 Sheet 阅读，关闭后恢复页面滚动", async ({ page }, testInfo) => {
  test.skip(
    !["iphone-390-webkit", "android-393-chromium", "harmony-proxy-chromium"].includes(testInfo.project.name),
    "展开阅读在三类代表性手机环境各跑一次",
  );
  await page.goto(appPath("/result/void/?from=share"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const worksSection = page.locator("section").filter({ hasText: "03 / 三次实锤" });
  const firstWork = worksSection.getByRole("button").first();
  await firstWork.click();
  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "现场看什么" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await sheet.getByRole("button", { name: /关闭/ }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expectNoHorizontalOverflow(page);
});

test("结果页首个静态 HTML 帧已经包含人格与内容，不等待客户端补壳", async ({ request }) => {
  const response = await request.get(appPath("/result/grid/?mine=1"));
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("01 / 先说人话");
  expect(html).toContain("/images/personas/grid/hero-poster-v1.webp");
  expect(html).toContain("03 / 三次实锤");
  expect(html).toMatch(/GRID(?:\s|<!--.*?-->)*· RESULT LOCKED/u);
  expect(html).not.toContain('aria-busy="true"');
});
