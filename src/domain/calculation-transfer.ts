import { QUIZ_VERSION, SCORING_VERSION } from "../content";
import { decodeAnswers, encodeAnswers, type AnswerMap } from "./scoring";
import { withBasePath } from "./paths";
import type { SearchParamsReader } from "./result-view";

export const CALCULATION_TRANSFER_VERSION = "3";

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
    return { ok: true, answers };
  } catch {
    return { ok: false, reason: "invalid-answers" };
  }
};
