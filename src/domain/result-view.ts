import { RESULT_TYPES, type ResultCode } from "../content";
import { isLocalResultCompatible, type LocalResultV2 } from "./local-result";
import { applyBasePath, BASE_PATH, toAbsoluteUrl } from "./paths";

export type SearchParamsReader = Pick<URLSearchParams, "get" | "has">;

export type ResultEntry =
  | { kind: "mine" }
  | { kind: "shared"; source: "share" | "card" }
  | { kind: "explore"; legacyAnswerUrl: boolean };

export type ResultView =
  | { kind: "owner"; localResult: LocalResultV2 }
  | { kind: "shared"; source: "share" | "card" | "owner-missing" }
  | { kind: "explore"; legacyAnswerUrl: boolean };

export type ResultPathEntry = "mine" | "share" | "card" | "explore";

const isKnownSlug = (slug: string) => RESULT_TYPES.some((result) => result.slug === slug);

export const parseResultEntry = (searchParams: SearchParamsReader): ResultEntry => {
  const from = searchParams.get("from");
  if (from === "share" || from === "card") return { kind: "shared", source: from };
  if (searchParams.get("mine") === "1") return { kind: "mine" };

  return {
    kind: "explore",
    legacyAnswerUrl: ["a", "q", "s", "u"].some((key) => searchParams.has(key)),
  };
};

export const resolveResultView = ({
  entry,
  expectedType,
  localResult,
}: {
  entry: ResultEntry;
  expectedType: ResultCode;
  localResult: LocalResultV2 | null;
}): ResultView => {
  if (entry.kind === "shared") return { kind: "shared", source: entry.source };
  if (entry.kind === "explore") {
    return { kind: "explore", legacyAnswerUrl: entry.legacyAnswerUrl };
  }
  if (isLocalResultCompatible(localResult, expectedType) && localResult) {
    return { kind: "owner", localResult };
  }
  return { kind: "shared", source: "owner-missing" };
};

export const buildResultPath = (slug: string, entry: ResultPathEntry = "explore") => {
  if (!isKnownSlug(slug)) throw new Error(`Unknown result slug: ${slug}`);
  const path = `/result/${slug}/`;
  if (entry === "mine") return `${path}?mine=1`;
  if (entry === "share" || entry === "card") return `${path}?from=${entry}`;
  return path;
};

export const buildPublicResultUrl = ({
  origin,
  slug,
  source = "share",
  basePath = BASE_PATH,
}: {
  origin: string;
  slug: string;
  source?: "share" | "card";
  basePath?: string;
}) => toAbsoluteUrl(applyBasePath(buildResultPath(slug, source), basePath), origin);
