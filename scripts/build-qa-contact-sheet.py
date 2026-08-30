from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PERSONAS = [
    "GRID", "SPAN", "ROOT", "EAVE",
    "TIDE", "MASS", "VOID", "RUIN",
    "SIGN", "TECH", "VEIL", "FLOW",
    "PLUS", "MIX", "ORNA", "HAND",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a 4x4 QA contact sheet from phone-preview screenshots")
    parser.add_argument("--assets", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--title", default="ArcBTI · 16 PERSONA PHONE QA")
    args = parser.parse_args()

    tile_width, tile_height = 316, 178
    gap = 12
    title_height = 54
    label_height = 28
    canvas_width = tile_width * 4 + gap * 5
    canvas_height = title_height + (tile_height + label_height) * 4 + gap * 5
    canvas = Image.new("RGB", (canvas_width, canvas_height), "#111820")
    draw = ImageDraw.Draw(canvas)
    label_font = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 19)
    title_font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 24)
    draw.text((gap, 13), args.title, font=title_font, fill="#f5f1e8")

    for index, code in enumerate(PERSONAS):
        source_path = args.assets / f"{code.lower()}.png"
        if not source_path.exists():
            raise FileNotFoundError(source_path)
        with Image.open(source_path) as source:
            tile = source.convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
        row, column = divmod(index, 4)
        x = gap + column * (tile_width + gap)
        y = title_height + gap + row * (tile_height + label_height + gap)
        canvas.paste(tile, (x, y))
        draw.text((x + 6, y + tile_height + 1), code, font=label_font, fill="#f5f1e8")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.output, format="PNG", optimize=True)
    print(f"Built QA contact sheet: {args.output}")


if __name__ == "__main__":
    main()
