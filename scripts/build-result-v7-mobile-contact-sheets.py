from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PERSONAS = [
    "grid", "span", "root", "eave",
    "tide", "mass", "void", "ruin",
    "sign", "tech", "veil", "flow",
    "plus", "mix", "orna", "hand",
]

SIZES = ["360x800", "390x844", "430x932"]
ROOT = Path(__file__).resolve().parents[1]
QA_ROOT = ROOT / "artifacts" / "qa" / "result-v7-mobile"


def font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def build(size: str) -> Path:
    source_dir = QA_ROOT / size
    tile_width = 260
    gap = 16
    label_height = 34
    title_height = 74
    columns = 4
    rows = 4

    first = Image.open(source_dir / "grid.png")
    tile_height = round(tile_width * first.height / first.width)
    first.close()

    canvas_width = gap + columns * (tile_width + gap)
    canvas_height = title_height + gap + rows * (tile_height + label_height + gap)
    canvas = Image.new("RGB", (canvas_width, canvas_height), "#d7d3c8")
    draw = ImageDraw.Draw(canvas)
    title_font = font("C:/Windows/Fonts/msyhbd.ttc", 25)
    label_font = font("C:/Windows/Fonts/impact.ttf", 22)
    detail_font = font("C:/Windows/Fonts/msyh.ttc", 14)

    draw.text((gap, 13), f"ArcBTI · RESULT V7 · {size} · 1:1 CSS VIEWPORT", font=title_font, fill="#111820")
    draw.text((gap, 45), "16 人格首屏安全区 / 人物比例 / 建筑余量 / 字体可读性", font=detail_font, fill="#4e514f")

    for index, slug in enumerate(PERSONAS):
        source_path = source_dir / f"{slug}.png"
        if not source_path.exists():
            raise FileNotFoundError(source_path)
        with Image.open(source_path) as source:
            tile = source.convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
        row, column = divmod(index, columns)
        x = gap + column * (tile_width + gap)
        y = title_height + gap + row * (tile_height + label_height + gap)
        canvas.paste(tile, (x, y))
        draw.text((x + 5, y + tile_height + 2), slug.upper(), font=label_font, fill="#111820")

    output = QA_ROOT / f"contact-{size}.png"
    canvas.save(output, format="PNG", optimize=True)
    return output


def main() -> None:
    for size in SIZES:
        print(build(size))


if __name__ == "__main__":
    main()
