# ArcBTI 小红书宣传海报 V2

## 交付节奏

本轮严格串行制作：

1. 完成并交付 `02 · The Complete Cast / 建筑人格全员到齐`。
2. 交付确认后，重新生成并完成 `01 · Endless Type Scroll / 人格卷轴`。
3. 第二张交付后，重新生成并完成 `03 · One Site, 16 Opinions / 同一块地，16 种不服`。

后两张在底图生成阶段不使用既有卡片拼贴替代，不主动降低角色数量、构图复杂度或画面质量。只有在官方生图接口再次明确失败时，才单独报告接口状态并等待下一次高质量重试。

## 01 · Endless Type Scroll

### 成片规格

- 画布：1080 × 1440 px，PNG，3:4 竖版。
- 用途：小红书人格系统总览、滑动钩子、系列首图。
- Mobile-first 主标题：`16种建筑人格 / 一卷装下！`
- 互动贴纸：`你在哪一格？`
- 大众 CTA：`往下划，猜猜你更像谁 →`
- 出品：右侧纵向信息轨 `PRODUCED BY LUKE`。
- 构图：4 条连续纸卷 × 每卷 4 人 = 16 人；上、下各 8 人，中间为独立黑色标题带。
- 比例处理：AI 原始底图为 1024 × 1536（2:3）。成片不裁掉人物，等比缩放至 960 × 1440，并使用两侧各 60 px 的黑色信息轨完成 3:4 适配。

### 成功生成底图的提示词

```text
Use case: ads-marketing.
Asset type: final text-free key art for a premium ArcBTI Xiaohongshu launch poster, strict vertical 3:4.
Primary request: Create an original “endless personality scroll” poster base showing exactly sixteen distinct adult architecture-personality characters as a dynamic rolling archive. Build four continuous vertical paper-scroll ribbons, arranged as four columns with elegant perspective and different vertical offsets. Each ribbon contains exactly four fully visible portrait windows, two above and two below the center, for a clear 4 columns × 4 portraits = exactly 16 characters. The scroll ribbons bend, curl, and roll beyond the top and bottom edges like an endless mechanical editorial conveyor. Leave one bold uninterrupted deep-ink horizontal band across the central 15 percent of the canvas, completely empty and clean for later ArcBTI typography; the four scrolls visibly pass behind that band. Preserve generous clean paper margin at the very top and a compact clean dark margin at the bottom for later copy.
Character system, each motif used exactly once: GRID — precise ruler, black drafting grid, controlled gaze; SPAN — white tensile membrane and cable model; MASS — heavy concrete cube protecting one tiny red flower; TECH — exposed teal structural frame; VOID — silent black architectural slab with one vertical light slit; ROOT — mossy rock, miniature trees, and water; EAVE — giant communal shade roof; TIDE — blue wetland stream and contour lines; RUIN — timeless stone circle and weathered wall; HAND — reclaimed red brick and visible handwork; SIGN — giant symbolic arrow and tiny house; ORNA — colorful ceramic mosaic and tiny dragon; VEIL — transparent glass boundary planes; FLOW — energetic violet curve; PLUS — planted winter-garden addition on an old facade; MIX — stacked mixed programs wrapped by a red circulation loop.
Style/medium: sophisticated adult low-poly cut-paper editorial illustration, premium architecture-and-culture magazine, modern Asian poster design, warm ivory paper, deep ink black, vermilion red, concrete gray, teal, brick, forest green, amber, restrained violet, tactile paper fibers, subtle offset-print grain and halftone. Witty, intelligent, rhythmic, surprising, highly shareable, never childish. Every portrait must have a visibly different face silhouette, hairstyle, outfit, pose, architectural prop, and color accent.
Composition/framing: strict 3:4 portrait, four clearly separated vertical scroll columns, exactly four complete portrait windows per column, all sixteen faces and signature architectural actions readable at phone size, strong up-and-down rolling motion, polished fashion-editorial hierarchy, central empty black title band with absolutely no objects crossing over it.
Constraints: no text, letters, numbers, labels, logos, captions, watermarks, extra people, duplicated people, cropped faces, illegible symbols, weapons, capes, superhero costumes, or copyrighted franchise references. Exactly sixteen humans, exactly four scroll ribbons, exactly four portrait windows on each ribbon.
Avoid: flat static card grid, simple contact sheet, generic website UI, rounded app cards, photorealism, chibi proportions, generic fantasy, chaotic collage, blue-purple gradient, clutter in the central title band.
```

### 文件

- `public/images/campaign/xhs-posters-v2/01-endless-type-scroll-art-v2.png`：无文字 AI 底图。
- `public/images/campaign/xhs-posters-v2/01-endless-type-scroll-v2.png`：最终交付海报。
- `public/images/campaign/xhs-posters-v2/01-endless-type-scroll-mobile-v3.png`：手机优先最终海报。
- `render-scroll.html`：可复现的精确排版源文件。
- `scripts/render-campaign-scroll-v2.mjs`：1080 × 1440 成片渲染脚本。

## 02 · The Complete Cast

### 成片规格

- 画布：1080 × 1440 px，PNG，3:4 竖版。
- 用途：小红书首图、产品预热、人格系统全阵容公布。
- 主标题：`建筑人格全员到齐`
- 英文副标题：`16 TYPES / ONE IMPOSSIBLE CITY`
- 幽默钩子：`有人拯救世界，有人只想把缝对齐。`
- CTA：`TAKE THE TEST / 测出你的建筑母语`
- 出品：`PRODUCED BY LUKE`
- 人格索引：`GRID / SPAN / MASS / TECH / VOID / ROOT / EAVE / TIDE / RUIN / HAND / SIGN / ORNA / VEIL / FLOW / PLUS / MIX`

### Mobile-first V3 调整

在 300 × 400 px 的信息流缩略图测试中，V2 的群像可见，但页眉、英文信息、人格索引、底部笑点和 CTA 会退化为不可读纹理。V3 因此改为：

- 核心标题：`16种建筑人格 / 全员到齐！`，主字号 102–138 px。
- 大众互动：黑色贴纸 `猜猜你更像谁？`
- 明确 CTA：`看看你会喜欢怎样的建筑`
- 克制说明：`也许，你会更明白自己为什么喜欢它。`
- 最终版删除右下角圆圈箭头，避免形成悬浮控件感。
- 取消首图上的长英文说明和 16 个小代码；这些内容保留在详情页或后续轮播图中。
- 将原底图的上方空白与下方黑场裁出，把完整 16 人群像向画面中心提纯，同时不缩小主要人物。

Mobile-first 最终成片：`public/images/campaign/xhs-posters-v2/02-whole-cast-ensemble-mobile-v3.png`。

缩略图研究板：`artifacts/qa/xhs-posters-v2/group-poster-mobile-type-study-v1.png`。

300 × 400 实际预览：`artifacts/qa/xhs-posters-v2/02-whole-cast-ensemble-mobile-v3-feed-preview.png`。

### 视觉系统

- 电影群像海报结构：16 人围绕一座“不可能完成的城市”形成宽底窄顶三角阵列。
- 上方暖象牙纸张留白承载品牌、主标题与演员阵容章。
- 下方深黑场承载中文幽默文案、CTA 与 LUKE 出品信息。
- 主色：暖象牙、墨黑、朱红；角色服装保留混凝土灰、技术青、砖红、森林绿与克制紫色。
- 中文主标题使用重磅衬线体，英文信息使用窄体/海报体，形成建筑文化杂志与电影海报的混合气质。

### 成功生成底图的提示词

```text
Use case: ads-marketing
Asset type: final text-free key art for a premium Xiaohongshu poster, vertical 3:4.
Primary request: Create an original cinematic ensemble illustration for ArcBTI. Exactly sixteen distinct adult low-poly cut-paper architecture characters form a powerful wide-bottom, narrow-top triangular composition around one impossible unfinished miniature city. The city, not one hero, is the center. Use five figures in the foreground, six in the middle ground, and five in the upper formation. Make every face silhouette, outfit, pose, and architectural action visibly different.
Character motifs, each exactly once: precise ruler and grid; tensile cables and white membrane; heavy concrete with a protected tiny red flower; exposed teal technical frame; silent vertical light slit; mossy rock with trees and water; giant communal shade roof; blue wetland stream; timeless circle and heavy wall; reclaimed brick; giant symbolic arrow and tiny house; colorful ceramic mosaic and tiny dragon; transparent glass boundaries; energetic violet curve; planted winter-garden addition on an old facade; stacked mixed programs with a red circulation loop.
Style/medium: sophisticated adult low-poly cut-paper editorial illustration, premium architecture culture magazine, cinematic cast reveal, warm ivory and deep ink black, concrete gray, teal, brick red, amber, forest green, restrained violet, fine paper fibers, subtle halftone and offset-print grain. Intelligent, triumphant, chaotic but controlled, never childish.
Composition/framing: strict 3:4 portrait; exactly sixteen visible characters; strong triangular hierarchy; dramatic central light; clean negative space across the top 12 percent and bottom 22 percent for later typography; faces and signature actions readable at mobile size.
Constraints: no text, letters, numbers, logos, captions, watermarks, weapons, capes, superhero costumes, or copyrighted franchise references; no duplicate character; no seventeenth person.
Avoid: photorealism, chibi proportions, generic fantasy team, flat card grid, battle explosions, rounded UI cards, blue-purple gradient.
```

### 文件

- `public/images/campaign/xhs-posters-v2/02-whole-cast-ensemble-art-v2.png`：无文字 AI 底图。
- `public/images/campaign/xhs-posters-v2/02-whole-cast-ensemble-v2.png`：最终交付海报。
- `render-group.html`：可复现的精确排版源文件。
- `scripts/render-campaign-poster-v2.mjs`：1080 × 1440 成片渲染脚本。

## 03 · One Site, 16 Opinions

### Mobile-first V3 成片规格

- 画布：1080 × 1440 px，PNG，3:4 竖版。
- 构图：完整保留 16 人围绕同一块基地的 16 套冲突方案；AI 原始底图 1024 × 1536 等比缩放为 960 × 1440，两侧使用 60 px 黑色系列信息轨。
- 核心标题：`同一块地，/ 16种不服！`
- 情境笑点：`一块地，十六个“我觉得”`
- 大众 CTA：`如果是你，会喜欢哪一种？`
- 辅助文案：`再看看，你为什么会选它。`
- 出品：`ORIGINAL BY LUKE` 与右侧纵向 `PRODUCED BY LUKE`。

### 文件

- `public/images/campaign/xhs-posters-v2/03-one-site-16-opinions-art-v2.png`：无文字 AI 底图。
- `public/images/campaign/xhs-posters-v2/03-one-site-16-opinions-mobile-v3.png`：手机优先最终海报。
- `render-mobile-2-3.html`：图 2、图 3 的可复现精确排版源文件。
- `scripts/render-campaign-mobile-2-3-v3.mjs`：图 2、图 3 的 1080 × 1440 成片渲染脚本。
- `artifacts/qa/xhs-posters-v2/arcbti-mobile-series-v3-preview.png`：三张海报 300 × 400 信息流三联终检图。
