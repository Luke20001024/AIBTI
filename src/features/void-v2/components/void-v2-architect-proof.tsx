import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2ArchitectProofProps = {
  content: VoidV2Content["architect"];
};

export function VoidV2ArchitectProof({ content }: VoidV2ArchitectProofProps) {
  return (
    <section className={styles.architect} aria-labelledby="void-v2-architect-title">
      <div className={styles.architectIntro}>
        <p className={styles.sectionCode}>VOID <span aria-hidden="true">•</span> 04</p>
        <h2 id="void-v2-architect-title">
          {content.lead.map((line) => <span key={line}>{line}</span>)}
        </h2>
        <p className={styles.architectInterruption}>{content.interruption}</p>
        <p className={styles.architectActionLead}>{content.actionLead}</p>
        <p className={styles.staticArchitectActions} aria-label={content.actions.join("、")}>
          {content.actions.map((action) => <span key={action}>{action}</span>)}
        </p>
      </div>

      <div className={styles.staticArchitectProfile}>
        <MediaImage
          className={styles.architectPortrait}
          src={content.image}
          alt={content.imageAlt}
          width={600}
          height={752}
          loading="lazy"
        />

        <div className={styles.architectIdentity}>
          <h3>{content.name}</h3>
          <p>{content.originalName} · {content.years}</p>
          <p>{content.descriptor}</p>
        </div>
      </div>

      <article className={styles.staticArchitectStory}>
        <h3>{content.storyTitle}</h3>
        {content.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </article>
    </section>
  );
}
