import {
  ART_VERSION,
  CONTENT_VERSION,
  DIMENSIONS,
  DIMENSION_IDS,
  QUESTIONS,
  QUIZ_VERSION,
  RESULT_TYPES,
  SCORING_VERSION,
  type DimensionVector,
  type OptionId,
  type ResultCode,
} from "../content";
import type { AnswerMap } from "./scoring";

export const RESULT_STORAGE_KEY = "aibti.result.v2";
export const LOCAL_RESULT_SCHEMA_VERSION = 2 as const;

export type LocalEvidenceV2 = {
  questionId: string;
  optionId: OptionId;
  choiceLabel: string;
  interpretation: string;
};

export type LocalResultV2 = {
  schemaVersion: typeof LOCAL_RESULT_SCHEMA_VERSION;
  quizVersion: string;
  scoringVersion: string;
  contentVersion: string;
  artVersion: string;
  primaryTypeId: ResultCode;
  secondaryTypeId: ResultCode;
  confidence: number;
  clarity: "clear" | "balanced" | "mixed";
  gap: number;
  dimensionScores: DimensionVector;
  evidence: LocalEvidenceV2[];
  completedAt: string;
};

export type ScoredResultForStorage = {
  primaryTypeId: ResultCode;
  secondaryTypeId: ResultCode;
  confidence: number;
  clarity: "clear" | "balanced" | "mixed";
  gap: number;
  dimensionScores: DimensionVector;
  evidenceQuestionIds?: readonly string[];
  evidence?: readonly unknown[];
  evidenceQuestions?: readonly unknown[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isResultCode = (value: unknown): value is ResultCode =>
  typeof value === "string" && RESULT_TYPES.some((result) => result.code === value);

const isOptionId = (value: unknown): value is OptionId =>
  value === "A" || value === "B" || value === "C";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const optionInterpretation = (option: Record<string, unknown>) => {
  if (typeof option.interpretation === "string" && option.interpretation.trim()) {
    return option.interpretation.trim();
  }
  if (typeof option.note === "string" && option.note.trim()) return option.note.trim();
  return null;
};

const evidenceDimensionInterpretation = (value: unknown) => {
  if (!Array.isArray(value)) return null;
  const names = value
    .filter((id): id is (typeof DIMENSION_IDS)[number] =>
      typeof id === "string" && DIMENSION_IDS.includes(id as (typeof DIMENSION_IDS)[number]))
    .slice(0, 2)
    .map((id) => DIMENSIONS[id].name);
  return names.length ? `这个选择主要影响了${names.join("和")}倾向` : null;
};

const evidenceFromQuestion = (
  questionId: string,
  answers: AnswerMap,
  rawEvidence?: unknown,
): LocalEvidenceV2 | null => {
  const question = QUESTIONS.find((item) => item.id === questionId);
  if (!question) return null;
  const selected = answers[question.id];
  const option = question.options.find((item) => item.id === selected);
  if (!option) return null;

  const provided = isRecord(rawEvidence) ? rawEvidence : null;
  const interpretation = provided &&
    typeof provided.interpretation === "string" &&
    provided.interpretation.trim()
    ? provided.interpretation.trim()
    : optionInterpretation(option as unknown as Record<string, unknown>) ??
      evidenceDimensionInterpretation(provided?.dimensions) ??
      `你选择了“${option.label}”，这个直觉参与了人格匹配`;

  return {
    questionId: question.id,
    optionId: option.id,
    choiceLabel: option.label,
    interpretation,
  };
};

const collectEvidence = (
  answers: AnswerMap,
  scored: ScoredResultForStorage,
): LocalEvidenceV2[] => {
  const collected: LocalEvidenceV2[] = [];
  const seen = new Set<string>();

  for (const raw of scored.evidenceQuestions ?? scored.evidence ?? []) {
    if (!isRecord(raw) || typeof raw.questionId !== "string" || seen.has(raw.questionId)) continue;
    const evidence = evidenceFromQuestion(raw.questionId, answers, raw);
    if (!evidence) continue;
    seen.add(evidence.questionId);
    collected.push(evidence);
    if (collected.length === 3) return collected;
  }

  for (const questionId of scored.evidenceQuestionIds ?? []) {
    if (seen.has(questionId)) continue;
    const evidence = evidenceFromQuestion(questionId, answers);
    if (!evidence) continue;
    seen.add(evidence.questionId);
    collected.push(evidence);
    if (collected.length === 3) break;
  }

  return collected;
};

export const createLocalResult = (
  answers: AnswerMap,
  scored: ScoredResultForStorage,
  completedAt: Date = new Date(),
): LocalResultV2 => ({
  schemaVersion: LOCAL_RESULT_SCHEMA_VERSION,
  quizVersion: QUIZ_VERSION,
  scoringVersion: SCORING_VERSION,
  contentVersion: CONTENT_VERSION,
  artVersion: ART_VERSION,
  primaryTypeId: scored.primaryTypeId,
  secondaryTypeId: scored.secondaryTypeId,
  confidence: scored.confidence,
  clarity: scored.clarity,
  gap: scored.gap,
  dimensionScores: { ...scored.dimensionScores },
  evidence: collectEvidence(answers, scored),
  completedAt: completedAt.toISOString(),
});

const normalizeDimensionScores = (value: unknown): DimensionVector | null => {
  if (!isRecord(value)) return null;
  const keys = Object.keys(value);
  if (
    keys.length !== DIMENSION_IDS.length ||
    keys.some((key) => !DIMENSION_IDS.includes(key as (typeof DIMENSION_IDS)[number]))
  ) {
    return null;
  }

  const scores = {} as DimensionVector;
  for (const id of DIMENSION_IDS) {
    const score = value[id];
    if (!isFiniteNumber(score) || score < -1 || score > 1) return null;
    scores[id] = score;
  }
  return scores;
};

const normalizeEvidence = (value: unknown): LocalEvidenceV2[] | null => {
  if (!Array.isArray(value) || value.length > 3) return null;
  const evidence: LocalEvidenceV2[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (
      !isRecord(item) ||
      typeof item.questionId !== "string" ||
      !isOptionId(item.optionId) ||
      typeof item.choiceLabel !== "string" ||
      !item.choiceLabel.trim() ||
      typeof item.interpretation !== "string" ||
      !item.interpretation.trim() ||
      seen.has(item.questionId)
    ) {
      return null;
    }

    const question = QUESTIONS.find((candidate) => candidate.id === item.questionId);
    const option = question?.options.find((candidate) => candidate.id === item.optionId);
    if (!question || !option || option.label !== item.choiceLabel) return null;

    seen.add(item.questionId);
    evidence.push({
      questionId: item.questionId,
      optionId: item.optionId,
      choiceLabel: item.choiceLabel,
      interpretation: item.interpretation.trim(),
    });
  }

  return evidence;
};

export const normalizeLocalResult = (value: unknown): LocalResultV2 | null => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== LOCAL_RESULT_SCHEMA_VERSION ||
    value.quizVersion !== QUIZ_VERSION ||
    value.scoringVersion !== SCORING_VERSION ||
    value.contentVersion !== CONTENT_VERSION ||
    value.artVersion !== ART_VERSION ||
    !isResultCode(value.primaryTypeId) ||
    !isResultCode(value.secondaryTypeId) ||
    value.primaryTypeId === value.secondaryTypeId ||
    !isFiniteNumber(value.confidence) ||
    value.confidence < 0 ||
    value.confidence > 1 ||
    (value.clarity !== "clear" && value.clarity !== "balanced" && value.clarity !== "mixed") ||
    !isFiniteNumber(value.gap) ||
    value.gap < 0 ||
    typeof value.completedAt !== "string" ||
    !Number.isFinite(Date.parse(value.completedAt))
  ) {
    return null;
  }

  const dimensionScores = normalizeDimensionScores(value.dimensionScores);
  const evidence = normalizeEvidence(value.evidence);
  if (!dimensionScores || !evidence) return null;

  return {
    schemaVersion: LOCAL_RESULT_SCHEMA_VERSION,
    quizVersion: QUIZ_VERSION,
    scoringVersion: SCORING_VERSION,
    contentVersion: CONTENT_VERSION,
    artVersion: ART_VERSION,
    primaryTypeId: value.primaryTypeId,
    secondaryTypeId: value.secondaryTypeId,
    confidence: value.confidence,
    clarity: value.clarity,
    gap: value.gap,
    dimensionScores,
    evidence,
    completedAt: new Date(value.completedAt).toISOString(),
  };
};

const readFromStorage = (storage: Storage): LocalResultV2 | null => {
  const raw = storage.getItem(RESULT_STORAGE_KEY);
  if (!raw) return null;
  return normalizeLocalResult(JSON.parse(raw) as unknown);
};

export const readLocalResult = (): LocalResultV2 | null => {
  if (typeof window === "undefined") return null;
  let local: LocalResultV2 | null = null;
  let session: LocalResultV2 | null = null;
  try {
    local = readFromStorage(window.localStorage);
  } catch {
    // Continue to the same-tab fallback when local storage is unavailable or corrupt.
  }
  try {
    session = readFromStorage(window.sessionStorage);
  } catch {
    // Keep a valid local result when the same-tab fallback is unavailable or corrupt.
  }

  if (!local) return session;
  if (!session) return local;
  return Date.parse(session.completedAt) > Date.parse(local.completedAt) ? session : local;
};

export const writeLocalResult = (value: LocalResultV2): "local" | "session" | null => {
  if (typeof window === "undefined") return null;
  const normalized = normalizeLocalResult(value);
  if (!normalized) return null;
  const serialized = JSON.stringify(normalized);

  try {
    window.localStorage.setItem(RESULT_STORAGE_KEY, serialized);
    return "local";
  } catch {
    // Continue to session storage for restricted embedded browsers.
  }

  try {
    window.sessionStorage.setItem(RESULT_STORAGE_KEY, serialized);
    return "session";
  } catch {
    return null;
  }
};

export const clearLocalResult = () => {
  if (typeof window === "undefined") return false;
  let succeeded = true;
  try {
    window.localStorage.removeItem(RESULT_STORAGE_KEY);
  } catch {
    succeeded = false;
  }
  try {
    window.sessionStorage.removeItem(RESULT_STORAGE_KEY);
  } catch {
    succeeded = false;
  }
  return succeeded;
};

export const isLocalResultCompatible = (
  value: LocalResultV2 | null,
  expectedType?: ResultCode,
) => Boolean(
  value &&
  value.schemaVersion === LOCAL_RESULT_SCHEMA_VERSION &&
  value.quizVersion === QUIZ_VERSION &&
  value.scoringVersion === SCORING_VERSION &&
  value.contentVersion === CONTENT_VERSION &&
  value.artVersion === ART_VERSION &&
  (!expectedType || value.primaryTypeId === expectedType),
);
