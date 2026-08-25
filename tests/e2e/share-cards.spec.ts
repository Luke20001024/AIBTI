import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const PERSONAS = ["grid", "root", "mass", "void", "tech", "flow", "orna", "hand"] as const;

test("八型分享卡都保留人物动作并输出公开二维码入口", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "八型出图只在代表性高 DPR 手机执行一次");
  test.setTimeout(120_000);

  for (const slug of PERSONAS) {
    await page.goto(appPath(`/result/${slug}/?from=share`), { waitUntil: "domcontentloaded" });
    const hero = page.locator(".result-stage img");
    await expect(hero).toBeVisible();
    await expect.poll(async () => hero.evaluate((item: HTMLImageElement) => item.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator(".result-stage .media-fallback")).toHaveCount(0);
    await page.getByRole("button", { name: "生成分享卡" }).click();
    const dialog = page.getByRole("dialog", { name: "AIBTI 分享卡" });
    await expect(dialog).toBeVisible({ timeout: 12_000 });
    const image = dialog.locator("img");
    await expect(image).toBeVisible();
    await expect.poll(async () => image.evaluate((item: HTMLImageElement) => item.naturalWidth)).toBe(1080);
    await expect.poll(async () => image.evaluate((item: HTMLImageElement) => item.naturalHeight)).toBe(1350);
    await image.screenshot({ path: `artifacts/qa/round-2/share-card-${slug}.png` });

    const publicLink = new URL(await dialog.getByRole("textbox", { name: "可选择的公开结果链接" }).inputValue());
    expect(publicLink.pathname).toMatch(new RegExp(`/result/${slug}/$`));
    expect(publicLink.searchParams.get("from")).toBe("share");
    for (const privateKey of ["mine", "a", "q", "s", "u"]) {
      expect(publicLink.searchParams.has(privateKey)).toBe(false);
    }

    await dialog.getByRole("button", { name: "关闭 ×" }).click();
    await expect(dialog).toBeHidden();
  }
});
