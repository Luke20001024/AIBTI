import { DISCRIMINATOR_QUESTIONS, QUESTIONS, QUIZ_VERSION, type OptionId } from "../content";
import { deriveDiscriminatorSequence, type AnswerMap } from "./scoring";

export const QUIZ_STORAGE_KEY = "aibti.quiz.v4";
export const QUIZ_SESSION_SCHEMA_VERSION = 3 as const;

const ALL_QUESTIONS = [...QUESTIONS, ...DISCRIMINATOR_QUESTIONS];
export const CURRENT_QUESTION_IDS = ALL_QUESTIONS.map((question) => question.id);

export type QuizSessionInput = {
  answers: AnswerMap;
  index: number;
  updatedAt: number;
};

export type QuizSession = QuizSessionInput & {
  schemaVersion: typeof QUIZ_SESSION_SCHEMA_VERSION;
  quizVersion: string;
  questionIds: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const hasCurrentQuestionIds = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.length === CURRENT_QUESTION_IDS.length &&
  value.every((id, index) => id === CURRENT_QUESTION_IDS[index]);

const isKnownAnswerKey = (id: string) => CURRENT_QUESTION_IDS.includes(id);

export const createQuizSession = (input: QuizSessionInput): QuizSession => ({
  schemaVersion: QUIZ_SESSION_SCHEMA_VERSION,
  quizVersion: QUIZ_VERSION,
  questionIds: [...CURRENT_QUESTION_IDS],
  answers: { ...input.answers },
  index: input.index,
  updatedAt: input.updatedAt,
});

export const normalizeQuizSession = (value: unknown): QuizSession | null => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== QUIZ_SESSION_SCHEMA_VERSION ||
    value.quizVersion !== QUIZ_VERSION ||
    !hasCurrentQuestionIds(value.questionIds) ||
    !isRecord(value.answers) ||
    typeof value.index !== "number" ||
    !Number.isFinite(value.index) ||
    typeof value.updatedAt !== "number" ||
    !Number.isFinite(value.updatedAt)
  ) {
    return null;
  }

  if (Object.keys(value.answers).some((id) => !isKnownAnswerKey(id))) return null;

  const answers: AnswerMap = {};
  for (const question of ALL_QUESTIONS) {
    const answer = value.answers[question.id];
    if (answer === undefined) continue;
    if (!question.options.some((option) => option.id === answer)) return null;
    answers[question.id] = answer as OptionId;
  }

  const coreComplete = QUESTIONS.every((question) => answers[question.id]);
  const activeDynamicIds = new Set(
    coreComplete ? deriveDiscriminatorSequence(answers).map((question) => question.id) : [],
  );
  for (const question of DISCRIMINATOR_QUESTIONS) {
    if (!activeDynamicIds.has(question.id)) delete answers[question.id];
  }

  const requestedIndex = Math.trunc(value.index);
  const maximumIndex = Math.max(0, QUESTIONS.length + activeDynamicIds.size - 1);
  const clampedIndex = Math.min(Math.max(requestedIndex, 0), maximumIndex);
  const firstMissingIndex = QUESTIONS.findIndex((question) => !answers[question.id]);
  const safeIndex = firstMissingIndex === -1
    ? clampedIndex
    : Math.min(clampedIndex, firstMissingIndex);

  return {
    schemaVersion: QUIZ_SESSION_SCHEMA_VERSION,
    quizVersion: QUIZ_VERSION,
    questionIds: [...CURRENT_QUESTION_IDS],
    answers,
    index: safeIndex,
    updatedAt: value.updatedAt,
  };
};

const readFromStorage = (storage: Storage): QuizSession | null => {
  const raw = storage.getItem(QUIZ_STORAGE_KEY);
  if (!raw) return null;
  return normalizeQuizSession(JSON.parse(raw) as unknown);
};

export const readQuizSession = (): QuizSession | null => {
  if (typeof window === "undefined") return null;
  let local: QuizSession | null = null;
  let session: QuizSession | null = null;
  try {
    local = readFromStorage(window.localStorage);
  } catch {
    // Continue to the same-tab fallback when persistent storage is restricted.
  }
  try {
    session = readFromStorage(window.sessionStorage);
  } catch {
    // Keep any valid persistent session when same-tab storage is unavailable.
  }

  if (!local) return session;
  if (!session) return local;
  return session.updatedAt > local.updatedAt ? session : local;
};

export const writeQuizSession = (input: QuizSessionInput | QuizSession) => {
  if (typeof window === "undefined") return null;
  const normalized = normalizeQuizSession(createQuizSession(input));
  if (!normalized) return null;
  const serialized = JSON.stringify(normalized);
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, serialized);
    return "local" as const;
  } catch {
    // Continue to session storage for restricted embedded browsers.
  }
  try {
    window.sessionStorage.setItem(QUIZ_STORAGE_KEY, serialized);
    return "session" as const;
  } catch {
    return null;
  }
};

export const clearQuizSession = () => {
  if (typeof window === "undefined") return false;
  let succeeded = true;
  try {
    window.localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    succeeded = false;
  }
  try {
    window.sessionStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    succeeded = false;
  }
  return succeeded;
};
