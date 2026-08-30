# ArcBTI 新增 8 人格首屏生成记录

模式：内置图像生成 + 确定性中文排版 + 单张 PNG 扁平化

## 共用生成约束

- 使用当前八人格总览作为系列风格参考，不复制现有角色
- 生成阶段不包含任何文字、Logo、数字或标识
- 人物为虚构成人，不复制代表建筑师面孔
- 人脸由 6—10 个主要多边形面组成
- 保留上方约 34% 的文字安全区
- 建筑母题清楚可读，但不复刻具体建筑作品
- 最终中文由 `scripts/build-persona-posters.py` 排入并扁平化

## 生成结果

| 人格 | 无字艺术源 | 最终海报 | 选择与修订 |
| --- | --- | --- | --- |
| SPAN | `generated-art/SPAN-art-v1.png` | `public/images/personas/span/hero-poster-v1.png` | 初稿通过，身体与拉索共同形成受力图 |
| EAVE | `generated-art/EAVE-art-v1.png` | `public/images/personas/eave/hero-poster-v1.png` | 初稿通过，屋顶与双臂形成召集动作 |
| TIDE | `generated-art/TIDE-art-v2.png` | `public/images/personas/tide/hero-poster-v1.png` | V2 降低写实五官，保留水路和梯田 |
| RUIN | `generated-art/RUIN-art-v2.png` | `public/images/personas/ruin/hero-poster-v1.png` | V2 放大角色，并增加顶部浅色编辑区保证文字可读 |
| SIGN | `generated-art/SIGN-art-v1.png` | `public/images/personas/sign/hero-poster-v1.png` | 初稿通过，年长女性角色、箭头与断裂山墙形成符号反差 |
| VEIL | `generated-art/VEIL-art-v1.png` | `public/images/personas/veil/hero-poster-v1.png` | 初稿通过，人物穿过三层透明边界 |
| PLUS | `generated-art/PLUS-art-v1.png` | `public/images/personas/plus/hero-poster-v1.png` | 初稿通过，女性角色将冬季花园推出旧立面 |
| MIX | `generated-art/MIX-art-v1.png` | `public/images/personas/mix/hero-poster-v1.png` | 初稿通过，程序块与环路保持高密度但有主次 |

## 排版源

- 文案与强调色：`poster-production-manifest.json`
- 排版脚本：`scripts/build-persona-posters.py`
- 总览脚本：`scripts/build-persona-contact-sheet.py`

## 视觉验收结论

- 16 图具有统一的窄体英文 Code、中文标题层级、纸张纹理和低多边形人物体系
- 新增组包含女性、中性、男性以及不同年龄角色，没有依靠妆容和服装刻板标记性别
- 每张新人格使用一个主要动作隐喻，未出现多人物、额外肢体或建筑作品照片冒充概念背景
- RUIN 的文字对比已二次修订
- MIX 的面部微笑细节在原图较明显，但在 390px 海报缩放中不构成第二视觉焦点，保留进入整页复验
