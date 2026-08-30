import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2CompactLineageProps = {
  content: VoidV2Content["lineage"];
};

export function VoidV2CompactLineage({ content }: VoidV2CompactLineageProps) {
  const methodComparison = content.comparison.find((row) => row.label === "方法") ?? content.comparison.at(-1);
  const methodRows = content.comparisonHeads.map((name, index) => ({
    name,
    method: methodComparison?.values[index] ?? "",
  }));

  return (
    <section className={styles.v6Lineage} aria-labelledby="void-v2-lineage-title">
      <header className={styles.v6SectionHeader}>
        <p className={styles.v6ChapterLabel}>06 / 继续看</p>
        <h2 id="void-v2-lineage-title">
          {content.title.map((line) => <span key={line}>{line}</span>)}
        </h2>
        <p className={styles.v6Lead}>{content.lead}</p>
      </header>

      <dl className={styles.v6MethodRows} aria-label="三位建筑师的方法对照">
        {methodRows.map((item) => (
          <div key={item.name}>
            <dt>{item.name}</dt>
            <dd>{item.method}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.v6LineageEvidence}>
        {content.items.map((item) => (
          <article key={item.name}>
            <MediaImage src={item.image} alt={item.imageAlt} width={900} height={650} loading="lazy" />
            <h3>{item.name}</h3>
            <p>{item.method}</p>
            <p>{item.body.join("，")}</p>
          </article>
        ))}
      </div>

      <div className={styles.v6FurtherWorks}>
        <p className={styles.v6ChapterLabel}>{content.furtherTitle}</p>
        <div>
          {content.further.map((work) => (
            <article key={work.name}>
              <MediaImage src={work.image} alt={work.imageAlt} width={1200} height={800} loading="lazy" />
              <h3>{work.name}</h3>
              <p>{work.hook}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
