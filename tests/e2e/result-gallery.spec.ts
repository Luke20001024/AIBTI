import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const PERSONAS = [
  ["grid", "GRID"], ["span", "SPAN"], ["mass", "MASS"], ["tech", "TECH"],
  ["void", "VOID"], ["root", "ROOT"], ["eave", "EAVE"], ["tide", "TIDE"],
  ["ruin", "RUIN"], ["hand", "HAND"], ["sign", "SIGN"], ["orna", "ORNA"],
  ["veil", "VEIL"], ["flow", "FLOW"], ["plus", "PLUS"], ["mix", "MIX"],
] as const;

test("16 个人格结果页均有完整首屏、真实人物、五座真实建筑与 Sheet 档案", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "16 页全量回归在代表性 Android 手机执行");
  test.setTimeout(240_000);

  for (const [slug, code] of PERSONAS) {
    await page.goto(appPath(`/result/${slug}/?from=share`), { waitUntil: "domcontentloaded" });
    const resultPage = page.locator("[data-result-v7-page]");
    const hero = resultPage.locator(":scope > section").first();
    const heroImage = hero.locator("img");

    await expect(resultPage).toBeVisible();
    await expect(page.locator("#result-v7-title")).toBeAttached();
    await expect(heroImage).toHaveCount(1);
    await expect(heroImage).toHaveAttribute("src", new RegExp(`/images/personas/${slug}/hero-poster-v1\\.webp$`));
    await expect.poll(() => heroImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThanOrEqual(780);
    await expect.poll(() => heroImage.evaluate((image: HTMLImageElement) => image.naturalHeight)).toBeGreaterThanOrEqual(1564);

    await expect(resultPage.getByText("01 / 先说人话", { exact: true })).toHaveCount(1);
    await expect(resultPage.getByText("02 / 代表建筑师", { exact: true })).toHaveCount(1);
    await expect(resultPage.getByText("03 / 三次实锤", { exact: true })).toHaveCount(1);
    await expect(resultPage.getByText("04 / 继续看", { exact: true })).toHaveCount(1);
    await expect(resultPage.getByText(`${code} · RESULT LOCKED`, { exact: true })).toHaveCount(1);
    await expect(resultPage.locator("details")).toHaveCount(0);
    await expect(resultPage.getByRole("button", { name: /打开|看/ })).toHaveCount(6);
    await expect(resultPage.locator("img")).toHaveCount(7);
    await expect(resultPage.locator(".media-fallback")).toHaveCount(0);

    const dimensions = await resultPage.locator("img").evaluateAll((images) => images.map((item) => {
      const image = item as HTMLImageElement;
      return [image.naturalWidth, image.naturalHeight];
    }));
    expect(dimensions.every(([width, height]) => width > 0 && height > 0), code).toBe(true);

    const workButtons = resultPage.locator("section").filter({ hasText: "03 / 三次实锤" }).getByRole("button");
    await workButtons.first().click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: /现场看什么/ })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await sheet.getByRole("button", { name: /关闭/ }).click();
    await expect(sheet).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, code).toBeLessThanOrEqual(1);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `artifacts/qa/persona-expansion-16-v1/result-${slug}-393x873.png`,
      fullPage: false,
    });
  }
});
