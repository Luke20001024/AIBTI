import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../content";
import { createLocalResult } from "./local-result";
import { scoreQuiz, type AnswerMap } from "./scoring";
import {
  buildPublicResultUrl,
  buildResultPath,
  parseResultEntry,
  resolveResultView,
} from "./result-view";

const answers: AnswerMap = Object.fromEntries(QUESTIONS.map((question) => [question.id, "A"]));
const scored = scoreQuiz(answers);
const localResult = createLocalResult(answers, scored);

const params = (value = "") => new URLSearchParams(value);

describe("result entry parsing", () => {
  it("gives explicit share and card entries precedence over local-owner hints", () => {
    expect(parseResultEntry(params("mine=1&from=share"))).toEqual({ kind: "shared", source: "share" });
    expect(parseResultEntry(params("mine=1&from=card"))).toEqual({ kind: "shared", source: "card" });
  });

  it("parses mine and neutral explore entries", () => {
    expect(parseResultEntry(params("mine=1"))).toEqual({ kind: "mine" });
    expect(parseResultEntry(params())).toEqual({ kind: "explore", legacyAnswerUrl: false });
  });

  it("marks legacy answer-bearing result URLs without decoding them", () => {
    expect(parseResultEntry(params("a=old&q=1&s=1"))).toEqual({
      kind: "explore",
      legacyAnswerUrl: true,
    });
  });
});

describe("result view resolution", () => {
  it("requires both mine=1 and a matching current local result for Owner", () => {
    expect(resolveResultView({
      entry: { kind: "mine" },
      expectedType: localResult.primaryTypeId,
      localResult,
    })).toEqual({ kind: "owner", localResult });
  });

  it("safely degrades a missing, stale, or type-mismatched owner result to Shared", () => {
    expect(resolveResultView({
      entry: { kind: "mine" },
      expectedType: localResult.primaryTypeId,
      localResult: null,
    })).toEqual({ kind: "shared", source: "owner-missing" });

    expect(resolveResultView({
      entry: { kind: "mine" },
      expectedType: localResult.primaryTypeId,
      localResult: { ...localResult, quizVersion: "stale" },
    })).toEqual({ kind: "shared", source: "owner-missing" });

    expect(resolveResultView({
      entry: { kind: "mine" },
      expectedType: localResult.secondaryTypeId,
      localResult,
    })).toEqual({ kind: "shared", source: "owner-missing" });
  });

  it("never hydrates Shared or Explore with an unrelated local result", () => {
    expect(resolveResultView({
      entry: { kind: "shared", source: "share" },
      expectedType: localResult.primaryTypeId,
      localResult,
    })).toEqual({ kind: "shared", source: "share" });
    expect(resolveResultView({
      entry: { kind: "explore", legacyAnswerUrl: false },
      expectedType: localResult.primaryTypeId,
      localResult,
    })).toEqual({ kind: "explore", legacyAnswerUrl: false });
  });
});

describe("public result URLs", () => {
  it("builds the four explicit result entry paths", () => {
    expect(buildResultPath("root", "mine")).toBe("/result/root/?mine=1");
    expect(buildResultPath("root", "share")).toBe("/result/root/?from=share");
    expect(buildResultPath("root", "card")).toBe("/result/root/?from=card");
    expect(buildResultPath("root", "explore")).toBe("/result/root/");
  });

  it("rejects unknown slugs", () => {
    expect(() => buildResultPath("javascript:alert(1)", "share")).toThrow("Unknown result slug");
  });

  it("never includes answer or internal version parameters in public share URLs", () => {
    const url = new URL(buildPublicResultUrl({
      origin: "https://luke20001024.github.io",
      slug: "root",
      source: "share",
      basePath: "/AIBTI",
    }));
    expect(url.pathname).toBe("/AIBTI/result/root/");
    expect(url.searchParams.get("from")).toBe("share");
    for (const key of ["a", "q", "s", "u"]) expect(url.searchParams.has(key)).toBe(false);
  });
});
