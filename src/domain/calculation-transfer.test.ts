import { describe, expect, it } from "vitest";
import { Buffer } from "node:buffer";
import { QUESTIONS, QUIZ_VERSION, SCORING_VERSION } from "../content";
import type { AnswerMap } from "./scoring";
import {
  CALCULATION_TRANSFER_VERSION,
  buildCalculationPath,
  parseCalculationTransfer,
} from "./calculation-transfer";

const answers: AnswerMap = Object.fromEntries(
  QUESTIONS.map((question, index) => [question.id, (["A", "B", "C"] as const)[index % 3]]),
);

const currentParams = (overrides: Record<string, string | null> = {}) => {
  const params = new URLSearchParams(buildCalculationPath(answers).split("#")[1]);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  return params;
};

describe("calculation transfer V2", () => {
  it("round-trips the complete answer map with explicit URL, quiz, and scoring versions", () => {
    const path = buildCalculationPath(answers);
    expect(path).not.toContain("?");
    const params = new URLSearchParams(path.split("#")[1]);
    expect(params.get("u")).toBe(CALCULATION_TRANSFER_VERSION);
    expect(params.get("q")).toBe(QUIZ_VERSION);
    expect(params.get("s")).toBe(SCORING_VERSION);
    expect(parseCalculationTransfer(params)).toEqual({ ok: true, answers });
  });

  it("rejects missing and legacy unversioned parameters before decoding", () => {
    expect(parseCalculationTransfer(new URLSearchParams("a=AAAA"))).toEqual({
      ok: false,
      reason: "missing-parameters",
    });
    expect(parseCalculationTransfer(currentParams({ u: null }))).toEqual({
      ok: false,
      reason: "missing-parameters",
    });
  });

  it("rejects transfer, quiz, and scoring version mismatches", () => {
    expect(parseCalculationTransfer(currentParams({ u: "1" }))).toEqual({
      ok: false,
      reason: "unsupported-transfer-version",
    });
    expect(parseCalculationTransfer(currentParams({ q: "1.0.0-old" }))).toEqual({
      ok: false,
      reason: "quiz-version-mismatch",
    });
    expect(parseCalculationTransfer(currentParams({ s: "1.0.0-old" }))).toEqual({
      ok: false,
      reason: "scoring-version-mismatch",
    });
  });

  it("rejects malformed, wrong-length, and reserved-option answer payloads", () => {
    expect(parseCalculationTransfer(currentParams({ a: "!" }))).toEqual({
      ok: false,
      reason: "invalid-answers",
    });
    expect(parseCalculationTransfer(currentParams({ a: "AAAA" }))).toEqual({
      ok: false,
      reason: "invalid-answers",
    });

    const reservedOptionPayload = Buffer.from([3, 0, 0, 0, 0]).toString("base64url");
    expect(parseCalculationTransfer(currentParams({ a: reservedOptionPayload }))).toEqual({
      ok: false,
      reason: "invalid-answers",
    });
  });
});
