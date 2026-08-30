from __future__ import annotations

import runpy
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"
OUT_DIR = ROOT / "artifacts/qa/result-v7-building-primaries"


def font(size: int, bold: bool = False):
    for candidate in [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def main() -> None:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_source")
    works = modules["parse_works"]()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for stale in OUT_DIR.glob("primary-*.png"):
        stale.unlink()
    columns, per_page = 5, 20
    cell_width, cell_height, header = 280, 248, 78
    image_width, image_height = 256, 184
    for page_index, start in enumerate(range(0, len(works), per_page), 1):
        page = works[start:start + per_page]
        rows = (len(page) + columns - 1) // columns
        canvas = Image.new("RGB", (columns * cell_width, header + rows * cell_height), "#d8d4ca")
        draw = ImageDraw.Draw(canvas)
        draw.text((24, 18), f"ArcBTI · 80 PRIMARY BUILDINGS · {page_index:02}", fill="#10151c", font=font(28, True))
        for index, work in enumerate(page):
            row, column = divmod(index, columns)
            x, y = column * cell_width, header + row * cell_height
            draw.rectangle((x, y, x + cell_width - 1, y + cell_height - 1), fill="#f3f0e7")
            path = ROOT / "public/images/buildings" / work.image_file
            with Image.open(path) as source:
                image = ImageOps.fit(source.convert("RGB"), (image_width, image_height), method=Image.Resampling.LANCZOS)
            canvas.paste(image, (x + 12, y + 10))
            draw.text((x + 12, y + 201), work.id.replace("BLD-", "")[:24], fill="#10151c", font=font(15, True))
            draw.text((x + 12, y + 224), work.original_name[:32], fill="#39414a", font=font(12))
        target = OUT_DIR / f"primary-{page_index:02}.png"
        canvas.save(target, "PNG", optimize=True)
        print(target)


if __name__ == "__main__":
    main()
