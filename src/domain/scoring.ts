import {
  DIMENSIONS,
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

export type EvidenceQuestion = {
  questionId: string;
  optionId: OptionId;
  prompt: string;
  label: string;
  dominantDimension: DimensionId;
  dimensions: DimensionId[];
  drop: number;
  similarityDrop: number;
  marginDrop: number;
  interpretation: string;
};

export type QuizResult = {
  primaryTypeId: ResultCode;
  secondaryTypeId: ResultCode;
  confidence: number;
  clarity: "clear" | "balanced" | "mixed";
  gap: number;
  dimensionScores: DimensionVector;
  evidence: EvidenceQuestion[];
  evidenceQuestions: EvidenceQuestion[];
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

const stableNumber = (value: number) => {
  const rounded = Number(value.toFixed(6));
  return Object.is(rounded, -0) ? 0 : rounded;
};

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

const dimensionMaximums = (() => {
  const maximums = emptyVector();
  for (const question of QUESTIONS) {
    const factor = questionFactor(question);
    for (const dimension of DIMENSION_IDS) {
      maximums[dimension] += Math.max(
        ...question.options.map((item) => Math.abs(item.weights[dimension] ?? 0)),
      ) * factor;
    }
  }
  return maximums;
})();

const getQuestionOption = (question: Question, optionId: OptionId) => {
  const option = question.options.find((item) => item.id === optionId);
  if (!option) throw new Error(`Unknown option ${optionId} for ${question.id}`);
  return option;
};

const calculateDimensionScoresInternal = (
  answers: AnswerMap,
  excludedQuestionId?: string,
): DimensionVector => {
  const totals = emptyVector();

  for (const question of QUESTIONS) {
    const answerId = answers[question.id];
    if (!answerId) throw new Error(`Missing answer for ${question.id}`);
    if (question.id === excludedQuestionId) continue;
    const option = getQuestionOption(question, answerId);
    const factor = questionFactor(question);

    for (const dimension of DIMENSION_IDS) {
      totals[dimension] += (option.weights[dimension] ?? 0) * factor;
    }
  }

  for (const dimension of DIMENSION_IDS) {
    totals[dimension] = dimensionMaximums[dimension]
      ? clamp(totals[dimension] / dimensionMaximums[dimension], -1, 1)
      : 0;
  }

  return totals;
};

export const calculateDimensionScores = (answers: AnswerMap): DimensionVector =>
  calculateDimensionScoresInternal(answers);

const rankCandidates = (dimensionScores: DimensionVector): ScoredCandidate[] =>
  RESULT_TYPES.map((result) => ({
    code: result.code,
    similarity: cosineSimilarity(dimensionScores, result.vector),
  })).sort((left, right) => {
    if (right.similarity !== left.similarity) return right.similarity - left.similarity;
    return RESULT_TYPES.findIndex((item) => item.code === left.code) -
      RESULT_TYPES.findIndex((item) => item.code === right.code);
  });

const getEvidenceQuestions = (
  answers: AnswerMap,
  primaryCode: ResultCode,
  resultVector: DimensionVector,
  fullCandidates: ScoredCandidate[],
): EvidenceQuestion[] => {
  const fullPrimarySimilarity = fullCandidates.find(
    (candidate) => candidate.code === primaryCode,
  )!.similarity;
  const fullCompetitorSimilarity = Math.max(
    ...fullCandidates
      .filter((candidate) => candidate.code !== primaryCode)
      .map((candidate) => candidate.similarity),
  );
  const fullMargin = fullPrimarySimilarity - fullCompetitorSimilarity;

  return QUESTIONS.map((question) => {
    const option = getQuestionOption(question, answers[question.id]);
    const withoutCandidates = rankCandidates(
      calculateDimensionScoresInternal(answers, question.id),
    );
    const withoutPrimarySimilarity = withoutCandidates.find(
      (candidate) => candidate.code === primaryCode,
    )!.similarity;
    const withoutCompetitorSimilarity = Math.max(
      ...withoutCandidates
        .filter((candidate) => candidate.code !== primaryCode)
        .map((candidate) => candidate.similarity),
    );
    const withoutMargin = withoutPrimarySimilarity - withoutCompetitorSimilarity;
    const similarityDrop = fullPrimarySimilarity - withoutPrimarySimilarity;
    const marginDrop = fullMargin - withoutMargin;
    const dimensions = DIMENSION_IDS
      .filter((dimension) => (option.weights[dimension] ?? 0) !== 0)
      .sort((left, right) => {
        const rightContribution = Math.abs(
          (option.weights[right] ?? 0) * resultVector[right],
        );
        const leftContribution = Math.abs(
          (option.weights[left] ?? 0) * resultVector[left],
        );
        if (rightContribution !== leftContribution) {
          return rightContribution - leftContribution;
        }
        return DIMENSION_IDS.indexOf(left) - DIMENSION_IDS.indexOf(right);
      })
      .slice(0, 3);
    const tendencyLabels = dimensions.slice(0, 2).map((dimension) => {
      const pole = (option.weights[dimension] ?? 0) >= 0 ? "positive" : "negative";
      return DIMENSIONS[dimension][pole];
    });

    return {
      questionId: question.id,
      optionId: option.id,
      prompt: question.prompt,
      label: option.label,
      dominantDimension: dimensions[0] ?? DIMENSION_IDS[0],
      dimensions,
      drop: stableNumber(Math.max(0, marginDrop)),
      similarityDrop: stableNumber(similarityDrop),
      marginDrop: stableNumber(marginDrop),
      interpretation: `你选了「${option.label}」，最明显地指向${tendencyLabels.join("与")}`,
    };
  })
    .sort((left, right) => {
      if (right.drop !== left.drop) return right.drop - left.drop;
      if (right.similarityDrop !== left.similarityDrop) {
        return right.similarityDrop - left.similarityDrop;
      }
      return left.questionId.localeCompare(right.questionId);
    })
    .slice(0, 3);
};

export const scoreQuiz = (answers: AnswerMap): QuizResult => {
  const answerKeys = Object.keys(answers);
  if (
    answerKeys.length !== QUESTIONS.length ||
    answerKeys.some((questionId) =>
      !QUESTIONS.some((question) => question.id === questionId),
    )
  ) {
    throw new Error(`Expected ${QUESTIONS.length} answers.`);
  }

  const dimensionScores = calculateDimensionScores(answers);
  const candidates = rankCandidates(dimensionScores);

  const primary = candidates[0];
  const secondary = candidates[1];
  const gap = Math.max(0, primary.similarity - secondary.similarity);
  const clarity = gap >= 0.16 ? "clear" : gap >= 0.08 ? "balanced" : "mixed";
  const resultVector = RESULT_TYPES.find((item) => item.code === primary.code)!.vector;
  const evidenceQuestions = getEvidenceQuestions(
    answers,
    primary.code,
    resultVector,
    candidates,
  );

  return {
    primaryTypeId: primary.code,
    secondaryTypeId: secondary.code,
    confidence: clamp(gap / 0.24, 0, 1),
    clarity,
    gap,
    dimensionScores,
    evidence: evidenceQuestions,
    evidenceQuestions,
    evidenceQuestionIds: evidenceQuestions.map((evidence) => evidence.questionId),
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
    const optionId = answers[question.id];
    if (!optionId) throw new Error(`Missing answer for ${question.id}`);
    const option = getQuestionOption(question, optionId);
    const value = option.id === "A" ? 0 : option.id === "B" ? 1 : 2;
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
