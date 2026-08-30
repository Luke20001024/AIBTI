import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARCHITECTS,
  BUILDINGS,
  RESULT_STORIES,
  RESULT_TYPES,
} from "./index";
import { BUILDING_GALLERIES } from "./building-galleries";
import { RESULT_V7_EDITORIAL } from "../features/result-v7/content/result-v7-content";

const publicFile = (src: string) =>
  join(process.cwd(), "public", src.replace(/^\//u, ""));

const expectLocalMedia = (src: string, label: string) => {
  expect(src, `${label} must use a root-relative local path`).toMatch(/^\/images\//u);
  expect(existsSync(publicFile(src)), `${label}: ${src}`).toBe(true);
};

describe("ArcBTI sixteen-persona content integrity", () => {
  it("keeps one complete and unique result graph for all sixteen personas", () => {
    expect(RESULT_TYPES).toHaveLength(16);
    expect(RESULT_STORIES).toHaveLength(16);
    expect(ARCHITECTS).toHaveLength(16);
    expect(BUILDINGS).toHaveLength(80);

    expect(new Set(RESULT_TYPES.map((result) => result.code)).size).toBe(16);
    expect(new Set(RESULT_TYPES.map((result) => result.slug)).size).toBe(16);
    expect(new Set(RESULT_STORIES.map((story) => story.code)).size).toBe(16);
    expect(new Set(ARCHITECTS.map((architect) => architect.id)).size).toBe(16);
    expect(new Set(BUILDINGS.map((building) => building.id)).size).toBe(80);

    expect(new Set(RESULT_TYPES.map((result) => result.architectId)).size).toBe(16);
    expect(new Set(RESULT_TYPES.map((result) => result.characterImage)).size).toBe(16);
  });

  it("ties every displayed work to that result's representative architect", () => {
    const architectById = new Map(ARCHITECTS.map((architect) => [architect.id, architect]));
    const buildingById = new Map(BUILDINGS.map((building) => [building.id, building]));
    const references = new Map<string, string[]>();

    for (const result of RESULT_TYPES) {
      expect(architectById.has(result.architectId), `${result.code} architect`).toBe(true);
      const ids = [...result.buildingIds, ...result.recommendedBuildingIds];
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size, `${result.code} work list`).toBe(5);

      for (const id of ids) {
        const building = buildingById.get(id);
        expect(building, `${result.code} references ${id}`).toBeDefined();
        expect(
          building?.architectIds.includes(result.architectId),
          `${result.code}: ${id} must belong to ${result.architectId}`,
        ).toBe(true);
        references.set(id, [...(references.get(id) ?? []), result.code]);
      }
    }

    expect(references.size).toBe(80);
    for (const building of BUILDINGS) {
      expect(references.get(building.id), building.id).toHaveLength(1);
    }
  });

  it("keeps all primary, gallery, hero and architect media local and present", () => {
    const mediaPaths: string[] = [];

    for (const result of RESULT_TYPES) {
      expectLocalMedia(result.characterImage, `${result.code} hero`);
      mediaPaths.push(result.characterImage);
    }

    for (const architect of ARCHITECTS) {
      expect(architect.portrait, `${architect.id} portrait`).toBeDefined();
      expectLocalMedia(architect.portrait!.src, `${architect.id} portrait`);
      expect(architect.portrait!.alt.trim().length, `${architect.id} portrait alt`).toBeGreaterThan(12);
      mediaPaths.push(architect.portrait!.src);
    }

    for (const building of BUILDINGS) {
      expect(building.image, `${building.id} primary image`).toBeDefined();
      expectLocalMedia(building.image!.src, `${building.id} primary image`);
      expect(building.image!.alt.trim().length, `${building.id} primary alt`).toBeGreaterThan(5);
      mediaPaths.push(building.image!.src);

      for (const [index, image] of (building.gallery ?? []).entries()) {
        expectLocalMedia(image.src, `${building.id} gallery ${index + 1}`);
        expect(image.alt.trim().length, `${building.id} gallery ${index + 1} alt`).toBeGreaterThan(5);
        mediaPaths.push(image.src);
      }
    }

    expect(new Set(mediaPaths).size, "visible media paths must be unique").toBe(mediaPaths.length);
  });

  it("keeps an accuracy-first two-to-three-image archive for all eighty works", () => {
    expect(Object.keys(BUILDING_GALLERIES)).toHaveLength(77);
    expect(BUILDINGS.filter((building) => building.gallery?.length)).toHaveLength(80);
    expect(BUILDINGS.filter((building) => !building.gallery?.length)).toHaveLength(0);

    const buildingById = new Map(BUILDINGS.map((building) => [building.id, building]));
    for (const [id, gallery] of Object.entries(BUILDING_GALLERIES)) {
      expect(buildingById.has(id), `gallery references unknown ${id}`).toBe(true);
      expect(gallery.length, `${id} generated gallery size`).toBeGreaterThanOrEqual(1);
      expect(gallery.length, `${id} generated gallery size`).toBeLessThanOrEqual(2);
      expect(buildingById.get(id)?.gallery, `${id} gallery is attached`).toEqual(gallery);
    }

    for (const building of BUILDINGS) {
      expect(building.gallery, `${building.id} gallery is required`).toBeDefined();
      expect(building.gallery!.length, `${building.id} gallery size`).toBeGreaterThanOrEqual(1);
      expect(building.gallery!.length, `${building.id} gallery size`).toBeLessThanOrEqual(2);
      expect(1 + building.gallery!.length, `${building.id} total image count`).toBeGreaterThanOrEqual(2);
      expect(1 + building.gallery!.length, `${building.id} total image count`).toBeLessThanOrEqual(3);
    }
  });

  it("keeps all architect portraits illustrated and duo portraits explicitly complete", () => {
    const duoArchitects = new Set([
      "ARCH-WANG-LU",
      "ARCH-VENTURI-SCOTT-BROWN",
      "ARCH-SANAA",
      "ARCH-LACATON-VASSAL",
    ]);

    for (const architect of ARCHITECTS) {
      const portrait = architect.portrait!;
      expect(
        portrait.src.startsWith("/images/architects-v2/")
          || portrait.src.startsWith("/images/architects-v7-illustrated/"),
        `${architect.id} portrait system`,
      ).toBe(true);
      expect(portrait.alt, `${architect.id} illustrated portrait`).toMatch(/风格化|低多边形/u);

      if (duoArchitects.has(architect.id)) {
        expect(portrait.alt, `${architect.id} complete duo`).toMatch(/双人|两人/u);
        expect(portrait.alt, `${architect.id} complete duo`).toMatch(/完整|并肩|并列|等距/u);
      }
    }
  });

  it("keeps visible editorial copy free of terminal sentence periods", () => {
    const copy: Array<[string, string]> = [];

    for (const result of RESULT_TYPES) {
      copy.push(
        [`${result.code}.tagline`, result.tagline],
        [`${result.code}.languageSummary`, result.languageSummary],
        [`${result.code}.schoolSummary`, result.schoolSummary],
        [`${result.code}.publicSide`, result.publicSide],
        [`${result.code}.hiddenSide`, result.hiddenSide],
        [`${result.code}.stressResponse`, result.stressResponse],
        [`${result.code}.architectureLogic`, result.architectureLogic],
      );
    }

    for (const story of RESULT_STORIES) {
      copy.push(
        [`${story.code}.plainLead`, story.plainLead],
        [`${story.code}.architectHook`, story.architectHook],
        [`${story.code}.architectFocus`, story.architectFocus],
        [`${story.code}.closing`, story.closing],
        ...story.heroLines.map((value, index) => [`${story.code}.heroLines.${index}`, value] as [string, string]),
        ...story.instincts.map((value, index) => [`${story.code}.instincts.${index}`, value] as [string, string]),
      );
    }

    for (const architect of ARCHITECTS) {
      copy.push(
        [`${architect.id}.summary`, architect.summary],
        [`${architect.id}.storyTitle`, architect.storyTitle],
        [`${architect.id}.story`, architect.story],
      );
    }

    for (const building of BUILDINGS) {
      copy.push(
        [`${building.id}.hook`, building.hook],
        [`${building.id}.story`, building.story],
        ...building.lookFor.map((value, index) => [`${building.id}.lookFor.${index}`, value] as [string, string]),
      );
    }

    const offenders = copy
      .filter(([, value]) => /[。.．]\s*$/u.test(value))
      .map(([label]) => label);
    expect(offenders).toEqual([]);
  });

  it("keeps result-page prose free of repetitive contrast scaffolding", () => {
    const resultPageCopy = JSON.stringify({
      architects: ARCHITECTS,
      buildings: BUILDINGS,
      editorial: RESULT_V7_EDITORIAL,
      results: RESULT_TYPES,
    });

    expect(resultPageCopy).not.toMatch(/不是|而是|别抄|抄这个/u);
  });
});
