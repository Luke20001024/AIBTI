import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ARCHITECTS, BUILDINGS, QUESTIONS, RESULT_TYPES } from "../content";
import { decodeAnswers, encodeAnswers, scoreQuiz, type AnswerMap } from "./scoring";

const all = (option: "A" | "B" | "C"): AnswerMap =>
  Object.fromEntries(QUESTIONS.map((question) => [question.id, option]));

describe("scoring", () => {
  it("keeps the 18-question product contract", () => {
    expect(QUESTIONS).toHaveLength(18);
    expect(new Set(QUESTIONS.map((question) => question.id)).size).toBe(18);
  });

  it("is deterministic and always returns primary and secondary types", () => {
    const answers = all("A");
    expect(scoreQuiz(answers)).toEqual(scoreQuiz(answers));
    expect(scoreQuiz(answers).primaryTypeId).not.toBe(scoreQuiz(answers).secondaryTypeId);
  });

  it("encodes and decodes all answers without server state", () => {
    const answers = Object.fromEntries(
      QUESTIONS.map((question, index) => [question.id, (["A", "B", "C"] as const)[index % 3]]),
    );
    expect(decodeAnswers(encodeAnswers(answers))).toEqual(answers);
  });

  it("matches a precision-heavy profile to GRID", () => {
    const answers = all("A");
    answers.Q14 = "A";
    answers.Q15 = "C";
    expect(scoreQuiz(answers).primaryTypeId).toBe("GRID");
  });

  it("matches a material-memory profile to HAND", () => {
    expect(scoreQuiz(all("B")).primaryTypeId).toBe("HAND");
  });

  it("keeps every result archetype reachable across deterministic answer sampling", () => {
    let seed = 0xA1B71;
    const random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 0x1_0000_0000;
    };
    const seen = new Set<string>();
    for (let sample = 0; sample < 50_000 && seen.size < RESULT_TYPES.length; sample += 1) {
      const answers = Object.fromEntries(QUESTIONS.map((question) => [
        question.id,
        (["A", "B", "C"] as const)[Math.floor(random() * 3)],
      ]));
      seen.add(scoreQuiz(answers).primaryTypeId);
    }
    expect([...seen].sort()).toEqual(RESULT_TYPES.map((result) => result.code).sort());
  });

  it("keeps the MVP content graph complete and all local media present", () => {
    expect(RESULT_TYPES).toHaveLength(8);
    expect(ARCHITECTS).toHaveLength(8);
    expect(BUILDINGS).toHaveLength(24);
    expect(new Set(RESULT_TYPES.flatMap((result) => result.buildingIds)).size).toBe(24);

    const media = [
      ...RESULT_TYPES.map((result) => result.characterImage),
      ...ARCHITECTS.flatMap((architect) => architect.portrait ? [architect.portrait.src] : []),
      ...BUILDINGS.flatMap((building) => building.image ? [building.image.src] : []),
    ];
    for (const src of media) {
      expect(existsSync(join(process.cwd(), "public", src.replace(/^\//, ""))), src).toBe(true);
    }
  });
});
