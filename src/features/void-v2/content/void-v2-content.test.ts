import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { VOID_V2_CONTENT } from "./void-v2-content";
import { VOID_V2_SOURCES } from "./void-v2-sources-content";
import { VOID_V2_SHARE_CARD_SIZE } from "../share/create-void-v2-share-card";

const runtimeAssets = [
  VOID_V2_CONTENT.hero.poster,
  VOID_V2_CONTENT.hero.background,
  VOID_V2_CONTENT.hero.persona,
  VOID_V2_CONTENT.styles.image,
  VOID_V2_CONTENT.architect.image,
  ...VOID_V2_CONTENT.works.items.map((item) => item.image),
  ...VOID_V2_CONTENT.works.items.flatMap((item) => item.gallery.map((image) => image.image)),
  ...VOID_V2_CONTENT.lineage.items.map((item) => item.image),
  ...VOID_V2_CONTENT.lineage.further.map((item) => item.image),
];

const runtimeAlts = [
  VOID_V2_CONTENT.hero.posterAlt,
  VOID_V2_CONTENT.hero.backgroundAlt,
  VOID_V2_CONTENT.hero.personaAlt,
  VOID_V2_CONTENT.styles.imageAlt,
  VOID_V2_CONTENT.architect.imageAlt,
  ...VOID_V2_CONTENT.works.items.map((item) => item.imageAlt),
  ...VOID_V2_CONTENT.works.items.flatMap((item) => item.gallery.map((image) => image.imageAlt)),
  ...VOID_V2_CONTENT.lineage.items.map((item) => item.imageAlt),
  ...VOID_V2_CONTENT.lineage.further.map((item) => item.imageAlt),
];

const collectStrings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
};

describe("VOID V2 content contract", () => {
  it("locks the mobile hero to one raster poster and removes the scroll-control CTA", () => {
    expect(VOID_V2_CONTENT.hero).toMatchObject({
      code: "VOID",
      title: "寂静的边界",
      statement: ["你不是喜欢空", "你是在用空，把噪音筛出去"],
      traits: ["克制", "厚度", "仪式感"],
      styles: ["现代主义", "极简主义倾向", "批判性地域主义"],
    });
    expect(VOID_V2_CONTENT.hero.poster).toBe("/images/void-v2/persona/void-hero-poster-v4.png");
    expect("cta" in VOID_V2_CONTENT.hero).toBe(false);
  });

  it("keeps the complete evidence set behind a compact visible narrative", () => {
    expect(VOID_V2_CONTENT.digest).toMatchObject({
      label: "01 / 先说人话",
      title: "你的空间，不爱说废话",
    });
    expect(VOID_V2_CONTENT.reactions.items.map((item) => item.id)).toEqual(["light", "boundary", "path"]);
    expect(VOID_V2_CONTENT.reactions.items.map((item) => item.role)).toEqual([
      "决定注意力最终落在哪里",
      "决定什么应该被隔绝在外",
      "决定你什么时候抵达核心",
    ]);
    for (const reaction of VOID_V2_CONTENT.reactions.items) {
      expect(reaction.condition.length).toBeGreaterThan(12);
      expect(reaction.counterexample.length).toBeGreaterThan(12);
    }
    expect(VOID_V2_CONTENT.styles.layers.map((item) => item.id)).toEqual(["modernism", "minimalism", "regionalism"]);
    expect(VOID_V2_CONTENT.works.items.map((item) => item.id)).toEqual(["cut", "detour", "bury"]);
    expect(VOID_V2_CONTENT.works.items.map((item) => [item.instinct, item.action, item.name])).toEqual([
      ["光", "切", "光之教堂"],
      ["路径", "绕", "水御堂"],
      ["边界", "藏", "地中美术馆"],
    ]);
    for (const work of VOID_V2_CONTENT.works.items) {
      expect(work.cardHook.length).toBeGreaterThan(18);
      expect(work.observations).toHaveLength(3);
      expect(work.story.length).toBeGreaterThanOrEqual(2);
      expect(work.gallery).toHaveLength(2);
      expect(work.significance.length).toBeGreaterThan(20);
      expect(work.keyFact.length).toBeGreaterThan(20);
      expect(work.takeaway.length).toBeGreaterThan(20);
    }
    expect(VOID_V2_CONTENT.lineage.comparison).toHaveLength(4);
    expect(VOID_V2_CONTENT.lineage.items).toHaveLength(2);
    for (const architect of VOID_V2_CONTENT.lineage.items) {
      expect(architect.detailBody.length).toBeGreaterThan(35);
      expect(architect.relation.length).toBeGreaterThan(25);
      expect(architect.featuredWork.length).toBeGreaterThan(4);
    }
    expect(VOID_V2_CONTENT.lineage.further).toHaveLength(2);
  });

  it("contains no orphaned or shared V1 image path", () => {
    expect(new Set(runtimeAssets).size).toBe(runtimeAssets.length);
    for (const asset of runtimeAssets) {
      expect(asset).toMatch(/^\/images\/void-v2\/.+\.(?:webp|jpg|png)$/);
      expect(existsSync(resolve(process.cwd(), "public", asset.slice(1)))).toBe(true);
    }
  });

  it("gives every meaningful production image an explicit Chinese alternative", () => {
    for (const alt of runtimeAlts) {
      expect(alt.trim().length).toBeGreaterThan(8);
    }
  });

  it("preserves the anti-misreading turn and adds a sharper shareable judgment", () => {
    expect(VOID_V2_CONTENT.digest.caveat).toContain("删完以后体验真的变了");
    expect(VOID_V2_CONTENT.architect.sectionTitle.join(" ")).toContain("最会打拳");
    expect(VOID_V2_CONTENT.ending.judgment).toEqual([
      "空间一安静，重要的东西就有了主场",
      "让杂音退到边界之外",
      "光、材料和人的动作自然被看见",
    ]);
    expect(VOID_V2_SHARE_CARD_SIZE).toEqual({ width: 1080, height: 1350 });
  });

  it("removes terminal periods from every visible V7 content string", () => {
    const visibleStrings = collectStrings(VOID_V2_CONTENT)
      .filter((value) => !value.startsWith("/images/"));

    for (const value of visibleStrings) {
      expect(value, value).not.toMatch(/[。.\s]+$/u);
    }
  });

  it("reserves the corrective 不是句式 for the hero and avoids command-like copy", () => {
    const visibleStrings = collectStrings(VOID_V2_CONTENT)
      .filter((value) => !value.startsWith("/images/"));

    expect(visibleStrings.filter((value) => value.includes("不是"))).toEqual(["你不是喜欢空"]);
    expect(visibleStrings.some((value) => value.includes("而是"))).toBe(false);
    expect(visibleStrings.some((value) => /别抄|，抄/u.test(value))).toBe(false);
  });

  it("uses a single accessible disclosure system without ornamental interactions", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src", "features", "void-v2", "components", "void-v2-story.tsx"),
      "utf8",
    );

    expect(source).toMatch(/role="dialog"/u);
    expect(source).toMatch(/aria-modal="true"/u);
    expect(source).toMatch(/aria-haspopup="dialog"/u);
    expect(source).not.toMatch(/<details|<summary|type="range"|ArrowIcon|role="tab"/u);
  });

  it("ships a transparent, authoritative source index for the prototype", () => {
    expect(VOID_V2_SOURCES).toHaveLength(11);
    for (const source of VOID_V2_SOURCES) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.subject.length).toBeGreaterThan(2);
      expect(source.label.length).toBeGreaterThan(12);
    }
  });
});
