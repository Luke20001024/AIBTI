from __future__ import annotations

import json
import runpy
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-search-candidates.json"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-search-downloads.json"
OUT_DIR = ROOT / "public/images/buildings/gallery-candidates"
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"
USER_AGENT = "Mozilla/5.0 ArcBTI local architecture research prototype"


@dataclass(frozen=True)
class DownloadTask:
    building_id: str
    original_name: str
    primary_file: str
    candidate_index: int
    title: str
    page_url: str
    image_url: str


def curl(url: str) -> bytes:
    result = subprocess.run(
        [
            "curl.exe", "-fsSL", "--retry", "1", "--retry-all-errors",
            "--ssl-no-revoke", "--http1.1", "--connect-timeout", "12",
            "--max-time", "40", "-A", USER_AGENT, url,
        ],
        capture_output=True,
    )
    if result.returncode != 0:
        error = result.stderr.decode("utf-8", errors="ignore").strip()
        raise RuntimeError(error or f"curl exit {result.returncode}")
    return result.stdout


def visual_distance(left: Image.Image, right: Image.Image) -> float:
    a = left.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    b = right.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    return sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3


def download(task: DownloadTask) -> dict:
    raw = curl(task.image_url)
    image = Image.open(BytesIO(raw)).convert("RGB")
    image.load()
    width, height = image.size
    if min(width, height) < 450 or width * height < 360_000:
        raise RuntimeError(f"image too small: {width}x{height}")
    primary_path = ROOT / "public/images/buildings" / task.primary_file
    with Image.open(primary_path) as primary_file:
        primary = primary_file.convert("RGB")
    distance = visual_distance(primary, image)
    if distance < 8:
        raise RuntimeError(f"near duplicate of primary: distance={distance:.2f}")
    image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
    target = OUT_DIR / f"{task.building_id.lower()}-candidate-{task.candidate_index:02}.webp"
    image.save(target, "WEBP", quality=86, method=6)
    return {
        "id": task.building_id,
        "originalName": task.original_name,
        "candidateIndex": task.candidate_index,
        "title": task.title,
        "pageUrl": task.page_url,
        "imageUrl": task.image_url,
        "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
        "dimensions": list(image.size),
        "visualDistance": round(distance, 2),
        "reviewStatus": "needs-visual-review",
    }


def main() -> None:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_source")
    works = {work.id: work for work in modules["parse_works"]()}
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))["records"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    tasks: list[DownloadTask] = []
    for record in manifest:
        work = works[record["id"]]
        for index, candidate in enumerate(record.get("candidates", []), 1):
            tasks.append(DownloadTask(
                building_id=work.id,
                original_name=work.original_name,
                primary_file=work.image_file,
                candidate_index=index,
                title=candidate["title"],
                page_url=candidate["pageUrl"],
                image_url=candidate["imageUrl"],
            ))

    records: list[dict] = []
    failures: list[dict] = []
    completed = 0
    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(download, task): task for task in tasks}
        for future in as_completed(futures):
            task = futures[future]
            completed += 1
            try:
                records.append(future.result())
                status = "OK"
            except Exception as exc:
                failures.append({
                    "id": task.building_id,
                    "candidateIndex": task.candidate_index,
                    "pageUrl": task.page_url,
                    "imageUrl": task.image_url,
                    "error": str(exc),
                })
                status = "SKIP"
            if completed % 12 == 0 or completed == len(tasks):
                print(f"[{completed:03d}/{len(tasks):03d}] {status} records={len(records)} failures={len(failures)}", flush=True)

    records.sort(key=lambda item: (item["id"], item["candidateIndex"]))
    failures.sort(key=lambda item: (item["id"], item["candidateIndex"]))
    REGISTER.write_text(
        json.dumps({"records": records, "failures": failures}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"records={len(records)} failures={len(failures)}", flush=True)


if __name__ == "__main__":
    main()
