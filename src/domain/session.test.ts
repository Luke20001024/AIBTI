import { afterEach, describe, expect, it, vi } from "vitest";
import { QUESTIONS, QUIZ_VERSION } from "../content";
import type { AnswerMap } from "./scoring";
import {
  CURRENT_QUESTION_IDS,
  QUIZ_SESSION_SCHEMA_VERSION,
  QUIZ_STORAGE_KEY,
  createQuizSession,
  normalizeQuizSession,
  readQuizSession,
  writeQuizSession,
} from "./session";

const answersThrough = (lastIndex: number): AnswerMap => Object.fromEntries(
  QUESTIONS.slice(0, lastIndex + 1).map((question) => [question.id, "A"]),
) as AnswerMap;

const validSession = (overrides: Record<string, unknown> = {}) => ({
  schemaVersion: QUIZ_SESSION_SCHEMA_VERSION,
  quizVersion: QUIZ_VERSION,
  questionIds: [...CURRENT_QUESTION_IDS],
  answers: answersThrough(7),
  index: 3,
  updatedAt: 123,
  ...overrides,
});

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

describe("quiz session V2 normalization", () => {
  it("preserves a valid versioned session, including intentional backwards navigation", () => {
    expect(normalizeQuizSession(validSession())).toEqual(validSession());
  });

  it("repairs an incomplete session to its first unanswered question", () => {
    const answers = answersThrough(16);
    delete answers.Q05;

    const normalized = normalizeQuizSession(validSession({
      answers,
      index: QUESTIONS.length - 1,
      updatedAt: 456,
    }));

    expect(normalized?.index).toBe(4);
    expect(normalized?.answers.Q05).toBeUndefined();
    expect(normalized?.answers.Q06).toBe("A");
  });

  it("rejects legacy unversioned V1 session objects", () => {
    expect(normalizeQuizSession({ answers: answersThrough(2), index: 2, updatedAt: 1 })).toBeNull();
  });

  it("rejects schema and quiz version mismatches", () => {
    expect(normalizeQuizSession(validSession({ schemaVersion: 1 }))).toBeNull();
    expect(normalizeQuizSession(validSession({ quizVersion: "stale" }))).toBeNull();
  });

  it("rejects a changed, incomplete, or reordered question contract", () => {
    expect(normalizeQuizSession(validSession({ questionIds: CURRENT_QUESTION_IDS.slice(0, -1) }))).toBeNull();
    expect(normalizeQuizSession(validSession({ questionIds: [...CURRENT_QUESTION_IDS].reverse() }))).toBeNull();
    expect(normalizeQuizSession(validSession({ questionIds: [...CURRENT_QUESTION_IDS, "OLD"] }))).toBeNull();
  });

  it("rejects unknown question keys and invalid option values instead of reinterpreting them", () => {
    expect(normalizeQuizSession(validSession({ answers: { Q01: "A", OLD_QUESTION: "B" } }))).toBeNull();
    expect(normalizeQuizSession(validSession({ answers: { Q01: "Z" } }))).toBeNull();
  });

  it("rejects malformed numeric fields", () => {
    expect(normalizeQuizSession(validSession({ index: Number.NaN }))).toBeNull();
    expect(normalizeQuizSession(validSession({ updatedAt: "123" }))).toBeNull();
  });
});

describe("quiz session V2 storage", () => {
  it("always writes the V2 envelope even when callers provide only progress fields", () => {
    const local = createStorage();
    const session = createStorage();
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: session.storage });

    expect(writeQuizSession({ answers: answersThrough(1), index: 1, updatedAt: 99 })).toBe("local");
    const saved = JSON.parse(local.values.get(QUIZ_STORAGE_KEY) ?? "null") as Record<string, unknown>;
    expect(saved.schemaVersion).toBe(QUIZ_SESSION_SCHEMA_VERSION);
    expect(saved.quizVersion).toBe(QUIZ_VERSION);
    expect(saved.questionIds).toEqual(CURRENT_QUESTION_IDS);
  });

  it("reads only the V2 key and safely handles storage failures", () => {
    const session = createQuizSession({ answers: answersThrough(0), index: 0, updatedAt: 1 });
    const local = createStorage();
    const sameTab = createStorage();
    local.values.set("aibti.quiz.v1", JSON.stringify(session));
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: sameTab.storage });
    expect(readQuizSession()).toBeNull();
    expect(local.storage.getItem).toHaveBeenCalledWith(QUIZ_STORAGE_KEY);

    vi.stubGlobal("window", {
      localStorage: { getItem: () => { throw new Error("denied"); } },
      sessionStorage: { getItem: () => { throw new Error("denied"); } },
    });
    expect(readQuizSession()).toBeNull();
  });

  it("falls back to session storage and reads the newer same-tab progress", () => {
    const local = createStorage({ failWrites: true });
    const sameTab = createStorage();
    local.values.set(QUIZ_STORAGE_KEY, JSON.stringify(createQuizSession({
      answers: answersThrough(0),
      index: 0,
      updatedAt: 1,
    })));
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: sameTab.storage });

    expect(writeQuizSession({ answers: answersThrough(3), index: 3, updatedAt: 2 })).toBe("session");
    expect(readQuizSession()?.updatedAt).toBe(2);
    expect(readQuizSession()?.answers).toEqual(answersThrough(3));
  });

  it("returns null only when both browser stores reject progress writes", () => {
    const local = createStorage({ failWrites: true });
    const sameTab = createStorage({ failWrites: true });
    vi.stubGlobal("window", { localStorage: local.storage, sessionStorage: sameTab.storage });

    expect(writeQuizSession({ answers: answersThrough(0), index: 0, updatedAt: 1 })).toBeNull();
  });
});
