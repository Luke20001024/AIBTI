import Link from "next/link";
import { HomeActions } from "../components/home-actions";
import { MediaImage } from "../components/media-image";

export default function HomePage() {
  return (
    <main className="narrow-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <div>
          <p className="section-kicker">Architecture Identity Type Indicator</p>
          <p className="hero-code" aria-hidden="true"><span>AI</span>BTI</p>
          <h1 className="hero-title" id="home-title">测测你的<br />建筑人格</h1>
          <p className="hero-subtitle">几道看似玄乎的问题，把你锚定到一种建筑性格、一位建筑师和三座真正值得看的建筑。</p>
        </div>

        <div className="hero-stage" aria-label="网格秩序者人物预览">
          <MediaImage
            className="hero-character-preview"
            src="/images/characters/grid.webp"
            alt="网格秩序者站在现代主义建筑近景中"
            fallbackLabel="人物原型载入中"
          />
          <span className="hero-caption">示例人格 · GRID 网格秩序者</span>
        </div>

        <HomeActions />
      </section>

      <section className="section home-manifesto">
        <p className="section-kicker">不是给你贴标签</p>
        <h2 className="section-title">先被结果逗笑，<br />再真正看懂一栋楼。</h2>
        <div className="manifesto-grid">
          <p><b>潜意识</b><br />半夜多出的门、末日前的房间，以及你会不会和一块旧砖聊天。</p>
          <p><b>人格</b><br />秩序、冒险、社交、表达；建筑偏好背后也藏着你处理世界的方法。</p>
          <p><b>建筑直觉</b><br />光、材料、几何和时间。没有专业术语，凭第一反应就够了。</p>
          <p><b>结果资料</b><br />原创人格形象、建筑师轶事和三座代表建筑，一张卡可以带走。</p>
        </div>
        <Link className="text-link" href="/about/">查看方法、边界与图片来源 →</Link>
      </section>
    </main>
  );
}
