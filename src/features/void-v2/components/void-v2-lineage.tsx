import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2LineageProps = {
  content: VoidV2Content["lineage"];
};

export function VoidV2Lineage({ content }: VoidV2LineageProps) {
  return (
    <section className={styles.lineage} aria-labelledby="void-v2-lineage-title">
      <h2 className={styles.lineageTitle} id="void-v2-lineage-title">
        {content.title.map((line) => <span key={line}>{line}</span>)}
      </h2>

      <div className={styles.lineageComparison} role="table" aria-label="VOID 与三位建筑师的方法对照">
        <div className={styles.lineageComparisonHead} role="row">
          <span role="columnheader">维度</span>
          {content.comparisonHeads.map((head) => <span role="columnheader" key={head}>{head}</span>)}
        </div>
        {content.comparison.map((row) => (
          <div className={styles.lineageComparisonRow} role="row" key={row.label}>
            <strong role="rowheader">{row.label}</strong>
            {row.values.map((value) => <span role="cell" key={value}>{value}</span>)}
          </div>
        ))}
      </div>

      <div className={styles.lineageBands}>
        {content.items.map((item) => (
          <article
            className={[styles.lineageBand, item.tone === "dark" ? styles.lineageBandDark : styles.lineageBandLight].join(" ")}
            key={item.name}
          >
            <div className={styles.lineageCopy}>
              <h3>{item.name}</h3>
              <p className={styles.lineageMethod}>{item.method}</p>
              <p className={styles.lineageBody}>
                {item.body.map((line) => <span key={line}>{line}</span>)}
              </p>
              <p className={styles.lineageKeywords}>{item.keywords.join(" / ")}</p>
            </div>
            <MediaImage className={styles.lineageImage} src={item.image} alt={item.imageAlt} width={900} height={item.tone === "dark" ? 1946 : 1350} loading="lazy" />
          </article>
        ))}
      </div>

      <section className={styles.furtherWorks} aria-labelledby="void-v2-further-title">
        <h3 id="void-v2-further-title">{content.furtherTitle}</h3>
        <div className={styles.furtherWorkList}>
          {content.further.map((work) => (
            <article className={styles.furtherWork} key={work.name}>
              <MediaImage
                className={styles.furtherWorkImage}
                src={work.image}
                alt={work.imageAlt}
                width={1200}
                height={800}
                loading="lazy"
              />
              <div>
                <h4>{work.name}</h4>
                <p className={styles.furtherWorkMeta}>{work.originalName} · {work.years}</p>
                <p>{work.hook}</p>
                <p className={styles.lineageKeywords}>{work.keywords.join(" / ")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
