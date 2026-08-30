from __future__ import annotations

import json
import runpy
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-search-downloads.json"
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"
OUT_DIR = ROOT / "artifacts/qa/result-v7-gallery-candidates"


def font(size: int, bold: bool = False):
    for candidate in [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def tile(path: Path, width: int, height: int) -> Image.Image:
    with Image.open(path) as source:
        image = source.convert("RGB")
    return ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_source")
    works = {work.id: work for work in modules["parse_works"]()}
    records = json.loads(REGISTER.read_text(encoding="utf-8"))["records"]
    grouped: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        grouped[record["id"]].append(record)
    building_ids = sorted(grouped)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for stale in OUT_DIR.glob("candidates-*.png"):
        stale.unlink()

    per_page = 8
    page_width, header_height, row_height = 1400, 80, 226
    tile_width, tile_height, gap = 258, 164, 14
    for page_index, start in enumerate(range(0, len(building_ids), per_page), 1):
        ids = building_ids[start:start + per_page]
        canvas = Image.new("RGB", (page_width, header_height + len(ids) * row_height), "#d8d4ca")
        draw = ImageDraw.Draw(canvas)
        draw.text((24, 18), f"ArcBTI · SEARCH CANDIDATE QA · {page_index:02}", fill="#10151c", font=font(28, True))
        for row_index, building_id in enumerate(ids):
            y = header_height + row_index * row_height
            draw.rectangle((0, y, page_width, y + row_height - 1), fill="#f3f0e7")
            work = works[building_id]
            draw.text((24, y + 10), f"{building_id}  {work.original_name}", fill="#10151c", font=font(18, True))
            images = [(ROOT / "public/images/buildings" / work.image_file, "PRIMARY")]
            for record in sorted(grouped[building_id], key=lambda item: item["candidateIndex"])[:4]:
                images.append((ROOT / record["localPath"], f'CAND {record["candidateIndex"]}'))
            for column, (path, label) in enumerate(images):
                x = 24 + column * (tile_width + gap)
                canvas.paste(tile(path, tile_width, tile_height), (x, y + 44))
                draw.rectangle((x + 6, y + 50, x + 102, y + 78), fill="#10151c")
                draw.text((x + 12, y + 52), label, fill="white", font=font(13, True))
        target = OUT_DIR / f"candidates-{page_index:02}.png"
        canvas.save(target, "PNG", optimize=True)
        print(target)


if __name__ == "__main__":
    main()
