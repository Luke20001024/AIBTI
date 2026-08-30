import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

test("390 × 844 通用手机容器在本地开发与静态子路径中都能切换 16 人格", async ({ page }) => {
  await page.goto(appPath("/preview/result-v7-device.html?slug=sign"), { waitUntil: "networkidle" });

  const device = page.locator(".viewport");
  await expect(device).toHaveCSS("width", "390px");
  await expect(device).toHaveCSS("height", "844px");

  const frame = page.frameLocator("iframe");
  await expect(frame.locator("[data-result-v7-page]")).toBeVisible();
  await expect(frame.locator("#result-v7-title")).toHaveText("建筑玩梗者");
  await expect(page.locator("#persona option")).toHaveCount(16);

  await page.locator("#persona").selectOption("void");
  await expect(frame.locator("#result-v7-title")).toHaveText("光影留白者");
  await expect(page).toHaveTitle(/VOID/);
});
