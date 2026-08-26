export const DIMENSION_IDS = [
  "ORDER",
  "RISK",
  "EXPRESS",
  "SOCIAL",
  "GEOMETRY",
  "CONTEXT",
  "MAKING",
  "TIME",
] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];
export type DimensionVector = Record<DimensionId, number>;
export type SparseVector = Partial<DimensionVector>;
export type QuestionKind = "projective" | "personality" | "aesthetic";
export type OptionId = "A" | "B" | "C";
export type ResultCode =
  | "GRID"
  | "ROOT"
  | "MASS"
  | "VOID"
  | "TECH"
  | "FLOW"
  | "ORNA"
  | "HAND";

export type QuestionOption = {
  id: OptionId;
  label: string;
  evidence: string;
  note?: string;
  weights: SparseVector;
  visual?: string;
};

export type Question = {
  id: string;
  order: number;
  kind: QuestionKind;
  prompt: string;
  eyebrow: string;
  options: readonly QuestionOption[];
};

export type SourceRef = {
  label: string;
  url: string;
  credit?: string;
  status?: "prototype-source-noted" | "cleared" | "replace-before-commercial";
};

export type Architect = {
  id: string;
  name: string;
  originalName: string;
  lifespan: string;
  region: string;
  school: string;
  summary: string;
  storyTitle: string;
  story: string;
  creditNote?: string;
  portrait?: {
    src: string;
    alt: string;
    source: SourceRef;
  };
  sources: readonly SourceRef[];
};

export type Building = {
  id: string;
  name: string;
  originalName: string;
  location: string;
  years: string;
  architectIds: readonly string[];
  hook: string;
  lookFor: readonly string[];
  story: string;
  image?: {
    src: string;
    alt: string;
    source: SourceRef;
  };
  sources: readonly SourceRef[];
};

export type ResultType = {
  code: ResultCode;
  slug: string;
  name: string;
  englishName: string;
  architectureLanguage: string;
  languageSummary: string;
  school: string;
  schoolSummary: string;
  relatedArchitects: readonly [string, string];
  tagline: string;
  keywords: readonly string[];
  vector: DimensionVector;
  architectId: string;
  buildingIds: readonly [string, string, string];
  recommendedBuildingIds: readonly [string, string];
  publicSide: string;
  hiddenSide: string;
  stressResponse: string;
  architectureLogic: string;
  accent: string;
  accentSoft: string;
  ink: string;
  characterImage: string;
  characterAlt: string;
};
