import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARCHITECT_BY_ID, BUILDING_BY_ID, RESULT_BY_SLUG, RESULT_TYPES } from "../../../../content";
import { withBasePath } from "../../../../domain/paths";
import styles from "./sources.module.css";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => RESULT_TYPES.map((result) => ({ slug: result.slug }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = RESULT_BY_SLUG[(await params).slug];
  return result ? { title: `${result.code} 资料与图片来源` } : {};
}

export default async function ResultSourcesPage({ params }: PageProps) {
  const result = RESULT_BY_SLUG[(await params).slug];
  if (!result) notFound();
  const architect = ARCHITECT_BY_ID[result.architectId];
  const works = [...result.buildingIds, ...result.recommendedBuildingIds].map((id) => BUILDING_BY_ID[id]);

  return (
    <main className={styles.page} style={{ "--source-accent": result.accent } as React.CSSProperties}>
      <header className={styles.hero}>
        <p>ArcBTI / SOURCE REGISTER</p>
        <h1>{result.code}<span>资料与图片来源</span></h1>
        <p>本页把人物、作品和图片出处集中列出，原型阶段素材不等于商业授权，正式发布前仍需逐项复核许可</p>
      </header>

      <section className={styles.section}>
        <p className={styles.kicker}>01 / 代表建筑师</p>
        <h2>{architect.name}</h2>
        {architect.portrait ? (
          <article className={styles.sourceCard}>
            <strong>人物图片</strong>
            <a href={architect.portrait.source.url} target="_blank" rel="noreferrer">{architect.portrait.source.label}</a>
            {architect.portrait.source.credit ? <small>{architect.portrait.source.credit}</small> : null}
          </article>
        ) : null}
        {architect.sources.map((source) => (
          <article className={styles.sourceCard} key={source.url}>
            <strong>人物与方法资料</strong>
            <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <p className={styles.kicker}>02 / 建筑作品</p>
        <div className={styles.workList}>
          {works.map((building, index) => (
            <article className={styles.work} key={building.id}>
              <p>{String(index + 1).padStart(2, "0")}</p>
              <h2>{building.name}</h2>
              <small>{building.originalName} · {building.years} · {building.location}</small>
              {building.image ? <a href={building.image.source.url} target="_blank" rel="noreferrer">图片：{building.image.source.label}</a> : null}
              {building.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">资料：{source.label}</a>)}
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <a href={withBasePath(`/result/${result.slug}/`)}>返回 {result.code} 结果页</a>
        <a href={withBasePath("/result/")}>查看 16 种人格</a>
      </footer>
    </main>
  );
}
