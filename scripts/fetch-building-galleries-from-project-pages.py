from __future__ import annotations

import argparse
import html
import json
import re
import subprocess
import time
from dataclasses import dataclass
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, urlparse

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
CONTENT_FILES = [ROOT / "src/content/buildings.ts", ROOT / "src/content/new-persona-buildings.ts"]
OUT_DIR = ROOT / "public/images/buildings/gallery"
REGISTRY = ROOT / "src/content/building-galleries.ts"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
USER_AGENT = "Mozilla/5.0 ArcBTI local architecture research prototype"
MANUAL_IDS = {"BLD-CHURCH-LIGHT", "BLD-CHICHU", "BLD-WATER-TEMPLE"}
REJECT = re.compile(
    r"(?:logo|icon|avatar|portrait|headshot|author|profile|signature|favicon|sprite|social|share|"
    r"plan|map|diagram|drawing|blueprint|section|elevation|render|model|lego|toy|miniature|"
    r"stamp|postcard|poster|painting|sketch|floor[-_ ]?plan|site[-_ ]?plan|placeholder)",
    re.I,
)
IMAGE_EXT = re.compile(r"\.(?:jpe?g|png|webp|avif)(?:$|[?#])", re.I)


@dataclass(frozen=True)
class Work:
    id: str
    name: str
    original_name: str
    image_file: str
    source_label: str
    source_url: str


@dataclass(frozen=True)
class Candidate:
    url: str
    context: str
    priority: int


class ProjectImageParser(HTMLParser):
    def __init__(self, page_url: str, tokens: set[str]) -> None:
        super().__init__(convert_charrefs=True)
        self.page_url = page_url
        self.tokens = tokens
        self.candidates: list[Candidate] = []

    def add(self, raw_url: str | None, context: str, base_priority: int = 0) -> None:
        if not raw_url:
            return
        raw_url = html.unescape(raw_url).replace("\\/", "/").strip().strip("'\"")
        if not raw_url or raw_url.startswith(("data:", "blob:", "javascript:")):
            return
        url = urljoin(self.page_url, raw_url)
        if not url.startswith(("http://", "https://")) or not IMAGE_EXT.search(url):
            return
        combined = f"{url} {context}"
        if REJECT.search(combined):
            return
        lowered = combined.lower()
        token_hits = sum(1 for token in self.tokens if len(token) >= 4 and token in lowered)
        self.candidates.append(Candidate(url=url, context=context.strip(), priority=base_priority + token_hits * 18))

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag.lower() == "meta":
            key = (values.get("property") or values.get("name") or "").lower()
            if key in {"og:image", "og:image:secure_url", "twitter:image", "twitter:image:src"}:
                self.add(values.get("content"), key, 100)
            return
        if tag.lower() not in {"img", "source"}:
            return
        context = " ".join(filter(None, [values.get("alt"), values.get("title"), values.get("class"), values.get("id")]))
        for key, priority in (("data-src", 55), ("data-lazy-src", 52), ("data-original", 50), ("src", 45)):
            self.add(values.get(key), context, priority)
        for key in ("srcset", "data-srcset"):
            srcset = values.get(key, "")
            if not srcset:
                continue
            parts = [part.strip() for part in srcset.split(",") if part.strip()]
            for index, part in enumerate(reversed(parts)):
                self.add(part.split()[0], context, 70 - index)


def curl(url: str, timeout: int = 45) -> bytes:
    result = subprocess.run(
        [
            "curl.exe", "-fsSL", "--retry", "1", "--retry-all-errors",
            "--ssl-no-revoke", "--http1.1", "--connect-timeout", "12",
            "--max-time", str(timeout), "-A", USER_AGENT, url,
        ],
        capture_output=True,
    )
    if result.returncode != 0:
        error = result.stderr.decode("utf-8", errors="ignore").strip()
        raise RuntimeError(error or f"curl exit {result.returncode}")
    return result.stdout


def parse_works() -> list[Work]:
    pattern = re.compile(
        r'id:\s*"(?P<id>BLD-[^"]+)"\s*,\s*name:\s*"(?P<name>[^"]+)"\s*,\s*originalName:\s*"(?P<original>[^"]+)"'
        r'.*?imageFile:\s*"(?P<file>[^"]+)".*?sourceLabel:\s*"(?P<label>[^"]+)"\s*,\s*sourceUrl:\s*"(?P<url>[^"]+)"',
        re.S,
    )
    works: list[Work] = []
    seen: set[str] = set()
    for source in CONTENT_FILES:
        for match in pattern.finditer(source.read_text(encoding="utf-8")):
            item = Work(
                match.group("id"), match.group("name"), match.group("original"),
                match.group("file"), match.group("label"), match.group("url"),
            )
            if item.id not in seen:
                works.append(item)
                seen.add(item.id)
    return works


def token_set(work: Work) -> set[str]:
    words = re.findall(r"[a-z0-9]+", f"{work.original_name} {work.image_file}".lower())
    stop = {"the", "and", "for", "with", "house", "building", "museum", "center", "centre", "school"}
    return {word for word in words if word not in stop and len(word) >= 4}


def collect_candidates(work: Work) -> list[Candidate]:
    body = curl(work.source_url).decode("utf-8", errors="ignore")
    parser = ProjectImageParser(work.source_url, token_set(work))
    parser.feed(body)
    css_urls = re.findall(r"url\(([^)]+)\)", body, re.I)
    for raw_url in css_urls:
        parser.add(raw_url, "css background", 20)
    best_by_url: dict[str, Candidate] = {}
    for candidate in parser.candidates:
        normalized = candidate.url.replace("http://", "https://")
        parsed = urlparse(normalized)
        canonical_path = re.sub(r"-\d+x\d+(?=\.[a-z0-9]+$)", "", parsed.path, flags=re.I)
        canonical = f"{parsed.netloc.lower()}{canonical_path}"
        current = best_by_url.get(canonical)
        if current is None or candidate.priority > current.priority:
            best_by_url[canonical] = Candidate(normalized, candidate.context, candidate.priority)
    return sorted(best_by_url.values(), key=lambda item: item.priority, reverse=True)


def visual_distance(left: Image.Image, right: Image.Image) -> float:
    a = left.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    b = right.convert("RGB").resize((48, 48), Image.Resampling.BILINEAR)
    return sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3


def open_image(raw: bytes) -> Image.Image:
    image = Image.open(BytesIO(raw)).convert("RGB")
    image.load()
    return image


def select_images(work: Work, candidates: list[Candidate], count: int = 2) -> list[tuple[Candidate, Image.Image, float]]:
    primary_path = ROOT / "public/images/buildings" / work.image_file
    if not primary_path.exists():
        raise RuntimeError(f"missing primary image: {primary_path}")
    with Image.open(primary_path) as primary_file:
        primary = primary_file.convert("RGB")
    selected: list[tuple[Candidate, Image.Image, float]] = []
    errors: list[str] = []
    hard_failures = 0
    for candidate in candidates[:14]:
        try:
            image = open_image(curl(candidate.url, timeout=25))
            width, height = image.size
            if min(width, height) < 500 or width * height < 450_000:
                continue
            distance = visual_distance(primary, image)
            if distance < 9:
                continue
            if any(visual_distance(existing[1], image) < 7 for existing in selected):
                continue
            selected.append((candidate, image, distance))
            if len(selected) >= count:
                break
        except Exception as exc:
            hard_failures += 1
            if len(errors) < 3:
                errors.append(str(exc))
            if hard_failures >= 3 and not selected:
                break
    if not selected:
        detail = f"; sample errors: {' | '.join(errors)}" if errors else ""
        raise RuntimeError(f"no distinct project-page photo from {len(candidates)} candidates{detail}")
    return selected


def load_register() -> tuple[dict[str, dict], list[dict]]:
    if not REGISTER.exists():
        return {}, []
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    migrated: dict[str, dict] = {}
    for record in data.get("records", []):
        if "images" in record:
            migrated[record["id"]] = record
            continue
        if record.get("localPath"):
            migrated[record["id"]] = {
                "id": record["id"],
                "name": record.get("name", record["id"]),
                "originalName": record.get("originalName", ""),
                "sourcePage": record.get("descriptionUrl", ""),
                "images": [{
                    "localPath": record["localPath"],
                    "alt": f'{record.get("name", record["id"])}补充建筑摄影',
                    "sourceLabel": f'Wikimedia Commons · {record.get("title", record["id"])}',
                    "sourceUrl": record.get("descriptionUrl", ""),
                    "imageUrl": record.get("imageUrl", ""),
                    "context": "migrated Commons record",
                    "priority": 0,
                    "dimensions": record.get("dimensions", []),
                    "visualDistance": record.get("visualDistance"),
                    "reviewStatus": record.get("reviewStatus", "needs-visual-review"),
                }],
            }
    return migrated, data.get("failures", [])


def write_outputs(records_by_id: dict[str, dict], failures: list[dict]) -> None:
    records = [records_by_id[key] for key in sorted(records_by_id)]
    lines = [
        'import type { Building } from "./schema";',
        "",
        'export const BUILDING_GALLERIES: Record<string, NonNullable<Building["gallery"]>> = {',
    ]
    for record in records:
        lines.append(f'  {json.dumps(record["id"])}: [')
        for image in record["images"]:
            lines.extend([
                "    {",
                f'      src: {json.dumps("/" + image["localPath"].split("public/", 1)[1], ensure_ascii=False)},',
                f'      alt: {json.dumps(image["alt"], ensure_ascii=False)},',
                "      source: { "
                f'label: {json.dumps(image["sourceLabel"], ensure_ascii=False)}, '
                f'url: {json.dumps(image["sourceUrl"], ensure_ascii=False)}, '
                'status: "prototype-source-noted" },',
                "    },",
            ])
        lines.append("  ],")
    lines.extend(["};", ""])
    REGISTRY.write_text("\n".join(lines), encoding="utf-8")
    REGISTER.parent.mkdir(parents=True, exist_ok=True)
    REGISTER.write_text(
        json.dumps({"records": records, "failures": failures}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build real-photo galleries from each building's project page")
    parser.add_argument("--ids", nargs="*", help="Specific building ids")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--replace", action="store_true", help="Replace existing record for selected ids")
    parser.add_argument("--delay", type=float, default=0.15)
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    records_by_id, previous_failures = load_register()
    selected_ids = set(args.ids or [])
    works = [work for work in parse_works() if work.id not in MANUAL_IDS]
    if selected_ids:
        works = [work for work in works if work.id in selected_ids]
    if args.limit:
        works = works[: args.limit]
    failures_by_id = {item["id"]: item for item in previous_failures if item.get("id")}

    for index, work in enumerate(works, 1):
        if work.id in records_by_id and not args.replace:
            print(f"[{index:02d}/{len(works)}] KEEP {work.id}", flush=True)
            continue
        try:
            candidates = collect_candidates(work)
            selected = select_images(work, candidates)
            images: list[dict] = []
            for image_index, (candidate, image, distance) in enumerate(selected, 2):
                target = OUT_DIR / f"{work.id.lower()}-{image_index:02d}.webp"
                image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
                image.save(target, "WEBP", quality=86, method=6)
                images.append({
                    "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
                    "alt": f"{work.name}补充建筑摄影视角 {image_index - 1}",
                    "sourceLabel": f"{work.source_label} · 项目页补充摄影",
                    "sourceUrl": work.source_url,
                    "imageUrl": candidate.url,
                    "context": candidate.context,
                    "priority": candidate.priority,
                    "dimensions": list(image.size),
                    "visualDistance": round(distance, 2),
                    "reviewStatus": "needs-visual-review",
                })
            records_by_id[work.id] = {
                "id": work.id,
                "name": work.name,
                "originalName": work.original_name,
                "sourcePage": work.source_url,
                "images": images,
            }
            failures_by_id.pop(work.id, None)
            print(f"[{index:02d}/{len(works)}] OK {work.id} images={len(images)}", flush=True)
        except Exception as exc:
            failures_by_id[work.id] = {
                "id": work.id,
                "name": work.name,
                "sourcePage": work.source_url,
                "error": str(exc),
            }
            print(f"[{index:02d}/{len(works)}] SKIP {work.id}: {exc}", flush=True)
        write_outputs(records_by_id, list(failures_by_id.values()))
        time.sleep(args.delay)

    write_outputs(records_by_id, list(failures_by_id.values()))
    print(f"records={len(records_by_id)} failures={len(failures_by_id)}", flush=True)


if __name__ == "__main__":
    main()
