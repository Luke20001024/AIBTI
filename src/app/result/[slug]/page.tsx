import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARCHITECT_BY_ID, BUILDING_BY_ID, RESULT_BY_SLUG, RESULT_TYPES } from "../../../content";
import { withBasePath } from "../../../domain/paths";
import { ResultV7Page } from "../../../features/result-v7/components/result-v7-page";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => RESULT_TYPES.map((result) => ({ slug: result.slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) return {};
  return {
    title: `${result.code} · ${result.name}`,
    description: `${result.languageSummary}｜代表建筑师 ${ARCHITECT_BY_ID[result.architectId].name}`,
    openGraph: {
      title: `${result.code} · ${result.name}｜ArcBTI`,
      description: result.languageSummary,
      images: [{ url: withBasePath(`/images/personas/${result.slug}/hero-poster-v1.png`) }],
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) notFound();
  const architect = ARCHITECT_BY_ID[result.architectId];
  const featuredBuildings = result.buildingIds.map((id) => BUILDING_BY_ID[id]);
  const recommendedBuildings = result.recommendedBuildingIds.map((id) => BUILDING_BY_ID[id]);
  return <ResultV7Page result={result} architect={architect} featuredBuildings={featuredBuildings} recommendedBuildings={recommendedBuildings} />;
}
