import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2HeroProps = {
  content: VoidV2Content["hero"];
};

export function VoidV2Hero({ content }: VoidV2HeroProps) {
  return (
    <section className={[styles.hero, styles.heroPosterOnly].join(" ")} aria-labelledby="void-v2-title">
      <MediaImage
        className={styles.heroPosterImage}
        src={content.poster}
        alt=""
        width={693}
        height={1296}
        loading="eager"
        fetchPriority="high"
        aria-hidden="true"
      />

      <div className={styles.visuallyHidden}>
        <p>{content.code}</p>
        <h1 className={styles.heroTitle} id="void-v2-title">{content.title}</h1>
        {content.statement.map((line) => <p key={line}>{line}</p>)}
        <p className={styles.heroTraits}>{content.traits.join(" / ")}</p>
        <p>{content.styles.join(" / ")}</p>
      </div>
    </section>
  );
}
