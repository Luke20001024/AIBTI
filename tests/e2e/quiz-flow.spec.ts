import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const fullFlowProjects = new Set([
  "iphone-390-webkit",
  "android-393-chromium",
  "harmony-proxy-chromium",
]);

test("18 题需显式提交并生成无答案的 Owner 结果", async ({ page }, testInfo) => {
  test.skip(!fullFlowProjects.has(testInfo.project.name), "完整链路在 iPhone、Android 与 HarmonyOS 代理各跑一次");
  const calculationRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "document" && request.url().includes("/calculating/")) {
      calculationRequests.push(request.url());
    }
  });

  await page.goto(appPath("/"), { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(appPath("/quiz/"), { waitUntil: "domcontentloaded" });

  for (let index = 1; index < 18; index += 1) {
    await page.getByRole("radio").first().click();
    await expect(page.locator(".quiz-progress-meta")).toContainText(`${String(index + 1).padStart(2, "0")} / 18`);
    await page.waitForTimeout(80);
  }

  const submit = page.getByRole("button", { name: "确认这就是我 →" });
  await expect(submit).toBeDisabled();
  await page.getByRole("radio").nth(1).click();
  await expect(page).toHaveURL(/\/quiz\/$/);
  await expect(submit).toBeEnabled();
  await submit.click();

  await page.waitForURL(/\/result\/[^/]+\/\?mine=1$/, { timeout: 12_000 });
  expect(calculationRequests.length).toBeGreaterThan(0);
  for (const requestUrl of calculationRequests) {
    expect(new URL(requestUrl).searchParams.has("a")).toBe(false);
  }
  const resultUrl = new URL(page.url());
  expect(resultUrl.searchParams.get("mine")).toBe("1");
  for (const privateKey of ["a", "q", "s", "u"]) {
    expect(resultUrl.searchParams.has(privateKey)).toBe(false);
  }
  await expect(page.locator(".result-proof")).toHaveAttribute("data-result-view", "owner");
  await expect(page.locator(".evidence-list li")).toHaveCount(3);
  await expect(page.getByText("展开八维建筑倾向", { exact: true })).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("clipboard blocked")) },
    });
  });
  await page.getByRole("button", { name: "复制公开链接" }).click();
  await expect(page.getByText("浏览器无法自动复制，请长按下方公开链接")).toBeVisible();
  const fallbackLink = new URL(await page.getByRole("textbox", { name: "可选择的公开结果链接" }).inputValue());
  expect(fallbackLink.pathname).toBe(resultUrl.pathname);
  expect(fallbackLink.searchParams.get("from")).toBe("share");
  for (const privateKey of ["mine", "a", "q", "s", "u"]) {
    expect(fallbackLink.searchParams.has(privateKey)).toBe(false);
  }

  const ownerPath = resultUrl.pathname;
  await page.goto(`${ownerPath}?from=share`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".result-proof")).toHaveAttribute("data-result-view", "shared");
  await expect(page.getByText(/这是 .* 的公开人格设定/)).toBeVisible();
  await expect(page.locator(".evidence-list")).toHaveCount(0);
});

test("分享卡可生成 1080×1350 图像、公开入口与受限浏览器后备", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "分享卡只需在代表性手机引擎生成一次");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("clipboard blocked")) },
    });
    Object.defineProperty(navigator, "canShare", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: (payload: ShareData) => {
        (window as Window & { __aibtiShare?: ShareData }).__aibtiShare = payload;
        return Promise.resolve();
      },
    });
    Object.defineProperty(window, "File", { configurable: true, value: undefined });
  });
  await page.goto(appPath("/result/grid/?from=share"), { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "生成分享卡" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "AIBTI 分享卡" });
  await expect(dialog).toBeVisible({ timeout: 12_000 });
  await expect(dialog.getByRole("button", { name: "关闭 ×" })).toBeFocused();
  const card = dialog.locator("img");
  await expect(card).toBeVisible();
  const dimensions = await card.evaluate((image: HTMLImageElement) => ({
    width: image.naturalWidth,
    height: image.naturalHeight,
  }));
  expect(dimensions).toEqual({ width: 1080, height: 1350 });
  const publicLink = dialog.getByRole("textbox", { name: "可选择的公开结果链接" });
  const href = new URL(await publicLink.inputValue());
  expect(href.pathname).toMatch(/\/result\/grid\/$/);
  expect(href.searchParams.get("from")).toBe("share");
  for (const privateKey of ["mine", "a", "q", "s", "u"]) {
    expect(href.searchParams.has(privateKey)).toBe(false);
  }

  await dialog.getByRole("button", { name: "复制公开链接" }).click();
  await expect(dialog.getByText("浏览器无法自动复制，请长按上方公开链接")).toBeVisible();

  await dialog.getByRole("button", { name: "分享或保存图片" }).click();
  const shared = await page.evaluate(() => (window as Window & { __aibtiShare?: ShareData }).__aibtiShare);
  expect(shared?.url).toBe(href.toString());
  expect(shared?.files).toBeUndefined();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
