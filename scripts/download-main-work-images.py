from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/design/persona-expansion-16-v1/main-work-real-image-downloads.json"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/main-work-real-image-register.json"
OUT = ROOT / "public/images/buildings"
QA = ROOT / "artifacts/qa/persona-expansion-16-v1/new-24-main-works-contact-sheet-v1.png"


def font(size: int, bold: bool = False):
    path = Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf")
    return ImageFont.truetype(str(path), size) if path.exists() else ImageFont.load_default()


def main() -> None:
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    records, failures = [], []
    for index, item in enumerate(items, 1):
        target = OUT / item["file"]
        try:
            if target.exists():
                with Image.open(target) as existing:
                    dimensions = list(existing.size)
                records.append({**item, "localPath": str(target.relative_to(ROOT)).replace("\\", "/"), "dimensions": dimensions})
                print(f"[{index:02d}/24] KEEP {item['file']}", flush=True)
                continue
            with tempfile.NamedTemporaryFile(suffix=".download", delete=False) as temporary:
                temp = Path(temporary.name)
            try:
                subprocess.run(["curl.exe", "-fsSL", "--retry", "3", "--retry-all-errors", "--connect-timeout", "15", "--max-time", "90", "-A", "Mozilla/5.0 ArcBTI local prototype", "-o", str(temp), item["url"]], check=True, capture_output=True)
                with Image.open(temp) as image:
                    image = image.convert("RGB")
                    image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
                    image.save(target, "WEBP", quality=86, method=6)
                    dimensions = list(image.size)
            finally:
                temp.unlink(missing_ok=True)
            records.append({**item, "localPath": str(target.relative_to(ROOT)).replace("\\", "/"), "dimensions": dimensions})
            print(f"[{index:02d}/24] OK {item['file']}", flush=True)
        except Exception as exc:
            failures.append({**item, "error": str(exc)})
            print(f"[{index:02d}/24] FAIL {item['file']}: {exc}", flush=True)
    REGISTER.write_text(json.dumps({"records": records, "failures": failures}, ensure_ascii=False, indent=2), encoding="utf-8")

    cols, cell_w, cell_h, header = 3, 420, 330, 76
    rows = (len(records) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, header + rows * cell_h), "#d9d5cb")
    draw = ImageDraw.Draw(sheet)
    draw.text((24, 20), "NEW 8 PERSONAS · 24 REAL MAIN WORKS", fill="#10151c", font=font(28, True))
    for idx, record in enumerate(records):
        row, col = divmod(idx, cols)
        x, y = col * cell_w, header + row * cell_h
        with Image.open(ROOT / record["localPath"]) as image:
            image = image.convert("RGB")
            image.thumbnail((396, 258), Image.Resampling.LANCZOS)
            sheet.paste(image, (x + (cell_w - image.width) // 2, y + 8 + (258 - image.height) // 2))
        draw.text((x + 12, y + 276), record["file"].replace(".webp", "")[:38], fill="#10151c", font=font(16, True))
    QA.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(QA, "PNG", optimize=True)
    print(f"records={len(records)} failures={len(failures)} qa={QA}", flush=True)


if __name__ == "__main__":
    main()
