import type { CSSProperties } from "react";
import { MediaImage } from "../../components/media-image";
import { RetestLink } from "../../components/retest-link";
import type { Architect, Building, ResultType } from "../../content";
import { RESULT_STORY_BY_CODE } from "../../content/result-stories";
import { withBasePath } from "../../domain/paths";
import styles from "./result-story-page.module.css";

const NEW_CODES = new Set(["SPAN", "EAVE", "TIDE", "RUIN", "SIGN", "VEIL", "PLUS", "MIX"]);
const copy = (value: string) => value.replace(/[。.]$/u, "");

function WorkCard({ building, index }: { building: Building; index: number }) {
  return (
    <details className={styles.workCard}>
      <summary>
        {building.image ? <MediaImage className={styles.workImage} src={building.image.src} alt={building.image.alt} fallbackLabel={`${building.name} 实景图整理中`} loading="lazy" decoding="async" /> : null}
        <span className={styles.workNumber}>{String(index).padStart(2, "0")}</span>
        <span className={styles.workHeading}><strong>{building.name}</strong><small>{building.originalName}</small></span>
        <span className={styles.workHook}>{copy(building.hook)}</span>
        <span className={styles.expandLabel}>展开看判断</span>
      </summary>
      <div className={styles.workDetail}>
        <p>{copy(building.story)}</p>
        <p className={styles.detailTitle}>看这三处</p>
        <ul>{building.lookFor.map((item) => <li key={item}>{copy(item)}</li>)}</ul>
        <p className={styles.workMeta}>{building.location} · {building.years}</p>
        {building.sources[0] ? <a href={building.sources[0].url} target="_blank" rel="noreferrer">查看项目资料</a> : null}
      </div>
    </details>
  );
}

function MoreWork({ building }: { building: Building }) {
  return (
    <details className={styles.moreWork}>
      <summary><span><strong>{building.name}</strong><small>{copy(building.hook)}</small></span><span className={styles.moreLabel}>继续看</span></summary>
      <div>
        <p>{copy(building.story)}</p>
        <ul>{building.lookFor.map((item) => <li key={item}>{copy(item)}</li>)}</ul>
        {building.sources[0] ? <a href={building.sources[0].url} target="_blank" rel="noreferrer">查看项目资料</a> : null}
      </div>
    </details>
  );
}

export function ResultStoryPage({ result, architect, featuredBuildings, recommendedBuildings }: {
  result: ResultType;
  architect: Architect;
  featuredBuildings: readonly Building[];
  recommendedBuildings: readonly Building[];
}) {
  const story = RESULT_STORY_BY_CODE[result.code];
  const heroImage = `/images/personas/${result.slug}/hero-poster-v1.webp`;
  const showPortrait = !NEW_CODES.has(result.code) && architect.portrait;
  const architectImage = showPortrait ? architect.portrait!.src : featuredBuildings[0]?.image?.src;
  const architectImageAlt = showPortrait ? architect.portrait!.alt : `${featuredBuildings[0]?.name ?? architect.name}建筑实景`;
  const css = { "--story-accent": result.accent, "--story-accent-soft": result.accentSoft, "--story-ink": result.ink } as CSSProperties;

  return (
    <main className={styles.page} style={css}>
      <article className={styles.article}>
        <section className={styles.hero} aria-label={`${result.code} ${result.name}首屏`}>
          <MediaImage src={heroImage} alt={`${result.code} ${result.name}人格首屏海报`} fallbackLabel={`${result.code} 首屏图整理中`} fetchPriority="high" decoding="sync" />
        </section>

        <section className={styles.profile} aria-labelledby="profile-title">
          <p className={styles.kicker}>{result.code} · 01 / SPACE PROFILE</p>
          <h1 id="profile-title">你为什么是 {result.code}</h1>
          <p className={styles.lead}>{copy(story.plainLead)}</p>
          <dl className={styles.profileGrid}>
            <div><dt>外显优势</dt><dd>{copy(result.publicSide)}</dd></div>
            <div><dt>隐藏驱力</dt><dd>{copy(result.hiddenSide)}</dd></div>
            <div><dt>压力模式</dt><dd>{copy(result.stressResponse)}</dd></div>
            <div><dt>风格坐标</dt><dd>{result.school}</dd></div>
          </dl>
        </section>

        <section className={styles.instincts} aria-labelledby="instinct-title">
          <p className={styles.kicker}>{result.code} · 02 / THREE INSTINCTS</p>
          <h2 id="instinct-title">你读空间的三个本能</h2>
          <ol>{story.instincts.map((instinct, index) => <li key={instinct}><span>{String(index + 1).padStart(2, "0")}</span><p>{copy(instinct)}</p></li>)}</ol>
          <p className={styles.logic}>{copy(result.architectureLogic)}</p>
        </section>

        <section className={styles.architect} aria-labelledby="architect-title">
          <p className={styles.kicker}>{result.code} · 03 / ARCHITECT</p>
          <div className={styles.architectLead}>
            <div><p className={styles.architectHook}>{story.architectHook}</p><h2 id="architect-title">{architect.name}</h2><p className={styles.originalName}>{architect.originalName} · {architect.lifespan}</p></div>
            {architectImage ? <MediaImage className={styles.architectImage} src={architectImage} alt={architectImageAlt} fallbackLabel={`${architect.name}资料图整理中`} loading="lazy" /> : null}
          </div>
          <p className={styles.architectSummary}>{copy(architect.summary)}</p>
          <details className={styles.architectStory}>
            <summary>展开建筑师故事</summary>
            <h3>{copy(architect.storyTitle)}</h3>
            <p>{copy(architect.story)}</p>
            <p>{copy(story.architectFocus)}</p>
            {architect.creditNote ? <p className={styles.creditNote}>{copy(architect.creditNote)}</p> : null}
            <div className={styles.sourceLinks}>{architect.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</div>
          </details>
        </section>

        <section className={styles.works} aria-labelledby="works-title">
          <p className={styles.kicker}>{result.code} · 04 / THREE WORKS</p>
          <h2 id="works-title">从三座作品看懂这种判断</h2>
          <p className={styles.sectionIntro}>外层先给结论，真正值得看的路线、光线和结构藏在卡片里</p>
          <div className={styles.workList}>{featuredBuildings.map((building, index) => <WorkCard key={building.id} building={building} index={index + 1} />)}</div>
        </section>

        <section className={styles.lineage} aria-labelledby="lineage-title">
          <p className={styles.kicker}>{result.code} · 05 / LINEAGE</p>
          <h2 id="lineage-title">喜欢这种判断，还可以继续看</h2>
          <p className={styles.schoolSummary}>{copy(result.schoolSummary)}</p>
          <div className={styles.architectTags}>{result.relatedArchitects.map((name) => <span key={name}>{name}</span>)}</div>
          <div className={styles.moreList}>{recommendedBuildings.map((building) => <MoreWork key={building.id} building={building} />)}</div>
        </section>

        <section className={styles.closing}>
          <p className={styles.kicker}>{result.code} · 06 / KEEP THIS</p>
          <blockquote>{story.closing}</blockquote>
          <p>{result.keywords.join(" / ")} · {story.family}</p>
        </section>

        <footer className={styles.footer}><a href={withBasePath("/result/")}>浏览 16 种人格</a><RetestLink resultCode={result.code} /></footer>
      </article>
    </main>
  );
}
