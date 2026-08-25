import { defineConfig, devices } from "@playwright/test";

const staticExport = process.env.PLAYWRIGHT_STATIC_EXPORT === "1";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? (staticExport ? "http://127.0.0.1:4173" : "http://127.0.0.1:3000");
const staticBasePath = process.env.PLAYWRIGHT_BASE_PATH ?? "/AIBTI";

const mobileProject = (
  name: string,
  browser: "chromium" | "webkit",
  width: number,
  height: number,
  userAgent?: string,
) => ({
  name,
  use: {
    ...(browser === "webkit" ? devices["iPhone 13"] : devices["Pixel 7"]),
    browserName: browser,
    viewport: { width, height },
    screen: { width, height },
    isMobile: true,
    hasTouch: true,
    ...(userAgent ? { userAgent } : {}),
  },
});

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./artifacts/playwright",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "artifacts/playwright-report", open: "never" }]],
  expect: { timeout: 7_000 },
  timeout: 45_000,
  use: {
    baseURL,
    actionTimeout: 7_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : staticExport
      ? {
          command: "pnpm serve:pages",
          url: `${baseURL}${staticBasePath}/`,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        }
      : {
        command: "pnpm dev --hostname 127.0.0.1 --port 3000",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    mobileProject("iphone-375-webkit", "webkit", 375, 812),
    mobileProject("iphone-390-webkit", "webkit", 390, 844),
    mobileProject("iphone-430-webkit", "webkit", 430, 932),
    mobileProject("android-360-chromium", "chromium", 360, 800),
    mobileProject("android-393-chromium", "chromium", 393, 873),
    mobileProject("android-412-chromium", "chromium", 412, 915),
    mobileProject("embedded-short-chromium", "chromium", 390, 700),
    mobileProject(
      "harmony-proxy-chromium",
      "chromium",
      390,
      844,
      "Mozilla/5.0 (Linux; HarmonyOS 4; NOH-AN00) AppleWebKit/537.36 Mobile Safari/537.36",
    ),
  ],
});
