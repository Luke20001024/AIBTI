import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const SLUGS = [
  "grid", "span", "mass", "tech", "void", "root", "eave", "tide",
  "ruin", "hand", "sign", "orna", "veil", "flow", "plus", "mix",
] as const;

test("16 张人格首屏均以单张扁平海报铺满手机内容宽度", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone-390-webkit", "首屏全量视觉合同在 390×844 iPhone 视口执行");
  test.setTimeout(180_000);

  for (const slug of SLUGS) {
    await page.goto(appPath(`/result/${slug}/`), { waitUntil: "domcontentloaded" });
    const resultPage = page.locator("[data-result-v7-page]");
    const hero = resultPage.locator(":scope > section").first();
    const poster = hero.locator("img");
    await expect(poster).toHaveCount(1);
    await expect(hero.getByRole("button")).toHaveCount(0);
    await expect(hero.getByRole("link")).toHaveCount(0);

    const geometry = await poster.evaluate((image: HTMLImageElement) => {
      const box = image.getBoundingClientRect();
      return {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: box.width,
      renderedHeight: box.height,
      heroHeight: image.parentElement!.getBoundingClientRect().height,
      pageWidth: image.closest("[data-result-v7-page]")!.getBoundingClientRect().width,
    };
    });
    expect(geometry.naturalWidth, slug).toBeGreaterThanOrEqual(780);
    expect(geometry.naturalHeight, slug).toBeGreaterThanOrEqual(1564);
    expect(Math.abs(geometry.renderedWidth - geometry.pageWidth), slug).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.renderedHeight - geometry.heroHeight), slug).toBeLessThanOrEqual(1);
    expect(Math.abs(
      (geometry.renderedWidth / geometry.renderedHeight) - (geometry.naturalWidth / geometry.naturalHeight),
    ), slug).toBeLessThanOrEqual(0.002);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), slug)
      .toBeLessThanOrEqual(1);
  }
});
