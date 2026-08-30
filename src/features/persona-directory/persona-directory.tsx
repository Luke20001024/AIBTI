import Link from "next/link";
import type { CSSProperties } from "react";
import { withBasePath } from "../../domain/paths";
import { PERSONA_FAMILIES, type DirectoryPersona } from "./persona-directory-content";
import styles from "./persona-directory.module.css";

function PersonaCard({ persona }: { persona: DirectoryPersona }) {
  const cardStyle = {
    "--persona-accent": persona.accent,
    "--persona-soft": persona.accentSoft,
  } as CSSProperties;

  return (
    <Link
      className={styles.card}
      href={`/result/${persona.slug}/`}
      style={cardStyle}
      aria-label={`${persona.code} ${persona.name}，${persona.language}`}
    >
      <div className={[styles.posterFrame, persona.poster ? "" : styles.posterFrameFallback].filter(Boolean).join(" ")}>
        {persona.poster ? (
          <img
            className={styles.poster}
            src={withBasePath(persona.poster)}
            alt={`${persona.code} ${persona.name}人格首屏海报`}
            data-media-fit="intrinsic"
          />
        ) : (
          <div className={styles.posterPlan} aria-hidden="true">
            <span className={styles.posterCode}>{persona.code}</span>
            <span className={styles.posterName}>{persona.name}</span>
            <span className={styles.posterLine} />
          </div>
        )}
      </div>
      <div className={styles.cardCopy}>
        <div className={styles.cardTitleRow}>
          <span>{persona.code}</span>
          <strong>{persona.name}</strong>
        </div>
        <p className={styles.language}>{persona.language}</p>
        <p className={styles.judgment}>{persona.judgment}</p>
      </div>
    </Link>
  );
}

export function PersonaDirectory() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1><span>16 种</span><span>建筑人格</span></h1>
        <p>你喜欢的外观背后，藏着一整套处理空间的直觉</p>
        <div className={styles.methodLabels} aria-label="四种空间方法">
          <span>校准</span>
          <span>感受</span>
          <span>组织</span>
          <span>越界</span>
        </div>
      </header>

      <div className={styles.families}>
        {PERSONA_FAMILIES.map((family) => (
          <section className={styles.family} key={family.id} aria-labelledby={`family-${family.id}`}>
            <div className={styles.familyHeading}>
              <span>{family.index}</span>
              <div>
                <h2 id={`family-${family.id}`}>{family.title}</h2>
                <p>{family.summary}</p>
              </div>
            </div>
            <div className={styles.grid}>
              {family.personas.map((persona) => (
                <PersonaCard key={persona.code} persona={persona} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className={styles.footer}>
        <p>人格是连续坐标，不是十六个互不相干的盒子</p>
        <Link href="/quiz/">开始测试</Link>
      </footer>
    </main>
  );
}
