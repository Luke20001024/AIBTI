# VOID V2 · Asset Inventory

> 状态：V3 静态编辑版生产资产冻结
>
> 运行时只使用 public/images/void-v2 下的资产；docs/design/void-v2/assets-source 保留无损生成源

## 运行时资产

| 路径 | 原生尺寸 | 角色 | Crop / object-position | Overlay | 优先级 | Alt |
| --- | --- | --- | --- | --- | --- | --- |
| public/images/void-v2/persona/void-persona.webp | 900×1350 RGBA | 同一 VOID 人物透明切图 | contain；right bottom；首屏允许下摆裁切，不裁脸 | 无 | P0 / 首屏 preload | VOID 人格人物侧身望向光线 |
| public/images/void-v2/persona/void-hero-cross.webp | 900×1352 | 首屏与分享背景 | cover；center right | 无颜色覆盖；只允许边缘遮罩 | P0 / 首屏 | 混凝土厚墙被十字光切开 |
| public/images/void-v2/reactions/light.webp | 900×1200 | 光反应背景 | cover；center | 无 | P0 | 狭缝光切开深色混凝土墙与地面 |
| public/images/void-v2/reactions/boundary.webp | 900×1950 | 边界反应背景 | cover；center 58% | 无 | P0 | 厚重混凝土墙中的深门洞与门槛 |
| public/images/void-v2/reactions/path.webp | 900×1946 | 路径反应背景 | cover；center | 无；可叠代码原生 SVG 路线 | P0 | 折返并下沉的混凝土路径最终通向一束光 |
| public/images/void-v2/style/style-anatomy.webp | 900×1950 | 三层风格剖面 | contain；center | 无 | P0 | 由结构骨架、切削混凝土与场地表层叠成的建筑剖面 |
| public/images/void-v2/architect/tadao-ando.webp | 600×752 | 安藤忠雄肖像 | cover；center 30% | 黑白原图，不加色洗 | P0 | 建筑师安藤忠雄黑白肖像 |
| public/images/void-v2/works/church-of-light.webp | 1070×803 | 切 / 光之教堂 | cover；center | 无 | P0 | 光之教堂混凝土墙上的十字光口 |
| public/images/void-v2/works/water-temple.webp | 1440×960 | 绕 / 水御堂 | cover；center 58% | 代码原生路径线 | P0 | 水御堂荷花池中央向下的混凝土楼梯 |
| public/images/void-v2/works/chichu-courtyard.webp | 960×720 | 藏 / 地中美术馆 | cover；center | 无 | P0 | 地中美术馆下沉混凝土庭院 |
| public/images/void-v2/lineage/kahn-mass.webp | 900×1350 | 康：重量与秩序 | cover；center | 无 | P1 / lazy | 厚重墙体、深门洞与受控日光构成的秩序空间 |
| public/images/void-v2/lineage/zumthor-atmosphere.webp | 900×1946 | 卒姆托：材料与气氛 | cover；center 55% | 无 | P1 / lazy | 深色石材、水面与暖光构成的触觉空间 |
| public/images/void-v2/works/details/church-light-detail-cross.webp | 原版原型尺寸 | 光之教堂十字光细节 | cover；center | 无 | P1 / lazy | 光之教堂内部十字形开口的光照入混凝土空间 |
| public/images/void-v2/works/details/church-light-exterior.webp | 原版原型尺寸 | 光之教堂外部 | cover；center | 无 | P1 / lazy | 光之教堂外部十字开口嵌入清水混凝土墙面 |
| public/images/void-v2/works/details/water-temple-pond.webp | 原版原型尺寸 | 水御堂荷花池 | cover；center | 无 | P1 / lazy | 水御堂的椭圆荷花池与水面边界 |
| public/images/void-v2/works/details/water-temple-interior.webp | 原版原型尺寸 | 水御堂朱红空间 | cover；center | 无 | P1 / lazy | 水御堂内部被夕阳照亮的朱红礼拜空间 |
| public/images/void-v2/works/details/chichu-entry.webp | 原版原型尺寸 | 地中美术馆入口 | cover；center | 无 | P1 / lazy | 地中美术馆被树木与地形遮蔽的入口路径 |
| public/images/void-v2/works/details/chichu-art-museum.webp | 原版原型尺寸 | 地中美术馆补充角度 | cover；center | 无 | P1 / lazy | 地中美术馆的地下空间与自然光 |
| public/images/void-v2/further/modern-fort-worth.jpg | 原版原型尺寸 | 延伸作品：沃思堡 | 16:10 cover | 无 | P2 / lazy | 沃思堡现代艺术博物馆的水面、平顶展馆与 Y 形混凝土柱 |
| public/images/void-v2/further/2121-design-sight.jpg | 原版原型尺寸 | 延伸作品：21_21 | 16:10 cover | 无 | P2 / lazy | 21_21 DESIGN SIGHT 的折叠钢屋顶贴近草坡 |

## 加载策略

- 首屏只 preload void-hero-cross.webp 与 void-persona.webp；
- 其余图片进入视口前保持浏览器原生 lazy loading；
- 三种反应与三座作品全部静态输出，除首屏外统一使用浏览器原生 lazy loading；
- 手机端显示宽度不超过 430px，但保留约 2× 像素密度；
- 概念 PNG 不进入 public，不参与运行时打包；
- 不在图片上烘焙 UI 文字、按钮或状态导航。

## 来源与权利状态

### 生成资产

人物、首屏背景、三种反应背景、风格剖面和两张谱系材料图由 OpenAI 内置 ImageGen 于 2026-08-27 为 VOID V2 原型生成。它们不冒充真实建筑摄影；谱系图只解释“重量 / 秩序”和“材料 / 气氛”，不标记为具体建筑。

### 既有原型资产

- 安藤忠雄肖像：身份参考来自 Wikimedia Commons；状态为 prototype-source-noted，公开或商业使用前复核肖像语境、作者与许可；
- 光之教堂：原型图像来源记录为 Wikimedia Commons · Church of the Light；
- 水御堂：原型图像来源记录为 JNTO · Honpukuji Water Temple；
- 地中美术馆：内容依据 Benesse Art Site Naoshima；当前局部图用于本地原型，公开前必须补齐原始图页、摄影者和授权状态。
- V3 细节图与两张延伸作品图只读复制自原版本地原型资产，不修改原版文件；其作者、原始图页与许可状态沿用原版记录，公开前仍需逐图复核。

页面末尾必须保留“查看测试方法与图片来源”入口。V2 不得把原型来源状态改写成已获商业授权。

## 生产资产验证

- void-persona.webp 已验证为 RGBA，Alpha extrema 为 0–255，四角透明；
- 运行时 12 张图像总量约 2.1MB；
- 人物约 91KB，首屏背景约 121KB；
- 源 PNG 保留在 docs/design/void-v2/assets-source；
- 不允许从概念截图再次裁切资产。
