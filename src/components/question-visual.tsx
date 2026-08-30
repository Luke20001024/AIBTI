import { withBasePath } from "../domain/paths";

const QUESTION_IMAGES_BY_ID = {
  Q13: ["q13-a.webp", "q13-b.webp", "q13-c.webp"],
  Q14: ["q14-a.webp", "q14-b.webp", "q14-c.webp"],
  Q15: ["q15-a.webp", "q15-b.webp", "q15-c.webp"],
  Q16: ["q16-a.webp", "q16-b.webp", "q16-c.webp"],
  Q17: ["q17-a.webp", "q17-b.webp", "q17-c.webp"],
  Q18: ["q18-a.webp", "q18-b.webp", "q18-c.webp"],
} as const;

type GeneratedQuestionId = keyof typeof QUESTION_IMAGES_BY_ID;

type QuestionVisualProps = {
  questionId: string;
  optionIndex: number;
};

export const hasGeneratedQuestionVisual = (questionId: string): questionId is GeneratedQuestionId =>
  questionId in QUESTION_IMAGES_BY_ID;

export const getQuestionVisualSources = (questionId: string): readonly string[] => {
  if (!hasGeneratedQuestionVisual(questionId)) return [];
  return QUESTION_IMAGES_BY_ID[questionId].map((filename) =>
    withBasePath(`/images/questions-v3/${filename}`),
  );
};

export function QuestionVisual({ questionId, optionIndex }: QuestionVisualProps) {
  const source = getQuestionVisualSources(questionId)[optionIndex];
  if (!source) return null;

  return (
    <img
      className="generated-question-visual"
      src={source}
      width={1200}
      height={800}
      alt=""
      data-media-fit="intrinsic"
      loading="eager"
      decoding="async"
    />
  );
}
