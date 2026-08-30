from __future__ import annotations

import argparse
import json
import runpy
import shutil
import subprocess
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-supplements.json"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"
CACHE_DIR = ROOT / "artifacts/source-cache/building-gallery-supplements"
QA_DIR = ROOT / "artifacts/qa/result-v7-gallery-supplements"
GALLERY_DIR = ROOT / "public/images/buildings/gallery"
USER_AGENT = "Mozilla/5.0 ArcBTI local architecture research prototype"


def fetch(url: str) -> bytes:
    result = subprocess.run(
        [
            "curl.exe", "-fsSL", "--retry", "2", "--retry-all-errors",
            "--ssl-no-revoke", "--http1.1", "--connect-timeout", "15",
            "--max-time", "75", "-A", USER_AGENT, url,
        ],
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode("utf-8", errors="ignore").strip() or f"curl exit {result.returncode}")
    return result.stdout


def open_image(raw: bytes) -> Image.Image:
    image = Image.open(BytesIO(raw)).convert("RGB")
    image.load()
    if min(image.size) < 360 or image.width * image.height < 200_000:
        raise RuntimeError(f"image too small: {image.width}x{image.height}")
    return image


def visual_distance(left: Image.Image, right: Image.Image) -> float:
    a = left.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    b = right.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    return sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    names = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def fit_preview(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    preview = ImageOps.contain(image, size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, "#eeeae0")
    canvas.paste(preview, ((size[0] - preview.width) // 2, (size[1] - preview.height) // 2))
    return canvas


def write_contact_sheets(staged: list[dict]) -> None:
    QA_DIR.mkdir(parents=True, exist_ok=True)
    for old in QA_DIR.glob("supplements-*.png"):
        old.unlink()
    per_sheet = 5
    cell_w, cell_h = 350, 280
    row_h = 335
    for sheet_index in range(0, len(staged), per_sheet):
        batch = staged[sheet_index:sheet_index + per_sheet]
        sheet = Image.new("RGB", (cell_w * 3, 54 + row_h * len(batch)), "#f7f3e9")
        draw = ImageDraw.Draw(sheet)
        draw.text((18, 14), "PRIMARY / SUPPLEMENT 1 / SUPPLEMENT 2", fill="#111820", font=font(20, True))
        for row, record in enumerate(batch):
            y = 54 + row * row_h
            draw.text((12, y + 6), record["id"], fill="#0b4d87", font=font(17, True))
            paths = [record["primaryPath"], *[item["cachePath"] for item in record["images"]]]
            labels = ["PRIMARY", *[f"NEW {index + 1}" for index in range(len(record["images"]))]]
            for col, path in enumerate(paths[:3]):
                with Image.open(ROOT / path) as source:
                    preview = fit_preview(source.convert("RGB"), (cell_w - 16, cell_h - 30))
                x = col * cell_w + 8
                sheet.paste(preview, (x, y + 34))
                draw.text((x + 6, y + cell_h + 8), labels[col], fill="#2b2b2b", font=font(14, True))
        target = QA_DIR / f"supplements-{sheet_index // per_sheet + 1:02}.png"
        sheet.save(target, optimize=True)


def stage() -> list[dict]:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_reader")
    works = {work.id: work for work in modules["parse_works"]()}
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    staged: list[dict] = []
    failures: list[dict] = []
    for record in manifest["records"]:
        building_id = record["id"]
        work = works[building_id]
        primary_path = ROOT / "public/images/buildings" / work.image_file
        with Image.open(primary_path) as primary_file:
            primary = primary_file.convert("RGB")
        staged_images: list[dict] = []
        accepted: list[Image.Image] = []
        try:
            for index, candidate in enumerate(record["images"], 1):
                image = open_image(fetch(candidate["url"]))
                primary_distance = visual_distance(primary, image)
                if primary_distance < 6:
                    raise RuntimeError(f"candidate {index} duplicates primary: distance={primary_distance:.2f}")
                for previous_index, previous in enumerate(accepted, 1):
                    distance = visual_distance(previous, image)
                    if distance < 6:
                        raise RuntimeError(f"candidate {index} duplicates candidate {previous_index}: distance={distance:.2f}")
                image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
                target = CACHE_DIR / f"{building_id.lower()}-candidate-{index:02}.webp"
                image.save(target, "WEBP", quality=86, method=6)
                accepted.append(image.copy())
                staged_images.append({
                    **candidate,
                    "cachePath": str(target.relative_to(ROOT)).replace("\\", "/"),
                    "dimensions": [image.width, image.height],
                    "visualDistance": round(primary_distance, 2),
                })
            staged.append({
                "id": building_id,
                "name": work.name,
                "originalName": work.original_name,
                "primaryPath": str(primary_path.relative_to(ROOT)).replace("\\", "/"),
                "images": staged_images,
            })
            print(f"STAGED {building_id} images={len(staged_images)}", flush=True)
        except Exception as exc:
            failures.append({"id": building_id, "error": str(exc)})
            safe_error = str(exc).encode("ascii", errors="backslashreplace").decode("ascii")
            print(f"FAILED {building_id}: {safe_error}", flush=True)
    write_contact_sheets(staged)
    report = {"records": staged, "failures": failures}
    (QA_DIR / "stage-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        raise SystemExit(f"stage failed for {len(failures)} records")
    return staged


def commit(staged: list[dict]) -> None:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_writer")
    write_outputs = modules["write_outputs"]
    current = json.loads(REGISTER.read_text(encoding="utf-8"))
    records_by_id = {record["id"]: record for record in current.get("records", [])}
    failures = [item for item in current.get("failures", []) if item.get("id") not in {record["id"] for record in staged}]
    GALLERY_DIR.mkdir(parents=True, exist_ok=True)
    gallery_root = GALLERY_DIR.resolve()
    for record in staged:
        building_id = record["id"]
        existing = records_by_id.get(building_id)
        if existing:
            for image in existing.get("images", []):
                path = (ROOT / image["localPath"]).resolve()
                if gallery_root not in path.parents:
                    raise RuntimeError(f"refusing to remove outside gallery directory: {path}")
                path.unlink(missing_ok=True)
        images: list[dict] = []
        for index, candidate in enumerate(record["images"], 2):
            source = ROOT / candidate["cachePath"]
            target = GALLERY_DIR / f"{building_id.lower()}-{index:02}.webp"
            shutil.copy2(source, target)
            images.append({
                "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
                "alt": f'{record["name"]}补充建筑摄影视角 {index - 1}',
                "sourceLabel": candidate["sourceLabel"],
                "sourceUrl": candidate["sourceUrl"],
                "imageUrl": candidate["url"],
                "dimensions": candidate["dimensions"],
                "visualDistance": candidate["visualDistance"],
                "reviewStatus": "visually-approved",
            })
        records_by_id[building_id] = {
            "id": building_id,
            "name": record["name"],
            "originalName": record["originalName"],
            "sourcePage": images[0]["sourceUrl"],
            "images": images,
            "reviewStatus": "visually-approved",
            "curationNote": "Identity-checked real photographs; primary plus supplemental views reviewed in contact sheets",
        }
        print(f"COMMITTED {building_id} images={len(images)}", flush=True)
    write_outputs(records_by_id, failures)


def main() -> None:
    parser = argparse.ArgumentParser(description="Stage and commit identity-checked real-photo gallery supplements")
    parser.add_argument("--commit", action="store_true")
    args = parser.parse_args()
    staged = stage()
    if args.commit:
        commit(staged)


if __name__ == "__main__":
    main()
