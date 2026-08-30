import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  ARCHITECTS,
  BUILDINGS,
  CONTENT_VERSION,
  DIMENSION_IDS,
  DISCRIMINATOR_QUESTIONS,
  QUESTION_GROUP_WEIGHTS,
  QUESTIONS,
  QUIZ_VERSION,
  RESULT_STORIES,
  RESULT_TYPES,
  SCORING_VERSION,
  type DimensionVector,
  type OptionId,
} from "../content";
import {
  calculateDimensionScores,
  decodeAnswers,
  deriveDiscriminatorSequence,
  encodeAnswers,
  selectDiscriminatorQuestion,
  scoreQuiz,
  type AnswerMap,
} from "./scoring";

const optionIds = ["A", "B", "C"] as const;

const answerPattern = (...pattern: OptionId[]): AnswerMap =>
  Object.fromEntries(
    QUESTIONS.map((question, index) => [
      question.id,
      pattern[index % pattern.length],
    ]),
  );

const cosineSimilarity = (left: DimensionVector, right: DimensionVector) => {
  const dot = DIMENSION_IDS.reduce(
    (sum, dimension) => sum + left[dimension] * right[dimension],
    0,
  );
  const leftMagnitude = Math.sqrt(
    DIMENSION_IDS.reduce((sum, dimension) => sum + left[dimension] ** 2, 0),
  );
  const rightMagnitude = Math.sqrt(
    DIMENSION_IDS.reduce((sum, dimension) => sum + right[dimension] ** 2, 0),
  );
  return leftMagnitude && rightMagnitude ? dot / (leftMagnitude * rightMagnitude) : 0;
};

const rankForVector = (vector: DimensionVector) =>
  RESULT_TYPES
    .map((result, index) => ({
      code: result.code,
      index,
      similarity: cosineSimilarity(vector, result.vector),
    }))
    .sort((left, right) =>
      right.similarity === left.similarity
        ? left.index - right.index
        : right.similarity - left.similarity,
    );

const primaryForAnswers = (answers: AnswerMap) => {
  const vector = calculateDimensionScores(answers);
  return rankForVector(vector)[0].code;
};

const kindCounts = Object.fromEntries(
  ["projective", "personality", "aesthetic"].map((kind) => [
    kind,
    QUESTIONS.filter((question) => question.kind === kind).length,
  ]),
) as Record<keyof typeof QUESTION_GROUP_WEIGHTS, number>;

const centeredWeight = (
  question: (typeof QUESTIONS)[number],
  option: (typeof QUESTIONS)[number]["options"][number],
  dimension: (typeof DIMENSION_IDS)[number],
) => (option.weights[dimension] ?? 0) - question.options.reduce(
  (sum, item) => sum + (item.weights[dimension] ?? 0),
  0,
) / question.options.length;

const dimensionMaximums = Object.fromEntries(
  DIMENSION_IDS.map((dimension) => [
    dimension,
    QUESTIONS.reduce((maximum, question) => {
      const factor = QUESTION_GROUP_WEIGHTS[question.kind] / kindCounts[question.kind];
      return maximum + Math.max(
        ...question.options.map((option) => Math.abs(centeredWeight(question, option, dimension))),
      ) * factor;
    }, 0),
  ]),
) as DimensionVector;

const scoresWithoutQuestion = (
  answers: AnswerMap,
  excludedQuestionId: string,
): DimensionVector => {
  const totals = Object.fromEntries(DIMENSION_IDS.map((dimension) => [dimension, 0])) as DimensionVector;
  for (const question of QUESTIONS) {
    if (question.id === excludedQuestionId) continue;
    const option = question.options.find((item) => item.id === answers[question.id])!;
    const factor = QUESTION_GROUP_WEIGHTS[question.kind] / kindCounts[question.kind];
    for (const dimension of DIMENSION_IDS) {
      totals[dimension] += centeredWeight(question, option, dimension) * factor;
    }
  }
  for (const dimension of DIMENSION_IDS) {
    totals[dimension] /= dimensionMaximums[dimension];
  }
  return totals;
};

describe("scoring", () => {
  it("keeps the balanced 18-question V4 core contract", () => {
    expect(QUESTIONS).toHaveLength(18);
    expect(new Set(QUESTIONS.map((question) => question.id)).size).toBe(18);
    expect(
      Object.fromEntries(
        ["projective", "personality", "aesthetic"].map((kind) => [
          kind,
          QUESTIONS.filter((question) => question.kind === kind).length,
        ]),
      ),
    ).toEqual({ projective: 6, personality: 6, aesthetic: 6 });

    for (const question of QUESTIONS) {
      expect(question.options.map((option) => option.id)).toEqual(optionIds);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(3);
    }
  });

  it("uses the V4 group weights and versions", () => {
    expect(QUESTION_GROUP_WEIGHTS).toEqual({
      projective: 0.3,
      personality: 0.35,
      aesthetic: 0.35,
    });
    expect(Object.values(QUESTION_GROUP_WEIGHTS).reduce((sum, value) => sum + value, 0))
      .toBeCloseTo(1, 12);
    expect(QUIZ_VERSION).toBe("4.0.0");
    expect(SCORING_VERSION).toBe("4.0.0");
    expect(CONTENT_VERSION).toBe("4.0.0");
  });

  it("keeps eight readable discriminator questions with a strict two-question ceiling", () => {
    expect(DISCRIMINATOR_QUESTIONS).toHaveLength(8);
    expect(new Set(DISCRIMINATOR_QUESTIONS.map((question) => question.id)).size).toBe(8);
    for (const question of DISCRIMINATOR_QUESTIONS) {
      expect(question.id).toMatch(/^T\d{2}$/u);
      expect(question.options.map((option) => option.id)).toEqual(optionIds);
      expect(question.prompt).not.toMatch(/[。.]\s*$/u);
      for (const option of question.options) {
        expect(option.label).not.toMatch(/[。.]\s*$/u);
        expect(option.evidence).not.toMatch(/[。.]\s*$/u);
      }
    }

    const coreAnswers = answerPattern("A", "C", "B");
    const firstSequence = deriveDiscriminatorSequence(coreAnswers);
    expect(firstSequence.length).toBeLessThanOrEqual(1);
    if (firstSequence[0]) {
      const withFirst = { ...coreAnswers, [firstSequence[0].id]: "B" } as AnswerMap;
      expect(deriveDiscriminatorSequence(withFirst).length).toBeLessThanOrEqual(2);
    }
  });

  it("uses the known collision question before a generic discriminator", () => {
    const selected = selectDiscriminatorQuestion({
      gap: 0.2,
      candidates: [
        { code: "ROOT", similarity: 0.81 },
        { code: "HAND", similarity: 0.61 },
      ],
    });
    expect(selected?.id).toBe("T01");
  });

  it("caps the entire discriminator layer at 0.12 per dimension", () => {
    const coreAnswers = answerPattern("A", "B", "C");
    const baseline = calculateDimensionScores(coreAnswers);
    for (const question of DISCRIMINATOR_QUESTIONS) {
      for (const option of question.options) {
        const adjusted = calculateDimensionScores({
          ...coreAnswers,
          [question.id]: option.id,
        });
        for (const dimension of DIMENSION_IDS) {
          expect(Math.abs(adjusted[dimension] - baseline[dimension]))
            .toBeLessThanOrEqual(0.120001);
        }
      }
    }
  });

  it("keeps option scoring strength comparable and copy free of terminal periods", () => {
    for (const question of QUESTIONS) {
      expect(question.eyebrow).not.toMatch(/[。.]\s*$/u);
      expect(question.prompt).not.toMatch(/[。.]\s*$/u);
      const magnitudes = question.options.map((option) => {
        expect(option.label).not.toMatch(/[。.]\s*$/u);
        expect(option.evidence).not.toMatch(/[。.]\s*$/u);
        expect(option.evidence.length).toBeGreaterThanOrEqual(12);
        const values = Object.values(option.weights);
        expect(values.length).toBeGreaterThanOrEqual(2);
        values.forEach((value) => {
          expect(value).toBeGreaterThanOrEqual(-1);
          expect(value).toBeLessThanOrEqual(1);
        });
        return Math.sqrt(values.reduce((sum, value) => sum + value ** 2, 0));
      });
      expect(Math.max(...magnitudes) / Math.min(...magnitudes)).toBeLessThanOrEqual(1.45);
    }
  });

  it("centers every question so equal option frequency is neutral", () => {
    for (const question of QUESTIONS) {
      for (const dimension of DIMENSION_IDS) {
        const expected = question.options.reduce(
          (sum, option) => sum + centeredWeight(question, option, dimension),
          0,
        ) / question.options.length;
        expect(expected, `${question.id} ${dimension}`).toBeCloseTo(0, 12);
      }
    }
  });

  it("is deterministic and returns deterministic leave-one-out evidence", () => {
    const answers = answerPattern("A", "C", "B", "B", "A", "C");
    const first = scoreQuiz(answers);
    const second = scoreQuiz(answers);

    expect(first).toEqual(second);
    expect(first.primaryTypeId).not.toBe(first.secondaryTypeId);
    expect(first.evidence).toEqual(first.evidenceQuestions);
    expect(first.evidenceQuestions).toHaveLength(3);
    expect(first.evidenceQuestionIds).toEqual(
      first.evidenceQuestions.map((evidence) => evidence.questionId),
    );
    expect(first.evidenceQuestions.some((evidence) => evidence.drop > 0)).toBe(true);

    first.evidenceQuestions.forEach((evidence, index) => {
      const question = QUESTIONS.find((item) => item.id === evidence.questionId)!;
      const option = question.options.find((item) => item.id === evidence.optionId)!;
      expect(evidence.prompt).toBe(question.prompt);
      expect(evidence.label).toBe(option.label);
      expect(evidence.optionId).toBe(answers[evidence.questionId]);
      expect(evidence.dimensions.length).toBeGreaterThanOrEqual(1);
      expect(evidence.dimensions.length).toBeLessThanOrEqual(3);
      expect(evidence.dominantDimension).toBe(evidence.dimensions[0]);
      expect(evidence.drop).toBeGreaterThanOrEqual(0);
      expect(evidence.drop).toBe(Number(evidence.drop.toFixed(6)));
      expect(evidence.interpretation).toBe(option.evidence);
      expect(evidence.interpretation).not.toMatch(/[。.]\s*$/u);

      const withoutCandidates = rankForVector(
        scoresWithoutQuestion(answers, evidence.questionId),
      );
      const fullPrimarySimilarity = first.candidates.find(
        (candidate) => candidate.code === first.primaryTypeId,
      )!.similarity;
      const fullCompetitorSimilarity = Math.max(
        ...first.candidates
          .filter((candidate) => candidate.code !== first.primaryTypeId)
          .map((candidate) => candidate.similarity),
      );
      const withoutPrimarySimilarity = withoutCandidates.find(
        (candidate) => candidate.code === first.primaryTypeId,
      )!.similarity;
      const withoutCompetitorSimilarity = Math.max(
        ...withoutCandidates
          .filter((candidate) => candidate.code !== first.primaryTypeId)
          .map((candidate) => candidate.similarity),
      );
      const expectedMarginDrop =
        (fullPrimarySimilarity - fullCompetitorSimilarity) -
        (withoutPrimarySimilarity - withoutCompetitorSimilarity);
      expect(evidence.marginDrop).toBeCloseTo(expectedMarginDrop, 5);
      expect(evidence.drop).toBeCloseTo(Math.max(0, expectedMarginDrop), 5);
      if (index > 0) {
        expect(evidence.drop).toBeLessThanOrEqual(first.evidenceQuestions[index - 1].drop);
      }
    });
  });

  it("encodes and decodes all answers without server state", () => {
    const answers = answerPattern("A", "B", "C");
    expect(decodeAnswers(encodeAnswers(answers))).toEqual(answers);
  });

  it("rejects unknown question keys and option ids instead of reinterpreting them", () => {
    const answers = answerPattern("A", "B", "C");
    const unknownQuestion = { ...answers, Q19: "A" } as AnswerMap;
    const unknownOption = { ...answers, Q01: "Z" } as unknown as AnswerMap;

    expect(() => scoreQuiz(unknownQuestion)).toThrow(/Expected 18 core answers/u);
    expect(() => scoreQuiz(unknownOption)).toThrow(/Unknown option Z for Q01/u);
    expect(() => encodeAnswers(unknownOption)).toThrow(/Unknown option Z for Q01/u);
  });

  it("keeps all sixteen archetypes reachable within the fixed-seed V4 distribution envelope", () => {
    let seed = 0xA1B71;
    const random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 0x1_0000_0000;
    };
    const counts = Object.fromEntries(
      RESULT_TYPES.map((result) => [result.code, 0]),
    ) as Record<(typeof RESULT_TYPES)[number]["code"], number>;
    const sampleCount = 100_000;

    for (let sample = 0; sample < sampleCount; sample += 1) {
      const answers = Object.fromEntries(
        QUESTIONS.map((question) => [
          question.id,
          optionIds[Math.floor(random() * optionIds.length)],
        ]),
      ) as AnswerMap;
      const first = deriveDiscriminatorSequence(answers)[0];
      if (first) answers[first.id] = optionIds[Math.floor(random() * optionIds.length)];
      const second = deriveDiscriminatorSequence(answers)[1];
      if (second) answers[second.id] = optionIds[Math.floor(random() * optionIds.length)];
      counts[primaryForAnswers(answers)] += 1;
    }

    const shares = Object.entries(counts).map(([code, count]) => ({ code, share: count / sampleCount }));
    shares.forEach(({ code, share }) => {
      expect(share, code).toBeGreaterThanOrEqual(0.018);
      expect(share, code).toBeLessThanOrEqual(0.15);
    });
    expect(
      Math.max(...shares.map((item) => item.share)) /
      Math.min(...shares.map((item) => item.share)),
    ).toBeLessThanOrEqual(7);
  }, 15_000);

  it("keeps the sixteen-persona content graph complete and all visible local media present", () => {
    expect(RESULT_TYPES).toHaveLength(16);
    expect(RESULT_STORIES).toHaveLength(16);
    expect(ARCHITECTS).toHaveLength(16);
    expect(BUILDINGS).toHaveLength(80);
    expect(new Set(RESULT_TYPES.flatMap((result) => result.buildingIds)).size).toBe(48);
    expect(new Set(RESULT_TYPES.flatMap((result) => result.recommendedBuildingIds)).size).toBe(32);

    const architectIds = new Set(ARCHITECTS.map((architect) => architect.id));
    const buildingIds = new Set(BUILDINGS.map((building) => building.id));
    const storyCodes = new Set(RESULT_STORIES.map((story) => story.code));
    for (const result of RESULT_TYPES) {
      expect(architectIds.has(result.architectId), `${result.code} architect`).toBe(true);
      expect(storyCodes.has(result.code), `${result.code} story`).toBe(true);
      for (const id of [...result.buildingIds, ...result.recommendedBuildingIds]) {
        expect(buildingIds.has(id), `${result.code} ${id}`).toBe(true);
      }
    }

    const media = [
      ...RESULT_TYPES.map((result) => result.characterImage),
      ...ARCHITECTS.flatMap((architect) => architect.portrait ? [architect.portrait.src] : []),
      ...RESULT_TYPES.flatMap((result) => result.buildingIds.map((id) => {
        const image = BUILDINGS.find((building) => building.id === id)?.image;
        expect(image, `${result.code} ${id} visible image`).toBeDefined();
        return image!.src;
      })),
    ];
    for (const src of media) {
      expect(existsSync(join(process.cwd(), "public", src.replace(/^\//, ""))), src).toBe(true);
    }
  });

  it("limits contrast-definition phrasing so each result reads directly", () => {
    const offenders: string[] = [];
    for (const result of RESULT_TYPES) {
      const story = RESULT_STORIES.find((item) => item.code === result.code)!;
      const architect = ARCHITECTS.find((item) => item.id === result.architectId)!;
      const buildings = [...result.buildingIds, ...result.recommendedBuildingIds]
        .map((id) => BUILDINGS.find((item) => item.id === id)!);
      const visibleStrings = [
        result.publicSide,
        result.hiddenSide,
        result.stressResponse,
        result.architectureLogic,
        story.plainLead,
        ...story.instincts,
        story.architectHook,
        story.architectFocus,
        story.closing,
        architect.summary,
        architect.storyTitle,
        architect.story,
        ...buildings.flatMap((building) => [building.hook, building.story, ...building.lookFor]),
      ];
      const indirect = visibleStrings.filter((value) => /(?:不是|并非).{0,55}(?:而是|，是|、是)|而不是/u.test(value));
      if (indirect.length > 3) offenders.push(`${result.code} (${indirect.length}): ${indirect.join(" | ")}`);
    }
    expect(offenders).toEqual([]);
  });
});
