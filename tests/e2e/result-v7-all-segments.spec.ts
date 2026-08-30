import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { appPath } from "./paths";

const PERSONAS = [
  "grid", "span", "root", "eave",
  "tide", "mass", "void", "ruin",
  "sign", "tech", "veil", "flow",
  "plus", "mix", "orna", "hand",
] as const;

const PROJECTS = new Set([
  "android-360-chromium",
  "harmony-proxy-chromium",
  "iphone-430-webkit",
]);

test("360 / 390 / 430 三档手机结果页分段视觉与布局验收", async ({ page }, testInfo) => {
  test.skip(!PROJECTS.has(testInfo.project.name), "只运行三个真实目标尺寸");
  test.setTimeout(300_000);

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const size = `${viewport!.width}x${viewport!.height}`;
  const outputDir = `artifacts/qa/result-v7-segments-final/${size}`;
  const report: unknown[] = [];
  await mkdir(outputDir, { recursive: true });

  for (const slug of PERSONAS) {
    await page.goto(appPath(`/result/${slug}/?mine=1&qa=segments-final`), { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(420);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(120);

    const metrics = await page.evaluate(() => {
      const root = document.querySelector("[data-result-v7-page]");
      const sections = Array.from(root?.querySelectorAll(":scope > section") ?? []).map((section, index) => {
        const rect = section.getBoundingClientRect();
        const heading = section.querySelector("h1,h2");
        const headingStyle = heading ? getComputedStyle(heading) : null;
        return {
          background: getComputedStyle(section).backgroundColor,
          fontSize: headingStyle?.fontSize ?? "",
          heading: heading?.textContent?.trim() ?? "",
          height: Math.round(rect.height),
          index,
          lineHeight: headingStyle?.lineHeight ?? "",
          top: Math.round(rect.top + window.scrollY),
        };
      });
      const images = Array.from(document.images).map((image) => ({
        alt: image.alt,
        complete: image.complete,
        height: image.naturalHeight,
        src: image.getAttribute("src") ?? "",
        width: image.naturalWidth,
      }));
      const text = root?.textContent ?? "";
      return {
        buttonCount: document.querySelectorAll("main button").length,
        clientWidth: document.documentElement.clientWidth,
        imageFailures: images.filter((image) => !image.complete || image.width <= 0 || image.height <= 0),
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        phraseCounts: {
          but: (text.match(/而是/gu) ?? []).length,
          dontCopy: (text.match(/别抄|抄这个/gu) ?? []).length,
          not: (text.match(/不是/gu) ?? []).length,
        },
        scrollHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        sections,
      };
    });

    expect(metrics.innerWidth, `${slug} inner width`).toBe(viewport!.width);
    expect(metrics.clientWidth, `${slug} client width`).toBe(viewport!.width);
    expect(metrics.scrollWidth, `${slug} horizontal overflow`).toBeLessThanOrEqual(viewport!.width);
    expect(metrics.sections, `${slug} section count`).toHaveLength(6);
    expect(metrics.imageFailures, `${slug} image failures`).toEqual([]);
    expect(metrics.buttonCount, `${slug} buttons`).toBe(7);
    expect(metrics.phraseCounts, `${slug} repetitive contrast prose`).toEqual({ but: 0, dontCopy: 0, not: 0 });

    const maxY = Math.max(0, metrics.scrollHeight - metrics.innerHeight);
    const sections = metrics.sections;
    const captures = [
      ["01-hero", 0],
      ["02-digest", sections[1]?.top ?? 0],
      ["03-architect", sections[2]?.top ?? 0],
      ["04-works-a", sections[3]?.top ?? 0],
      [
        "05-works-b",
        Math.min(
          maxY,
          (sections[3]?.top ?? 0) + Math.min(760, Math.max(0, (sections[3]?.height ?? 0) - 620)),
        ),
      ],
      ["06-lineage", sections[4]?.top ?? maxY],
      ["07-ending", maxY],
    ] as const;

    const saved: Array<{ name: string; path: string; y: number }> = [];
    await mkdir(`${outputDir}/${slug}`, { recursive: true });
    for (const [name, requestedY] of captures) {
      const y = Math.max(0, Math.min(maxY, Math.round(requestedY)));
      await page.evaluate((target) => window.scrollTo(0, target), y);
      await page.waitForTimeout(130);
      const path = `${outputDir}/${slug}/${name}-${y}.png`;
      await page.screenshot({ path, fullPage: false });
      saved.push({ name, path, y });
    }

    report.push({ captures: saved, metrics, slug });
    await writeFile(`${outputDir}/audit-${size}.json`, JSON.stringify(report, null, 2), "utf8");
  }
});
