import { QUESTIONS, type OptionId } from "../content";
import type { AnswerMap } from "./scoring";

export const QUIZ_STORAGE_KEY = "aibti.quiz.v1";

export type QuizSession = {
  answers: AnswerMap;
  index: number;
  updatedAt: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const normalizeQuizSession = (value: unknown): QuizSession | null => {
  if (!isRecord(value) || !isRecord(value.answers) || typeof value.index !== "number") {
    return null;
  }

  const answers: AnswerMap = {};
  for (const question of QUESTIONS) {
    const answer = value.answers[question.id];
    if (question.options.some((option) => option.id === answer)) {
      answers[question.id] = answer as OptionId;
    }
  }

  const requestedIndex = Number.isFinite(value.index) ? Math.trunc(value.index) : 0;
  const clampedIndex = Math.min(Math.max(requestedIndex, 0), QUESTIONS.length - 1);
  const firstMissingIndex = QUESTIONS.findIndex((question) => !answers[question.id]);
  const safeIndex = firstMissingIndex === -1
    ? clampedIndex
    : Math.min(clampedIndex, firstMissingIndex);

  return {
    answers,
    index: safeIndex,
    updatedAt: typeof value.updatedAt === "number" && Number.isFinite(value.updatedAt)
      ? value.updatedAt
      : 0,
  };
};

export const readQuizSession = (): QuizSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    return normalizeQuizSession(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

export const writeQuizSession = (session: QuizSession) => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};

export const clearQuizSession = () => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(QUIZ_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};
