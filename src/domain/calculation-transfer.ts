import { DISCRIMINATOR_BY_ID, QUIZ_VERSION, SCORING_VERSION } from "../content";
import type { OptionId } from "../content";
import { decodeAnswers, encodeAnswers, type AnswerMap } from "./scoring";
import { withBasePath } from "./paths";
import type { SearchParamsReader } from "./result-view";

export const CALCULATION_TRANSFER_VERSION = "4";

export type CalculationTransferError =
  | "missing-parameters"
  | "unsupported-transfer-version"
  | "quiz-version-mismatch"
  | "scoring-version-mismatch"
  | "invalid-answers";

export type CalculationTransferResult =
  | { ok: true; answers: AnswerMap }
  | { ok: false; reason: CalculationTransferError };

export const buildCalculationPath = (answers: AnswerMap) => {
  const params = new URLSearchParams({
    a: encodeAnswers(answers),
    u: CALCULATION_TRANSFER_VERSION,
    q: QUIZ_VERSION,
    s: SCORING_VERSION,
  });
  const discriminator = Object.keys(answers)
    .filter((id) => DISCRIMINATOR_BY_ID[id])
    .sort()
    .map((id) => `${id}${answers[id]}`)
    .join("-");
  if (discriminator) params.set("d", discriminator);
  return `/calculating/#${params.toString()}`;
};

export const buildCalculationHref = (answers: AnswerMap) =>
  withBasePath(buildCalculationPath(answers));

export const parseCalculationTransfer = (
  searchParams: SearchParamsReader,
): CalculationTransferResult => {
  const encoded = searchParams.get("a");
  const transferVersion = searchParams.get("u");
  const quizVersion = searchParams.get("q");
  const scoringVersion = searchParams.get("s");

  if (!encoded || !transferVersion || !quizVersion || !scoringVersion) {
    return { ok: false, reason: "missing-parameters" };
  }
  if (transferVersion !== CALCULATION_TRANSFER_VERSION) {
    return { ok: false, reason: "unsupported-transfer-version" };
  }
  if (quizVersion !== QUIZ_VERSION) {
    return { ok: false, reason: "quiz-version-mismatch" };
  }
  if (scoringVersion !== SCORING_VERSION) {
    return { ok: false, reason: "scoring-version-mismatch" };
  }

  try {
    const answers = decodeAnswers(encoded);
    if (encodeAnswers(answers) !== encoded) {
      return { ok: false, reason: "invalid-answers" };
    }
    const discriminator = searchParams.get("d");
    if (discriminator) {
      const tokens = discriminator.split("-");
      if (tokens.length > 2) return { ok: false, reason: "invalid-answers" };
      const seen = new Set<string>();
      for (const token of tokens) {
        const match = /^(T\d{2})([ABC])$/u.exec(token);
        if (!match || !DISCRIMINATOR_BY_ID[match[1]] || seen.has(match[1])) {
          return { ok: false, reason: "invalid-answers" };
        }
        seen.add(match[1]);
        answers[match[1]] = match[2] as OptionId;
      }
    }
    return { ok: true, answers };
  } catch {
    return { ok: false, reason: "invalid-answers" };
  }
};
