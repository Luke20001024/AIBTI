import type { DimensionId, QuestionKind } from "./schema";

export const DIMENSIONS: Record<
  DimensionId,
  { name: string; negative: string; positive: string }
> = {
  ORDER: { name: "秩序方式", negative: "即兴", positive: "精确" },
  RISK: { name: "风险倾向", negative: "稳妥", positive: "实验" },
  EXPRESS: { name: "表达强度", negative: "克制", positive: "外放" },
  SOCIAL: { name: "关系模式", negative: "独处", positive: "共创" },
  GEOMETRY: { name: "形式直觉", negative: "有机", positive: "几何" },
  CONTEXT: { name: "场所关系", negative: "普适", positive: "在地" },
  MAKING: { name: "建造偏好", negative: "工业", positive: "手工" },
  TIME: { name: "时间取向", negative: "未来", positive: "记忆" },
};

export const QUESTION_GROUP_WEIGHTS: Record<QuestionKind, number> = {
  projective: 0.25,
  personality: 0.35,
  aesthetic: 0.4,
};

export const QUIZ_VERSION = "1.0.0";
export const SCORING_VERSION = "1.0.0";
export const CONTENT_VERSION = "1.0.0";
export const ART_VERSION = "0.1.0";
