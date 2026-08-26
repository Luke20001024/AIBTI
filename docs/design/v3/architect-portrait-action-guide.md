# AIBTI 建筑师肖像全量生产与主任务替换行动指南

状态：已执行完成并冻结（2026-08-27，本地主任务已替换，未部署线上）
目的：减少长任务目标漂移。每次继续执行前，先读取本文件、`architect-portrait-production-plan.md` 与 `architect-portrait-production-manifest.json`。

## 1. 唯一目标

以用户确认的 Zaha A（`zaha-v1`）和 Mies A（`mies-v1`）为肖像母版，完成 AIBTI 首发 8 组建筑师/搭档的统一风格化肖像；逐张通过身份、风格、尊重性、构图和移动端验收后，将全套版本化图片替换到主任务的所有建筑师肖像引用中，并完成代码、构建和八型结果页 QA。

首发 8 组对象固定为：

1. Ludwig Mies van der Rohe
2. Frank Lloyd Wright
3. Le Corbusier
4. Tadao Ando
5. Norman Foster
6. Zaha Hadid
7. Antoni Gaudí
8. Wang Shu × Lu Wenyu

除非用户明确追加，不增加人物、不改变人物映射、不拆分 Wang Shu × Lu Wenyu。

## 2. 最终完成定义

同时满足以下条件才可宣告完成：

- 8 组肖像全部存在，每组有原始生成版、1200×1000 审阅版和生产 WebP；
- 每张无硬失败且人工评分至少 85/100；
- 4×2 总览与 390px 移动端预览整体通过，没有明显的写实度、人物尺度、背景复杂度或色彩漂移；
- 生产图片位于 `public/images/architects-v2/`，不覆盖 `public/images/architects/` 原始身份参考照片；
- `src/content/architects.ts` 的 8 个 `portrait.src` 全部切换到 `/images/architects-v2/*.webp`；
- 8 个肖像的 `alt` 从“资料照片”语义更新为“风格化人物插画”语义；
- 身份参考来源仍可追溯，但页面不得把风格化生成图误称为原机构直接发布的资料照片；
- 代码搜索确认运行时代码不再引用 `/images/architects/`；文档和生成清单可继续引用原图作为身份参考；
- 类型检查、单元测试、生产构建通过；
- 8 个结果页均完成桌面和 390px 宽移动端目视检查；
- 不修改计分逻辑、人格内容、建筑照片、人格主视觉、分享卡逻辑或部署配置。

## 3. 不可变设计规则

### 3.1 母版锁定

- 只采用 Zaha A / Mies A 的资料肖像型语言；
- `zaha-v2` 的全身动作型不进入本轮全量基线；
- 单人统一为胸像、腰部以上或三分之二坐姿；双人统一为腰部以上并肩肖像；
- 身份辨识优先于动作、建筑和装饰。

### 3.2 画风锁定

- 平面二维编辑插画、矢量感切纸、宽大哑光多边形；
- 面部 8–13 个大切面；年龄用少量结构面表达，不画密集皱纹；
- 发型和胡须使用连续色块，不画发丝；
- 暖纸白底、轻微均匀纸纹、6–8 个主色；
- 建筑只保留 3–6 个低对比大面，永远次于人物；
- 禁止摄影感、半写实绘画、3D、PBR、电影光、景深、渐变、密集材质和文字。

### 3.3 真人与署名锁定

- 不恶搞、不丑化、不夸大年龄、族裔、性别或身体特征；
- 不将道具变成笑点或营销符号；
- Wang Shu 与 Lu Wenyu 同尺度、同对比、同清晰度、同视觉权重，不允许前后主从、师生或情侣化构图；
- 原始肖像仅作为身份参考。公开或商业使用前仍需复核原照片版权、摄影署名与肖像语境。

## 4. 固定执行阶段

阶段必须按顺序推进，不跨门：

### Phase A — Prompt 固化

输入：Zaha A、Mies A、8 组身份参考图。
输出：`architect-portrait-production-plan.md`。
通过条件：统一母提示词、逐人身份锚点、姿态、建筑符号、配色、禁止项、重生规则均明确。

当前状态：已完成。

### Phase B — 逐张生成

顺序固定：Wright → Le Corbusier → Ando → Foster → Gaudí → Wang Shu × Lu Wenyu。

每位执行循环：

1. 读取该人物变量；
2. 调用一次内置 `image_gen`；
3. 将原始结果复制为 `*-raw.png`；
4. 非破坏性裁切/缩放为 1200×1000 `*.png`；
5. 立即进入 Phase C 单图 review；
6. 通过后才生成下一位。

网络失败不算设计失败；记录尝试次数后可以重试内置工具。不得未经用户明确同意切换到 CLI/API，也不得为了凑齐数量使用无参考图的泛化人物。

若多图上传连续出现网络失败，允许把 Zaha A 与 Mies A 非破坏性合成一张低体积并排参考板，再与单张身份图共同输入。该措施只能优化传输，不得改变母版内容、人物变量或验收标准。

### Phase C — 单图 Review 与定向重生

硬失败沿用生产计划。每张必须记录：

- 身份辨识 25；
- 二维抽象 20；
- 系列语法 15；
- 尊重与非讽刺 15；
- 简洁与移动端可读 15；
- 建筑叙事 10。

低于 85 或出现硬失败时只允许单变量修正：身份、写实度、人物尺度、背景复杂度或双人平权之一。不得同时重写整套提示词，不得因单张失败改变 Zaha A / Mies A 母方向。

### Phase D — 全套 Review

输出：

- `artifacts/design/architect-character-exploration/architect-portraits-all.png`
- `artifacts/design/architect-character-exploration/architect-portraits-mobile-390.png`

检查：

- 8 图人物阅读距离相近；
- 面部抽象程度一致；
- 黑/深色服装占比没有造成八张同质化；
- 每人仍由脸型、发型、姿态和小色彩重音区分；
- 建筑不抢人；
- Wang Shu × Lu Wenyu 在总览中没有被缩成一张信息过密的例外。

全套不通过时只返修具体失败图，不整体重做已通过图片。

### Phase E — 生产资产

创建版本化目录：`public/images/architects-v2/`。

固定映射：

| 建筑师 ID | 生产文件 |
| --- | --- |
| `ARCH-MIES` | `mies.webp` |
| `ARCH-WRIGHT` | `wright.webp` |
| `ARCH-CORBU` | `le-corbusier.webp` |
| `ARCH-ANDO` | `ando.webp` |
| `ARCH-FOSTER` | `foster.webp` |
| `ARCH-ZAHA` | `zaha.webp` |
| `ARCH-GAUDI` | `gaudi.webp` |
| `ARCH-WANG-LU` | `wang-lu.webp` |

生产规格：

- 1200×1000 WebP；
- 保持 6:5；
- 优先控制在 250 KB 内，任何单图不得超过 350 KB；
- 不从 `$CODEX_HOME/generated_images` 直接被页面引用；
- 原始 PNG 与审阅 PNG 留在 `artifacts/design/architect-character-exploration/`。

### Phase F — 主任务替换

已确认主任务运行时入口：

- 数据源：`src/content/architects.ts`
- 消费页面：`src/app/result/[slug]/page.tsx`
- 资源存在性测试：`src/domain/scoring.test.ts`

执行：

1. 将 8 个 `portrait.src` 切换到 `/images/architects-v2/*.webp`；
2. 将 8 个 `portrait.alt` 更新为具体、尊重且明确的“风格化人物插画”描述；
3. 保留身份参考 URL；必要时将来源标签改成“风格化肖像身份参考 · …”；
4. 将结果页固定文案“资料图源”改成准确的“肖像身份参考”；
5. 搜索运行时代码，确保不存在遗留 `/images/architects/` 引用；
6. 不删除旧照片，以便回滚和继续追溯身份参考。

### Phase G — 验证与交付

自动验证：

- JSON 清单解析；
- 8 张生产图存在、尺寸和文件大小正确；
- 类型检查；
- 单元测试；
- 生产构建；
- 运行时代码旧路径零引用。

浏览器验证：

- 8 个结果页逐一打开；
- 桌面宽度检查人物、建筑师姓名、说明与来源标注；
- 390px 宽检查裁切、清晰度、CLS、溢出和文字层级；
- 至少保存一张八型页面证据总览或逐页截图清单。

只有 Phase G 通过后才汇报“已全部替换”。本轮不部署线上，除非用户另行明确要求。

## 5. 防漂移检查表

每次继续工作前回答以下六项；若答案变化，必须先更新本指南或向用户说明：

1. 当前唯一目标是否仍是“8 组建筑师肖像全量完成并替换主任务引用”？
2. 当前阶段是什么？上一阶段验收门是否已通过？
3. Zaha A / Mies A 母版方向是否保持不变？
4. 是否只处理本阶段允许的文件与图片？
5. 是否出现需要用户新增授权的动作（CLI/API、部署、删除旧资产）？
6. 当前剩余未通过对象、失败原因和下一次单变量动作是什么？

## 6. 状态与日志唯一来源

- 设计规则：`docs/design/v3/architect-portrait-production-plan.md`
- 长任务行动指南：本文件
- 机器可读状态：`docs/design/v3/architect-portrait-production-manifest.json`
- 单图与全套评审：后续追加到 `docs/design/v3/architect-portrait-production-review.md`
- 审阅图片：`artifacts/design/architect-character-exploration/`
- 生产图片：`public/images/architects-v2/`

不得以聊天记忆代替这些文件。任何重生、分数、失败、路径变更和集成状态都必须写回清单或评审文件。

## 7. 回滚策略

- 不覆盖或删除 `public/images/architects/`；
- 新生产图全部进入 `public/images/architects-v2/`；
- 若页面 QA 失败，只需将 `src/content/architects.ts` 的路径恢复到旧目录即可回滚；
- 不使用 `git reset --hard`、`git checkout --` 或其他会覆盖用户现有工作的命令；
- 仓库中的其他未提交修改视为用户工作，不纳入本任务，也不回退。
