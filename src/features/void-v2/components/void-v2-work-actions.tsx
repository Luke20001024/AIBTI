import { MediaImage } from "../../../components/media-image";
import type { VoidV2Content } from "../content/void-v2-types";
import styles from "./void-v2.module.css";

type VoidV2WorkActionsProps = {
  content: VoidV2Content["works"];
};

export function VoidV2WorkActions({ content }: VoidV2WorkActionsProps) {
  return (
    <section className={styles.works} id="void-v2-works" aria-labelledby="void-v2-works-title">
      <header className={styles.staticWorksHeader}>
        <p className={styles.sectionCode}>VOID <span aria-hidden="true">•</span> 05</p>
        <h2 id="void-v2-works-title">{content.title}</h2>
      </header>

      <div className={styles.staticWorkList}>
        {content.items.map((work) => (
          <article className={styles.staticWork} id={"void-v2-work-" + work.id} key={work.id}>
            <MediaImage
              className={styles.staticWorkHero}
              src={work.image}
              alt={work.imageAlt}
              width={work.id === "cut" ? 1070 : work.id === "detour" ? 1440 : 960}
              height={work.id === "cut" ? 803 : work.id === "detour" ? 960 : 720}
              loading="lazy"
              style={{ objectPosition: work.objectPosition }}
            />

            <div className={styles.staticWorkCopy}>
              <div className={styles.staticWorkHeading}>
                <p className={styles.staticWorkAction} aria-hidden="true">{work.action}</p>
                <div>
                  <h3>{work.name}</h3>
                  <p className={styles.staticWorkMeta}>{work.originalName} · {work.year}</p>
                </div>
              </div>
              <p className={styles.staticWorkLocation}>{work.location}</p>
              <p className={styles.staticWorkHook}>
                {work.hook.map((line) => <span key={line}>{line}</span>)}
              </p>

              <div className={styles.staticWorkObservations}>
                <h4>现场路径</h4>
                <ol>
                  {work.observations.map((item) => <li key={item}>{item}</li>)}
                </ol>
              </div>

              <div className={styles.staticWorkStory}>
                <h4>空间发生了什么</h4>
                {work.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              <dl className={styles.staticWorkInsights}>
                <div>
                  <dt>为什么重要</dt>
                  <dd>{work.significance}</dd>
                </div>
                <div>
                  <dt>关键事实</dt>
                  <dd>{work.keyFact}</dd>
                </div>
                <div>
                  <dt>可以借走</dt>
                  <dd>{work.takeaway}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.staticWorkGallery}>
              {work.gallery.map((image, index) => (
                <MediaImage
                  className={index === 0 ? styles.staticWorkGalleryPrimary : styles.staticWorkGallerySecondary}
                  key={image.image}
                  src={image.image}
                  alt={image.imageAlt}
                  width={1200}
                  height={800}
                  loading="lazy"
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
