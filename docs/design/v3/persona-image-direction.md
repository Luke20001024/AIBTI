# AIBTI V3 人格图统一美术与验收规范

状态：候选生成规范，不替换 V2 正式资产，直至八图与页面验收全部通过。

## 目标

V3 解决 V2 人物与建筑逐渐写实、背景信息密度过高、八张图不像同一角色宇宙的问题。设计原则沿用 PRD：统一的是角色宇宙，变化的是人格演出。

视觉优先级从高到低：

1. 人物的扁平二维几何化与系列一致性，但不是同一张脸换衣服
2. 人格动作、表情和道具的一眼可读
3. 代表建筑的轮廓可识别
4. 材料与空间氛围

建筑不得以“更准确”为理由抢走人物主体，也不得使用摄影、PBR 或建筑可视化的写实材质语言。

## 引用图角色

- 项目旧版 GRID：项目自有角色锚点，只参考成人卡通比例、几何脸、切纸分面和人物主导关系；不继承旧图中的文字、具体构图或较写实材质。
- 用户提供的人格角色集合：只参考“大块面、少细节、干净留白、同系列角色家族”的抽象层级；不复制任何具体人物、服饰、动作、标签、配色、版式或商业识别。
- 各人格旧版图：只参考该人格的动作、道具和叙事锚点；统一服从本文件的 V3 风格母规范。

## 风格母规范（每张图必须原样重复）

```text
Use case: stylized-concept
Asset type: AIBTI V3 mobile result-page personality character hero, production raster candidate

REFERENCE PRIORITY:
Image 1 is the project-owned AIBTI character-world anchor. Preserve only its adult cartoon abstraction, large faceted cut-paper shapes, geometric face grammar, crisp silhouette, and character-first storytelling. Do not copy its exact character, pose, clothing, building, text, or layout.
Image 2 is a user-supplied abstraction benchmark. Preserve only the high-level simplicity: flat 2D polygonal adults, very few facial marks, limited colors, clean negative space, and a coherent collectible family. Do not reproduce any specific character, trade dress, labels, layout, costume, pose, palette, or proprietary identity.
Image 3 is the project-owned persona content reference. Preserve only the persona's emotional idea, prop, action, and representative-building cue. Restyle everything into the V3 system below.

STYLE LOCK:
Original flat 2D editorial illustration, vector-like cut paper and screen-print geometry. The image must read as deliberately drawn graphic art, never as a 3D render or a painted-over photograph. Use large matte color shapes with crisp edges and only a faint uniform paper grain. Character and architecture share the same flat graphic world.

CHARACTER GRAMMAR:
Clearly adult but stylized, approximately 1:5.5 to 1:6 head-to-body, with a slightly enlarged geometric head for expression. Build every face from 6-10 large flat polygon shapes, graphic eyes, one simplified nose shape, one simple mouth shape, and bold eyebrows. Keep the same level of abstraction across the series, but never reuse one facial template: vary face silhouette, jaw width, cheek geometry, eye shape and spacing, eyebrow rhythm, nose direction, mouth shape, age cues, hairstyle, and expression to embody each persona. Hair is one solid silhouette with at most 3-5 internal facets and no strands. Clothing uses broad planes and no realistic fabric folds. Hands are simplified but readable. Keep one character only. Avoid ethnic, gender, age, or profession stereotypes; personality must come from authored shape and expression rather than caricature shorthand.

ARCHITECTURE GRAMMAR:
Reduce the representative building to 4-8 large recognizable planes or silhouette cues. Architecture is secondary, diagrammatic and calmer than the character. No material simulation, no brick-by-brick, leaf-by-leaf, bolt-by-bolt, marble-vein, glazing-reflection, weathering, or photographic texture. Use flat color blocking and at most one simple cast-shadow shape.

COMPOSITION:
Exact 6:5 landscape, full bleed, designed for 1200 x 1000 output and mobile display. Full or nearly full body. Character occupies 65-75% of frame height and remains the dominant focal point. Preserve a strong outer silhouette, safe head and hands, and 25-35% quiet negative space. Architecture stays close enough to identify but never dominates. Use no more than one primary prop and one tiny comic accent.

COLOR AND LIGHT:
Six to eight dominant colors total, including warm paper off-white and near-black. Flat tonal separation, no cinematic lighting. No gradients except a single restrained flat shadow transition if essential. No glow, haze, HDR, depth of field, volumetric light, lens effects, or dramatic sky.

CONSTRAINTS:
Original fictional adult; no real-person likeness; no text, letters, numbers, logos, UI, border, watermark, poster labels, speech bubbles, extra people, or duplicate props.

HARD AVOID:
Photorealism, semi-realistic face, realistic human portrait, architectural visualization, cinematic concept art, 3D render, CGI, PBR, glossy clay or plastic, realistic eyes, skin pores, subsurface skin, individual hair strands, detailed fabric, realistic material reflections, dense foliage, high-frequency facade detail, busy scenery, clutter, anime, chibi, kawaii, child proportions, superhero pose, stock illustration, magic effects.
```

## 八人格变量

| 人格 | 人格演出 | 建筑符号（最多 4–8 大面） | 配色 | 特别禁止 |
| --- | --- | --- | --- | --- |
| GRID | 冷静挑剔；一手竖握超长丁字尺，一手捏红色小方块；单边抬眉 | 巴塞罗那馆：薄屋顶、细柱、石墙、浅水池 | 米白、炭黑、钴蓝、警示红 | 写实大理石、玻璃反射、建筑摄影、人物过小 |
| ROOT | 温和守护；站立或轻靠，双手托苔石；温暖但固执 | 流水别墅：两层水平悬挑、石质核心、一道水流 | 森林绿、岩灰、暖棕、微量锈红 | 叶片细节、真实瀑布、忧郁蹲姿、童话森林 |
| MASS | 嘴硬心软；抱臂如承重墙，手肘保护一盆单朵红花 | 马赛公寓：巨大架空柱、模块阳台、厚重水平体块 | 混凝土灰、深蓝、褪红 | 混凝土毛孔、天气侵蚀、英雄姿态、多个花盆 |
| VOID | 安静内省；侧身让出光，手指做“嘘”手势 | 光之教堂：暗面、一个十字开口、一道平面光 | 墨灰、骨白、深靛 | 写实光束、灰尘体积光、宗教服饰、恐怖气氛 |
| TECH | 技术兴奋；托住 5 块以内的爆炸结构模型，另一手调节节点 | 香港汇丰：两组外露桁架、斜撑、中庭空隙 | 银灰、青蓝、荧光绿小点 | 螺栓海、玻璃幕墙摄影、全息 UI、赛博朋克 |
| FLOW | 狂喜越界但成人；身体形成一条曲线，一手画非发光运动路径，一手握卷图 | 盖达尔中心：地面卷起的一条白色连续壳体、一个深色切口 | 深紫、亮橙、电蓝小点 | 魔法光带、雾、建筑渲染、人物缩成配景 |
| ORNA | 戏剧迷人；半鞠躬，掌上托一只小陶瓷龙，围巾是唯一碎瓷纹样 | 巴特罗之家：骨状阳台、一个曲窗、少量碎瓷块 | 珊瑚红、孔雀蓝、金黄 | 全立面马赛克细节、真实街景、活龙、狂欢节服装 |
| HAND | 温厚固执；抱旧砖瓦，工具袋为次要形状，砖缝冒一枚小芽 | 宁波历史博物馆：倾斜大墙、一个深开口、三条旧砖带 | 砖褐、瓦灰、靛蓝、苔绿小点 | 一砖一瓦写实、摄影天空、家庭砖墙、多个植物 |

## 面部差异矩阵

同一抽象层级不等于相同五官。以下是表演方向，不是身份或群体刻板印象：

| 人格 | 独立脸型与眉眼节奏 | 表情重点 |
| --- | --- | --- |
| GRID | 纵长棱角脸、窄而半垂的眼、眉峰一高一低 | 冷静审视与轻微嫌弃 |
| ROOT | 宽而柔和的梯形脸、眼角微弯、眉线舒展 | 温暖、耐心、安静固执 |
| MASS | 方下颌与较低额头、粗直眉、眼神向侧下方 | 表面强硬、眼底保护欲 |
| VOID | 窄菱形脸、低垂眼、眉线平缓、嘴形极简 | 安静、专注、不冷漠 |
| TECH | 紧凑三角脸、眼距略宽、眉眼不对称上扬 | 发现系统机关时的兴奋 |
| FLOW | 锐利楔形脸、高眉、张开但仍图形化的眼、斜向笑口 | 狂喜、速度与创造性越界 |
| ORNA | 心形或宽颧脸、弧形眉、眨眼或侧视 | 舞台感、自得、迷人幽默 |
| HAND | 柔和六边形的成熟脸、短弯眉、沉静眼神 | 对材料的亲近、温厚与固执 |

生成时不得把某一人格的脸直接迁移到另一人格，也不得仅靠更换发型、肤色或服装制造差异。

## 后置验收

任一硬失败出现即淘汰，不以总分抵消：

1. 人脸或皮肤呈半写实、写实或 3D 质感
2. 建筑比人物更抢眼，或人物小于画面高度 60%
3. 背景出现高频纹理：逐片树叶、逐块砖、密集螺栓、真实反射、材料毛孔
4. 不属于平面二维切纸／矢量感角色家族
5. 多人物、文字、标志、水印、重复肢体或核心道具不可读
6. 6:5 画幅和移动端安全区失败
7. FLOW 轨迹像魔法；ORNA 变成细节堆砌；HAND 变成建筑摄影
8. 两张以上人物明显共用同一脸型与五官模板，仅更换发型、肤色或服装

通过硬门后按 100 分评分：

| 维度 | 分值 | 通过标准 |
| --- | ---: | --- |
| 二维抽象与非写实 | 25 | 人脸、衣物、建筑都由大块平面构成 |
| 系列角色语法 | 20 | 八张的抽象程度、头身和手部像同一世界，同时每张脸都可区分 |
| 简洁与留白 | 20 | 主次明确，背景低频，手机缩略图仍清楚 |
| 人格可读性 | 15 | 不看标题也能由表情、动作、道具猜到人格 |
| 建筑可识别且次要 | 10 | 轮廓锚点正确，不靠写实细节识别 |
| 配色纪律 | 10 | 6–8 色内，强调色单一、稳定 |

单图总分至少 85；八图联系人总览必须整体通过；最后还要在 390px 结果页、4:5 分享卡和首页切片中复核。

## 生产顺序

1. 先生成 GRID、ROOT、FLOW，分别覆盖冷静、温暖、极端动态三个边界
2. 三张同时通过后再生成 MASS、VOID、TECH、ORNA、HAND
3. 所有候选保存到 `public/images/characters-v3/`，不覆盖 V2
4. 生成提示词、源文件路径、输出文件、评分与修改记录写入 `generation-manifest.json`
5. 八张均通过后才修改页面资产引用
