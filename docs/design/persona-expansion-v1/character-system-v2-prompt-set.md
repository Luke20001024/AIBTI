# ArcBTI 角色系统 V2 图像提示词集

## 生成模式

- 工具：内置图像生成
- 意图：精确编辑现有海报
- 方式：每张人格海报单独调用一次
- Image 1：对应人格 V1，作为编辑目标和所有版式不变量
- Image 2：GRID V1，只作为面部抽象语言参考
- 输出：V2 兄弟文件，不覆盖任何 V1

## 共用提示词骨架

```text
Use case: precise-object-edit
Asset type: ArcBTI mobile personality result hero poster, flattened single bitmap

Image 1 is the target poster and must remain the master composition
Image 2 is the GRID poster and is a facial abstraction style reference only

Change only the character face and geometric hair language unless the persona delta explicitly asks to replace the character with an adult female character

Use 6–10 large hard-edged facial planes: broad forehead plane, cheekbone plane, folded nose bridge, jaw plane, narrow dark geometric eyes and one minimal mouth line

Preserve the exact 1:2 portrait poster, all typography, wording, line breaks, architecture, props, character size, pose, palette, lighting, perspective, texture, margins and bottom lineage

Avoid photorealistic face, iris highlights, eyelashes, detailed nostrils, lips, teeth, skin texture, makeup-based gender coding, soft 3D doll shading, anime, altered Chinese text and watermark
```

## ROOT V2

```text
Keep the adult male ROOT character
Remove the complete realistic smile and detailed eyes
Let calmness come from the slightly lifted head and the way both hands hold the mossy stone
Preserve the green work jacket, waterfall, cantilevered house, forest and vertical ROOT lettering
```

## MASS V2

```text
Keep the adult male MASS character
Use a broad angular face, wide jaw plane, heavy brow plane and narrow dark eyes
Let the stern protective personality come from crossed arms, high collar and posture
Preserve the tiny red flower as the warm counterpoint
```

## TECH V2

```text
Keep the adult male TECH character
Replace the open cartoon smile with a calm, focused expression directed toward the suspended structural model
Remove teeth and complete eye anatomy
Preserve both hands, exploded truss model, exposed steel framework and teal clothing
```

## FLOW V2

```text
Replace the existing FLOW character with an adult female architectural character
Keep her strong, fast and self-directed while leaping diagonally through the flowing white architecture
Use short swept-back geometric hair planes
Her gender must read through overall silhouette and character design, not through makeup
Preserve the rolled plan, raised hand, violet route, black tailored outfit and exact diagonal motion
```

## ORNA V2

```text
Keep the adult ORNA character with a masculine-to-androgynous presence
Replace the realistic smile with one restrained playful mouth line
Let theatrical confidence come from the open hand, colorful geometric outfit and ceramic dragon
Preserve the cream coat, orange trousers, bone-like balconies and teal–terracotta palette
```

## HAND V2

```text
Replace/refine the HAND character as an unmistakably adult female builder and material practitioner
Make her calm, warm, experienced and physically grounded rather than delicate
Use short or tied-back blocky geometric hair
Her gender must not rely on makeup, jewelry or costume
Preserve the navy work jacket, brown trousers, tool pouch, reclaimed bricks, stone pieces and green sprout
```

## 逐张文案不变量

每次调用均把对应 V1 的全部文案以 verbatim 形式写入提示词，要求逐字、逐行、逐位置保留。最终输出已通过原尺寸和 `390 × 780` 手机预览检查
