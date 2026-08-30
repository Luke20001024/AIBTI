import { expect, test, type Locator, type Page } from "@playwright/test";
import { appPath } from "./paths";

const SLUGS = [
  "grid", "span", "mass", "tech", "void", "root", "eave", "tide",
  "ruin", "hand", "sign", "orna", "veil", "flow", "plus", "mix",
] as const;

const PHONE_PROJECTS = new Set([
  "android-360-chromium",
  "iphone-390-webkit",
  "iphone-430-webkit",
]);

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, label).toBeLessThanOrEqual(1);
}

async function expectIntrinsicImages(images: Locator, label: string) {
  const count = await images.count();
  expect(count, `${label} 应至少包含一张内容图片`).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(
      () => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0),
      { message: `${label} 第 ${index + 1} 张图片应完成加载` },
    ).toBe(true);

    const geometry = await image.evaluate((node: HTMLImageElement) => {
      const box = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        naturalWidth: node.naturalWidth,
        naturalHeight: node.naturalHeight,
        renderedWidth: box.width,
        renderedHeight: box.height,
        objectFit: style.objectFit,
        aspectRatio: style.aspectRatio,
      };
    });

    expect(geometry.renderedWidth, `${label} 第 ${index + 1} 张图片宽度`).toBeGreaterThan(0);
    expect(geometry.renderedHeight, `${label} 第 ${index + 1} 张图片高度`).toBeGreaterThan(0);
    expect(geometry.objectFit, `${label} 第 ${index + 1} 张图片禁止 cover 裁切`).not.toBe("cover");
    expect(Math.abs(
      (geometry.renderedWidth / geometry.renderedHeight)
      - (geometry.naturalWidth / geometry.naturalHeight),
    ), `${label} 第 ${index + 1} 张图片应保持固有比例`).toBeLessThanOrEqual(0.004);
  }
}

test("16 个人格结果页的全部外层内容图均完整显示", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone-390-webkit", "16 页全量媒体合同固定在 390×844 执行");
  test.setTimeout(240_000);

  for (const slug of SLUGS) {
    await page.goto(appPath(`/result/${slug}/`), { waitUntil: "domcontentloaded" });
    const images = page.locator('[data-result-v7-page] img[data-media-fit="intrinsic"]');
    await expect(images, `${slug} 外层应有首图、人物、三张作品和两张延伸作品`).toHaveCount(7);
    if (slug === "void") {
      await page.screenshot({
        path: "artifacts/qa/content-media-system-v1/void-hero-iphone-390-webkit.png",
        fullPage: false,
      });
    }
    await expectIntrinsicImages(images, slug);
    await expectNoHorizontalOverflow(page, slug);
  }
});

test("人物、建筑和延伸建筑三类档案图均保持原始比例", async ({ page }, testInfo) => {
  test.skip(!PHONE_PROJECTS.has(testInfo.project.name), "三档手机宽度执行弹层媒体合同");
  test.setTimeout(120_000);
  await page.goto(appPath("/result/sign/"), { waitUntil: "domcontentloaded" });

  const architectSection = page.locator("section").filter({ hasText: "02 / 代表建筑师" });
  await architectSection.getByRole("button", { name: /打开人物档案/ }).click();
  let dialog = page.getByRole("dialog");
  await expectIntrinsicImages(dialog.locator('img[data-media-fit="intrinsic"]'), "人物档案");
  await dialog.getByRole("button", { name: /关闭/ }).click();

  const worksSection = page.locator("section").filter({ hasText: "03 / 三次实锤" });
  await worksSection.getByRole("button").first().click();
  dialog = page.getByRole("dialog");
  await expectIntrinsicImages(dialog.locator('img[data-media-fit="intrinsic"]'), "建筑档案");
  await page.screenshot({
    path: `artifacts/qa/content-media-system-v1/work-sheet-${testInfo.project.name}.png`,
    fullPage: false,
  });
  await dialog.getByRole("button", { name: /关闭/ }).click();

  const lineageSection = page.locator("section").filter({ hasText: "04 / 继续看" });
  await lineageSection.getByRole("button").first().click();
  dialog = page.getByRole("dialog");
  await expectIntrinsicImages(dialog.locator('img[data-media-fit="intrinsic"]'), "延伸建筑档案");
  await expectNoHorizontalOverflow(page, `档案弹层 ${testInfo.project.name}`);
  await dialog.getByRole("button", { name: /关闭/ }).click();
});

test("人格目录和结果长页不再使用裁切缩略图", async ({ page }, testInfo) => {
  test.skip(!PHONE_PROJECTS.has(testInfo.project.name), "三档手机宽度执行目录与长页媒体合同");
  test.setTimeout(120_000);

  await page.goto(appPath("/result/"), { waitUntil: "domcontentloaded" });
  const posters = page.locator('img[data-media-fit="intrinsic"]');
  await expect(posters).toHaveCount(16);
  await expectIntrinsicImages(posters, "16 人格目录");
  await expectNoHorizontalOverflow(page, `人格目录 ${testInfo.project.name}`);
  await page.screenshot({
    path: `artifacts/qa/content-media-system-v1/directory-${testInfo.project.name}.png`,
    fullPage: true,
  });

  await page.goto(appPath("/result/sign/"), { waitUntil: "domcontentloaded" });
  const resultImages = page.locator('[data-result-v7-page] img[data-media-fit="intrinsic"]');
  await expect(resultImages).toHaveCount(7);
  await expectIntrinsicImages(resultImages, `SIGN 长页 ${testInfo.project.name}`);
  await expectNoHorizontalOverflow(page, `SIGN 长页 ${testInfo.project.name}`);
  await page.screenshot({
    path: `artifacts/qa/content-media-system-v1/result-sign-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("图像题的三个选项随原图比例完整显示", async ({ page }, testInfo) => {
  test.skip(!PHONE_PROJECTS.has(testInfo.project.name), "三档手机宽度执行题目图媒体合同");
  await page.goto(appPath("/quiz/?reset=1"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".quiz-shell")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
  for (let index = 0; index < 12; index += 1) {
    await page.getByRole("radio").first().evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.locator(".quiz-progress-count strong")).toHaveText(String(index + 2));
  }

  const questionImages = page.locator('.generated-question-visual[data-media-fit="intrinsic"]');
  await expect(questionImages).toHaveCount(3);
  await expectIntrinsicImages(questionImages, `Q13 ${testInfo.project.name}`);
  await expectNoHorizontalOverflow(page, `Q13 ${testInfo.project.name}`);
  await page.screenshot({
    path: `artifacts/qa/content-media-system-v1/quiz-q13-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
