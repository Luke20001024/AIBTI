# AIBTI V3 建筑师人物风格化补充探索

状态：离线概念验证；不接入页面，不替换 `public/images/architects/` 中的资料照片。

## 任务目标

验证 AIBTI V3 人格角色的二维几何语言，能否迁移到真实建筑师人物，同时满足三件事：

1. 在手机缩略图中仍能辨认人物；
2. 明显属于 AIBTI 的扁平切纸角色宇宙，但只做轻度卡通化；
3. 尊重真人及合作者署名，不依赖夸大五官、年龄、性别或文化特征制造“性格”。

本轮只做四张候选，不做八位建筑师全量生产：

| 候选 | 人物 | 验证重点 | 构图方向 |
| --- | --- | --- | --- |
| `zaha-v1` | Zaha Hadid | 成熟女性单人肖像、身份保真、克制风格化 | 腰部以上、安静收藏卡式肖像 |
| `zaha-v2` | Zaha Hadid | 同一人物的动作版、仍保持身份一致 | 近全身、卷图与非发光曲线 |
| `mies-v1` | Ludwig Mies van der Rohe | 老年男性、经典姿态、避免写实和恶搞 | 三分之二坐姿、克制的雪茄手势 |
| `wang-lu-v1` | Wang Shu × Lu Wenyu | 双人同框、脸型差异、合作者平权 | 同尺度并立、材料样本作为道具 |

## 与人格角色规范的关系

继承 `persona-image-direction.md`：

- 原创扁平二维编辑插画；
- 矢量感切纸与丝网印刷式几何；
- 大块哑光色面、清楚轮廓、微弱且均匀的纸张颗粒；
- 6:5 横向画幅、移动端安全区、人物主导、建筑次要；
- 6–8 个主色，不使用摄影、PBR、3D、电影光、渐变、景深或高频材质；
- 无文字、Logo、UI、边框和水印。

为真实建筑师替换以下规则：

- 人格角色的“无真人相似”改为“以指定资料肖像为身份锚点”；
- 面部允许 8–13 个大色面，以保留成熟年龄与辨识度，但不得回到半写实；
- 表情强度低于人格角色，优先保留神态、头发轮廓、脸型、眼距、鼻颌关系与经典姿态；
- 不把真实性建立在皮肤纹理、皱纹、发丝、光泽、摄影背景或写实眼睛上；
- 不添加未经资料支持的个人符号，不模仿现成商业角色体系。

## 真人与合作者边界

- 只做尊重人物的风格化，不讽刺、不丑化、不做医学化或性格诊断；
- 不夸大年龄、族裔、性别或身体特征；
- Mies 的雪茄只作为既有肖像姿态锚点，不强化烟雾、不做吸烟宣传；
- Wang Shu 与 Lu Wenyu 必须同尺度、同视觉权重、同抽象层级，不使用师生、主从或夫妻式构图暗示；
- 本轮引用的建筑师照片只用于原型期身份参考。生成结果在公开或商业使用前，仍需复核原始照片来源、肖像/版权风险、人物语境与署名方式。

## 通用生成提示词

```text
Use case: style-transfer / identity-preserve
Asset type: offline AIBTI architect-character exploration, 6:5 landscape concept image

Input images:
Image 1 is the project-owned AIBTI V3 style anchor. Use only its flat 2D cut-paper geometry, mature adult abstraction, matte large color planes, crisp silhouette, faint uniform paper grain, limited palette and clean negative space. Do not copy its exact character, pose, clothing, building or layout.
Image 2 is the named architect identity reference. Preserve the explicitly listed identity anchors and restyle rather than reproduce the photograph.

STYLE LOCK:
Original flat 2D editorial illustration, vector-like cut paper and restrained screen-print geometry. Face uses a small number of broad flat polygon planes, graphic eyes, one simplified nose plane, one simple mouth, and minimal age cues. Hair is one solid silhouette with only a few large internal facets. Clothing uses broad matte planes and no realistic folds. Character and architecture share one deliberately drawn graphic world.

COMPOSITION:
Exact 6:5 landscape. Mobile-safe head and hands. Single-person character occupies about 68–74% of frame height; a two-person partnership uses equal scale and visual weight. Preserve quiet negative space. Architecture, if present, is reduced to 4–8 large planes and remains secondary.

CONSTRAINTS:
Respectful real-person likeness with controlled light cartoonization. No ridicule, grotesque exaggeration, stereotype, age mockery, beauty retouching, commercial-character imitation, text, letters, logos, UI, border or watermark.

HARD AVOID:
Photorealism, semi-realistic painted face, 3D render, CGI, PBR, glossy clay, realistic eyes, skin pores, individual hair strands, detailed wrinkles, anime, chibi, kawaii, child proportions, cinematic lighting, gradients, glow, haze, depth of field, busy architectural scenery and high-frequency material texture.
```

## 候选变量

### `zaha-v1`

- 身份锚点：成熟脸型、眼距与注视、肩长波浪发轮廓、克制神情、深色建筑感服装；
- 动作：轻微三分之二转身，双手仅少量出现；
- 背景：暖纸白与 2–3 条极安静的浅灰连续空间带；
- 配色：暖纸白、近黑、炭灰、暖肤色、石灰、极少深酒红；
- 禁止：时尚广告式美化、戏剧化怒目、波浪建筑抢主体。

### `zaha-v2`

- 身份锚点与 `zaha-v1` 相同；
- 动作：近全身不对称站姿，一手持单卷黑色图纸，一手画一条不发光的连续曲线；
- 建筑符号：一个白色连续壳体与一个深色切口，共 4–6 大面；
- 配色：暖纸白、近黑、炭灰、暖肤色、骨白、深紫、极少橙色；
- 禁止：超级英雄站姿、魔法光带、建筑渲染、夸张癫狂。

### `mies-v1`

- 身份锚点：宽阔秃顶、两侧白发、半垂眼、显著鼻颌、黑西装、白领口、手抵嘴边的经典雪茄姿态；
- 动作：三分之二坐姿，另一只手自然放在膝上；
- 建筑符号：巴塞罗那馆薄屋顶、两根细柱、绿墙与浅蓝水面，共不超过 6 大面；
- 配色：暖纸白、近黑、炭灰、白、暖肤色、暗绿、浅蓝、极少锈红；
- 禁止：密集皱纹、烟雾云、写实大理石、吸烟广告感、老年恶搞。

### `wang-lu-v1`

- Wang Shu 身份锚点：灰色后梳发、矩形眼镜、较宽圆脸、深色叠穿外套；
- Lu Wenyu 身份锚点：短黑发整体轮廓、较窄脸、深色外套与暖红内搭；
- 动作：并肩且微微朝向对方；Wang Shu 持一片旧瓦，Lu Wenyu 持一块折叠材料样本或小砖片；
- 建筑符号：宁波历史博物馆斜墙、深开口与三条旧材料带；
- 配色：暖纸白、近黑、炭灰、暖肤色、瓦灰、砖褐、靛蓝、克制暖红；
- 禁止：同脸模板、图书馆摄影背景、主从站位、情侣姿态、逐砖纹理。

## 后置验收

任一项出现即淘汰：

1. 半写实/写实脸、皮肤、眼睛或发丝；
2. 只像“泛建筑师”，无法辨认指定人物；
3. 恶搞、丑化、年龄夸张或群体刻板印象；
4. 建筑或道具抢过人物，背景出现高频纹理；
5. 人物小于画面高度 60%，或头、手、关键道具不在移动端安全区；
6. 双人图同脸、主从、尺寸失衡或合作者署名语义失败；
7. 文字、Logo、水印、多余人物、重复肢体或不可读手部。

通过硬门后按 100 分评分：

| 维度 | 分值 | 通过标准 |
| --- | ---: | --- |
| 真人身份辨识 | 25 | 不依赖照片纹理，仍可由脸型、神态、头发与姿态辨认 |
| 二维抽象与非写实 | 20 | 脸、衣物、建筑均由大块平面构成 |
| AIBTI 系列语法 | 15 | 与 V3 人格角色共享几何、比例、纸感与轮廓纪律 |
| 尊重与非讽刺 | 15 | 无夸张丑化、年龄/群体刻板印象和语境误导 |
| 简洁与移动端可读 | 15 | 主次明确、背景低频，390px 缩略图仍清楚 |
| 建筑/道具叙事 | 10 | 有人物职业语义，但不遮蔽身份与主体 |

单图建议达到 85 分后，才进入页面构图模拟；本轮不进行页面构图模拟和线上替换。

## 下一轮决策

`[已确认：2026-08-26]` 用户选择 Zaha A（`zaha-v1`）与 Mies A（`mies-v1`）作为全量建筑师的资料肖像型母版。后续 Wright、Le Corbusier、Ando、Foster、Gaudí 与 Wang Shu × Lu Wenyu 按 `architect-portrait-production-plan.md` 执行“逐人提示词 → 逐张生成 → 单图 review → 全量联系人总览 review”，不再以 `zaha-v2` 的全身动作型作为系列基线。
