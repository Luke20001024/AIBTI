from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


TARGET_SIZE = (780, 1564)
INK = "#09121c"
FONT_CODE = Path("C:/Windows/Fonts/impact.ttf")
FONT_CN_BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")
FONT_CN_REGULAR = Path("C:/Windows/Fonts/msyh.ttc")


def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Font not found: {path}")
    return ImageFont.truetype(str(path), size=size)


def fit_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    font_path: Path,
    start_size: int,
    min_size: int,
    max_width: int,
) -> ImageFont.FreeTypeFont:
    size = start_size
    while size > min_size:
        font = load_font(font_path, size)
        box = draw.textbbox((0, 0), text, font=font)
        if box[2] - box[0] <= max_width:
            return font
        size -= 2
    return load_font(font_path, min_size)


def cover_image(source: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    target_width, target_height = target_size
    source_ratio = source.width / source.height
    target_ratio = target_width / target_height
    if source_ratio > target_ratio:
        scaled_height = target_height
        scaled_width = round(target_height * source_ratio)
    else:
        scaled_width = target_width
        scaled_height = round(target_width / source_ratio)
    resized = source.resize((scaled_width, scaled_height), Image.Resampling.LANCZOS)
    left = max(0, (scaled_width - target_width) // 2)
    top = max(0, (scaled_height - target_height) // 2)
    return resized.crop((left, top, left + target_width, top + target_height)).convert("RGBA")


def add_bottom_gradient(image: Image.Image) -> None:
    gradient_height = 230
    overlay = Image.new("RGBA", (image.width, gradient_height), (0, 0, 0, 0))
    pixels = overlay.load()
    for y in range(gradient_height):
        progress = y / max(1, gradient_height - 1)
        alpha = round(8 + 190 * (progress**1.7))
        for x in range(image.width):
            pixels[x, y] = (5, 11, 17, alpha)
    image.alpha_composite(overlay, (0, image.height - gradient_height))


def add_side_code(image: Image.Image, code: str, accent: str) -> None:
    side_layer = Image.new("RGBA", (560, 178), (0, 0, 0, 0))
    side_draw = ImageDraw.Draw(side_layer)
    font = fit_font(side_draw, code, FONT_CODE, 170, 118, 530)
    rgb = tuple(int(accent[index : index + 2], 16) for index in (1, 3, 5))
    side_draw.text((8, -13), code, font=font, fill=(*rgb, 58))
    rotated = side_layer.rotate(90, expand=True, resample=Image.Resampling.BICUBIC)
    image.alpha_composite(rotated, (image.width - rotated.width + 28, 74))


def build_poster(source_path: Path, output_path: Path, code: str, item: dict) -> None:
    with Image.open(source_path) as source:
        poster = cover_image(source, TARGET_SIZE)

    artwork_offset_y = int(item.get("artworkOffsetY", 0))
    if artwork_offset_y > 0:
        background = item.get("artworkBackground", "#f3efe6")
        rgb = tuple(int(background[index : index + 2], 16) for index in (1, 3, 5))
        shifted = Image.new("RGBA", TARGET_SIZE, (*rgb, 255))
        shifted.alpha_composite(poster.crop((0, 0, poster.width, poster.height - artwork_offset_y)), (0, artwork_offset_y))
        poster = shifted

    copy_panel = item.get("copyPanel")
    if copy_panel:
        color = copy_panel["color"]
        rgb = tuple(int(color[index : index + 2], 16) for index in (1, 3, 5))
        panel = Image.new(
            "RGBA",
            (poster.width, int(copy_panel["height"])),
            (*rgb, int(copy_panel.get("opacity", 238))),
        )
        poster.alpha_composite(panel, (0, 0))

    add_side_code(poster, code, item["accent"])
    draw = ImageDraw.Draw(poster)
    x = 45
    copy_width = 600

    code_font = fit_font(draw, code, FONT_CODE, 148, 118, 420)
    draw.text((x, 26), code, font=code_font, fill=INK, stroke_width=0)

    title_y = 190
    title_line_height = 70
    for title_line in item["titleLines"]:
        title_font = fit_font(draw, title_line, FONT_CN_BOLD, 62, 48, copy_width)
        draw.text((x, title_y), title_line, font=title_font, fill=INK)
        title_box = draw.textbbox((x, title_y), title_line, font=title_font)
        title_line_height = max(title_line_height, title_box[3] - title_box[1] + 8)
        title_y += title_line_height

    statement_y = title_y + 22
    for statement in item["statements"]:
        statement_font = fit_font(draw, statement, FONT_CN_REGULAR, 31, 25, 660)
        draw.text((x, statement_y), statement, font=statement_font, fill=INK)
        statement_y += 48

    keywords = "  /  ".join(item["keywords"])
    keyword_font = fit_font(draw, keywords, FONT_CN_BOLD, 27, 23, 660)
    draw.text((x, statement_y + 11), keywords, font=keyword_font, fill=item["accent"])

    add_bottom_gradient(poster)
    draw = ImageDraw.Draw(poster)
    lineage = "  ×  ".join(item["lineage"])
    lineage_font = fit_font(draw, lineage, FONT_CN_REGULAR, 22, 17, 690)
    lineage_box = draw.textbbox((0, 0), lineage, font=lineage_font)
    lineage_width = lineage_box[2] - lineage_box[0]
    lineage_x = (poster.width - lineage_width) // 2
    draw.text((lineage_x, poster.height - 92), lineage, font=lineage_font, fill="#ffffff")
    line_width = 96
    draw.rectangle(
        (
            (poster.width - line_width) // 2,
            poster.height - 43,
            (poster.width + line_width) // 2,
            poster.height - 39,
        ),
        fill=item["accent"],
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    poster.convert("RGB").save(output_path, format="PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build flattened ArcBTI persona hero posters")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--code", required=True)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    code = args.code.upper()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    if code not in manifest:
        raise KeyError(f"Unknown persona code: {code}")
    if not args.input.exists():
        raise FileNotFoundError(f"Artwork not found: {args.input}")

    build_poster(args.input, args.output, code, manifest[code])
    print(f"Built {code}: {args.output}")


if __name__ == "__main__":
    main()
