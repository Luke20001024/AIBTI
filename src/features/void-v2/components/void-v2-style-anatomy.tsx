import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2StyleAnatomyProps = {
  content: VoidV2Content["styles"];
};

export function VoidV2StyleAnatomy({ content }: VoidV2StyleAnatomyProps) {
  return (
    <section className={styles.styleAnatomy} aria-labelledby="void-v2-style-title">
      <header className={styles.styleHeader}>
        <p className={styles.sectionCode}>VOID <span aria-hidden="true">•</span> 03</p>
        <h2 id="void-v2-style-title">{content.title}</h2>
        <p className={styles.styleLead}>
          {content.lead.map((line) => <span key={line}>{line}</span>)}
        </p>
      </header>

      <div className={styles.staticStyleStack}>
        <MediaImage
          className={styles.staticStyleImage}
          src={content.image}
          alt={content.imageAlt}
          width={900}
          height={1950}
          loading="lazy"
        />

        <div className={styles.staticStyleLayers}>
          {content.layers.map((layer) => (
            <article className={styles.staticStyleLayer} key={layer.id}>
              <p>{layer.index}</p>
              <h3>{layer.name}</h3>
              <strong>{layer.role}</strong>
              <div>
                {layer.body.map((line) => <span key={line}>{line}</span>)}
              </div>
              <small>{layer.contribution}</small>
            </article>
          ))}
        </div>
      </div>

      <p className={styles.styleClosing}>
        {content.closing.map((line, index) => (
          <span className={index === content.closing.length - 1 ? styles.styleClosingStrong : undefined} key={line}>{line}</span>
        ))}
      </p>
    </section>
  );
}
