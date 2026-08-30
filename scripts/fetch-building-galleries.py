from __future__ import annotations

import argparse
import json
import re
import subprocess
import time
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from urllib.parse import urlencode

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
CONTENT_FILES = [ROOT / "src/content/buildings.ts", ROOT / "src/content/new-persona-buildings.ts"]
OUT_DIR = ROOT / "public/images/buildings/gallery"
REGISTRY = ROOT / "src/content/building-galleries.ts"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
USER_AGENT = "ArcBTI-local-prototype/1.0 (architecture-image-research)"
MANUAL_IDS = {"BLD-CHURCH-LIGHT", "BLD-CHICHU", "BLD-WATER-TEMPLE"}
REJECT_TITLE = re.compile(r"\b(plan|map|logo|portrait|architect|signature|diagram|drawing|section|elevation|model|lego|toy|miniature|stamp|postcard|poster|painting|sketch|render)\b", re.I)


@dataclass(frozen=True)
class Work:
    id: str
    name: str
    original_name: str
    image_file: str


def fetch_json(url: str) -> dict:
    return json.loads(fetch_bytes(url).decode("utf-8"))


def fetch_bytes(url: str) -> bytes:
    result = subprocess.run(
        [
            "curl.exe", "-fsSL", "--retry", "4", "--retry-all-errors",
            "--connect-timeout", "12", "--max-time", "60", "-A", USER_AGENT, url,
        ],
        check=True,
        capture_output=True,
    )
    return result.stdout


def parse_works() -> list[Work]:
    pattern = re.compile(
        r'id:\s*"(?P<id>BLD-[^"]+)"\s*,\s*name:\s*"(?P<name>[^"]+)"\s*,\s*originalName:\s*"(?P<original>[^"]+)".*?imageFile:\s*"(?P<file>[^"]+)"',
        re.S,
    )
    seen: set[str] = set()
    works: list[Work] = []
    for source in CONTENT_FILES:
        for match in pattern.finditer(source.read_text(encoding="utf-8")):
            item = Work(match.group("id"), match.group("name"), match.group("original"), match.group("file"))
            if item.id not in seen:
                works.append(item)
                seen.add(item.id)
    return works


def search_candidates(work: Work) -> list[dict]:
    queries = [f'"{work.original_name}" architecture', f'"{work.original_name}" building']
    candidates: list[dict] = []
    seen: set[str] = set()
    for query in queries:
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": 6,
            "gsrlimit": 12,
            "prop": "imageinfo",
            "iiprop": "url|mime|size|extmetadata",
            "iiurlwidth": 1600,
            "format": "json",
            "formatversion": 2,
        }
        payload = fetch_json("https://commons.wikimedia.org/w/api.php?" + urlencode(params))
        for page in payload.get("query", {}).get("pages", []):
            info = (page.get("imageinfo") or [{}])[0]
            title = page.get("title", "")
            key = info.get("descriptionurl") or title
            if key in seen or REJECT_TITLE.search(title):
                continue
            seen.add(key)
            if info.get("mime") not in {"image/jpeg", "image/png", "image/webp"}:
                continue
            if min(int(info.get("width", 0)), int(info.get("height", 0))) < 600:
                continue
            image_url = info.get("thumburl") or info.get("url")
            if isinstance(image_url, str) and image_url.startswith("//"):
                image_url = "https:" + image_url
            if not isinstance(image_url, str) or not image_url.startswith(("http://", "https://")):
                continue
            candidates.append({
                "title": title[5:] if title.startswith("File:") else title,
                "descriptionUrl": info.get("descriptionurl"),
                "imageUrl": image_url,
                "width": info.get("thumbwidth") or info.get("width"),
                "height": info.get("thumbheight") or info.get("height"),
            })
        if candidates:
            break
    return candidates


def visual_distance(primary: Path, candidate: Image.Image) -> float:
    with Image.open(primary) as source:
        left = source.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    right = candidate.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    diff = ImageChops.difference(left, right)
    return sum(ImageStat.Stat(diff).mean) / 3


def save_candidate(work: Work, candidate: dict) -> tuple[Path, tuple[int, int], float]:
    raw = fetch_bytes(candidate["imageUrl"])
    image = Image.open(BytesIO(raw)).convert("RGB")
    image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
    primary = ROOT / "public/images/buildings" / work.image_file
    distance = visual_distance(primary, image) if primary.exists() else 999.0
    target = OUT_DIR / f"{work.id.lower()}-02.webp"
    image.save(target, "WEBP", quality=86, method=6)
    return target, image.size, distance


def write_registry(records: list[dict]) -> None:
    lines = [
        'import type { Building } from "./schema";',
        "",
        'export const BUILDING_GALLERIES: Record<string, NonNullable<Building["gallery"]>> = {',
    ]
    for record in records:
        label = json.dumps(f'Wikimedia Commons · {record["title"]}', ensure_ascii=False)
        url = json.dumps(record["descriptionUrl"], ensure_ascii=False)
        alt = json.dumps(f'{record["name"]}补充建筑摄影', ensure_ascii=False)
        src = json.dumps("/" + record["localPath"].split("public/", 1)[1], ensure_ascii=False)
        lines.extend([
            f'  {json.dumps(record["id"])}: [',
            "    {",
            f"      src: {src},",
            f"      alt: {alt},",
            f"      source: {{ label: {label}, url: {url}, status: \"prototype-source-noted\" }},",
            "    },",
            "  ],",
        ])
    lines.extend(["};", ""])
    REGISTRY.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch one validated Commons gallery image per ArcBTI building")
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    works = [work for work in parse_works() if work.id not in MANUAL_IDS]
    if args.limit:
        works = works[: args.limit]
    records: list[dict] = []
    failures: list[dict] = []
    for index, work in enumerate(works, 1):
        try:
            candidates = search_candidates(work)
            if not candidates:
                raise RuntimeError("no Commons photo candidate")
            selected = None
            for candidate in candidates[:4]:
                target, dimensions, distance = save_candidate(work, candidate)
                if distance >= 8:
                    selected = (candidate, target, dimensions, distance)
                    break
                target.unlink(missing_ok=True)
            if not selected:
                raise RuntimeError("only near-duplicate candidates")
            candidate, target, dimensions, distance = selected
            record = {
                "id": work.id,
                "name": work.name,
                "originalName": work.original_name,
                **candidate,
                "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
                "dimensions": list(dimensions),
                "visualDistance": round(distance, 2),
                "reviewStatus": "needs-visual-review",
            }
            records.append(record)
            print(f"[{index:02d}/{len(works)}] OK {work.id} <- {candidate['title']}", flush=True)
        except Exception as exc:
            failures.append({"id": work.id, "name": work.name, "error": str(exc)})
            print(f"[{index:02d}/{len(works)}] SKIP {work.id}: {exc}", flush=True)
        time.sleep(0.45)
    write_registry(records)
    REGISTER.parent.mkdir(parents=True, exist_ok=True)
    REGISTER.write_text(json.dumps({"records": records, "failures": failures}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"records={len(records)} failures={len(failures)}", flush=True)


if __name__ == "__main__":
    main()
