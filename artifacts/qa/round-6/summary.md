# AIBTI Round 6 V3 人格接入与传播验收

日期：2026-08-26

状态：本地候选通过；等待 GitHub Pages 统一部署与公网冒烟

## 本轮范围

- 将八种人格从 `public/images/characters-v2/` 切换至 `public/images/characters-v3/`
- 保留 Round 5 的纯文字首页、统一建筑手绘题和连续编辑式结果页，不把人物重新塞回首页
- 对八张 6:5 人格图执行单图、系列、面部差异、结果首屏与分享卡五层验收
- 将分享卡自动检查从“弹窗中的图片元素截图”提升为“直接读取 Canvas 最终导出的 JPEG 文件”

## 人格美术结论

- 八张主图均为 1200 × 1000 WebP，单张 50,074–101,448 B
- 二维矢量感切纸、大块哑光色面、低频建筑背景与轻纸纹保持一致
- GRID、ROOT、MASS、VOID、TECH、FLOW、ORNA、HAND 使用八套不同的脸型、眉眼节奏、年龄感与表情
- 未发现仅更换发型、肤色、服装或道具而复用同一脸模板的情况
- 未使用族群、性别、年龄或职业刻板符号制造人格差异
- 八张人工评分为 93–96，全部超过 85 分通过线且硬失败为 0

完整提示词、人格变量、脸部矩阵和硬门见 `docs/design/v3/persona-image-direction.md`；逐图调用与评分见 `docs/design/v3/generation-manifest.json`；返修与视觉评审见 `artifacts/qa/persona-v3/summary.md`

## 页面与分享卡证据

- 八型完整结果长页：`result-grid-393x873.png` 至 `result-hand-393x873.png`
- 八型结果首屏组合复核：`artifacts/review/persona-v3-result-first-viewports.png`
- 八张分享卡真实原始导出：`share-card-*-1080x1350.jpg`
- 分享卡组合复核：`artifacts/review/persona-v3-share-card-true-1080x1350-sheet.jpg`

八张分享卡均为 1080 × 1350 JPEG，未出现弹窗截图黑边、输出尺寸漂移或人物关键动作裁切。GRID 的超长丁字尺、ROOT 的苔石、MASS 的红花、VOID 的“嘘”手势、TECH 的爆炸模型、FLOW 的卷图与路径线、ORNA 的陶瓷龙、HAND 的旧砖瓦均保留。

## 自动验收

- TypeScript：通过
- Vitest：7 个文件、52 项测试通过
- Next.js 静态导出：14 个页面生成成功
- `/AIBTI` 子路径 Pages 静态模式：Android 393 代表项目 8 项全部通过
- iPhone 390 WebKit、Android 393 Chromium、HarmonyOS 390 代理核心链路：18 项通过、6 项按项目职责跳过
- Android 393 八型结果长页：8 种人格、8 位／组代表建筑师、24 座展开建筑、16 座推荐建筑和 8 个建筑风格坐标通过
- Android 393 八张分享卡：人格图加载、1080 × 1350 输出、公开二维码入口与 Canvas 原始 JPEG 写入通过
- 390／393 视口横向溢出：0
- 首页引用 CSS：26,765 B 原始／6,357 B gzip；首页引用 JavaScript：653,297 B 原始／207,644 B gzip
- `public/images` 总量：10,460,164 B；其中八张 V3 人格图合计 562,062 B

模拟 WebKit 与 Chromium 不替代真实 iPhone Safari、微信、Android 微信与 HarmonyOS 百度浏览器。GitHub Pages 部署成功并完成公网路由、静态资源、八结果与分享链路冒烟之前，本轮只能标记为本地候选通过。
