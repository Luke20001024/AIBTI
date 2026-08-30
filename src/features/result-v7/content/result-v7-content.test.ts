import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ARCHITECT_BY_ID, BUILDING_BY_ID, RESULT_TYPES } from "../../../content";
import { RESULT_V7_EDITORIAL } from "./result-v7-content";

const publicFile = (src: string) => join(process.cwd(), "public", src.replace(/^\//u, ""));

const collectStrings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
};

describe("16-persona V7 result contract", () => {
  it("gives every persona the same editorial depth", () => {
    expect(Object.keys(RESULT_V7_EDITORIAL)).toHaveLength(16);
    for (const result of RESULT_TYPES) {
      const editorial = RESULT_V7_EDITORIAL[result.code];
      expect(editorial.digestBody).toHaveLength(2);
      expect(editorial.architectTitle).toHaveLength(2);
      expect(editorial.works).toHaveLength(3);
      expect(editorial.lineageTitle).toHaveLength(2);
      expect(editorial.endingJudgment).toHaveLength(3);
    }
  });

  it("keeps visible editorial copy compact and free of the rejected contrast formula", () => {
    const strings = collectStrings(RESULT_V7_EDITORIAL);
    expect(strings.filter((value) => /不是.*而是/u.test(value))).toEqual([]);
    expect(strings.filter((value) => /[。.]$/u.test(value))).toEqual([]);
  });

  it("has a real person image and five real building images for every result", () => {
    for (const result of RESULT_TYPES) {
      const architect = ARCHITECT_BY_ID[result.architectId];
      expect(architect.portrait, `${result.code} architect portrait`).toBeDefined();
      expect(existsSync(publicFile(architect.portrait!.src)), `${result.code} portrait file`).toBe(true);
      expect(existsSync(publicFile(`/images/personas/${result.slug}/hero-poster-v1.webp`)), `${result.code} mobile hero`).toBe(true);
      expect(existsSync(publicFile(`/images/personas/${result.slug}/hero-poster-v1.png`)), `${result.code} downloadable hero`).toBe(true);

      for (const id of [...result.buildingIds, ...result.recommendedBuildingIds]) {
        const building = BUILDING_BY_ID[id];
        expect(building.image, `${result.code} ${id} image`).toBeDefined();
        expect(existsSync(publicFile(building.image!.src)), `${result.code} ${id} image file`).toBe(true);
      }
    }
  });

  it("uses Sheet dialogs instead of inline details disclosure", () => {
    const component = readFileSync(join(process.cwd(), "src/features/result-v7/components/result-v7-page.tsx"), "utf8");
    expect(component).not.toContain("<details");
    expect(component).toContain('role="dialog"');
    expect(component).toContain("createPortal");
  });
});
