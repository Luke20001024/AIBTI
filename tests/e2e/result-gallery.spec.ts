import { expect, test, type Locator } from "@playwright/test";
import { appPath } from "./paths";

const PERSONAS = [
  { slug: "grid", code: "GRID", language: "理性秩序", name: "网格秩序者", architect: "密斯·凡·德·罗", buildings: ["巴塞罗那馆", "范斯沃斯住宅", "西格拉姆大厦"] },
  { slug: "root", code: "ROOT", language: "有机生长", name: "场所生长者", architect: "弗兰克·劳埃德·赖特", buildings: ["流水别墅", "罗比住宅", "西塔里埃森"] },
  { slug: "mass", code: "MASS", language: "粗粝集体", name: "混凝土嘴硬者", architect: "勒·柯布西耶", buildings: ["马赛公寓", "拉图雷特修道院", "昌迪加尔议会建筑群"] },
  { slug: "void", code: "VOID", language: "诗意留白", name: "光影留白者", architect: "安藤忠雄", buildings: ["光之教堂", "地中美术馆", "水御堂"] },
  { slug: "tech", code: "TECH", language: "显性系统", name: "系统外挂者", architect: "诺曼·福斯特", buildings: ["香港汇丰总行大厦", "德国国会大厦改造", "赫斯特大厦"] },
  { slug: "flow", code: "FLOW", language: "流动未来", name: "直线逃犯", architect: "扎哈·哈迪德", buildings: ["盖达尔·阿利耶夫中心", "MAXXI 国立二十一世纪艺术博物馆", "北京大兴国际机场"] },
  { slug: "orna", code: "ORNA", language: "装饰生命", name: "装饰上头者", architect: "安东尼·高迪", buildings: ["巴特罗之家", "圣家堂", "桂尔公园"] },
  { slug: "hand", code: "HAND", language: "材料记忆", name: "旧料收藏者", architect: "王澍 × 陆文宇", buildings: ["宁波历史博物馆", "中国美术学院象山校区", "富阳文村村落改造"] },
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
    await expect(page.locator(".result-language")).toHaveText(persona.language);
    await expect(page.locator(".result-persona-name")).toContainText(persona.name);
    await expect(page.locator(".architect-intro h2")).toHaveText(persona.architect);
    await expect(page.locator(".featured-work h3")).toHaveText([...persona.buildings]);
    await expect(page.locator(".recommended-work h3")).toHaveCount(2);
    await expect(page.locator(".lineage-summary")).toBeVisible();

    const images = page.locator("main img");
    await expect(images).toHaveCount(7);
    const hero = page.locator(".result-stage img");
    await expect(hero).toHaveAttribute("src", /\/images\/buildings\//);
    await expect.poll(async () => hero.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await expectRenderedImage(hero, 390, 280);
    await expectRenderedImage(page.locator(".architect-intro-portrait"), 110, 120);
    await expect(page.locator(".featured-work-image")).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expectRenderedImage(page.locator(".featured-work-image").nth(index), 350, 218);
    }
    await expect(page.locator(".recommended-work-image")).toHaveCount(2);
    await expectRenderedImage(page.locator(".recommended-work-image").nth(0), 110, 80);
    await expectRenderedImage(page.locator(".recommended-work-image").nth(1), 110, 80);

    const imageSources = await images.evaluateAll((items) => items.map((image) => (image as HTMLImageElement).currentSrc));
    expect(new Set(imageSources).size).toBe(6);

    await expect(page.locator("main .media-fallback")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `artifacts/qa/round-6/result-${slug}-393x873.png`,
      fullPage: true,
    });
  }
});
