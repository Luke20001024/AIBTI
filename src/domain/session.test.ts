import { describe, expect, it } from "vitest";
import { QUESTIONS } from "../content";
import { normalizeQuizSession } from "./session";

const answersThrough = (lastIndex: number) => Object.fromEntries(
  QUESTIONS.slice(0, lastIndex + 1).map((question) => [question.id, "A"]),
);

describe("quiz session normalization", () => {
  it("preserves a valid session, including intentional backwards navigation", () => {
    const normalized = normalizeQuizSession({
      answers: answersThrough(7),
      index: 3,
      updatedAt: 123,
    });

    expect(normalized).toEqual({
      answers: answersThrough(7),
      index: 3,
      updatedAt: 123,
    });
  });

  it("repairs an incomplete session to its first unanswered question", () => {
    const answers = answersThrough(16);
    delete answers.Q05;

    const normalized = normalizeQuizSession({
      answers,
      index: QUESTIONS.length - 1,
      updatedAt: 456,
    });

    expect(normalized?.index).toBe(4);
    expect(normalized?.answers.Q05).toBeUndefined();
  });

  it("drops stale keys and invalid option values", () => {
    const normalized = normalizeQuizSession({
      answers: { Q01: "B", Q02: "Z", OLD_QUESTION: "A" },
      index: 17,
      updatedAt: "invalid",
    });

    expect(normalized).toEqual({
      answers: { Q01: "B" },
      index: 1,
      updatedAt: 0,
    });
  });

  it("rejects malformed storage values", () => {
    expect(normalizeQuizSession(null)).toBeNull();
    expect(normalizeQuizSession({ index: 0 })).toBeNull();
    expect(normalizeQuizSession({ index: "0", answers: {} })).toBeNull();
  });
});
