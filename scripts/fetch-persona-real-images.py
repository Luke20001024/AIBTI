from __future__ import annotations

import html
import json
import re
import subprocess
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
QUERY_FILE = ROOT / "docs/design/persona-expansion-16-v1/real-image-asset-queries.json"
REGISTER_FILE = ROOT / "docs/design/persona-expansion-16-v1/real-image-source-register.json"
BUILDING_DIR = ROOT / "public/images/buildings"
ARCHITECT_DIR = ROOT / "public/images/architects-v2"
QA_DIR = ROOT / "artifacts/qa/persona-expansion-16-v1"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "ArcBTI-local-prototype/1.0 (image source QA)"


def clean(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value))).strip()


def api_json(params: dict[str, str]) -> dict:
    url = API + "?" + urllib.parse.urlencode(params)
    result = subprocess.run(
        ["curl.exe", "-fsSL", "--retry", "5", "--retry-all-errors", "--connect-timeout", "20", "--max-time", "60", "-A", USER_AGENT, url],
        check=True,
        capture_output=True,
    )
    return json.loads(result.stdout.decode("utf-8"))


def search(query: str) -> list[dict]:
    data = api_json({
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": "10",
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": "1600",
        "format": "json",
        "formatversion": "2",
        "origin": "*",
    })
    return data.get("query", {}).get("pages", [])


def score(page: dict, query: str, portrait: bool) -> float:
    info = (page.get("imageinfo") or [{}])[0]
    title = page.get("title", "").lower()
    width = int(info.get("width") or 0)
    height = int(info.get("height") or 0)
    mime = info.get("mime", "")
    if mime not in {"image/jpeg", "image/png", "image/webp"}:
        return -1000
    bad = ("logo", "map", "plan", "drawing", "diagram", "floor", "site_plan", "icon", "svg", "chair", "pavilion")
    value = -4 * sum(token in title for token in bad)
    tokens = [token.lower() for token in re.findall(r"[A-Za-z0-9]+", query) if len(token) > 2]
    value += 2 * sum(token in title for token in tokens)
    if portrait:
        value += 2 if height >= width else -1
        value += 1 if "portrait" in title else 0
        value -= 3 if any(word in title for word in ("building", "museum", "school", "roof", "gallery", "chair")) else 0
    else:
        value += 1 if width >= height else 0
    value += min(width, 4000) / 4000
    return value


def download(url: str, target: Path) -> None:
    subprocess.run(
        ["curl.exe", "-fsSL", "--retry", "5", "--retry-all-errors", "--connect-timeout", "20", "--max-time", "120", "-A", USER_AGENT, "-o", str(target), url],
        check=True,
        capture_output=True,
    )


def convert(source: Path, target: Path, portrait: bool) -> tuple[int, int]:
    with Image.open(source) as image:
        image = image.convert("RGB")
        max_size = (1200, 1500) if portrait else (1600, 1200)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=86, method=6)
        return image.size


def load_font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def contact_sheet(records: list[dict], target: Path, title: str) -> None:
    cols = 4
    cell_w, cell_h = 360, 290
    header = 80
    rows = (len(records) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, header + rows * cell_h), "#ddd9cf")
    draw = ImageDraw.Draw(sheet)
    draw.text((28, 22), title, fill="#11161c", font=load_font(26, True))
    for index, record in enumerate(records):
        row, col = divmod(index, cols)
        x, y = col * cell_w, header + row * cell_h
        path = ROOT / record["localPath"]
        with Image.open(path) as image:
            image = image.convert("RGB")
            image.thumbnail((cell_w - 24, 218), Image.Resampling.LANCZOS)
            px = x + (cell_w - image.width) // 2
            py = y + 8 + (218 - image.height) // 2
            sheet.paste(image, (px, py))
        draw.text((x + 12, y + 232), record["label"][:34], fill="#11161c", font=load_font(16, True))
        draw.text((x + 12, y + 257), record["commonsTitle"][:45], fill="#4b5055", font=load_font(11))
    target.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(target, "PNG", optimize=True)


def main() -> None:
    config = json.loads(QUERY_FILE.read_text(encoding="utf-8"))
    BUILDING_DIR.mkdir(parents=True, exist_ok=True)
    ARCHITECT_DIR.mkdir(parents=True, exist_ok=True)
    QA_DIR.mkdir(parents=True, exist_ok=True)
    records: list[dict] = []
    failures: list[dict] = []

    for kind in ("architects", "buildings"):
        portrait = kind == "architects"
        output_dir = ARCHITECT_DIR if portrait else BUILDING_DIR
        for item in config[kind]:
            target = output_dir / item["file"]
            target.unlink(missing_ok=True)
            try:
                pages = search(item["query"])
                ranked = sorted(pages, key=lambda page: score(page, item["query"], portrait), reverse=True)
                if not ranked or score(ranked[0], item["query"], portrait) < -100:
                    raise RuntimeError("no usable Wikimedia raster result")
                page = ranked[0]
                info = page["imageinfo"][0]
                url = info.get("thumburl") or info["url"]
                temp = output_dir / (item["file"] + ".download")
                download(url, temp)
                dimensions = convert(temp, target, portrait)
                temp.unlink(missing_ok=True)
                metadata = info.get("extmetadata") or {}
                record = {
                    "kind": kind,
                    "label": item["label"],
                    "query": item["query"],
                    "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
                    "dimensions": list(dimensions),
                    "commonsTitle": page.get("title", ""),
                    "commonsPage": info.get("descriptionurl") or info.get("descriptionshorturl") or "",
                    "artist": clean((metadata.get("Artist") or {}).get("value")),
                    "license": clean((metadata.get("LicenseShortName") or {}).get("value")),
                    "licenseUrl": clean((metadata.get("LicenseUrl") or {}).get("value")),
                }
                records.append(record)
                print(f"OK {kind}: {item['label']} <- {record['commonsTitle']}")
            except Exception as exc:
                failures.append({"kind": kind, **item, "error": str(exc)})
                print(f"FAIL {kind}: {item['label']} ({exc})")
            time.sleep(0.12)

    register = {"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "records": records, "failures": failures}
    REGISTER_FILE.write_text(json.dumps(register, ensure_ascii=False, indent=2), encoding="utf-8")
    architect_records = [record for record in records if record["kind"] == "architects"]
    building_records = [record for record in records if record["kind"] == "buildings"]
    if architect_records:
        contact_sheet(architect_records, QA_DIR / "new-8-architects-real-images-v1.png", "NEW 8 ARCHITECTS · REAL IMAGE SOURCE QA")
    if building_records:
        contact_sheet(building_records, QA_DIR / "new-40-buildings-real-images-v1.png", "NEW 40 WORKS · REAL BUILDING IMAGE QA")
    print(f"records={len(records)} failures={len(failures)} register={REGISTER_FILE}")


if __name__ == "__main__":
    main()
