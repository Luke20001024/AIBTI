# ArcBTI 16 人格索引实施清单

状态：索引结构已建立，新增 8 张首图生成后替换对应主题骨架

## 本地路由

- 人格索引：`/result/`
- 人格详情：`/result/{slug}/`

## 移动端结构

- 四个家族垂直排列
- 每个家族四张人格卡，使用 `2 × 2` 排列
- 卡片提供人格 Code、人格名、建筑语言和一句判断
- 主图采用裁切后的首屏海报，完整海报进入对应结果页

## 桌面结构

- 每个家族保持一行四张
- 四行共同构成内容上的 `4 × 4` 人格地图

## 首图接入状态

| 人格 | 资产状态 | 路径 |
| --- | --- | --- |
| GRID | 已接入当前验收版 | `/images/personas/grid/hero-poster-v1.png` |
| SPAN | 已接入新增首图 | `/images/personas/span/hero-poster-v1.png` |
| MASS | 已接入当前验收版 | `/images/personas/mass/hero-poster-v1.png` |
| TECH | 已接入当前验收版 | `/images/personas/tech/hero-poster-v1.png` |
| VOID | 已接入当前验收版 | `/images/personas/void/hero-poster-v1.png` |
| ROOT | 已接入当前验收版 | `/images/personas/root/hero-poster-v1.png` |
| EAVE | 已接入新增首图 | `/images/personas/eave/hero-poster-v1.png` |
| TIDE | 已接入新增首图 | `/images/personas/tide/hero-poster-v1.png` |
| RUIN | 已接入新增首图 | `/images/personas/ruin/hero-poster-v1.png` |
| HAND | 已接入当前验收版 | `/images/personas/hand/hero-poster-v1.png` |
| SIGN | 已接入新增首图 | `/images/personas/sign/hero-poster-v1.png` |
| ORNA | 已接入当前验收版 | `/images/personas/orna/hero-poster-v1.png` |
| VEIL | 已接入新增首图 | `/images/personas/veil/hero-poster-v1.png` |
| FLOW | 已接入当前验收版 | `/images/personas/flow/hero-poster-v1.png` |
| PLUS | 已接入新增首图 | `/images/personas/plus/hero-poster-v1.png` |
| MIX | 已接入新增首图 | `/images/personas/mix/hero-poster-v1.png` |

## 16 图视觉索引

- `artifacts/qa/persona-expansion-16-v1/sixteen-persona-contact-sheet-v1.png`
- 画布按规划矩阵排列为 4 列 × 4 行
- 现有 8 张维持原验收版，新 8 张使用同一低多边形编辑插画体系


## 验收视口

- `390 × 844`：iPhone 14 / 15 级别 CSS 视口
- `393 × 873`：Pixel 7 级别 CSS 视口
- `430 × 932`：大屏 iPhone 级别 CSS 视口
- `1440 × 1000`：桌面 4 列总览
