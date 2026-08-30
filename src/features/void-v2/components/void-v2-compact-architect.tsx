import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2CompactArchitectProps = {
  content: VoidV2Content["architect"];
};

export function VoidV2CompactArchitect({ content }: VoidV2CompactArchitectProps) {
  return (
    <section className={styles.v6Architect} aria-labelledby="void-v2-architect-title">
      <header className={styles.v6SectionHeader}>
        <p className={styles.v6ChapterLabel}>04 / 谁把这种安静建了出来</p>
        <h2 id="void-v2-architect-title">{content.interruption}</h2>
        <p className={styles.v6Lead}>{content.lead.join("，")}</p>
      </header>

      <div className={styles.v6ArchitectBridge}>
        <p>{content.actionLead}</p>
        <ol aria-label="安藤忠雄的三个空间动作">
          {content.actions.map((action, index) => (
            <li key={action}>
              <span>0{index + 1}</span>
              <strong>{action}</strong>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.v6ArchitectProfile}>
        <div>
          <h3>{content.name}</h3>
          <p className={styles.v6Meta}>{content.originalName} · {content.years}</p>
          <p className={styles.v6ArchitectDescriptor}>{content.descriptor}</p>
        </div>
        <MediaImage
          className={styles.v6ArchitectImage}
          src={content.image}
          alt={content.imageAlt}
          width={600}
          height={752}
          loading="lazy"
        />
      </div>

      <article className={styles.v6ArchitectStory}>
        <h3>{content.storyTitle}</h3>
        <ul>
          {content.story.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </article>
    </section>
  );
}
