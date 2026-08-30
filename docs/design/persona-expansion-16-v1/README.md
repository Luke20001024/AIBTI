# ArcBTI 16 人格交付索引

状态：最终版已完成跨系统手机验收｜通过 GitHub Pages 自动发布

## 入口

- 产品首页：`/`
- 答题入口：`/quiz/`
- 16 人格索引：`/result/`
- 结果页：`/result/{slug}/`
- 本地 Pages 预览：`http://127.0.0.1:4173/AIBTI/`
- 线上地址：`https://luke20001024.github.io/AIBTI/`
- 方法与图源：`/about/`

## 16 人格路由与首屏

| 家族 | 人格 | 路由 | 移动展示首屏（同名 PNG 为下载原稿） |
| --- | --- | --- | --- |
| 骨架与法则 | GRID | `/result/grid/` | `public/images/personas/grid/hero-poster-v1.webp` |
| 骨架与法则 | SPAN | `/result/span/` | `public/images/personas/span/hero-poster-v1.webp` |
| 骨架与法则 | MASS | `/result/mass/` | `public/images/personas/mass/hero-poster-v1.webp` |
| 骨架与法则 | TECH | `/result/tech/` | `public/images/personas/tech/hero-poster-v1.webp` |
| 场所与气候 | VOID | `/result/void/` | `public/images/personas/void/hero-poster-v1.webp` |
| 场所与气候 | ROOT | `/result/root/` | `public/images/personas/root/hero-poster-v1.webp` |
| 场所与气候 | EAVE | `/result/eave/` | `public/images/personas/eave/hero-poster-v1.webp` |
| 场所与气候 | TIDE | `/result/tide/` | `public/images/personas/tide/hero-poster-v1.webp` |
| 记忆与符号 | RUIN | `/result/ruin/` | `public/images/personas/ruin/hero-poster-v1.webp` |
| 记忆与符号 | HAND | `/result/hand/` | `public/images/personas/hand/hero-poster-v1.webp` |
| 记忆与符号 | SIGN | `/result/sign/` | `public/images/personas/sign/hero-poster-v1.webp` |
| 记忆与符号 | ORNA | `/result/orna/` | `public/images/personas/orna/hero-poster-v1.webp` |
| 流动与改写 | VEIL | `/result/veil/` | `public/images/personas/veil/hero-poster-v1.webp` |
| 流动与改写 | FLOW | `/result/flow/` | `public/images/personas/flow/hero-poster-v1.webp` |
| 流动与改写 | PLUS | `/result/plus/` | `public/images/personas/plus/hero-poster-v1.webp` |
| 流动与改写 | MIX | `/result/mix/` | `public/images/personas/mix/hero-poster-v1.webp` |

## 规划与生产文件

- 总规划：`16-persona-expansion-master-plan.md`
- 目录实现：`index-implementation-manifest.md`
- 首屏生成记录：`new-8-hero-generation-log.md`
- 首屏生产参数：`poster-production-manifest.json`
- 题目与评分 V4：`question-v4-implementation-and-test-plan.md`
- 真实项目图登记：`main-work-real-image-register.json`
- 16 首屏联系表：`artifacts/qa/persona-expansion-16-v1/sixteen-persona-contact-sheet-v1.png`
- 24 个新增主作品联系表：`artifacts/qa/persona-expansion-16-v1/new-24-main-works-contact-sheet-v1.png`

## 实现状态

1. 16 人格目录：完成
2. 16 张扁平首屏主图：完成
3. 16 套结果页内容：完成
4. 16 个结果页：完成，逐页回归通过
5. 18 核心题 + 动态辨析 V4：完成，评分与兼容测试通过
6. 题目到结果的完整闭环：完成，iPhone WebKit、Android Chromium 与 HarmonyOS 代理通过
7. GitHub Pages：自动构建与发布工作流已配置并通过本地同构门禁

最终验收记录见 `final-mobile-acceptance-report.md`

视觉与交互证据目录见 `qa-index.md`

## 手机验收矩阵

强制尺寸：360×800、375×812、390×844、393×873、412×915、430×932，并额外覆盖 390×700 的短屏嵌入环境

每一档至少验证：无横向溢出、44px 触控区、首屏整图比例、正文 14–17px 实际可读性、原生展开卡、返回与重测、图像无破损、题目恢复、动态追问上限、计算后私密答案不出现在结果 URL

最终结果：全部通过。V7 最终版完成 360×800、390×844、430×932 的 16 人格分段视觉检查，共 336 张截图；96 个档案全量打开与关闭检查；8 环境矩阵中 80 条实际执行用例最终通过，104 条按设备职责条件跳过；GitHub Actions 同构 Android 393 发布门禁为 15 通过、8 跳过、0 失败
