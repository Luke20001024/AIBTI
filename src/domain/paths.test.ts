import { describe, expect, it } from "vitest";
import { applyBasePath, normalizeBasePath, toAbsoluteUrl } from "./paths";

describe("base-path helpers", () => {
  it("normalizes empty, root, and slash-padded base paths", () => {
    expect(normalizeBasePath(undefined)).toBe("");
    expect(normalizeBasePath("")).toBe("");
    expect(normalizeBasePath("/")).toBe("");
    expect(normalizeBasePath("///")).toBe("");
    expect(normalizeBasePath("AIBTI")).toBe("/AIBTI");
    expect(normalizeBasePath("//AIBTI//")).toBe("/AIBTI");
  });

  it("prefixes local paths including query strings exactly once", () => {
    expect(applyBasePath("/result/root/?from=share", "/AIBTI/")).toBe(
      "/AIBTI/result/root/?from=share",
    );
    expect(applyBasePath("/AIBTI/result/root/?from=share", "/AIBTI")).toBe(
      "/AIBTI/result/root/?from=share",
    );
    expect(applyBasePath("/AIBTI?x=1", "/AIBTI")).toBe("/AIBTI?x=1");
  });

  it("does not rewrite external, protocol-relative, or non-root-relative values", () => {
    expect(applyBasePath("https://example.com/image.jpg", "/AIBTI")).toBe(
      "https://example.com/image.jpg",
    );
    expect(applyBasePath("//cdn.example.com/image.jpg", "/AIBTI")).toBe(
      "//cdn.example.com/image.jpg",
    );
    expect(applyBasePath("images/image.jpg", "/AIBTI")).toBe("images/image.jpg");
  });

  it("builds absolute HTTP(S) URLs and rejects unsafe origins", () => {
    expect(toAbsoluteUrl("/AIBTI/result/root/?from=share", "https://example.com/base/"))
      .toBe("https://example.com/AIBTI/result/root/?from=share");
    expect(() => toAbsoluteUrl("/path", "javascript:alert(1)")).toThrow(
      "Only HTTP(S) origins are supported",
    );
    expect(() => toAbsoluteUrl("javascript:alert(1)", "https://example.com")).toThrow(
      "Only HTTP(S) URLs are supported",
    );
  });
});
