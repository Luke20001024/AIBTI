import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const scriptDirectory = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)));
const miniRoot = path.resolve(scriptDirectory, "..");
const output = path.join(miniRoot, "qa", "bridge-smoke.json");
const target = process.env.ARCBTI_XHS_URL || "http://127.0.0.1:4188/";
const errors = [];
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(() => {
    window.__xhsCalls = [];
    window.xhs = {
      miniTool: {
        writeTempFile: async (options) => {
          window.__xhsCalls.push({ api: "writeTempFile", options });
          return { filePath: "xhs-temp://arcbti-result.png" };
        },
        saveImageToPhotosAlbum: async (options) => {
          window.__xhsCalls.push({ api: "saveImageToPhotosAlbum", options });
          return { errMsg: "ok" };
        },
        postNote: async (options) => {
          window.__xhsCalls.push({ api: "postNote", options });
          return { errMsg: "ok" };
        },
      },
    };
  });

  const page = await context.newPage();
  await page.goto(target, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /开测！开测！/ }).click();
  for (let index = 0; index < 20 && await page.locator(".quiz-screen").count(); index += 1) {
    await page.locator("[data-action='choose-option']").nth(index % 3).click();
    await page.waitForTimeout(210);
  }
  await page.locator(".result-screen").waitFor();
  await page.getByRole("button", { name: /保存人格卡/ }).click();
  await page.waitForFunction(() => window.__xhsCalls.some((call) => call.api === "saveImageToPhotosAlbum"));
  await page.getByRole("button", { name: "发小红书", exact: true }).click();
  await page.waitForFunction(() => window.__xhsCalls.some((call) => call.api === "postNote"));

  const calls = await page.evaluate(() => window.__xhsCalls);
  const write = calls.find((call) => call.api === "writeTempFile");
  const save = calls.find((call) => call.api === "saveImageToPhotosAlbum");
  const post = calls.find((call) => call.api === "postNote");
  if (!write?.options?.data?.startsWith("data:image/png;base64,")) errors.push("writeTempFile did not receive a complete PNG data URI");
  if (save?.options?.filePath !== "xhs-temp://arcbti-result.png") errors.push("saveImageToPhotosAlbum did not receive the temporary file path");
  if (post?.options?.pageType !== "photo_publish") errors.push("postNote pageType is incorrect");
  if (post?.options?.title?.length > 20) errors.push("postNote title exceeds 20 characters");
  if (post?.options?.content?.length > 1000) errors.push("postNote content exceeds 1000 characters");
  if (post?.options?.mediaInfo?.image_resources?.length !== 1) errors.push("postNote must contain one result image");
  if (!post?.options?.mediaInfo?.image_resources?.[0]?.url?.startsWith("data:image/png;base64,")) errors.push("postNote image is not a PNG data URI");
  await context.close();
} finally {
  await browser.close();
}

const report = {
  status: errors.length ? "failed" : "passed",
  target,
  checkedApis: ["writeTempFile", "saveImageToPhotosAlbum", "postNote"],
  errors,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
