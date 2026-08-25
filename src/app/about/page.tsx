import type { Metadata } from "next";
import { ARCHITECTS, BUILDINGS, CONTENT_VERSION, QUIZ_VERSION, SCORING_VERSION } from "../../content";

export const metadata: Metadata = { title: "方法与图源", description: "AIBTI 的测试方法、内容边界和建筑图片来源" };

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="section">
        <p className="section-kicker">About this experiment</p>
        <h1 className="section-title">一场认真胡闹的<br />建筑美学测试</h1>
        <p className="section-copy">AIBTI 不是心理诊断，也不是 MBTI 的官方衍生产品｜18 道短题把潜意识投射、日常人格和建筑直觉映射到 8 个原创建筑人格，让非专业读者获得一条进入建筑史的轻入口</p>
      </section>

      <section className="section about-list">
        <div><h2>怎么算</h2><p>答案进入秩序、风险、表达、社交、几何、场所、建造、时间八个维度；潜意识、日常人格与建筑直觉三类题目的权重分别为 30%、35%、35%，再与八种人格原型进行相似度匹配｜结果仅作文化娱乐，不用于招聘、诊断或重要决策</p></div>
        <div><h2>为什么有真人照片</h2><p>原创卡通人物负责人格传播；建筑师真人肖像只在资料段落中出现，用来连接真实历史经历、合作关系和轶事｜我们优先选择有辨识度的环境肖像或工作照，并保留图源</p></div>
        <div><h2>图片与授权</h2><p>当前为非商业研究原型｜建筑和建筑师照片优先来自建筑事务所、机构、博物馆及专业建筑媒体，页面逐图标注来源；“标注来源”不等于已获得商业授权｜任何公开发布或商业使用前都应完成逐图授权复核、替换或许可确认</p></div>
        <div><h2>署名不是英雄榜</h2><p>大型建筑来自工作室、工程师、工匠、业主与使用者的协作｜页面会在资料可得时补充重要合作者，例如 Lilly Reich、事务所团队和项目实施团队，避免把建筑史压缩为单一大师神话</p></div>
        <div><h2>隐私</h2><p>答案默认只保存在当前浏览器，并只在这台设备上完成计算｜当前版本没有账号、数据库或用户画像上传｜公开结果链接与分享卡只携带人格类型，不包含答题明细</p></div>
      </section>

      <section className="section">
        <p className="section-kicker">资料入口</p>
        <h2 className="section-title">建筑师与作品来源</h2>
        <div className="reference-index">
          {ARCHITECTS.map((architect) => (
            <div className="reference-row" key={architect.id}>
              <b>{architect.name}</b>
              <span>{architect.sources.map((source, index) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{index ? " · " : ""}{source.label}</a>)}</span>
            </div>
          ))}
          {BUILDINGS.map((building) => (
            <div className="reference-row" key={building.id}>
              <b>{building.name}</b>
              <span>{building.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="version-footer">Quiz {QUIZ_VERSION} · Scoring {SCORING_VERSION} · Content {CONTENT_VERSION}</footer>
    </main>
  );
}
