import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2ShadowProps = {
  content: VoidV2Content["shadow"];
};

export function VoidV2Shadow({ content }: VoidV2ShadowProps) {
  return (
    <section className={styles.shadow} aria-labelledby="void-v2-shadow-title">
      <h2 className={styles.staticShadowTitle} id="void-v2-shadow-title">
        {content.headline.map((line) => <span key={line}>{line}</span>)}
      </h2>

      <div className={styles.staticShadowContrast}>
        <article>
          <h3>{content.desiredTitle}</h3>
          <ul>
            {content.desired.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <h3>{content.rejectedTitle}</h3>
          <ul>
            {content.rejected.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </div>

      <div className={styles.staticDarkSide}>
        <p>{content.darkTitle}</p>
        <h3>{content.darkLead}</h3>
        <p>
          {content.darkBody.map((line) => <span key={line}>{line}</span>)}
        </p>
      </div>
    </section>
  );
}
