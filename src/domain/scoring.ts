import {
  DIMENSION_IDS,
  QUESTION_GROUP_WEIGHTS,
  QUESTIONS,
  RESULT_TYPES,
  SCORING_VERSION,
  QUIZ_VERSION,
  type DimensionId,
  type DimensionVector,
  type OptionId,
  type Question,
  type ResultCode,
} from "../content";

export type AnswerMap = Record<string, OptionId>;

export type ScoredCandidate = {
  code: ResultCode;
  similarity: number;
};

export type QuizResult = {
  primaryTypeId: ResultCode;
  secondaryTypeId: ResultCode;
  confidence: number;
  clarity: "clear" | "balanced" | "mixed";
  gap: number;
  dimensionScores: DimensionVector;
  evidenceQuestionIds: string[];
  candidates: ScoredCandidate[];
  quizVersion: string;
  scoringVersion: string;
};

const emptyVector = (): DimensionVector => ({
  ORDER: 0,
  RISK: 0,
  EXPRESS: 0,
  SOCIAL: 0,
  GEOMETRY: 0,
  CONTEXT: 0,
  MAKING: 0,
  TIME: 0,
});

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const dot = (left: DimensionVector, right: DimensionVector) =>
  DIMENSION_IDS.reduce((sum, dimension) => sum + left[dimension] * right[dimension], 0);

const magnitude = (vector: DimensionVector) => Math.sqrt(dot(vector, vector));

const cosineSimilarity = (left: DimensionVector, right: DimensionVector) => {
  const denominator = magnitude(left) * magnitude(right);
  return denominator === 0 ? 0 : dot(left, right) / denominator;
};

const questionFactor = (question: Question) =>
  QUESTION_GROUP_WEIGHTS[question.kind] /
  QUESTIONS.filter((item) => item.kind === question.kind).length;

const getQuestionOption = (question: Question, optionId: OptionId) => {
  const option = question.options.find((item) => item.id === optionId);
  if (!option) throw new Error(`Unknown option ${optionId} for ${question.id}`);
  return option;
};

export const calculateDimensionScores = (answers: AnswerMap): DimensionVector => {
  const totals = emptyVector();
  const maximums = emptyVector();

  for (const question of QUESTIONS) {
    const answerId = answers[question.id];
    if (!answerId) throw new Error(`Missing answer for ${question.id}`);
    const option = getQuestionOption(question, answerId);
    const factor = questionFactor(question);

    for (const dimension of DIMENSION_IDS) {
      totals[dimension] += (option.weights[dimension] ?? 0) * factor;
      const theoreticalQuestionMax = Math.max(
        ...question.options.map((item) => Math.abs(item.weights[dimension] ?? 0)),
      );
      maximums[dimension] += theoreticalQuestionMax * factor;
    }
  }

  for (const dimension of DIMENSION_IDS) {
    totals[dimension] = maximums[dimension]
      ? clamp(totals[dimension] / maximums[dimension], -1, 1)
      : 0;
  }

  return totals;
};

const getEvidenceQuestions = (
  answers: AnswerMap,
  resultVector: DimensionVector,
): string[] =>
  QUESTIONS.map((question) => {
    const option = getQuestionOption(question, answers[question.id]);
    const contribution = DIMENSION_IDS.reduce(
      (sum, dimension) =>
        sum + (option.weights[dimension] ?? 0) * resultVector[dimension],
      0,
    ) * questionFactor(question);
    return { id: question.id, contribution };
  })
    .filter((item) => item.contribution > 0)
    .sort((left, right) => right.contribution - left.contribution)
    .slice(0, 3)
    .map((item) => item.id);

export const scoreQuiz = (answers: AnswerMap): QuizResult => {
  if (Object.keys(answers).length !== QUESTIONS.length) {
    throw new Error(`Expected ${QUESTIONS.length} answers.`);
  }

  const dimensionScores = calculateDimensionScores(answers);
  const candidates = RESULT_TYPES.map((result) => ({
    code: result.code,
    similarity: cosineSimilarity(dimensionScores, result.vector),
  })).sort((left, right) => {
    if (right.similarity !== left.similarity) return right.similarity - left.similarity;
    return RESULT_TYPES.findIndex((item) => item.code === left.code) -
      RESULT_TYPES.findIndex((item) => item.code === right.code);
  });

  const primary = candidates[0];
  const secondary = candidates[1];
  const gap = Math.max(0, primary.similarity - secondary.similarity);
  const clarity = gap >= 0.16 ? "clear" : gap >= 0.08 ? "balanced" : "mixed";
  const resultVector = RESULT_TYPES.find((item) => item.code === primary.code)!.vector;

  return {
    primaryTypeId: primary.code,
    secondaryTypeId: secondary.code,
    confidence: clamp(gap / 0.24, 0, 1),
    clarity,
    gap,
    dimensionScores,
    evidenceQuestionIds: getEvidenceQuestions(answers, resultVector),
    candidates,
    quizVersion: QUIZ_VERSION,
    scoringVersion: SCORING_VERSION,
  };
};

const BASE64_URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const encodeBytes = (bytes: Uint8Array): string => {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    const chunk = (first << 16) | (second << 8) | third;
    output += BASE64_URL_ALPHABET[(chunk >> 18) & 63];
    output += BASE64_URL_ALPHABET[(chunk >> 12) & 63];
    if (index + 1 < bytes.length) output += BASE64_URL_ALPHABET[(chunk >> 6) & 63];
    if (index + 2 < bytes.length) output += BASE64_URL_ALPHABET[chunk & 63];
  }
  return output;
};

const decodeBytes = (encoded: string): Uint8Array => {
  const bytes: number[] = [];
  for (let index = 0; index < encoded.length; index += 4) {
    const chars = encoded.slice(index, index + 4).split("");
    const values = chars.map((char) => BASE64_URL_ALPHABET.indexOf(char));
    if (values.some((value) => value < 0)) throw new Error("Invalid answer code.");
    const chunk =
      ((values[0] ?? 0) << 18) |
      ((values[1] ?? 0) << 12) |
      ((values[2] ?? 0) << 6) |
      (values[3] ?? 0);
    bytes.push((chunk >> 16) & 255);
    if (chars.length > 2) bytes.push((chunk >> 8) & 255);
    if (chars.length > 3) bytes.push(chunk & 255);
  }
  return Uint8Array.from(bytes);
};

export const encodeAnswers = (answers: AnswerMap): string => {
  const bytes = new Uint8Array(Math.ceil((QUESTIONS.length * 2) / 8));
  QUESTIONS.forEach((question, index) => {
    const option = answers[question.id];
    if (!option) throw new Error(`Missing answer for ${question.id}`);
    const value = option === "A" ? 0 : option === "B" ? 1 : 2;
    const bitOffset = index * 2;
    bytes[Math.floor(bitOffset / 8)] |= value << (bitOffset % 8);
  });
  return encodeBytes(bytes);
};

export const decodeAnswers = (encoded: string): AnswerMap => {
  const bytes = decodeBytes(encoded);
  const requiredBytes = Math.ceil((QUESTIONS.length * 2) / 8);
  if (bytes.length !== requiredBytes) throw new Error("Answer code has the wrong length.");

  const answers: AnswerMap = {};
  QUESTIONS.forEach((question, index) => {
    const bitOffset = index * 2;
    const value = (bytes[Math.floor(bitOffset / 8)] >> (bitOffset % 8)) & 3;
    if (value > 2) throw new Error("Answer code contains an invalid option.");
    answers[question.id] = value === 0 ? "A" : value === 1 ? "B" : "C";
  });
  return answers;
};
