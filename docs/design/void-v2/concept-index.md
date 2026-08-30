# VOID V3 · 概念图片索引

> 状态：V3 静态编辑版视觉概念冻结
>
> 设计母版：390 × 844 手机端
>
> 原则：概念图是布局与视觉规格，不作为生产 UI 截图；所有文字与控件保持代码原生

实施后的逐模块差异与待验项见 [fidelity-ledger.md](./fidelity-ledger.md)。

P0 / P1 / P2 内容重构与 390 × 844 生产构建验收见 [v6-content-restructure-and-visual-acceptance.md](./v6-content-restructure-and-visual-acceptance.md)。

## 索引

| 编号 | 主题 | 文件 | 状态 | 实施时锁定的判断 |
| --- | --- | --- | --- | --- |
| C01 | 人格封面 | concepts/C01-persona-cover.png | FINAL | 人物是第一主体；VOID、人格判断与风格构成首屏可见 |
| C02-A | 空间反应：光 | concepts/C02-A-light.png | FINAL | 光缝与明暗断层解释判断；状态控制不做播放器 |
| C02-B | 空间反应：边界 | concepts/C02-B-boundary.png | FINAL | 厚墙、门槛与进入前的停顿可被身体理解 |
| C02-C | 空间反应：路径 | concepts/C02-C-path.png | FINAL | 折返、下沉与延迟揭示形成独立空间逻辑 |
| C03 | 反误读与暗面 | concepts/C03-shadow.png | FINAL | 同一人物近景回归；反标签句成为第二传播峰值 |
| C04 | 风格剖面 | concepts/C04-style-anatomy.png | FINAL | 现代主义、极简主义倾向、批判性地域主义分别承担骨架、方法、校正 |
| C05 | 建筑师证据 | concepts/C05-architect-proof.png | FINAL | 安藤忠雄以“切 / 绕 / 藏”的证据出现，不做人物百科 |
| C06-A | 作品：切 | concepts/C06-A-cut.png | FINAL | 十字光先于作品信息被识别 |
| C06-B | 作品：绕 | concepts/C06-B-detour.png | FINAL | 绕过水面再向下消失形成身体路径 |
| C06-C | 作品：藏 | concepts/C06-C-bury.png | FINAL | 建筑被地面压低，只让天光暴露时间 |
| C06-L | 建筑谱系 | concepts/C06-L-lineage.png | FINAL | 康与卒姆托以两种不同材料节奏扩展 VOID，不使用头像卡 |
| C07 | 最终判词与分享 | concepts/C07-share-ending.png | FINAL | 回到同一人物身份；结尾是一张可保存人格海报 |
| C08 | 静态人格切面与空间本能 | concepts/C08-static-personality-and-instincts.png | LAYOUT ONLY | 只采用全部内容同时可见的分带方式；人物比例过大，不作为人物构图参考 |
| C09 | 静态风格与安藤证据 | concepts/C09-static-style-and-ando.png | FINAL V3 | 三层风格同时展开；反误读与完整人物故事不再隐藏 |
| C10 | 静态作品章节 | concepts/C10-static-work-chapter.png | FINAL V3 | 主图、hook、三个观察点、完整故事与细节图自然滚动可见 |

## 方向冻结

- C01 是首屏人物与建筑关系的最高优先级参考；
- 390px 首屏人物视觉宽度约为 68%–74% 视口，最大约 330px；
- 人物面部不超过视口宽度约 34%，十字光、厚墙和右侧纵向 VOID 必须保持可读；
- 人物脸部、头发和主要肩部在 360、390、430px 宽度下不得被意外裁掉；
- 后续人格与反误读章节不重复大人物构图，把视觉空间还给建筑；
- 风格构成在首屏安全区内可读，不藏进标签或详情页；
- 暖骨白与墨黑交替形成长页节奏；VOID 蓝只用于当前状态、关键词和少量基线；
- 容器以全幅图像、开放文字、建筑剖面和直线为主；
- 禁止非功能汉堡菜单、圆角卡片、胶囊、Bento、伪分数、雷达图、无意义图标阵列和蓝紫渐变；
- 禁止 tabs、slider、details、作品切换、箭头式向下指引和“查看详情”控件；
- 不从概念图裁切生产资产；生产资产见 asset-inventory.md。

## 概念 Review 结论

- C02-B 初稿中的伪造 0900 mm 已移除；
- C06-L 初稿中的汉堡菜单与无关书法已移除，并恢复同一 VOID 人物；
- 人物身份在 C01 与 C07 之间保持一致，C03 不再作为 V3 必须出现的人物场景；
- 三座作品使用同一信息骨架，但通过背景、图像比例和文字节奏避免重复卡片堆；
- C08 的过大人物和误生成操作文案被明确拒绝；
- C01、C09、C10 与 V3 文案锁共同构成当前实施规格。
