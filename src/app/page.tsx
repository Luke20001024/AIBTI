import { HomeActions } from "../components/home-actions";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-copy">
          <p className="hero-code" aria-hidden="true"><span>AI</span>BTI</p>
          <h1 className="hero-title" id="home-title">测测你的<br />建筑人格</h1>
          <p className="hero-subtitle">18 道直觉题，匹配一种建筑性格、一位代表建筑师和三座真正值得看的建筑</p>
        </div>

        <div className="home-conversion"><HomeActions /></div>
      </section>

    </main>
  );
}
