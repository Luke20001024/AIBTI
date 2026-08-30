from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


SLUGS = [
    "grid", "span", "root", "eave",
    "tide", "mass", "void", "ruin",
    "sign", "tech", "veil", "flow",
    "plus", "mix", "orna", "hand",
]

STAGES = [
    "01-hero",
    "02-digest",
    "03-architect",
    "04-works-a",
    "05-works-b",
    "06-lineage",
    "07-ending",
]


def find_capture(root: Path, slug: str, stage: str) -> Path:
    matches = sorted((root / slug).glob(f"{stage}-*.png"))
    if len(matches) != 1:
        raise RuntimeError(f"Expected one {stage} capture for {slug}, found {len(matches)}")
    return matches[0]


def build_sheet(root: Path, output_dir: Path, stage: str) -> Path:
    tile_w, tile_h = 230, 498
    label_h = 34
    gap = 12
    title_h = 58
    canvas_w = tile_w * 4 + gap * 5
    canvas_h = title_h + (tile_h + label_h) * 4 + gap * 5
    canvas = Image.new("RGB", (canvas_w, canvas_h), "#111820")
    draw = ImageDraw.Draw(canvas)
    title_font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 24)
    label_font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
    draw.text((gap, 14), f"ArcBTI · {root.name.replace('x', '×')} · {stage}", font=title_font, fill="#f5f1e8")

    for index, slug in enumerate(SLUGS):
        source_path = find_capture(root, slug, stage)
        with Image.open(source_path) as source:
            tile = ImageOps.fit(source.convert("RGB"), (tile_w, tile_h), Image.Resampling.LANCZOS)
        row, col = divmod(index, 4)
        x = gap + col * (tile_w + gap)
        y = title_h + gap + row * (tile_h + label_h + gap)
        canvas.paste(tile, (x, y))
        draw.text((x + 4, y + tile_h + 6), slug.upper(), font=label_font, fill="#f5f1e8")

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"contact-{stage}.png"
    canvas.save(output_path, "PNG", optimize=True)
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Build 4x4 contact sheets for ArcBTI result-page segments")
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()

    for stage in STAGES:
        print(build_sheet(args.root, args.output_dir, stage))


if __name__ == "__main__":
    main()
