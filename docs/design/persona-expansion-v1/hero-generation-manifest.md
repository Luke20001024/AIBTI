# 八人格首屏视觉生成清单

本文件记录首屏可见文案、参考图和生成状态。所有概念图只进入本目录，不接入正式页面

## 共用参考

- 信息结构基准：`public/images/void-v2/persona/void-hero-poster-v4.png`
- GRID 动作参考：`public/images/characters-v3/grid-scene-v3.webp`
- ROOT 动作参考：`public/images/characters-v3/root-scene-v3.webp`
- MASS 动作参考：`public/images/characters-v3/mass-scene-v3.webp`
- TECH 动作参考：`public/images/characters-v3/tech-scene-v3.webp`
- FLOW 动作参考：`public/images/characters-v3/flow-scene-v3.webp`
- ORNA 动作参考：`public/images/characters-v3/orna-scene-v3.webp`
- HAND 动作参考：`public/images/characters-v3/hand-scene-v3.webp`

## 输出

| 人格 | 文件 | 状态 | 备注 |
| --- | --- | --- | --- |
| VOID | `public/images/void-v2/persona/void-hero-poster-v4.png` | 基准通过 | 不重新生成 |
| GRID | `concepts/GRID-hero-v1.png` | 视觉验收通过 | 丁字尺、红方块、巴塞罗那馆 |
| ROOT | `concepts/ROOT-hero-v1.png` | 视觉验收通过 | 苔石、悬挑平台、水流 |
| MASS | `concepts/MASS-hero-v1.png` | 视觉验收通过 | 抱臂、红花、马赛公寓体量 |
| TECH | `concepts/TECH-hero-v1.png` | 视觉验收通过 | 爆炸结构模型、外露桁架 |
| FLOW | `concepts/FLOW-hero-v1.png` | 视觉验收通过 | 动态身体、连续白壳、非发光轨迹 |
| ORNA | `concepts/ORNA-hero-v1.png` | 视觉验收通过 | 陶瓷龙、骨状阳台、少量彩色工艺 |
| HAND | `concepts/HAND-hero-v1.png` | 视觉验收通过 | 旧砖瓦、嫩芽、倾斜材料墙 |

## 文案锁

### GRID

`GRID` / `一毫米的秩序` / `你会先看见哪里没对齐` / `世界一归位，你才开始放心` / `比例 / 接缝 / 结构脑` / `现代主义 × 国际主义 × 理性秩序`

### ROOT

`ROOT` / `地形的回声` / `你会先听风、水和地面怎么说` / `房子长对地方，比长得漂亮更重要` / `地形 / 气候 / 共生` / `有机建筑 × 草原学派 × 场所精神`

### MASS

`MASS` / `重量的温度` / `你把关心做成承重结构` / `嘴上不说，公共屋顶都替人留好了` / `体量 / 诚实 / 集体` / `现代主义 × 粗野主义源流 × 集体住宅`

### TECH

`TECH` / `系统的浪漫` / `你看建筑，先看它怎么运行` / `结构敢露出来，升级路线也得留出来` / `系统 / 装配 / 可升级` / `高技派 × 结构表现 × 环境技术`

### FLOW

`FLOW` / `直线失效以后` / `你不接受空间原地站好` / `地面、墙和屋顶最好一起起跑` / `速度 / 连续 / 越界` / `解构主义 × 新未来主义 × 流动空间`

### ORNA

`ORNA` / `万物都想上场` / `你相信日常值得认真演一场` / `结构、色彩和故事，都该有自己的戏份` / `戏剧 / 手工 / 想象` / `加泰罗尼亚现代主义 × 新艺术 × 总体艺术`

### HAND

`HAND` / `材料记得一切` / `你会先问这块砖从哪里来` / `旧材料一开口，城市就有了记忆` / `材料 / 手工 / 时间` / `批判性地域主义 × 材料再生 × 在地建造`

## 生成方式

- 模式：内置图像生成
- 意图：新图生成，参考图只负责结构、人物动作和角色语法
- 每个人格单独调用一次，不用一个提示词批量换色
- 初稿生成后逐张使用原尺寸视觉检查
- 文案错误、构图失败或主题漂移时只做单一问题迭代

完整提示词结构与人格变量见 [首屏图像提示词集](./hero-prompt-set.md)

最终验收依据见 [首屏视觉验收记录](./visual-qa.md)
