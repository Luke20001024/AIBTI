import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ARCHITECT_BY_ID, BUILDING_BY_ID, RESULT_BY_SLUG, RESULT_TYPES } from "../../../content";
import { MediaImage } from "../../../components/media-image";
import { ResultPersonalization } from "../../../components/result-personalization";
import { withBasePath } from "../../../domain/paths";

type PageProps = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => RESULT_TYPES.map((result) => ({ slug: result.slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) return {};
  return {
    title: `${result.code} · ${result.name}`,
    description: `${result.tagline} 你的建筑人格对应 ${result.school}，进入结果查看建筑师故事与三座代表建筑。`,
    openGraph: {
      title: `我的建筑人格是 ${result.code} · ${result.name}`,
      description: result.tagline,
      images: [{ url: withBasePath(result.characterImage) }],
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) notFound();
  const architect = ARCHITECT_BY_ID[result.architectId];
  const buildings = result.buildingIds.map((id) => BUILDING_BY_ID[id]);
  const style = { "--accent": result.accent, "--accent-soft": result.accentSoft, "--result-ink": result.ink } as CSSProperties;

  return (
    <main className="result-page" style={style}>
      <div className="page-shell">
        <section className="result-hero" aria-labelledby="result-title">
          <div>
            <p className="section-kicker">你的建筑人格是</p>
            <p className="result-code">{result.code}</p>
            <h1 className="result-name" id="result-title">{result.name}</h1>
            <p className="result-tagline">“{result.tagline}”</p>
          </div>
          <div className="result-stage">
            <MediaImage src={result.characterImage} alt={result.characterAlt} fallbackLabel={`${result.code} 人物形象施工中`} fetchPriority="high" decoding="async" />
            <span className="result-stage-label">原创人格主视觉 · 成人低多边形卡通</span>
          </div>
          <div className="result-quick-meta">
            <div className="keyword-list">{result.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div>
            <span className="school-label">{result.school}</span>
          </div>
        </section>

        <section className="section">
          <p className="section-kicker">人格剖面</p>
          <h2 className="section-title">你不是一栋楼，<br />但很像这种建法。</h2>
          <div className="result-grid">
            <div className="result-copy-block"><h3>别人眼中的你</h3><p>{result.publicSide}</p></div>
            <div className="result-copy-block"><h3>藏起来的那一面</h3><p>{result.hiddenSide}</p></div>
            <div className="result-copy-block"><h3>压力一来</h3><p>{result.stressResponse}</p></div>
            <div className="result-copy-block"><h3>你会被什么建筑打动</h3><p>{result.architectureLogic}</p></div>
          </div>
        </section>

        <Suspense><ResultPersonalization result={result} /></Suspense>

        <section className="section" id="architect">
          <p className="section-kicker">同频建筑师 · 不等于本人复刻</p>
          <div className="architect-layout">
            {architect.portrait ? (
              <div>
                <MediaImage className="architect-portrait" src={architect.portrait.src} alt={architect.portrait.alt} fallbackLabel="肖像待补" loading="lazy" decoding="async" />
                <p className="image-credit">肖像资料：<a href={architect.portrait.source.url} target="_blank" rel="noreferrer">{architect.portrait.source.label}</a>{architect.portrait.source.credit ? ` · ${architect.portrait.source.credit}` : ""}</p>
              </div>
            ) : <div className="architect-portrait media-fallback"><span>肖像待补</span></div>}
            <div>
              <h2 className="architect-name">{architect.name}</h2>
              <p className="architect-original">{architect.originalName} · {architect.lifespan}</p>
              <p className="architect-summary">{architect.summary}</p>
              <div className="meta-row"><span>{architect.region}</span><span>{architect.school}</span></div>
            </div>
          </div>
          <div className="story-box"><h3>{architect.storyTitle}</h3><p>{architect.story}</p></div>
          {architect.creditNote && <p className="credit-note">署名提醒：{architect.creditNote}</p>}
          <div className="source-links">{architect.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
        </section>

        <section className="section" id="buildings">
          <p className="section-kicker">三座代表建筑</p>
          <h2 className="section-title">别急着说喜欢。<br />先看这三个地方。</h2>
          <div className="building-list">
            {buildings.map((building, index) => (
              <article className="building-item" key={building.id}>
                <div>
                  {building.image && (
                    <>
                      <div className="building-image-wrap"><MediaImage className="building-image" src={building.image.src} alt={building.image.alt} fallbackLabel="建筑图片整理中" loading="lazy" decoding="async" /></div>
                      <p className="image-credit">{building.image.source.credit ?? "原型资料图"} · <a href={building.image.source.url} target="_blank" rel="noreferrer">{building.image.source.label} ↗</a></p>
                    </>
                  )}
                </div>
                <div>
                  <span className="building-number">0{index + 1}</span>
                  <h3 className="building-title">{building.name}</h3>
                  <p className="building-original">{building.originalName} · {building.location} · {building.years}</p>
                  <p className="building-hook">{building.hook}</p>
                  <ul className="look-list">{building.lookFor.map((item) => <li key={item}>{item}</li>)}</ul>
                  <p className="building-story">{building.story}</p>
                  <div className="source-links">{building.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">查阅专业资料 ↗</a>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
