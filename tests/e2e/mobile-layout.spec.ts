import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const expectNoHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
};

test("纯文字首页在手机首屏完成定位和开始动作", async ({ page }, testInfo) => {
  await page.goto(appPath("/"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "测测你的 建筑直觉" })).toBeVisible();
  await expect(page.getByRole("link", { name: /开始测试|继续上次测试|继续生成结果|查看我的/ })).toBeInViewport();
  await expect(page.locator(".home-facts").getByText("18 题", { exact: true })).toBeVisible();
  await expect(page.locator(".hero-stage")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  if (["iphone-390-webkit", "android-393-chromium", "harmony-proxy-chromium"].includes(testInfo.project.name)) {
    await page.screenshot({ path: `artifacts/qa/round-5/home-${testInfo.project.name}.png`, fullPage: true });
  }
});

test("图像题保持直观、可读并满足触控尺寸", async ({ page }, testInfo) => {
  await page.goto(appPath("/quiz/"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".quiz-shell")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
  await expect(page.getByRole("radio").first()).toBeVisible();
  for (let index = 1; index < 13; index += 1) {
    await page.getByRole("radio").first().click({ force: true });
    await expect(page.locator(".quiz-progress-count strong")).toHaveText(String(index + 1));
    await page.waitForTimeout(80);
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
    await page.screenshot({ path: `artifacts/qa/round-5/quiz-q13-${testInfo.project.name}.png`, fullPage: true });
  }
});

test("公开结果不会伪造个人维度，主视觉贴合手机宽度", async ({ page }) => {
  await page.goto(appPath("/result/root/"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".result-proof")).toHaveAttribute("data-result-view", "explore");
  await expect(page.getByRole("heading", { name: "有机生长", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "测出你的建筑母语 →" })).toBeVisible();
  await expect(page.getByText("展开八维建筑倾向", { exact: true })).toHaveCount(0);

  const stage = await page.locator(".result-stage").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: innerWidth - box.right, width: box.width };
  });
  expect(Math.abs(stage.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(stage.right)).toBeLessThanOrEqual(1);
  expect(stage.width).toBeGreaterThanOrEqual(359);
  await expectNoHorizontalOverflow(page);
});

test("建筑资料卡在手机上锁定背景、恢复焦点且可由返回键关闭", async ({ page }, testInfo) => {
  test.skip(
    !["iphone-390-webkit", "android-393-chromium", "harmony-proxy-chromium"].includes(testInfo.project.name),
    "交互资料卡在三类代表性手机环境各跑一次",
  );
  await page.goto(appPath("/result/void/?from=share"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".result-story")).toHaveAttribute(
    "data-interactive",
    "true",
    { timeout: 20_000 },
  );

  const trigger = page.getByRole("button", { name: "查看空间细节" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "光之教堂" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "关闭", exact: true })).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await expect.poll(async () => {
    const dialogBottom = await dialog.evaluate(
      (element) => element.getBoundingClientRect().bottom,
    );
    const viewportHeight = await page.evaluate(() => innerHeight);
    return Math.abs(dialogBottom - viewportHeight);
  }, { timeout: 3_000 }).toBeLessThanOrEqual(12);

  const sheetGeometry = await dialog.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height, bottom: box.bottom };
  });
  expect(sheetGeometry.width).toBeGreaterThanOrEqual(360);
  expect(sheetGeometry.height).toBeGreaterThanOrEqual(650);
  expect(Math.abs(sheetGeometry.bottom - (await page.evaluate(() => innerHeight)))).toBeLessThanOrEqual(12);

  await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("Owner 首个服务端帧保持占位，不闪现公开档案", async ({ request }) => {
  const response = await request.get(appPath("/result/grid/?mine=1"));
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('class="result-proof"');
  expect(html).toContain('aria-busy="true"');
  expect(html).not.toContain("公开页面只展示人格设定");
  expect(html).not.toContain("测出你的建筑母语");
});
