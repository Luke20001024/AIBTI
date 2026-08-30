import { withBasePath } from "../../../domain/paths";
import { VOID_V2_SOURCES } from "../content/void-v2-sources-content";
import styles from "./void-v2.module.css";

export function VoidV2Sources() {
  return (
    <main className={[styles.page, styles.sourcesPage].join(" ")}>
      <header className={styles.sourcesHero}>
        <p className={styles.sectionCode}>VOID <span aria-hidden="true">•</span> SOURCES</p>
        <h1>方法与来源</h1>
        <p>这是一份建筑文化人格内容，不是心理诊断，也不是正式建筑史分类</p>
      </header>

      <section className={styles.sourcesSection} aria-labelledby="void-v2-method-title">
        <h2 id="void-v2-method-title">内容边界</h2>
        <p>“光 / 边界 / 路径”和“切 / 绕 / 藏”是 ArcBTI 为帮助非专业读者理解空间经验所做的编辑归纳，不是安藤忠雄本人提出的理论分类</p>
        <p>现代主义、极简主义倾向与批判性地域主义在页面中分别承担“骨架 / 方法 / 校正”，是内容结构，不代表三个流派可以被简单合并</p>
      </section>

      <section className={styles.sourcesSection} aria-labelledby="void-v2-references-title">
        <h2 id="void-v2-references-title">建筑事实来源</h2>
        <div className={styles.sourcesList}>
          {VOID_V2_SOURCES.map((source) => (
            <a href={source.url} key={source.url} target="_blank" rel="noreferrer">
              <span>{source.subject}</span>
              <strong>{source.label}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.sourcesSection} aria-labelledby="void-v2-rights-title">
        <h2 id="void-v2-rights-title">图片与授权状态</h2>
        <p>VOID 首屏人格海报与风格轴测图是解释性视觉，不对应也不冒充任何具体建筑作品</p>
        <p>金贝尔艺术博物馆与瓦尔斯温泉使用 Wikimedia Commons 的真实建筑照片，并在上方列出作者与许可；安藤忠雄肖像及三座核心作品图仍需在正式公开发布前逐图复核摄影者、原始图页与商业使用许可</p>
      </section>

      <a className={styles.sourcesBack} href={withBasePath("/preview/void-v2/")}>
        返回 VOID
      </a>
    </main>
  );
}
