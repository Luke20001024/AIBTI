import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const PERSONAS = [
  "grid", "span", "root", "eave",
  "tide", "mass", "void", "ruin",
  "sign", "tech", "veil", "flow",
  "plus", "mix", "orna", "hand",
] as const;

type DialogRecord = {
  index: number;
  imageCount: number;
  images: Array<{ alt: string; height: number; src: string; width: number }>;
  title: string;
  trigger: string;
};

test("390 × 844 下逐一打开 16 个人格的 96 个建筑师与建筑档案", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "harmony-proxy-chromium", "固定使用 390 × 844 Chromium 手机环境");
  test.setTimeout(300_000);

  const outputDir = "artifacts/qa/result-v7-modals/390x844";
  const report: Array<{ dialogs: DialogRecord[]; slug: string }> = [];
  await mkdir(outputDir, { recursive: true });

  try {
    for (const slug of PERSONAS) {
      await page.goto(appPath(`/result/${slug}/?mine=1&qa=complete-dialogs`), { waitUntil: "networkidle" });

      const architectTrigger = page.getByRole("button", { name: /打开人物档案/ });
      const buildingTriggers = page.locator("main section article").getByRole("button");
      await expect(architectTrigger, `${slug} representative architect trigger`).toHaveCount(1);
      await expect(buildingTriggers, `${slug} five building triggers`).toHaveCount(5);

      const records: DialogRecord[] = [];
      for (let index = 0; index < 6; index += 1) {
        const trigger = index === 0 ? architectTrigger : buildingTriggers.nth(index - 1);
        const triggerText = (await trigger.innerText()).trim();
        await trigger.click();

        const dialog = page.getByRole("dialog");
        await expect(dialog, `${slug} dialog ${index}`).toBeVisible();
        await expect(page.locator("body"), `${slug} body lock ${index}`).toHaveCSS("overflow", "hidden");
        await page.waitForTimeout(220);

        const box = await dialog.boundingBox();
        expect(box, `${slug} dialog ${index} bounding box`).not.toBeNull();
        expect(box!.x, `${slug} dialog ${index} left edge`).toBeGreaterThanOrEqual(-1);
        expect(box!.x + box!.width, `${slug} dialog ${index} right edge`).toBeLessThanOrEqual(391);
        expect(box!.y, `${slug} dialog ${index} top edge`).toBeGreaterThanOrEqual(-1);
        expect(box!.height, `${slug} dialog ${index} visible height`).toBeGreaterThan(700);

        const images = dialog.locator("img");
        const imageCount = await images.count();
        if (index === 0) {
          expect(imageCount, `${slug} architect portrait count`).toBe(1);
        } else {
          expect(imageCount, `${slug} building ${index} image count`).toBeGreaterThanOrEqual(2);
          expect(imageCount, `${slug} building ${index} image count`).toBeLessThanOrEqual(3);
        }

        const imageData = await images.evaluateAll((items) => items.map((item) => {
          const image = item as HTMLImageElement;
          return {
            alt: image.alt,
            height: image.naturalHeight,
            src: image.getAttribute("src") ?? "",
            width: image.naturalWidth,
          };
        }));
        expect(imageData.every((image) => image.width > 0 && image.height > 0), `${slug} dialog ${index} loaded images`).toBe(true);
        expect(imageData.every((image) => image.alt.trim().length > 0), `${slug} dialog ${index} image alts`).toBe(true);

        const title = (await dialog.getByRole("heading", { level: 2 }).first().innerText()).trim();
        records.push({ index, imageCount, images: imageData, title, trigger: triggerText });

        if (index < 2) {
          await page.screenshot({
            path: `${outputDir}/${slug}-${index === 0 ? "architect" : "building-1"}-playwright.png`,
            fullPage: false,
          });
        }

        await dialog.getByRole("button", { name: /关闭/ }).click();
        await expect(dialog, `${slug} dialog ${index} closes`).toHaveCount(0);
        await expect(page.locator("body"), `${slug} body unlock ${index}`).not.toHaveCSS("overflow", "hidden");
      }

      report.push({ dialogs: records, slug });
      await writeFile(`${outputDir}/playwright-audit-390x844.json`, JSON.stringify(report, null, 2), "utf8");
    }
  } finally {
    await writeFile(`${outputDir}/playwright-audit-390x844.json`, JSON.stringify(report, null, 2), "utf8");
  }
});
