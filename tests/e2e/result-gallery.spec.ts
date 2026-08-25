import { expect, test, type Locator } from "@playwright/test";
import { appPath } from "./paths";

const PERSONAS = [
  { slug: "grid", code: "GRID", name: "网格秩序者", architect: "密斯·凡·德·罗", buildings: ["巴塞罗那馆", "范斯沃斯住宅", "西格拉姆大厦"] },
  { slug: "root", code: "ROOT", name: "场所生长者", architect: "弗兰克·劳埃德·赖特", buildings: ["流水别墅", "罗比住宅", "西塔里埃森"] },
  { slug: "mass", code: "MASS", name: "混凝土嘴硬者", architect: "勒·柯布西耶", buildings: ["马赛公寓", "拉图雷特修道院", "昌迪加尔议会建筑群"] },
  { slug: "void", code: "VOID", name: "光影留白者", architect: "安藤忠雄", buildings: ["光之教堂", "地中美术馆", "水御堂"] },
  { slug: "tech", code: "TECH", name: "系统外挂者", architect: "诺曼·福斯特", buildings: ["香港汇丰总行大厦", "德国国会大厦改造", "赫斯特大厦"] },
  { slug: "flow", code: "FLOW", name: "直线逃犯", architect: "扎哈·哈迪德", buildings: ["盖达尔·阿利耶夫中心", "MAXXI 国立二十一世纪艺术博物馆", "北京大兴国际机场"] },
  { slug: "orna", code: "ORNA", name: "装饰上头者", architect: "安东尼·高迪", buildings: ["巴特罗之家", "圣家堂", "桂尔公园"] },
  { slug: "hand", code: "HAND", name: "旧料收藏者", architect: "王澍 × 陆文宇", buildings: ["宁波历史博物馆", "中国美术学院象山校区", "富阳文村村落改造"] },
] as const;

const expectRenderedImage = async (image: Locator, minimumWidth: number, minimumHeight: number) => {
  await expect(image).toBeVisible();
  await expect.poll(async () => image.evaluate((item: HTMLImageElement) => item.naturalWidth)).toBeGreaterThan(0);
  const box = await image.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(minimumWidth);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(minimumHeight);
  await expect(image).not.toHaveCSS("opacity", "0");
};

test("八型结果页的身份映射、图片资源与布局均完整", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "全八型长页视觉回归只在代表性 Android 视口执行一次");
  test.setTimeout(180_000);

  for (const persona of PERSONAS) {
    const { slug } = persona;
    await page.goto(appPath(`/result/${slug}/?from=share`), { waitUntil: "domcontentloaded" });
    await page.locator(".result-footer").scrollIntoViewIfNeeded();

    await expect(page.locator(".result-code")).toHaveText(persona.code);
    await expect(page.locator(".result-name")).toHaveText(persona.name);
    await expect(page.locator(".architect-name")).toHaveText(persona.architect);
    await expect(page.locator(".building-title")).toHaveText(persona.buildings[0]);
    await expect(page.locator(".extension-building h3")).toHaveText([persona.buildings[1], persona.buildings[2]]);

    const images = page.locator("main img");
    await expect(images).toHaveCount(5);
    const hero = page.locator(".result-stage img");
    await expect(hero).toHaveAttribute("src", new RegExp(`/characters-v2/${slug}-scene-v2\\.webp$`));
    await expect.poll(async () => hero.evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight])).toEqual([1200, 1000]);
    await expectRenderedImage(hero, 390, 320);
    await expectRenderedImage(page.locator(".architect-portrait"), 110, 135);
    await expectRenderedImage(page.locator(".building-image"), 390, 230);
    await expect(page.locator(".extension-building-image")).toHaveCount(2);
    await expectRenderedImage(page.locator(".extension-building-image").nth(0), 110, 80);
    await expectRenderedImage(page.locator(".extension-building-image").nth(1), 110, 80);

    const imageSources = await images.evaluateAll((items) => items.map((image) => (image as HTMLImageElement).currentSrc));
    expect(new Set(imageSources).size).toBe(5);

    await expect(page.locator("main .media-fallback")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `artifacts/qa/round-3/result-${slug}-393x873.png`,
      fullPage: true,
    });
  }
});
