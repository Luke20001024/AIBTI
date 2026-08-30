from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
OUT_DIR = ROOT / "artifacts/qa/result-v7-galleries"
CONTENT_FILES = [ROOT / "src/content/buildings.ts", ROOT / "src/content/new-persona-buildings.ts"]


def font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def primary_map() -> dict[str, str]:
    pattern = re.compile(r'id:\s*"(?P<id>BLD-[^"]+)".*?imageFile:\s*"(?P<file>[^"]+)"', re.S)
    result: dict[str, str] = {}
    for source in CONTENT_FILES:
        for match in pattern.finditer(source.read_text(encoding="utf-8")):
            result.setdefault(match.group("id"), match.group("file"))
    return result


def tile(path: Path, width: int, height: int) -> Image.Image:
    with Image.open(path) as source:
        image = source.convert("RGB")
    return ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    records = sorted(data.get("records", []), key=lambda record: record["id"])
    primaries = primary_map()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for stale in OUT_DIR.glob("contact-sheet-*.png"):
        stale.unlink()

    per_page = 8
    page_width, header_height, row_height = 1200, 82, 264
    image_width, image_height = 368, 202
    gap = 16
    for page_index, start in enumerate(range(0, len(records), per_page), 1):
        page_records = records[start:start + per_page]
        canvas = Image.new("RGB", (page_width, header_height + len(page_records) * row_height), "#d8d4ca")
        draw = ImageDraw.Draw(canvas)
        draw.text((24, 18), f"ArcBTI · BUILDING GALLERY QA · {page_index:02}", fill="#10151c", font=font(30, True))

        for row_index, record in enumerate(page_records):
            y = header_height + row_index * row_height
            draw.rectangle((0, y, page_width, y + row_height - 1), fill="#f3f0e7")
            draw.text((24, y + 12), f'{record["id"]}  {record.get("name", "")}', fill="#10151c", font=font(20, True))
            paths = []
            primary = primaries.get(record["id"])
            if primary:
                paths.append((ROOT / "public/images/buildings" / primary, "PRIMARY"))
            for index, image_record in enumerate(record.get("images", []), 2):
                paths.append((ROOT / image_record["localPath"], f"VIEW {index}"))
            for column, (path, label) in enumerate(paths[:3]):
                x = 24 + column * (image_width + gap)
                if path.exists():
                    canvas.paste(tile(path, image_width, image_height), (x, y + 44))
                else:
                    draw.rectangle((x, y + 44, x + image_width, y + 44 + image_height), fill="#d64545")
                    draw.text((x + 12, y + 120), "MISSING", fill="white", font=font(22, True))
                draw.rectangle((x + 8, y + 52, x + 108, y + 82), fill="#10151c")
                draw.text((x + 16, y + 55), label, fill="white", font=font(15, True))

        target = OUT_DIR / f"contact-sheet-{page_index:02}.png"
        canvas.save(target, "PNG", optimize=True)
        print(target)


if __name__ == "__main__":
    main()
