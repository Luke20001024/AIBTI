from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/content/architects.ts"


def read_portraits() -> list[tuple[str, Path]]:
    text = SOURCE.read_text(encoding="utf-8")
    pattern = re.compile(
        r'id:\s*"ARCH-[^"]+".*?name:\s*"(?P<name>[^"]+)".*?portrait:\s*\{\s*src:\s*"(?P<src>[^"]+)"',
        re.S,
    )
    items = [(match.group("name"), ROOT / "public" / match.group("src").lstrip("/")) for match in pattern.finditer(text)]
    if len(items) != 16:
        raise RuntimeError(f"Expected 16 architect portraits, found {len(items)}")
    return items


def main() -> None:
    parser = argparse.ArgumentParser(description="Build ArcBTI 4x4 architect portrait QA sheet")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    items = read_portraits()
    tile_w, tile_h = 250, 300
    label_h = 42
    gap = 12
    title_h = 58
    canvas = Image.new("RGB", (tile_w * 4 + gap * 5, title_h + (tile_h + label_h) * 4 + gap * 5), "#111820")
    draw = ImageDraw.Draw(canvas)
    title_font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 25)
    label_font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 17)
    draw.text((gap, 14), "ArcBTI · 16 位代表建筑师 · 插画一致性验收", font=title_font, fill="#f5f1e8")

    for index, (name, path) in enumerate(items):
        if not path.exists():
            raise FileNotFoundError(path)
        with Image.open(path) as source:
            tile = ImageOps.contain(source.convert("RGB"), (tile_w, tile_h), Image.Resampling.LANCZOS)
        frame = Image.new("RGB", (tile_w, tile_h), "#f1eee5")
        frame.paste(tile, ((tile_w - tile.width) // 2, (tile_h - tile.height) // 2))
        row, col = divmod(index, 4)
        x = gap + col * (tile_w + gap)
        y = title_h + gap + row * (tile_h + label_h + gap)
        canvas.paste(frame, (x, y))
        draw.text((x + 5, y + tile_h + 7), name, font=label_font, fill="#f5f1e8")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(args.output, "PNG", optimize=True)
    print(f"Built architect QA sheet: {args.output}")


if __name__ == "__main__":
    main()
