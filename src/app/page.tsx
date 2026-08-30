import { HomeActions } from "../components/home-actions";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="hero-code" aria-hidden="true">Arc<span>B</span>TI</p>
          <p className="hero-expansion">ARCHITECTURE IDENTITY TYPE</p>
          <h1 className="hero-title" id="home-title">测测你的<br />建筑直觉</h1>
          <p className="hero-subtitle">18 道核心直觉题，结果接近时再问 1–2 题，匹配 16 种建筑人格、一位代表建筑师和三座值得看的建筑</p>
        </div>

        <div className="home-conversion"><HomeActions /></div>
      </section>

    </main>
  );
}
