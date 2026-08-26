import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MediaImage } from "../../../components/media-image";
import { ResultPersonalization } from "../../../components/result-personalization";
import { RetestLink } from "../../../components/retest-link";
import { ARCHITECT_BY_ID, BUILDING_BY_ID, RESULT_BY_SLUG, RESULT_TYPES } from "../../../content";
import { withBasePath } from "../../../domain/paths";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => RESULT_TYPES.map((result) => ({ slug: result.slug }));

const noTerminalPeriod = (value: string) => value.replace(/[。.]$/u, "");

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) return {};
  return {
    title: `${result.code} · ${result.name}`,
    description: `${result.tagline}｜${result.school}建筑人格、代表建筑师与建筑作品`,
    openGraph: {
      title: `${result.code} · ${result.name}｜AIBTI 建筑人格`,
      description: result.tagline,
      images: [{ url: withBasePath(result.characterImage) }],
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) notFound();

  const architect = ARCHITECT_BY_ID[result.architectId];
  const featuredBuildings = result.buildingIds.map((id) => BUILDING_BY_ID[id]);
  const recommendedBuildings = result.recommendedBuildingIds.map((id) => BUILDING_BY_ID[id]);
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
            <p className="section-kicker">AIBTI / 建筑人格档案</p>
            <p className="result-code">{result.code}</p>
            <h1 className="result-name" id="result-title">{result.name}</h1>
            <p className="result-tagline">“{result.tagline}”</p>
          </div>

          <div className="result-stage">
            <MediaImage
              src={result.characterImage}
              alt={result.characterAlt}
              fallbackLabel={`${result.code} 人格形象施工中`}
              fetchPriority="high"
              decoding="async"
            />
            <span className="result-stage-label">AIBTI PERSONA / {result.code}</span>
          </div>

          <div className="result-quick-meta">
            <div className="keyword-list">
              {result.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
            <span className="school-label">{result.school}</span>
          </div>
        </section>

        <Suspense fallback={<section className="result-proof" aria-busy="true" />}>
          <ResultPersonalization result={result} architect={architect} primaryBuilding={featuredBuildings[0]} />
        </Suspense>

        <section className="section personality-section" id="personality">
          <h2 className="section-title">这种人格通常是这样</h2>
          <div className="result-grid">
            <div className="result-copy-block result-copy-lead">
              <h3>别人眼中的你</h3>
              <p>{noTerminalPeriod(result.publicSide)}</p>
            </div>
            <div className="result-copy-block">
              <h3>你不太展示的一面</h3>
              <p>{noTerminalPeriod(result.hiddenSide)}</p>
            </div>
            <div className="result-copy-block">
              <h3>压力一来</h3>
              <p>{noTerminalPeriod(result.stressResponse)}</p>
            </div>
            <div className="result-copy-block">
              <h3>偏爱的建筑</h3>
              <p>{noTerminalPeriod(result.architectureLogic)}</p>
            </div>
          </div>
        </section>

        <section className="section architecture-profile" id="architect">
          <h2 className="section-title">该人格代表建筑师</h2>

          <div className="architect-layout">
            {architect.portrait ? (
              <div className="architect-media">
                <MediaImage
                  className="architect-portrait"
                  src={architect.portrait.src}
                  alt={architect.portrait.alt}
                  fallbackLabel="建筑师肖像待补"
                  loading="lazy"
                  decoding="async"
                />
                <p className="image-credit">
                  资料图源 <a href={architect.portrait.source.url} target="_blank" rel="noreferrer">{architect.portrait.source.label} ↗</a>
                </p>
              </div>
            ) : (
              <div className="architect-portrait media-fallback"><span>建筑师肖像待补</span></div>
            )}

            <div className="architect-copy">
              <h3 className="architect-name">{architect.name}</h3>
              <p className="architect-original">{architect.originalName} · {architect.lifespan}</p>
              <p className="architect-summary">{noTerminalPeriod(architect.summary)}</p>
              <div className="meta-row"><span>{architect.region}</span><span>{architect.school}</span></div>
            </div>
          </div>

          <div className="story-box">
            <p className="story-label">建筑师经历</p>
            <h3>{architect.storyTitle}</h3>
            <p>{noTerminalPeriod(architect.story)}</p>
          </div>
          {architect.creditNote && <p className="credit-note">署名提醒 · {noTerminalPeriod(architect.creditNote)}</p>}
          <div className="source-links">
            {architect.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
            ))}
          </div>

          <div className="featured-buildings" id="buildings">
            <h2 className="section-title">从这三座建筑开始</h2>
            {featuredBuildings.map((building) => (
              <article className="featured-building" key={building.id}>
                {building.image && (
                  <div className="featured-building-media">
                    <MediaImage
                      className="building-image"
                      src={building.image.src}
                      alt={building.image.alt}
                      fallbackLabel="建筑图片整理中"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{building.location}</span>
                  </div>
                )}
                <div className="featured-building-copy">
                  <h3 className="building-title">{building.name}</h3>
                  <p className="building-original">{building.originalName} · {building.years}</p>
                  <p className="building-hook">{noTerminalPeriod(building.hook)}</p>
                  <ul className="look-list">
                    {building.lookFor.map((item) => <li key={item}>{noTerminalPeriod(item)}</li>)}
                  </ul>
                  <p className="building-story">{noTerminalPeriod(building.story)}</p>
                  {building.image && (
                    <p className="image-credit">
                      图源 {building.image.source.credit ?? building.image.source.label} · <a href={building.image.source.url} target="_blank" rel="noreferrer">查看原页 ↗</a>
                    </p>
                  )}
                  <div className="source-links">
                    {building.sources.map((source) => (
                      <a key={source.url} href={source.url} target="_blank" rel="noreferrer">建筑资料 ↗</a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="school-context" aria-labelledby="school-context-title">
            <p className="section-kicker">建筑风格坐标</p>
            <h2 id="school-context-title">{result.school}</h2>
            <p>{result.schoolSummary}</p>
            <div>
              <span>可以继续认识</span>
              <strong>{result.relatedArchitects.join(" · ")}</strong>
            </div>
          </aside>

          <div className="more-buildings">
            <h2>更多作品</h2>
            <div className="more-building-grid">
              {recommendedBuildings.map((building) => (
                <article className="more-building" key={building.id}>
                  {building.image && (
                    <MediaImage
                      className="more-building-image"
                      src={building.image.src}
                      alt={building.image.alt}
                      fallbackLabel="建筑图片整理中"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div>
                    <h3>{building.name}</h3>
                    <p>{building.originalName}</p>
                    <a href={building.sources[0]?.url} target="_blank" rel="noreferrer">查看建筑资料 ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="result-footer">
          <a className="result-method-link" href={withBasePath("/about/")}>查看测试方法、边界与图片来源 →</a>
          <RetestLink resultCode={result.code} />
        </footer>
      </div>
    </main>
  );
}
