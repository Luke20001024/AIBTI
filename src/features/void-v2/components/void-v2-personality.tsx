import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2PersonalityProps = {
  content: VoidV2Content["personality"];
};

export function VoidV2Personality({ content }: VoidV2PersonalityProps) {
  return (
    <section className={styles.personality} aria-labelledby="void-v2-personality-title">
      <header className={styles.personalityHeader}>
        <p className={styles.sectionCode}>VOID <span aria-hidden="true">•</span> 01</p>
        <h2 id="void-v2-personality-title">{content.title}</h2>
      </header>

      <dl className={styles.personalityPassport} aria-label="VOID 人格护照">
        {content.passport.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.personalityFacets}>
        {content.facets.map((facet) => (
          <article className={styles.personalityFacet} key={facet.index}>
            <p className={styles.personalityIndex}>{facet.index}</p>
            <h3>{facet.title}</h3>
            <p>
              {facet.body.map((line) => <span key={line}>{line}</span>)}
            </p>
          </article>
        ))}
      </div>

      <div className={styles.personalityLogic}>
        <p>{content.logicTitle}</p>
        <h3>
          {content.logic.map((line) => <span key={line}>{line}</span>)}
        </h3>
      </div>
    </section>
  );
}
