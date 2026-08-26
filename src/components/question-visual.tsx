import type { CSSProperties } from "react";
import { withBasePath } from "../domain/paths";

const QUESTION_IMAGE_BY_ID = {
  Q13: "/images/questions-generated/q13-form.jpg",
  Q14: "/images/questions-generated/q14-atmosphere.jpg",
  Q15: "/images/questions-generated/q15-material.jpg",
  Q16: "/images/questions-generated/q16-window.jpg",
  Q17: "/images/questions-generated/q17-public-space.jpg",
  Q18: "/images/questions-generated/q18-imperfection.jpg",
} as const;

type GeneratedQuestionId = keyof typeof QUESTION_IMAGE_BY_ID;

type QuestionVisualProps = {
  questionId: string;
  optionIndex: number;
  label: string;
};

export const hasGeneratedQuestionVisual = (questionId: string): questionId is GeneratedQuestionId =>
  questionId in QUESTION_IMAGE_BY_ID;

export function QuestionVisual({ questionId, optionIndex, label }: QuestionVisualProps) {
  if (!hasGeneratedQuestionVisual(questionId)) return null;

  const style = {
    "--question-image": `url(${withBasePath(QUESTION_IMAGE_BY_ID[questionId])})`,
    "--question-image-position": `${optionIndex * 50}% center`,
  } as CSSProperties;

  return (
    <span
      className="generated-question-visual"
      style={style}
      role="img"
      aria-label={label}
    />
  );
}
