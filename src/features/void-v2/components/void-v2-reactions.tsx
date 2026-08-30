import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2ReactionsProps = {
  content: VoidV2Content["reactions"];
};

export function VoidV2Reactions({ content }: VoidV2ReactionsProps) {
  return (
    <section className={styles.reactions} id="void-v2-reactions" aria-labelledby="void-v2-reactions-title">
      <header className={styles.staticReactionsHeader}>
        <p className={styles.sectionCode}>VOID <span aria-hidden="true">•</span> 02</p>
        <h2 id="void-v2-reactions-title">{content.title}</h2>
      </header>

      <div className={styles.staticReactionList}>
        {content.items.map((item) => (
          <article className={styles.staticReaction} key={item.id}>
            <div className={styles.staticReactionCopy}>
              <div className={styles.staticReactionHeading}>
                <p className={styles.staticReactionIndex}>{item.index}</p>
                <h3>{item.title}</h3>
                <span className={styles.staticReactionGlyph} aria-hidden="true">
                  {item.id === "light" ? "╱" : item.id === "boundary" ? "□" : "↳"}
                </span>
              </div>
              <p className={styles.staticReactionHeadline}>
                {item.headline.map((line) => <span key={line}>{line}</span>)}
              </p>
              <p className={styles.staticReactionBody}>
                {item.body.map((line) => <span key={line}>{line}</span>)}
              </p>
              <dl className={styles.staticReactionChecks}>
                <div>
                  <dt>成立条件</dt>
                  <dd>{item.condition}</dd>
                </div>
                <div>
                  <dt>伪 VOID</dt>
                  <dd>{item.counterexample}</dd>
                </div>
              </dl>
              <p className={styles.keywordLine}>{item.keywords.join(" / ")}</p>
            </div>

            <MediaImage
              className={styles.staticReactionImage}
              src={item.image}
              alt={item.imageAlt}
              width={900}
              height={item.id === "light" ? 1200 : 1950}
              loading="lazy"
              style={{ objectPosition: item.objectPosition }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
