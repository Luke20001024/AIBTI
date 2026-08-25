import type { CSSProperties } from "react";
import type { Metadata } from "next";
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
    description: `${result.tagline}｜${result.school}建筑人格、同频建筑师与代表建筑`,
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
  const [primaryBuilding, ...extensionBuildings] = result.buildingIds.map((id) => BUILDING_BY_ID[id]);
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
          <ResultPersonalization result={result} architect={architect} primaryBuilding={primaryBuilding} />
        </Suspense>

        <section className="section personality-section" id="personality">
          <p className="section-kicker">人格剖面</p>
          <h2 className="section-title">你不是一栋楼<br />但很像这种建法</h2>
          <div className="result-grid">
            <div className="result-copy-block result-copy-lead">
              <span>01 / 外显</span>
              <h3>别人眼中的你</h3>
              <p>{noTerminalPeriod(result.publicSide)}</p>
            </div>
            <div className="result-copy-block">
              <span>02 / 隐藏</span>
              <h3>你不太展示的一面</h3>
              <p>{noTerminalPeriod(result.hiddenSide)}</p>
            </div>
            <div className="result-copy-block">
              <span>03 / 超载</span>
              <h3>压力一来</h3>
              <p>{noTerminalPeriod(result.stressResponse)}</p>
            </div>
            <div className="result-copy-block">
              <span>04 / 审美</span>
              <h3>什么建筑会击中你</h3>
              <p>{noTerminalPeriod(result.architectureLogic)}</p>
            </div>
          </div>
        </section>

        <section className="section architect-section" id="architect">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">同频建筑师 / 不是本人复刻</p>
              <h2 className="section-title">先认识这个人<br />再理解他的建筑</h2>
            </div>
            <span className="section-index">02</span>
          </div>

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
            <p className="story-label">一件值得记住的事</p>
            <h3>{architect.storyTitle}</h3>
            <p>{noTerminalPeriod(architect.story)}</p>
          </div>
          {architect.creditNote && <p className="credit-note">署名提醒 · {noTerminalPeriod(architect.creditNote)}</p>}
          <div className="source-links">
            {architect.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
            ))}
          </div>
        </section>

        <section className="section buildings-section" id="buildings">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">第一座本命建筑</p>
              <h2 className="section-title">别急着说喜欢<br />先看这里</h2>
            </div>
            <span className="section-index">03</span>
          </div>

          <article className="primary-building">
            {primaryBuilding.image && (
              <div className="primary-building-media">
                <MediaImage
                  className="building-image"
                  src={primaryBuilding.image.src}
                  alt={primaryBuilding.image.alt}
                  fallbackLabel="建筑图片整理中"
                  loading="lazy"
                  decoding="async"
                />
                <span>01 / {primaryBuilding.location}</span>
              </div>
            )}
            <div className="primary-building-copy">
              <h3 className="building-title">{primaryBuilding.name}</h3>
              <p className="building-original">{primaryBuilding.originalName} · {primaryBuilding.years}</p>
              <p className="building-hook">{noTerminalPeriod(primaryBuilding.hook)}</p>
              <ul className="look-list">
                {primaryBuilding.lookFor.map((item) => <li key={item}>{noTerminalPeriod(item)}</li>)}
              </ul>
              <p className="building-story">{noTerminalPeriod(primaryBuilding.story)}</p>
              {primaryBuilding.image && (
                <p className="image-credit">
                  图源 {primaryBuilding.image.source.credit ?? primaryBuilding.image.source.label} · <a href={primaryBuilding.image.source.url} target="_blank" rel="noreferrer">查看原页 ↗</a>
                </p>
              )}
              <div className="source-links">
                {primaryBuilding.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noreferrer">专业资料 ↗</a>
                ))}
              </div>
            </div>
          </article>

          <div className="building-extensions">
            <p className="section-kicker">再看两座 / 验证你的品味</p>
            {extensionBuildings.map((building, index) => (
              <article className="extension-building" key={building.id}>
                {building.image && (
                  <MediaImage
                    className="extension-building-image"
                    src={building.image.src}
                    alt={building.image.alt}
                    fallbackLabel="建筑图片整理中"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div>
                  <span>0{index + 2}</span>
                  <h3>{building.name}</h3>
                  <p>{noTerminalPeriod(building.hook)}</p>
                  <a href={building.sources[0]?.url} target="_blank" rel="noreferrer">查看建筑资料 ↗</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="result-footer">
          <p>人格不是诊断，建筑也不需要站队</p>
          <RetestLink resultCode={result.code} />
        </footer>
      </div>
    </main>
  );
}
