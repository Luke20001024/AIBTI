import { afterEach, describe, expect, it, vi } from "vitest";
import { QUESTIONS, QUIZ_VERSION } from "../content";
import { scoreQuiz, type AnswerMap } from "./scoring";
import {
  LOCAL_RESULT_SCHEMA_VERSION,
  RESULT_STORAGE_KEY,
  clearLocalResult,
  createLocalResult,
  normalizeLocalResult,
  readLocalResult,
  writeLocalResult,
} from "./local-result";

const answers: AnswerMap = Object.fromEntries(
  QUESTIONS.map((question, index) => [question.id, (["A", "B", "C"] as const)[index % 3]]),
);

const makeResult = () => createLocalResult(
  answers,
  scoreQuiz(answers),
  new Date("2026-08-26T12:00:00.000Z"),
);

const createStorage = ({ failWrites = false } = {}) => {
  const values = new Map<string, string>();
  return {
    storage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        if (failWrites) throw new Error("denied");
        values.set(key, value);
      }),
      removeItem: vi.fn((key: string) => values.delete(key)),
    } as unknown as Storage,
    values,
  };
};

afterEach(() => vi.unstubAllGlobals());

describe("local result V2", () => {
  it("creates a versioned local result with evidence resolved from the selected options", () => {
    const value = makeResult();
    expect(value.schemaVersion).toBe(LOCAL_RESULT_SCHEMA_VERSION);
    expect(value.quizVersion).toBe(QUIZ_VERSION);
    expect(value.evidence).toHaveLength(3);
    for (const evidence of value.evidence) {
      expect(answers[evidence.questionId]).toBe(evidence.optionId);
      expect(evidence.choiceLabel.length).toBeGreaterThan(0);
      expect(evidence.interpretation.length).toBeGreaterThan(0);
    }
    expect(normalizeLocalResult(value)).toEqual(value);
  });

  it("accepts the richer scoring evidence shape and keeps its interpretation", () => {
    const scored = scoreQuiz(answers);
    const questionId = scored.evidenceQuestionIds[0];
    const value = createLocalResult(answers, {
      ...scored,
      evidenceQuestions: [{ questionId, interpretation: "这个选择优先建立了清晰秩序" }],
    });
    expect(value.evidence[0]).toMatchObject({
      questionId,
      interpretation: "这个选择优先建立了清晰秩序",
    });
  });

  it("rejects version mismatches and malformed result identity", () => {
    const value = makeResult();
    expect(normalizeLocalResult({ ...value, quizVersion: "stale" })).toBeNull();
    expect(normalizeLocalResult({ ...value, primaryTypeId: value.secondaryTypeId })).toBeNull();
    expect(normalizeLocalResult({ ...value, primaryTypeId: "UNKNOWN" })).toBeNull();
  });

  it("rejects malformed dimensions, confidence, dates, and evidence", () => {
    const value = makeResult();
    expect(normalizeLocalResult({ ...value, confidence: Number.NaN })).toBeNull();
    expect(normalizeLocalResult({ ...value, completedAt: "not-a-date" })).toBeNull();
    expect(normalizeLocalResult({
      ...value,
      dimensionScores: { ...value.dimensionScores, ORDER: 2 },
    })).toBeNull();
    expect(normalizeLocalResult({
      ...value,
      evidence: [{ ...value.evidence[0], optionId: "Z" }],
    })).toBeNull();
  });
});

describe("local result storage", () => {
  it("writes to local storage and reads the normalized value back", () => {
    const local = createStorage();
    const session = createStorage();
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: session.storage });
    const value = makeResult();

    expect(writeLocalResult(value)).toBe("local");
    expect(local.values.has(RESULT_STORAGE_KEY)).toBe(true);
    expect(readLocalResult()).toEqual(value);
  });

  it("falls back to session storage when local storage rejects writes", () => {
    const local = createStorage({ failWrites: true });
    const session = createStorage();
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: session.storage });

    expect(writeLocalResult(makeResult())).toBe("session");
    expect(session.values.has(RESULT_STORAGE_KEY)).toBe(true);
  });

  it("reads the newer session fallback when a stale local result cannot be overwritten", () => {
    const local = createStorage({ failWrites: true });
    const session = createStorage();
    const oldResult = makeResult();
    const newResult = createLocalResult(
      answers,
      scoreQuiz(answers),
      new Date("2026-08-26T12:05:00.000Z"),
    );
    local.values.set(RESULT_STORAGE_KEY, JSON.stringify(oldResult));
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: session.storage });

    expect(writeLocalResult(newResult)).toBe("session");
    expect(readLocalResult()).toEqual(newResult);
  });

  it("returns null when both browser stores are unavailable", () => {
    const local = createStorage({ failWrites: true });
    const session = createStorage({ failWrites: true });
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: session.storage });
    expect(writeLocalResult(makeResult())).toBeNull();
  });

  it("clears only the V2 result key from both stores", () => {
    const local = createStorage();
    const session = createStorage();
    local.values.set("aibti.result.v1", "legacy");
    local.values.set(RESULT_STORAGE_KEY, JSON.stringify(makeResult()));
    session.values.set(RESULT_STORAGE_KEY, JSON.stringify(makeResult()));
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: session.storage });

    expect(clearLocalResult()).toBe(true);
    expect(local.values.get("aibti.result.v1")).toBe("legacy");
    expect(local.values.has(RESULT_STORAGE_KEY)).toBe(false);
    expect(session.values.has(RESULT_STORAGE_KEY)).toBe(false);
  });
});
