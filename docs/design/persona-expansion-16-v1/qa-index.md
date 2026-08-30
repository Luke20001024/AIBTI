# ArcBTI 16 人格 V7｜视觉与交互验收索引

本页只索引最终证据，不收录中间探索稿

## 1. 推荐入口

- 本地完整站点：`http://127.0.0.1:4173/AIBTI/`
- GitHub Pages：`https://luke20001024.github.io/AIBTI/`
- 16 人格目录：`http://127.0.0.1:4173/AIBTI/result/`
- VOID 结果页：`http://127.0.0.1:4173/AIBTI/result/void/`
- VOID 来源页：`http://127.0.0.1:4173/AIBTI/result/void/sources/`

## 2. 三档手机结果页

每档包含 16 个人格、每人格 7 个稳定滚动位置，以及 7 张 4×4 阶段联系表

| 视口 | 审计报告 | 截图目录 |
| --- | --- | --- |
| 360×800 | `artifacts/qa/result-v7-segments-final/360x800/audit-360x800.json` | `artifacts/qa/result-v7-segments-final/360x800/` |
| 390×844 | `artifacts/qa/result-v7-segments-final/390x844/audit-390x844.json` | `artifacts/qa/result-v7-segments-final/390x844/` |
| 430×932 | `artifacts/qa/result-v7-segments-final/430x932/audit-430x932.json` | `artifacts/qa/result-v7-segments-final/430x932/` |

七个阶段：

1. `hero`：人格首屏
2. `digest`：先说人话
3. `architect`：代表建筑师
4. `works-a`：前三座作品上半段
5. `works-b`：前三座作品下半段
6. `lineage`：两座延伸作品与同频参考
7. `ending`：人格收口与操作区

390×844 VOID 首屏：`artifacts/qa/result-v7-segments-final/390x844/void/01-hero-0.png`

首屏等比完整显示专项证据：

- 360×800：`artifacts/qa/persona-expansion-16-v1/hero-responsive-android-360-chromium.png`
- 390×844：`artifacts/qa/persona-expansion-16-v1/hero-responsive-iphone-390-webkit.png`
- 430×932：`artifacts/qa/persona-expansion-16-v1/hero-responsive-iphone-430-webkit.png`

## 2.1 全站内容图片容器专项

本轮不再只检查首屏，而是给所有承载内容信息的图片统一增加 `data-media-fit="intrinsic"` 验收标记，并逐张比较渲染宽高比与文件固有宽高比

覆盖范围：16 张人格首屏、16 页人物肖像、48 张外层主作品、32 张外层延伸作品、三类档案主图与图组、16 张人格目录海报、图像题选项图，以及旧 VOID 参考页

专项证据目录：`artifacts/qa/content-media-system-v1/`

| 视口 | 结果长页 | 建筑档案 | 人格目录 | 图像题 |
| --- | --- | --- | --- | --- |
| 360×800 | `result-sign-android-360-chromium.png` | `work-sheet-android-360-chromium.png` | `directory-android-360-chromium.png` | `quiz-q13-android-360-chromium.png` |
| 390×844 | `result-sign-iphone-390-webkit.png` | `work-sheet-iphone-390-webkit.png` | `directory-iphone-390-webkit.png` | `quiz-q13-iphone-390-webkit.png` |
| 430×932 | `result-sign-iphone-430-webkit.png` | `work-sheet-iphone-430-webkit.png` | `directory-iphone-430-webkit.png` | `quiz-q13-iphone-430-webkit.png` |

自动合同：`tests/e2e/content-media-system.spec.ts`

- 16 个人格 × 7 张外层内容图 = 112/112 保持固有比例
- 360、390、430 三档人物/主作品/延伸作品 Sheet 均无 `cover` 裁切
- 16 张目录海报和 Q13 三张题目图在三档尺寸均完整显示
- 三档均无横向溢出

## 3. 96 个人物与建筑档案

- 全量报告：`artifacts/qa/result-v7-modals/390x844/playwright-audit-390x844.json`
- 16 个人物档案截图：`artifacts/qa/result-v7-modals/390x844/*-architect-playwright.png`
- 16 个第一主作品档案截图：`artifacts/qa/result-v7-modals/390x844/*-building-1-playwright.png`
- 人物档案 4×4 联系表：`artifacts/qa/result-v7-modals/390x844/contact/contact-architect.png`
- 第一主作品 4×4 联系表：`artifacts/qa/result-v7-modals/390x844/contact/contact-building-1.png`

验收总数：16 个人物档案 + 80 个建筑档案 = 96 个 Sheet；共加载 205 张建筑实景与 16 张人物插画；80 个建筑档案全部为 2–3 图

## 4. 人物插画一致性

- 16 建筑师肖像总览：`artifacts/qa/result-v7-mobile/architect-portrait-contact.png`
- 16 人格主海报总览：`artifacts/qa/result-v7-mobile/`

检查重点：真人照片残留、双人构图裁切、面部抽象程度、背景深浅、人物与文字碰撞

## 5. 核心测试命令与最终结果

```text
pnpm test             80/80 通过
pnpm typecheck        通过
完整 8 环境矩阵       80 条实际执行最终通过 / 104 条件跳过
Pages 发布门禁        15 通过 / 8 条件跳过 / 0 失败
```

`verify:pages` 已包含 production static build，并生成 41 个静态页面

## 6. 最终审查清单

- [x] 16 人格结果页全部存在
- [x] 16 张首屏均为单张扁平海报
- [x] 所有内容图容器跟随原图比例，不再使用固定高度或 `cover` 裁切
- [x] 代表建筑师肖像全部为风格化插画
- [x] 80 座作品关系与代表建筑师一致
- [x] 80 个建筑档案全部使用真实建筑照片
- [x] 80 个建筑档案全部保有 2–3 张图，205 张建筑图跨项目重复 0 项
- [x] 所有档案可打开、关闭并恢复页面滚动
- [x] 360、390、430 三档无横向溢出
- [x] 无图片加载失败、空替代文本或禁用按钮
- [x] 结果页正文不再依赖“不是 / 而是 / 别抄 / 抄这个”句式
- [x] 补充判断改为小字斜体，不作为强调模块
- [x] 结尾保存/分享按钮无越界或遮挡
- [x] 静态子路径 `/AIBTI` 可访问
- [x] GitHub Pages 子路径、静态直达刷新和资源加载合同通过
