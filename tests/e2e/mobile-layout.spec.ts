import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const expectNoHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
};

test("首页在手机首屏完成定位、人格预览和开始动作", async ({ page }) => {
  await page.goto(appPath("/"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "测测你的 建筑人格" })).toBeVisible();
  await expect(page.getByRole("link", { name: /开始测试|继续上次测试|继续生成结果|查看我的/ })).toBeInViewport();
  await expect(page.locator(".home-facts").getByText("18 题", { exact: true })).toBeVisible();
  await expect(page.locator(".hero-range-item img")).toHaveCount(3);
  await expectNoHorizontalOverflow(page);
});

test("图像题保持直观、可读并满足触控尺寸", async ({ page }) => {
  await page.goto(appPath("/quiz/"), { waitUntil: "domcontentloaded" });
  for (let index = 1; index < 13; index += 1) {
    await page.getByRole("radio").first().click();
    await expect(page.locator(".quiz-progress-meta")).toContainText(`${String(index + 1).padStart(2, "0")} / 18`);
    await page.waitForTimeout(80);
  }

  await expect(page.locator(".question-visual-wrap svg")).toHaveCount(3);
  await expect(page.getByRole("radio")).toHaveCount(3);
  const targetSizes = await page.getByRole("radio").evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }),
  );
  expect(targetSizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  await expectNoHorizontalOverflow(page);
});

test("公开结果不会伪造个人维度，主视觉贴合手机宽度", async ({ page }) => {
  await page.goto(appPath("/result/root/"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".result-proof")).toHaveAttribute("data-result-view", "explore");
  await expect(page.getByText("这是 ROOT 的公开人格设定", { exact: true })).toBeVisible();
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

test("Owner 首个服务端帧保持占位，不闪现公开档案", async ({ request }) => {
  const response = await request.get(appPath("/result/grid/?mine=1"));
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('class="result-proof"');
  expect(html).toContain('aria-busy="true"');
  expect(html).not.toContain("公开页面只展示人格设定");
  expect(html).not.toContain("测测我是谁");
});
