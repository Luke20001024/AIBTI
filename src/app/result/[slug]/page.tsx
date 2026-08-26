import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MediaImage } from "../../../components/media-image";
import { ResultDetailSheets } from "../../../components/result-detail-sheets";
import { ResultPersonalization } from "../../../components/result-personalization";
import { RetestLink } from "../../../components/retest-link";
import {
  ARCHITECT_BY_ID,
  BUILDING_BY_ID,
  RESULT_BY_SLUG,
  RESULT_TYPES,
} from "../../../content";
import { withBasePath } from "../../../domain/paths";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => RESULT_TYPES.map((result) => ({ slug: result.slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) return {};
  const primaryBuilding = BUILDING_BY_ID[result.buildingIds[0]];
  return {
    title: `${result.code} · ${result.architectureLanguage}`,
    description: `${result.languageSummary}｜代表建筑师 ${ARCHITECT_BY_ID[result.architectId].name}`,
    openGraph: {
      title: `${result.code} · ${result.architectureLanguage}｜ArcBTI`,
      description: result.languageSummary,
      images: primaryBuilding.image
        ? [{ url: withBasePath(primaryBuilding.image.src) }]
        : undefined,
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) notFound();

  const architect = ARCHITECT_BY_ID[result.architectId];
  const featuredBuildings = result.buildingIds.map((id) => BUILDING_BY_ID[id]);
  const recommendedBuildings = result.recommendedBuildingIds.map((id) => BUILDING_BY_ID[id]);
  const primaryBuilding = featuredBuildings[0];
  const style = {
    "--accent": result.accent,
    "--accent-soft": result.accentSoft,
    "--result-ink": result.ink,
  } as CSSProperties;

  return (
    <main className="result-page" style={style}>
      <div className="page-shell result-shell">
        <section className="result-hero" aria-labelledby="result-title">
          <div className="result-heading">
            <p className="section-kicker">ArcBTI · {result.code}</p>
            <p className="result-overline">你的建筑母语</p>
            <p className="result-code" aria-hidden="true">{result.code}</p>
            <h1 className="result-language" id="result-title">{result.architectureLanguage}</h1>
            <p className="result-language-summary">{result.languageSummary}</p>
            <p className="result-persona-name">{result.name} · {result.englishName}</p>
          </div>

          <div className="result-stage">
            {primaryBuilding.image && (
              <MediaImage
                src={primaryBuilding.image.src}
                alt={primaryBuilding.image.alt}
                fallbackLabel={`${primaryBuilding.name} 图片整理中`}
                fetchPriority="high"
                decoding="async"
              />
            )}
            <span className="result-stage-label">{primaryBuilding.name} · {primaryBuilding.years}</span>
          </div>

          <dl className="result-anchor-list">
            <div>
              <dt>代表建筑师</dt>
              <dd>{architect.name}</dd>
            </div>
            <div>
              <dt>代表建筑</dt>
              <dd>{primaryBuilding.name}</dd>
            </div>
          </dl>
        </section>

        <Suspense fallback={<section className="result-proof" aria-busy="true" />}>
          <ResultPersonalization
            result={result}
            architect={architect}
            primaryBuilding={primaryBuilding}
          />
        </Suspense>

        <ResultDetailSheets
          result={result}
          architect={architect}
          featuredBuildings={featuredBuildings}
          recommendedBuildings={recommendedBuildings}
        />

        <footer className="result-footer">
          <a className="result-method-link" href={withBasePath("/about/")}>
            方法、边界与图片来源 <span aria-hidden="true">→</span>
          </a>
          <RetestLink resultCode={result.code} />
        </footer>
      </div>
    </main>
  );
}
