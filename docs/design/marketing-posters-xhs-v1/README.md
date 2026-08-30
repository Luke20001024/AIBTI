# ArcBTI 小红书宣传海报 V1

状态：视觉规划与首轮生图

目标画布：竖版 `1080 × 1440`，比例 `3:4`，适配小红书信息流首图

出品署名：`PRODUCED BY LUKE`

## 1. 产品理念摘要

ArcBTI 是一场建筑文化与空间直觉测试，不是心理诊断，也不是 MBTI 官方产品。它用 18 道核心题与最多 2 道动态辨析题，帮助用户辨认自己天然读得懂的建筑语言，并把结果组织成四层身份：

1. 人格代码：GRID、VOID、FLOW 等 16 个四字母结果
2. 建筑母语：理性秩序、诗意留白、流动未来等可传播结论
3. 建筑谱系：与真实建筑学派和历史脉络的关联
4. 建筑锚点：一位代表建筑师与一座代表建筑

传播重点不是“你像哪个大师”，而是“你为什么会天然读懂这一类空间”。整体视觉保持现有成熟世界观：成人比例、低多边形切纸编辑插画、建筑母题与人物动作一体、暖骨白和墨黑为底、各人格强调色做小面积冲突。

## 2. 16 型内容地图

| 家族 | 人格 |
| --- | --- |
| 骨架与法则 | GRID 网格秩序者；SPAN 轻量撑场者；MASS 混凝土嘴硬者；TECH 系统外挂者 |
| 场所与气候 | VOID 光影留白者；ROOT 场所生长者；EAVE 屋檐召集者；TIDE 雨水驯兽师 |
| 记忆与符号 | RUIN 永恒预演者；HAND 旧料收藏者；SIGN 建筑玩梗者；ORNA 装饰上头者 |
| 流动与改写 | VEIL 边界蒸发者；FLOW 直线逃犯；PLUS 拒绝拆除者；MIX 功能串台者 |

## 3. 统一 UI 规则

- 画布：3:4 竖版；四周安全边距约 6.5%；缩略图状态下先读到主标题，再看到人物关系
- 排版：英文使用超粗窄体海报字；中文主标题使用高对比宋体或锋利衬线体；说明文字使用中性黑体
- 品牌：`ArcBTI` 必须清晰、完整、只出现 1–2 次；页脚固定 `PRODUCED BY LUKE`
- 色彩：暖骨白 `#F2EBDD`、墨黑 `#11161C`；蓝、青、砖红、橙、紫、绿只作为家族和人格的信号色
- 质感：印刷网点、轻微套色错位、纸张纤维、电影海报颗粒；禁止蓝紫渐变、玻璃拟态、圆角卡片和廉价科技光效
- 文案：最多一个中文主标题、一个英文锚点、一句副标题、一个产品说明和一个署名；避免把 16 个全名都塞进小字
- 人物：必须能辨认现有 16 张卡的动作或母题；群像中不复制同一张脸，不新增第 17 个主角
- 产品表达：统一使用“测出你的建筑母语 / FIND YOUR ARCHITECTURE LANGUAGE”

## 4. 主题一：THE ENDLESS TYPE SCROLL

中文名：人格卷轴正在加载

传播钩子：把 16 张卡做成手机信息流无限滚动的实体卷轴，直接把“刷到哪张就是哪种建筑人格”的行为变成海报笑点。

### UI 规划

- 4 条不同速度的纵向卡片带，左右两列上滚，中间两列下滚，制造正在刷信息流的瞬间
- 中央留一条墨黑书脊式竖带，写 `ArcBTI / 16 WAYS TO BUILD A WORLD`
- 卡片只露出人物、代码和人格强调色，允许上下裁切，形成没有尽头的卷轴
- 顶部像杂志页眉；底部以一条红色校样线压住署名和 CTA
- 主标题不压住面部，中文宋体占两行，英文窄体作为中央脊柱

### 画面文案

```text
ArcBTI / 16 ARCHITECTURE PERSONALITIES
别滑了
你的人格在盖楼
ArcBTI / 16 WAYS TO BUILD A WORLD
测出你的建筑母语
FIND YOUR ARCHITECTURE LANGUAGE
PRODUCED BY LUKE
```

### 生图 Prompt

```text
Use case: ads-marketing
Asset type: Xiaohongshu launch poster, vertical 3:4
Input images: Image 1 is the identity-and-style reference contact sheet containing the existing 16 ArcBTI persona cards. Preserve their adult low-poly cut-paper editorial character universe, architectural motifs, color accents, and the sixteen distinct identities; this is a reference, not an edit target.
Primary request: create a witty high-fashion editorial poster where the sixteen persona cards become four tall endless vertical scrolling ribbons, like a physical social-media feed or mechanical film strip. Alternate ribbon directions and stagger the crops so full characters, faces, codes, and architectural fragments peek in and out. A narrow matte-black vertical spine runs through the center like a book binding and visually locks the moving columns together.
Scene/backdrop: warm bone-white paper with ink-black rules, subtle print grain, halftone dots, crop marks, registration marks, one small vermilion proofing line.
Style/medium: premium printed cultural magazine poster; adult low-poly cut-paper illustration; condensed grotesk English display type mixed with a sharp high-contrast Chinese serif; fashionable, internet-native, slightly absurd, never childish.
Composition/framing: strict 3:4 portrait poster; four dense card columns; strong central vertical spine; 6.5 percent safe margin; readable at phone-feed thumbnail size; no face hidden by headline.
Lighting/mood: crisp editorial contrast, kinetic scrolling energy, intelligent humor.
Color palette: warm bone white, near-black, muted architectural concrete tones, and small accents sampled from all sixteen cards.
Text (verbatim, render exactly, no extra text): "ArcBTI / 16 ARCHITECTURE PERSONALITIES"; "别滑了 你的人格在盖楼"; "ArcBTI / 16 WAYS TO BUILD A WORLD"; "测出你的建筑母语"; "FIND YOUR ARCHITECTURE LANGUAGE"; "PRODUCED BY LUKE".
Constraints: exactly sixteen persona-card appearances across the ribbons; no duplicated persona; preserve the existing cards' identity cues; ArcBTI spelled exactly A-r-c-B-T-I; LUKE spelled exactly L-U-K-E; clean hierarchy; no watermark.
Avoid: generic app UI, rounded cards, blue-purple gradients, glassmorphism, cute chibi proportions, photorealistic humans, illegible microcopy, fake logos, Avengers or other franchise marks.
```

## 5. 主题二：THE WHOLE CAST

中文名：建筑人格，全员到齐

传播钩子：把 16 型组织成电影级三角群像。不是模仿任何具体英雄海报，而是借用大片式“全员集结”能量，把建筑人格做成一个有冲突也有共同世界观的角色宇宙。

### UI 规划

- 16 位人物由下宽上窄排成三角形；4 个家族形成四个色温分区，但光线在中心汇合
- 中央核心不是某一位人格，而是一座由网格、曲面、屋檐、旧砖、水路与透明边界拼合的“未完成城市”
- 前景 5 人为强动作，中景 6 人互相呼应，后景 5 人形成剪影，不让某一类型垄断结论
- 标题像电影片名横跨下三分之一；上方用小页眉建立品牌，底部使用演员表式代码排版
- 表情与动作允许夸张，但保持现有成人低多边形角色宇宙

### 画面文案

```text
ArcBTI ORIGINAL
建筑人格
全员到齐
16 TYPES. ONE CITY.
有人拯救世界
有人只想把缝对齐
测出你的建筑母语
PRODUCED BY LUKE
```

### 生图 Prompt

```text
Use case: ads-marketing
Asset type: Xiaohongshu cinematic ensemble poster, vertical 3:4
Input images: Image 1 is the identity-and-style reference contact sheet for all sixteen ArcBTI personas. Rebuild the same sixteen adult low-poly editorial characters as a single coherent ensemble while preserving their signature clothing, face silhouettes, poses, props, architectural motifs, and accent colors. Reference only; create a new composition.
Primary request: an original cinematic all-cast poster with blockbuster ensemble energy. Arrange exactly sixteen ArcBTI characters in a broad-bottom, narrow-top triangular formation around an impossible unfinished miniature city assembled from their competing architectural instincts: precise grid, tensile membrane, heavy concrete, exposed structure, cross-shaped light, rock and water, generous roof, wetland, timeless circle, reused brick, symbolic gable, ceramic ornament, transparent boundary, flowing curve, added winter garden, and mixed programs. The city, not a single hero, is the compositional center.
Scene/backdrop: deep ink-black architectural void with warm paper haze, fragments of drawings and construction dust, one luminous vertical slit and subtle family-color beams.
Style/medium: premium adult low-poly cut-paper editorial illustration; dramatic original film-poster staging; print grain and offset texture; Chinese serif title plus ultra-condensed English supporting type.
Composition/framing: strict 3:4 portrait; exactly sixteen distinct characters; five dynamic figures foreground, six middle ground, five upper silhouettes; strong triangle; every face readable or intentionally identifiable by silhouette; title across lower third; generous top header space.
Lighting/mood: intelligent, triumphant, chaotic but controlled, a cast reveal with humorous seriousness.
Color palette: ink black and warm ivory, concrete gray, muted teal, brick red, amber, forest green, restrained violet accents.
Text (verbatim, render exactly, no extra text): "ArcBTI ORIGINAL"; "建筑人格 全员到齐"; "16 TYPES. ONE CITY."; "有人拯救世界 有人只想把缝对齐"; "测出你的建筑母语"; "PRODUCED BY LUKE".
Constraints: original composition only; exactly sixteen characters and no duplicates; do not turn them into superheroes or add capes; preserve adult proportions; ArcBTI spelled exactly; LUKE spelled exactly; readable mobile hierarchy; no watermark.
Avoid: copyrighted franchise logos, recognizable superhero costumes, weapons, explosive battle scene, photorealism, cute chibi faces, generic fantasy team, excessive lens flare, blue-purple gradient, unreadable tiny names.
```

## 6. 主题三：ONE SITE, 16 OPINIONS

中文名：同一块地，16 种不服

传播钩子：把 ArcBTI 的差异压缩成一个社交冲突场景——16 型同时改同一个方案。它比单纯列卡更像小红书会转发的梗图，也最能解释测试为何有 16 种结果。

### UI 规划

- 中央是一座被 16 种判断同时改造的爆炸轴测模型，像建筑评图现场突然失控
- 16 位人物沿模型四周形成环形争论：有人校准缝隙、有人拉膜、有人护住旧砖、有人放水、有人往立面加龙
- 大标题像工地警示牌斜压上方，英文副题做红色审图章
- 右上角加入小型批注：`会议还没开始 / 方案已经改了16版`
- 下方留下干净 CTA，确保缩略图看得懂、打开后有第二层笑点

### 画面文案

```text
ArcBTI FIELD REPORT 001
同一块地
16种不服
ONE SITE. 16 OPINIONS.
会议还没开始
方案已经改了16版
测出你的建筑母语
FIND YOUR ARCHITECTURE LANGUAGE
PRODUCED BY LUKE
```

### 生图 Prompt

```text
Use case: ads-marketing
Asset type: Xiaohongshu meme-forward campaign poster, vertical 3:4
Input images: Image 1 is the reference contact sheet for the existing sixteen ArcBTI personas. Preserve all sixteen distinct adult low-poly cut-paper identities, their signature gestures, props, buildings, and palette. Reference only; create a new scene.
Primary request: a smart, surprising architectural design-review disaster. Exactly sixteen ArcBTI characters crowd around one large exploded axonometric building model, each simultaneously applying their own architectural instinct. Make the conflicts readable: GRID aligns a joint; SPAN tensions a membrane; MASS adds concrete collective housing; TECH exposes services; VOID cuts a silent light slit; ROOT reconnects rock, trees and water; EAVE lifts a communal shade roof; TIDE redirects rain through wetlands; RUIN inserts a timeless circle and heavy wall; HAND protects reclaimed brick; SIGN adds a witty giant symbolic arrow and house sign; ORNA attaches ceramic color and a tiny dragon; VEIL dissolves a glass boundary; FLOW bends a straight corridor into a curve; PLUS pushes a winter-garden extension onto the old facade; MIX connects incompatible programs with a red circulation loop.
Scene/backdrop: architectural jury room merged with a construction site, warm bone-white drafting paper, black floor grid, red review stamps, tape, crop marks, fragments of tracing paper.
Style/medium: adult low-poly cut-paper editorial illustration, exploded architectural axonometric, premium cultural-magazine ad, dry visual comedy, Chinese serif headline and condensed poster typography.
Composition/framing: strict 3:4 portrait; one central exploded model occupying the middle 55 percent; sixteen distinct characters ring the model without hiding one another; diagonal warning-style headline at top; clean CTA band at bottom; phone-feed readability.
Lighting/mood: bright studio work light, mock-serious emergency energy, dense visual Easter eggs, humorous but sophisticated.
Color palette: warm ivory, charcoal black, concrete gray, blueprint cyan, vermilion review red, plus restrained persona accent colors.
Text (verbatim, render exactly, no extra text): "ArcBTI FIELD REPORT 001"; "同一块地 16种不服"; "ONE SITE. 16 OPINIONS."; "会议还没开始 方案已经改了16版"; "测出你的建筑母语"; "FIND YOUR ARCHITECTURE LANGUAGE"; "PRODUCED BY LUKE".
Constraints: exactly sixteen characters; all listed architectural actions visible; no duplicated identity; no seventeenth hero; ArcBTI and LUKE spelled exactly; readable at social thumbnail size; no watermark.
Avoid: generic corporate infographic, cute classroom cartoon, photorealistic people, horror or disaster victims, copyrighted logos, blue-purple gradients, rounded app cards, illegible microtext.
```

## 7. 首轮验收顺序

1. 先验人物数量、身份差异和现有世界观一致性
2. 再验 3:4 构图与小红书缩略图识别
3. 再验主标题、ArcBTI、LUKE 和 CTA 的拼写
4. 最后看笑点是否在 1 秒内成立，细节是否在打开大图后提供第二次惊喜

如果生成器对中文排版出现错字，视觉构图仍可作为母图，下一轮只做文字区的定点修订，不重画人物与场景。

## 8. V1 实际交付

内置图像生成通道在携带参考图与纯文字生成两条路径上均返回网络错误；本机同时没有可供 CLI/API 使用的 `OPENAI_API_KEY`。为不中断宣传物料交付，V1 先采用现有 16 张正式人格卡进行本地确定性排版合成，保留真实角色与精确中英文排版。

| 主题 | 文件 | 尺寸 | 人格完整性 |
| --- | --- | --- | --- |
| 人格卷轴正在加载 | `public/images/campaign/xhs-posters-v1/01-endless-type-scroll.png` | 1080 × 1440 | 四列各四型，共 16 型 |
| 建筑人格，全员到齐 | `public/images/campaign/xhs-posters-v1/02-whole-cast-ensemble.png` | 1080 × 1440 | 1＋3＋5＋7 三角阵列，共 16 型 |
| 同一块地，16 种不服 | `public/images/campaign/xhs-posters-v1/03-one-site-16-opinions.png` | 1080 × 1440 | 左右各八型，共 16 型 |

可复现母版：`docs/design/marketing-posters-xhs-v1/render.html`

渲染脚本：`scripts/render-campaign-posters.mjs`

API 恢复后的升级顺序：先保留 V1 的标题、CTA 与安全区不变，再仅替换第二张的卡片三角阵列为真正的同场人物群像、替换第三张的中央轴测模型与人物互动，第一张继续使用现有正式卡片本身。
