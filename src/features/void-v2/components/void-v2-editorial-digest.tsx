import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2EditorialDigestProps = {
  personality: VoidV2Content["personality"];
  reactions: VoidV2Content["reactions"];
  shadow: VoidV2Content["shadow"];
  style: VoidV2Content["styles"];
};

export function VoidV2EditorialDigest({ personality, reactions, shadow, style }: VoidV2EditorialDigestProps) {
  return (
    <div className={styles.v6DigestFlow}>
      <section className={styles.v6Chapter} aria-labelledby="void-v2-digest-title">
        <header className={styles.v6SectionHeader}>
          <p className={styles.v6ChapterLabel}>01 / 为什么你是 VOID</p>
          <h2 id="void-v2-digest-title">{personality.title}</h2>
          <p className={styles.v6Thesis}>{personality.logicTitle}</p>
          <p className={styles.v6Lead}>{personality.logic.join("，")}</p>
        </header>

        <dl className={styles.v6ProfileRows} aria-label="VOID 人格速写">
          {personality.passport.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.v6Chapter} aria-labelledby="void-v2-instinct-title">
        <header className={styles.v6SectionHeader}>
          <p className={styles.v6ChapterLabel}>02 / 你的空间本能</p>
          <h2 id="void-v2-instinct-title">{reactions.title}</h2>
          <p className={styles.v6Lead}>{reactions.lead}</p>
        </header>

        <div className={styles.v6InstinctList}>
          {reactions.items.map((item) => (
            <article className={styles.v6InstinctRow} key={item.id}>
              <div className={styles.v6InstinctName}>
                <span>{item.index}</span>
                <h3>{item.title}</h3>
              </div>
              <div className={styles.v6InstinctCopy}>
                <strong>{item.role}</strong>
                <p>{item.headline.join("，")}</p>
              </div>
            </article>
          ))}
        </div>

        <aside className={styles.v6Counterpoint} aria-label="VOID 的外观误区">
          <p className={styles.v6ChapterLabel}>当它只剩外观</p>
          <p>{reactions.counterpoint}</p>
          <div>
            <strong>{shadow.darkLead}</strong>
            <span>{shadow.darkBody.join("，")}</span>
          </div>
        </aside>
      </section>

      <section className={styles.v6Chapter} aria-labelledby="void-v2-style-title">
        <header className={styles.v6SectionHeader}>
          <p className={styles.v6ChapterLabel}>03 / {style.title}</p>
          <h2 id="void-v2-style-title">这种本能如何变成建筑</h2>
          <p className={styles.v6Lead}>{style.lead.join("，")}</p>
        </header>

        <div className={styles.v6StyleLayout}>
          <dl className={styles.v6StyleLayers}>
            {style.layers.map((layer) => (
              <div key={layer.id}>
                <dt>
                  <span>{layer.index}</span>
                  <h3>{layer.name}</h3>
                </dt>
                <dd>
                  <strong>{layer.role}</strong>
                  <span>{layer.contribution}</span>
                </dd>
              </div>
            ))}
          </dl>

          <figure className={styles.v6StyleFigure}>
            <MediaImage
              src={style.image}
              alt={style.imageAlt}
              width={1024}
              height={1024}
              loading="lazy"
            />
            <figcaption>骨架 / 纪律 / 地点</figcaption>
          </figure>
        </div>

        <blockquote className={styles.v6StyleQuote}>
          {style.closing.map((line) => <span key={line}>{line}</span>)}
        </blockquote>
      </section>
    </div>
  );
}
