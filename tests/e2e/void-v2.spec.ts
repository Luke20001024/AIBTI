import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const representativeProjects = new Set([
  "iphone-390-webkit",
  "android-393-chromium",
  "embedded-short-chromium",
  "harmony-proxy-chromium",
]);

test("VOID 首屏在手机上只渲染一张完整人格海报", async ({ page }, testInfo) => {
  await page.goto(appPath("/preview/void-v2/"), { waitUntil: "domcontentloaded" });

  const root = page.locator("[data-void-v2-page]");
  const hero = root.locator("section").first();
  const poster = hero.locator("img");

  await expect(root).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "寂静的边界" })).toBeAttached();
  await expect(poster).toHaveCount(1);
  await expect(poster).toBeVisible();
  await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(780);
  await expect.poll(() => poster.evaluate((image: HTMLImageElement) => image.naturalHeight)).toBe(1564);

  const geometry = await poster.evaluate((image) => {
    const box = image.getBoundingClientRect();
    return { width: box.width, height: box.height, viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(geometry.viewportWidth - 16);
  expect(Math.abs(geometry.height - geometry.width * (1564 / 780))).toBeLessThanOrEqual(1);

  await expect(hero.getByRole("link")).toHaveCount(0);
  await expect(hero.getByRole("button")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);

  if (representativeProjects.has(testInfo.project.name)) {
    await page.screenshot({ path: `artifacts/qa/void-v2/hero-${testInfo.project.name}.png`, fullPage: false });
  }
});

test("VOID 主页面用紧凑文稿尽快交付建筑师与三座作品", async ({ page }, testInfo) => {
  test.skip(!representativeProjects.has(testInfo.project.name), "核心长页只在代表性手机环境执行");
  await page.goto(appPath("/preview/void-v2/"), { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.locator("details, summary, input[type=range]")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "你的空间，不爱说废话" })).toBeAttached();
  await expect(page.getByText(/现代主义负责立骨架/)).toBeAttached();
  await expect(page.getByText(/建筑界最会打拳的那位/)).toBeAttached();
  await expect(page.getByAltText(/轴测模型/)).toHaveCount(0);
  for (const title of ["光之教堂", "水御堂", "地中美术馆"]) {
    await expect(page.getByRole("heading", { level: 3, name: title, exact: true })).toBeAttached();
  }
  await expect(page.getByText(/墙上开了一刀/)).toBeAttached();
  await expect(page.getByText(/荷花池下面/)).toBeAttached();
  await expect(page.getByText(/别抢整座岛的镜头/)).toBeAttached();
  await expect(page.getByText(/别抄|，抄/)).toHaveCount(0);
  await expect(page.getByText(/而是/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /打开人物故事/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /看光怎么接管整个空间/ })).toBeEnabled();

  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});

test("人物与作品详情在移动端 Sheet 中提供完整内容", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "详情交互只在代表性 Android 视口执行一次");
  await page.goto(appPath("/preview/void-v2/"), { waitUntil: "domcontentloaded" });

  const architectTrigger = page.getByRole("button", { name: /打开人物故事/ });
  await architectTrigger.click();
  const architectSheet = page.getByRole("dialog");
  await expect(architectSheet).toBeVisible();
  await expect(architectSheet.getByRole("heading", { name: "安藤忠雄" })).toBeVisible();
  await expect(architectSheet.getByText(/拳击早就练进了他的空间方法/)).toBeVisible();
  await architectSheet.getByRole("button", { name: /关闭/ }).click();
  await expect(architectSheet).toBeHidden();
  await expect(architectTrigger).toBeFocused();

  const workTrigger = page.getByRole("button", { name: /看光怎么接管整个空间/ });
  await workTrigger.click();
  const workSheet = page.getByRole("dialog");
  await expect(workSheet.getByRole("heading", { name: "光之教堂" })).toBeVisible();
  await expect(workSheet.getByText("现场看什么", { exact: true })).toBeVisible();
  await expect(workSheet.getByText("可以带走的判断", { exact: true })).toBeVisible();
  await expect(workSheet.locator("figure img")).toHaveCount(2);
  const galleryRendering = await workSheet.locator("figure img").evaluateAll((images) =>
    images.map((element) => {
      const image = element as HTMLImageElement;
      const box = image.getBoundingClientRect();
      return {
        renderedRatio: box.width / box.height,
        naturalRatio: image.naturalWidth / image.naturalHeight,
        objectFit: getComputedStyle(image).objectFit,
      };
    }),
  );
  expect(galleryRendering.every(({ renderedRatio, naturalRatio, objectFit }) =>
    Math.abs(renderedRatio - naturalRatio) <= 0.004 && objectFit === "contain",
  )).toBe(true);
  await page.screenshot({ path: "artifacts/qa/void-v2/work-sheet-android-393.png", fullPage: false });
  await workSheet.getByRole("button", { name: /关闭/ }).click();
  await expect(workTrigger).toBeFocused();
});

test("VOID 以同频建筑师、保存分享与来源页收口", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "完整终点只在代表性 Android 视口执行一次");
  await page.goto(appPath("/preview/void-v2/"), { waitUntil: "domcontentloaded" });

  await expect(page.getByAltText(/金贝尔艺术博物馆真实外景/)).toBeAttached();
  await expect(page.getByAltText(/瓦尔斯温泉真实外景/)).toBeAttached();
  await expect(page.getByRole("heading", { name: /安静这件事/ })).toBeAttached();
  await expect(page.getByRole("button", { name: "认识路易斯·康" })).toBeEnabled();
  const lineageImage = page.getByAltText(/金贝尔艺术博物馆真实外景/);
  const lineageRatio = await lineageImage.evaluate((image: HTMLImageElement) => {
    const box = image.getBoundingClientRect();
    return {
      rendered: box.width / box.height,
      natural: image.naturalWidth / image.naturalHeight,
    };
  });
  expect(Math.abs(lineageRatio.rendered - lineageRatio.natural)).toBeLessThanOrEqual(0.004);
  await page.getByRole("heading", { name: /安静这件事/ }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/qa/void-v2/lineage-android-393.png", fullPage: false });

  const ending = page.getByRole("heading", { level: 2, name: "寂静的边界" });
  await ending.scrollIntoViewIfNeeded();
  await expect(page.getByText("空间一安静，重要的东西就有了主场", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "保存 VOID 人格封面" })).toBeVisible();
  await expect(page.getByRole("button", { name: "分享 VOID" })).toBeVisible();
  await expect(page.getByRole("link", { name: "重新测试" })).toBeVisible();
  await expect(page.getByRole("link", { name: /查看测试方法与图片来源/ })).toHaveAttribute(
    "href",
    appPath("/preview/void-v2/sources/"),
  );

  await page.goto(appPath("/preview/void-v2/sources/"), { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "图片与授权状态" })).toBeVisible();
  await expect(page.getByText(/金贝尔艺术博物馆与瓦尔斯温泉使用 Wikimedia Commons/)).toBeVisible();
  await expect(page.locator("[class*=sourcesList] a")).toHaveCount(11);
});

test.describe("VOID 无 JavaScript 降级", () => {
  test.use({ javaScriptEnabled: false });

  test("核心人格判断与三座作品仍在主页面静态 HTML 中", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "android-393-chromium", "无脚本合同只需在一个代表性手机环境执行");
    await page.goto(appPath("/preview/void-v2/"), { waitUntil: "domcontentloaded" });

    await expect(page.getByText("你的空间，不爱说废话", { exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { level: 3, name: "光之教堂" })).toBeAttached();
    await expect(page.getByRole("heading", { level: 3, name: "水御堂" })).toBeAttached();
    await expect(page.getByRole("heading", { level: 3, name: "地中美术馆" })).toBeAttached();
    await expect(page.getByRole("button", { name: /打开人物故事/ })).toBeDisabled();
  });
});
