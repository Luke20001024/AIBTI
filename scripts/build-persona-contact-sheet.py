from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PERSONAS = [
    "GRID", "SPAN", "MASS", "TECH",
    "VOID", "ROOT", "EAVE", "TIDE",
    "RUIN", "HAND", "SIGN", "ORNA",
    "VEIL", "FLOW", "PLUS", "MIX",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the ArcBTI 4x4 persona poster contact sheet")
    parser.add_argument("--assets", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    tile_width, tile_height = 390, 780
    gap = 8
    label_height = 34
    canvas_width = tile_width * 4 + gap * 5
    canvas_height = (tile_height + label_height) * 4 + gap * 5
    canvas = Image.new("RGB", (canvas_width, canvas_height), "#111820")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 24)

    for index, code in enumerate(PERSONAS):
        source_path = args.assets / code.lower() / "hero-poster-v1.webp"
        if not source_path.exists():
            source_path = args.assets / code.lower() / "hero-poster-v1.png"
        if not source_path.exists():
            raise FileNotFoundError(source_path)
        with Image.open(source_path) as source:
            tile = source.convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
        row, column = divmod(index, 4)
        x = gap + column * (tile_width + gap)
        y = gap + row * (tile_height + label_height + gap)
        canvas.paste(tile, (x, y))
        draw.text((x + 8, y + tile_height + 2), code, font=font, fill="#f5f1e8")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.output, format="PNG", optimize=True)
    print(f"Built contact sheet: {args.output}")


if __name__ == "__main__":
    main()
