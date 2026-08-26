# AIBTI V3 建筑师风格化全量生产计划

状态：已确认生产方向；离线生成与评审，不接入线上页面。

长任务执行、主任务替换、验证与回滚以 `architect-portrait-action-guide.md` 为唯一行动基线；本文件只负责 prompt 与图像验收设计。

母版选择：

- `zaha-v1`：女性、中近景、正面身份辨识与安静建筑背景的母版；
- `mies-v1`：老年男性、坐姿/手势、历史人物年龄表达与明确建筑背景的母版。

`zaha-v2` 保留为动作型探索，但不作为本轮全量肖像的构图母版。

## Prompt 关键倾向

以下七项按优先级排序。低优先项不得破坏高优先项：

1. **身份辨识优先于画风炫技**：先锁脸型、发型轮廓、眼距、鼻颌、神态和经典姿态，再做几何化；不能只剩“某位建筑师的感觉”。
2. **中近景肖像优先于全身角色**：单人以胸像、腰部以上或三分之二坐姿为主，人物占画面高度约 70–82%；双人以腰部以上并肩肖像为主。
3. **中等切面密度**：面部约 8–13 个大色面；年龄通过 2–4 个结构转折表达，不使用密集皱纹；眼、鼻、口保持图形化但可辨认。
4. **服装承担大轮廓**：服装使用近黑、炭灰或单一低饱和色的大平面；不出现写实褶皱、织物纹理、时尚广告光泽。
5. **建筑是低对比身份注脚**：每张只保留 3–6 个代表建筑大面，降低对比与细节，不得成为建筑渲染。
6. **统一纸张世界与色彩纪律**：暖纸白底、微弱均匀纸纹、6–8 个主色；每人最多一个小面积个性色彩重音。
7. **尊重真人与共同署名**：不恶搞、不丑化、不强化年龄/族裔/性别刻板印象；搭档同尺度、同视觉权重、不同脸型。

## 统一母提示词

每张图使用相同母提示词，并追加对应人物变量。Zaha A 与 Mies A 同时作为风格参考，人物资料照作为身份参考。

传输实现：为降低内置图片编辑接口的多图上传失败率，Zaha A 与 Mies A 已非破坏性合成为 `artifacts/design/architect-character-exploration/portrait-style-anchor-pair.jpg`。该文件只是两张已确认母版的并排低体积参考板，不新增设计信息；生成调用可使用“组合母版参考板 + 单张身份参考图”，仍视为同时引用两张母版。

```text
Use case: style-transfer / identity-preserve
Asset type: offline AIBTI architect portrait series, exact 6:5 landscape

Input images:
Image 1 is the approved Zaha A portrait anchor. Preserve its close identity-first framing, flat cut-paper face construction, matte black clothing silhouette, warm paper field, low-contrast architectural bands, restrained palette and dignified tone. Do not copy Zaha's identity, hair, clothing cut or background geometry.
Image 2 is the approved Mies A portrait anchor. Preserve its mature age abstraction, broad polygon planes, quiet seated editorial presence, simplified architectural background, paper grain and controlled contrast. Do not copy Mies's identity, cigar, pose, suit details or pavilion.
Image 3 is the named architect identity reference. Preserve the listed identity anchors from Image 3 and restyle rather than reproduce the photograph.

PRIMARY REQUEST:
Create a respectful, lightly cartoonized but clearly recognizable AIBTI architect portrait. Identity must remain legible through face silhouette, hair shape, eye spacing, nose-jaw relationship, expression and one documented pose cue—not through photographic texture.

STYLE LOCK:
Original flat 2D editorial illustration; vector-like cut paper and restrained screen-print geometry. Face uses 8–13 broad matte polygon planes, graphic eyes, one simplified nose structure, one controlled mouth and only 2–4 large age planes. Hair is a solid silhouette with at most 3–6 internal facets; facial hair is grouped into broad masses, never strands. Clothing uses large matte planes with no realistic folds. Faint uniform paper grain only. Deliberately drawn graphic art, never a filtered photograph.

COMPOSITION:
Exact 6:5 landscape, intended for 1200 x 1000 review and 390px mobile display. Single-person chest-up, waist-up or three-quarter seated portrait occupies 70–82% of frame height. Keep head, hands and identity cues mobile-safe. Preserve 18–30% quiet negative space. Architecture stays behind the portrait and uses only 3–6 low-contrast large planes.

COLOR AND LIGHT:
Warm paper off-white, near-black, charcoal, warm skin tones and no more than three muted supporting colors. Six to eight dominant colors total. Flat tonal separation; no cinematic key light, gradients, glow, haze, HDR, depth of field or realistic cast-light effects.

CONSTRAINTS:
Respectful real-person likeness with controlled light cartoonization. No ridicule, grotesque exaggeration, age mockery, ethnic/gender stereotype, beauty retouching, commercial-character imitation, invented costume, invented personal symbol, text, letters, numbers, logo, UI, border, signature or watermark.

HARD AVOID:
Photorealism, semi-realistic painted face, vectorized-photo look, 3D render, CGI, PBR, glossy clay, realistic eyes, skin pores, individual hair or beard strands, dense wrinkles, anime, chibi, kawaii, child proportions, superhero pose, fashion advertisement, cinematic concept art, busy architecture, material simulation and high-frequency texture.
```

## 逐人 Prompt 变量

### `wright-v1` — Frank Lloyd Wright

- 身份锚点：高龄窄长脸、额头与颧骨关系、蓬松白发轮廓、略下垂眼神、细长鼻、克制而警觉的表情；
- 姿态：三分之二坐姿或腰部以上，一只手轻托太阳穴，另一只手不进入主体区；
- 服装：深色西装、白衬衣、极简深色领结；不添加参考图未出现的宽檐帽或披风；
- 建筑符号：流水别墅的两条水平悬挑、一个石质竖向核心和一条低饱和蓝灰水带，共 4–5 大面；
- 色彩：暖纸白、近黑、暖灰、石褐、苔绿、蓝灰；
- 特别禁止：凌乱书桌、台灯、纸张堆、森林叶片、瀑布摄影、夸张天才姿态。

### `le-corbusier-v1` — Le Corbusier

- 身份锚点：光头、圆形黑框眼镜、突出而图形化的鼻部、略抿嘴、向侧方审视的眼神；
- 姿态：腰部以上轻微侧转，一只手可低位扶住外套边缘，避免复杂手势；
- 服装：暖灰西装、白衬衣、深色小圆点领结，圆眼镜必须清楚但不能变成漫画放大镜；
- 建筑符号：马赛公寓厚重水平体块、两根粗架空柱、两条低对比模块带，共 4–6 大面；
- 色彩：暖纸白、近黑、暖灰、混凝土灰、褪红、深蓝；
- 特别禁止：眼镜过大、滑稽学者形象、密集阳台格、粗糙混凝土纹理、模数人体图或文字。

### `ando-v1` — Tadao Ando

- 身份锚点：成熟窄长脸、厚直黑发整体轮廓、深眼窝、明显鼻唇结构、坚定而安静的正视；
- 姿态：胸像或腰部以上，轻微三分之二转身，双手可不出现；
- 服装：近黑外套与高位白色立领，轮廓简洁；
- 建筑符号：光之教堂一块深灰墙面、一个骨白十字开口和一条低对比地面，共 3–4 大面；
- 色彩：暖纸白、近黑、混凝土灰、骨白、深靛；
- 特别禁止：体积光、宗教圣像感、拳击姿态、过度阴沉、写实混凝土孔洞、脸部摄影阴影。

### `foster-v1` — Norman Foster

- 身份锚点：成熟高额头、极短银灰发、长椭圆脸、直视眼神、轻微闭嘴微笑和清晰下颌；
- 姿态：腰部以上，双臂自然交叠，保持参考图的开放与自信，不做权威领袖姿态；
- 服装：低饱和浅蓝衬衫，以 5–7 个宽大平面表达，保留一个极小深色腕带形状；
- 建筑符号：香港汇丰两组外露桁架、一个中庭空隙和一条青蓝结构线，共 4–6 大面；
- 色彩：暖纸白、近黑、银灰、浅蓝、青蓝、极少深红；
- 特别禁止：草地摄影、密集钢构、螺栓、玻璃反射、赛博朋克、过度年轻化或企业广告笑容。

### `gaudi-v1` — Antoni Gaudí

- 身份锚点：年轻至中年历史肖像的长椭圆脸、深眼、侧分深发、完整胡须轮廓、严肃正视；
- 姿态：胸像或腰部以上轻微三分之二侧转，不添加帽子或工具；
- 服装：深色历史西装与黑色高领/领口，简化为大平面；
- 胡须规则：胡须作为 3–5 块连续深色几何质量，不出现卷曲发丝和高频颗粒；
- 建筑符号：巴特罗之家一个曲窗、两条骨状阳台曲线和 2–3 块低饱和碎瓷色面；
- 色彩：暖纸白、近黑、深褐、暖肤色、孔雀蓝、珊瑚红、少量金黄；
- 特别禁止：胡须写实化、圣人肖像、奇幻巫师、全立面马赛克、彩色碎瓷铺满背景、圣家堂天际线。

### `wang-lu-v1` — Wang Shu × Lu Wenyu

- 身份锚点：Wang Shu 为灰色后梳发、矩形眼镜、较宽圆脸与深色叠穿外套；Lu Wenyu 为短黑发整体轮廓、较窄脸、平静正视、深色外套与暖红内搭；
- 姿态：腰部以上并肩，肩线处于同一高度，身体轻微朝向彼此但目光可看向镜头；不持道具，降低双人手部风险；
- 平权规则：两人脸部尺寸差异不超过 8%，同等清晰度、同等对比、同等画面占比；不得遮挡、前后主从或只突出一人；
- 建筑符号：宁波历史博物馆一块倾斜墙、一个深开口和三条宽阔旧材料带；
- 色彩：暖纸白、近黑、瓦灰、砖褐、靛蓝、克制暖红；
- 特别禁止：同脸模板、情侣姿态、师生站位、奖项主角/配偶附属暗示、图书馆摄影背景、逐砖逐瓦纹理。

## 生成与 Review 计划

生产顺序：

1. `wright-v1` → review；
2. `le-corbusier-v1` → review；
3. `ando-v1` → review；
4. `foster-v1` → review；
5. `gaudi-v1` → review；
6. `wang-lu-v1` → review。

每张只允许三种状态：

- `reviewed-pass`：无硬失败且总分 ≥ 85；
- `reviewed-revise`：身份与风格基本成立，但一个可局部修复的问题影响系列统一；
- `rejected-regenerate`：出现任一硬失败，必须重生，不得靠裁切掩盖。

定向重生规则：一次只调整一个问题，并重复其他不变量。例如：

- 身份偏弱：只加强脸型、眼距、鼻颌与发型锚点；
- 过于写实：只减少面部小切面与写实眼睛，不改变姿态和背景；
- 背景抢人：只降低建筑对比与面数；
- 人物过小：只改中近景占比；
- 双人失衡：只修正尺度、前后关系与脸部清晰度，不改变身份设计。

## 硬门与评分

沿用 `architect-character-exploration.md` 的七项硬失败和 100 分评分，但本轮新增两项系列硬门：

1. 单人图必须与 Zaha A / Mies A 保持相近的中近景阅读距离，不得退回全身角色图；
2. 八图联系人总览中，不得有任意一张明显更写实、更卡通、建筑更复杂或服装更高光。

全部八组通过后，生成：

- `architect-portraits-all.png`：4×2 全量总览；
- `architect-portraits-mobile-390.png`：390px 宽移动端检查；
- `architect-portrait-production-manifest.json`：逐图提示变量、源文件、输出、分数与修改记录。

本轮仍不修改线上人物引用。
