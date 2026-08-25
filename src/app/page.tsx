import Link from "next/link";
import { HomeActions } from "../components/home-actions";
import { MediaImage } from "../components/media-image";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="section-kicker">Architecture Identity Type Indicator</p>
          <p className="hero-code" aria-hidden="true"><span>AI</span>BTI</p>
          <h1 className="hero-title" id="home-title">测测你的<br />建筑人格</h1>
          <p className="hero-subtitle">18 次第一反应，找到一种建筑人格、一位同频建筑师和三座真正值得看的建筑</p>
        </div>

        <div className="hero-range" aria-label="克制、温和与癫狂三种建筑人格预览">
          <figure className="hero-range-item is-grid">
            <MediaImage src="/images/characters-v2/grid-scene-v2.webp" alt="冷静的网格秩序者站在巴塞罗那馆近景中" fallbackLabel="GRID" fetchPriority="high" />
            <figcaption><b>GRID</b><span>克制</span></figcaption>
          </figure>
          <figure className="hero-range-item is-root">
            <MediaImage src="/images/characters-v2/root-scene-v2.webp" alt="温和的场所生长者站在流水别墅近景中" fallbackLabel="ROOT" fetchPriority="high" />
            <figcaption><b>ROOT</b><span>温和</span></figcaption>
          </figure>
          <figure className="hero-range-item is-flow">
            <MediaImage src="/images/characters-v2/flow-scene-v2.webp" alt="兴奋的直线逃犯站在连续曲面建筑近景中" fallbackLabel="FLOW" />
            <figcaption><b>FLOW</b><span>癫狂</span></figcaption>
          </figure>
        </div>

        <div className="home-conversion"><HomeActions /></div>
      </section>

      <section className="home-manifesto">
        <div>
          <p className="section-kicker">不是给你贴标签</p>
          <h2 className="section-title">先被结果逗笑<br />再被建筑打动</h2>
        </div>
        <div className="manifesto-grid">
          <p><b>先凭直觉</b><br />潜意识、日常人格与建筑审美混在一起，不考专业知识</p>
          <p><b>再看证据</b><br />结果会告诉你，刚才哪三个选择把你推到了这里</p>
          <p><b>认领人格</b><br />八种角色从安静、温和一路延伸到兴奋和癫狂</p>
          <p><b>看懂建筑</b><br />从一位建筑师和一座主建筑开始，不把资料堆成百科</p>
        </div>
        <Link className="text-link" href="/about/">查看方法、边界与图片来源 →</Link>
      </section>
    </main>
  );
}
