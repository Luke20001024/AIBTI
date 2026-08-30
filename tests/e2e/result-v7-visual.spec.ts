import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const shot = (name: string) => `artifacts/qa/persona-expansion-16-v1/v7-${name}-390x844.png`;

test("390 × 844 结果页关键叙事节点视觉验收", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "harmony-proxy-chromium", "固定在 390 × 844 Chromium 手机环境生成视觉验收图");

  await page.goto(appPath("/result/sign/?mine=1"), { waitUntil: "networkidle" });
  await expect(page.locator("[data-result-v7-page]")).toBeVisible();
  await page.screenshot({ path: shot("sign-hero"), fullPage: false });

  await page.locator("#result-v7-digest-title").scrollIntoViewIfNeeded();
  await page.screenshot({ path: shot("sign-digest-architect"), fullPage: false });

  await page.getByRole("button", { name: /打开人物档案/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: shot("sign-architect-sheet"), fullPage: false });
  await page.getByRole("dialog").getByRole("button", { name: /关闭/ }).click();

  await page.locator("#result-v7-works-title").scrollIntoViewIfNeeded();
  await page.screenshot({ path: shot("sign-works"), fullPage: false });
  await page.locator("section").filter({ hasText: "03 / 三次实锤" }).getByRole("button").first().click();
  await expect(page.getByRole("dialog").getByText("现场看什么", { exact: true })).toBeVisible();
  await page.screenshot({ path: shot("sign-work-sheet"), fullPage: false });
  await page.getByRole("dialog").getByRole("button", { name: /关闭/ }).click();

  await page.locator("#result-v7-lineage-title").scrollIntoViewIfNeeded();
  await page.screenshot({ path: shot("sign-lineage"), fullPage: false });

  for (const slug of ["veil", "tide", "mix"] as const) {
    await page.goto(appPath(`/result/${slug}/`), { waitUntil: "networkidle" });
    await page.locator("#result-v7-digest-title").scrollIntoViewIfNeeded();
    await page.screenshot({ path: shot(`${slug}-digest-architect`), fullPage: false });
    await page.locator("#result-v7-works-title").scrollIntoViewIfNeeded();
    await page.screenshot({ path: shot(`${slug}-works`), fullPage: false });
  }
});
