import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2CompactWorksProps = {
  content: VoidV2Content["works"];
};

export function VoidV2CompactWorks({ content }: VoidV2CompactWorksProps) {
  return (
    <section className={styles.v6Works} id="void-v2-works" aria-labelledby="void-v2-works-title">
      <header className={styles.v6WorksHeader}>
        <p className={styles.v6ChapterLabel}>05 / 三座建筑，三次证明</p>
        <h2 id="void-v2-works-title">{content.title}</h2>
        <p className={styles.v6Lead}>{content.lead}</p>
        <ol className={styles.v6ProofMap} aria-label="三种空间本能与三个建筑动作">
          {content.items.map((work) => (
            <li key={work.id}>
              <span>{work.instinct}</span>
              <strong>{work.action}</strong>
            </li>
          ))}
        </ol>
      </header>

      {content.items.map((work, index) => (
        <article className={styles.v6Work} id={`void-v2-work-${work.id}`} key={work.id}>
          <header className={styles.v6WorkHeader}>
            <p className={styles.v6WorkProof}>0{index + 1} / {work.instinct} → {work.action}</p>
            <h3>{work.name}</h3>
            <p className={styles.v6Meta}>{work.originalName} · {work.year} · {work.location}</p>
            <p className={styles.v6WorkHook}>{work.hook.join("，")}</p>
          </header>

          <MediaImage
            className={styles.v6WorkImage}
            src={work.image}
            alt={work.imageAlt}
            width={1200}
            height={800}
            loading="lazy"
            style={{ objectPosition: work.objectPosition }}
          />
          <div className={styles.v6WorkCopy}>
            <p className={styles.v6ChapterLabel}>空间如何发生</p>
            <ol className={styles.v6WorkRoute} aria-label={`${work.name}的三步空间路径`}>
              {work.observations.map((item) => <li key={item}>{item}</li>)}
            </ol>
            <p className={styles.v6WorkStory}>{work.story.join("，")}</p>
            <p className={styles.v6Takeaway}><span>可以借走</span>{work.takeaway}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
