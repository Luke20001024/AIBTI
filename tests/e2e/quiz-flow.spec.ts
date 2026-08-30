import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const fullFlowProjects = new Set([
  "iphone-390-webkit",
  "android-393-chromium",
  "harmony-proxy-chromium",
]);

const expectGeneratedQuestion = async (
  page: import("@playwright/test").Page,
  questionNumber: number,
) => {
  const images = page.locator(".generated-question-visual");
  await expect(images).toHaveCount(3);
  await expect.poll(
    () => images.evaluateAll((items) => items.map((item) => {
      const image = item as HTMLImageElement;
      return [image.naturalWidth, image.naturalHeight];
    })),
    { timeout: 20_000 },
  ).toEqual([[1200, 800], [1200, 800], [1200, 800]]);
  const sources = await images.evaluateAll((items) => items.map((item) => (item as HTMLImageElement).currentSrc));
  expect(new Set(sources).size).toBe(3);
  expect(sources.every((source) => new RegExp(`/images/questions-v3/q${questionNumber}-[abc]\\.webp$`).test(source))).toBe(true);
};

test("18 道核心题在接近结果时追加最多两题，并完成本地结果闭环", async ({ page }, testInfo) => {
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
  await expect(page.locator(".quiz-shell")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });

  for (let index = 0; index < 18; index += 1) {
    if (index >= 12) await expectGeneratedQuestion(page, index + 1);
    await page.getByRole("radio").first().click({ force: true });
    if (index < 17) {
      await expect(page.locator(".quiz-progress-count strong")).toHaveText(String(index + 2));
    }
  }

  await expect(page.locator(".quiz-brand").getByText("最后判断", { exact: true })).toBeVisible();
  let dynamicCount = 0;
  while (dynamicCount < 2) {
    const submit = page.getByRole("button", { name: "查看结果 →" });
    if (await submit.isEnabled().catch(() => false)) break;
    await page.getByRole("radio").nth(dynamicCount % 3).click({ force: true });
    dynamicCount += 1;
    await page.waitForTimeout(120);
  }
  expect(dynamicCount).toBeGreaterThanOrEqual(1);
  expect(dynamicCount).toBeLessThanOrEqual(2);

  const savedDynamicIds = await page.evaluate(() => {
    const raw = localStorage.getItem("aibti.quiz.v4") ?? sessionStorage.getItem("aibti.quiz.v4");
    const value = raw ? JSON.parse(raw) as { answers?: Record<string, string> } : null;
    return Object.keys(value?.answers ?? {}).filter((id) => id.startsWith("T"));
  });
  expect(savedDynamicIds.length).toBe(dynamicCount);

  const submit = page.getByRole("button", { name: "查看结果 →" });
  await expect(submit).toBeEnabled();
  await submit.click();
  await page.waitForURL(/\/result\/[^/]+\/\?mine=1$/, { timeout: 15_000 });

  expect(calculationRequests.length).toBeGreaterThan(0);
  for (const requestUrl of calculationRequests) {
    const url = new URL(requestUrl);
    expect(url.search).toBe("");
  }
  const resultUrl = new URL(page.url());
  for (const privateKey of ["a", "d", "q", "s", "u"]) {
    expect(resultUrl.searchParams.has(privateKey)).toBe(false);
  }
  const resultPage = page.locator("[data-result-v7-page]");
  await expect(resultPage).toBeVisible();
  await expect(page.locator("#result-v7-title")).toBeAttached();
  await expect(resultPage.locator(":scope > section").first().locator("img")).toHaveCount(1);
  await expect(resultPage.locator("details")).toHaveCount(0);
  await expect(resultPage.locator("button[aria-haspopup=dialog]")).toHaveCount(6);
  await expect(resultPage.locator("img")).toHaveCount(7);
  await expect(resultPage.locator(".media-fallback")).toHaveCount(0);

  const localResult = await page.evaluate(() => {
    const raw = localStorage.getItem("aibti.result.v2") ?? sessionStorage.getItem("aibti.result.v2");
    return raw ? JSON.parse(raw) as Record<string, unknown> : null;
  });
  expect(localResult?.quizVersion).toBe("4.0.0");
  expect(localResult?.scoringVersion).toBe("4.0.0");
});

test("公开结果页不携带答题明细，原生展开卡仍可完整阅读", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "公开结果合同在代表性手机执行一次");
  await page.goto(appPath("/result/grid/?from=share"), { waitUntil: "domcontentloaded" });
  const url = new URL(page.url());
  for (const privateKey of ["mine", "a", "d", "q", "s", "u"]) {
    expect(url.searchParams.has(privateKey)).toBe(false);
  }
  const firstWork = page.locator("section").filter({ hasText: "03 / 三次实锤" }).getByRole("button").first();
  await firstWork.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "现场看什么" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "查看作品资料与图片来源" })).toBeVisible();
  await dialog.getByRole("button", { name: /关闭/ }).click();
  await expect(dialog).toHaveCount(0);
});

test("重新测试会清空全部答题状态并从第 1 题开始", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "android-393-chromium", "重测清空合同在代表性手机执行一次");
  await page.goto(appPath("/result/void/?mine=1"), { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    for (const storage of [localStorage, sessionStorage]) {
      storage.setItem("aibti.quiz.v4", JSON.stringify({ index: 19, stale: true }));
      storage.setItem("aibti.result.v2", JSON.stringify({ primaryTypeId: "VOID", stale: true }));
    }
  });

  await page.getByRole("link", { name: "重新测试" }).click();
  await page.waitForURL(/\/quiz\/$/, { timeout: 15_000 });
  await expect(page.locator(".quiz-shell")).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
  await expect(page.locator(".quiz-progress-count strong")).toHaveText("1");
  await expect(page.locator(".quiz-progress-count span")).toContainText("/ 18");

  const stored = await page.evaluate(() => ({
    localQuiz: localStorage.getItem("aibti.quiz.v4"),
    sessionQuiz: sessionStorage.getItem("aibti.quiz.v4"),
    localResult: localStorage.getItem("aibti.result.v2"),
    sessionResult: sessionStorage.getItem("aibti.result.v2"),
  }));
  expect(stored).toEqual({
    localQuiz: null,
    sessionQuiz: null,
    localResult: null,
    sessionResult: null,
  });
});
