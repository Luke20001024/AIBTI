import type { AnswerMap } from "./scoring";

export const QUIZ_STORAGE_KEY = "aibti.quiz.v1";

export type QuizSession = {
  answers: AnswerMap;
  index: number;
  updatedAt: number;
};

export const readQuizSession = (): QuizSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizSession;
    if (!parsed || typeof parsed.index !== "number" || !parsed.answers) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeQuizSession = (session: QuizSession) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(session));
};

export const clearQuizSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(QUIZ_STORAGE_KEY);
};
