from __future__ import annotations

import html
import json
import re
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import urljoin

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILE = ROOT / "src/content/new-persona-buildings.ts"
OUT_DIR = ROOT / "public/images/buildings"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/official-project-image-register.json"
USER_AGENT = "Mozilla/5.0 ArcBTI local visual research prototype"


def curl(url: str, output: Path | None = None) -> bytes:
    args = ["curl.exe", "-fsSL", "--retry", "2", "--retry-all-errors", "--connect-timeout", "12", "--max-time", "40", "-A", USER_AGENT]
    if output:
        args += ["-o", str(output)]
    args.append(url)
    result = subprocess.run(args, check=True, capture_output=True)
    return result.stdout


def extract_items(source: str) -> list[dict[str, str]]:
    pattern = re.compile(
        r'imageFile:\s*"(?P<file>[^"]+)".*?sourceLabel:\s*"(?P<label>[^"]+)"\s*,\s*sourceUrl:\s*"(?P<url>[^"]+)"',
        re.S,
    )
    return [match.groupdict() for match in pattern.finditer(source)]


def find_image_url(page_url: str, body: str) -> str | None:
    patterns = [
        r'<meta[^>]+property=["\']og:image(?::secure_url)?["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image(?::secure_url)?["\']',
        r'<meta[^>]+name=["\']twitter:image(?::src)?["\'][^>]+content=["\']([^"\']+)',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']twitter:image(?::src)?["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, body, re.I)
        if match:
            return urljoin(page_url, html.unescape(match.group(1)).replace("\\/", "/"))
    return None


def convert(source: Path, target: Path) -> tuple[int, int]:
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=86, method=6)
        return image.size


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    items = extract_items(SOURCE_FILE.read_text(encoding="utf-8"))
    records: list[dict] = []
    failures: list[dict] = []
    for index, item in enumerate(items, 1):
        target = OUT_DIR / item["file"]
        target.unlink(missing_ok=True)
        try:
            page = curl(item["url"]).decode("utf-8", errors="ignore")
            image_url = find_image_url(item["url"], page)
            if not image_url:
                raise RuntimeError("no og:image or twitter:image")
            with tempfile.NamedTemporaryFile(suffix=".image", delete=False) as temp_file:
                temp = Path(temp_file.name)
            try:
                curl(image_url, temp)
                dimensions = convert(temp, target)
            finally:
                temp.unlink(missing_ok=True)
            records.append({
                **item,
                "imageUrl": image_url,
                "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
                "dimensions": list(dimensions),
            })
            print(f"[{index:02d}/{len(items)}] OK {item['file']} <- {item['url']}", flush=True)
        except Exception as exc:
            failures.append({**item, "error": str(exc)})
            print(f"[{index:02d}/{len(items)}] FAIL {item['file']}: {exc}", flush=True)
        time.sleep(0.08)
    REGISTER.write_text(json.dumps({"records": records, "failures": failures}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"records={len(records)} failures={len(failures)}", flush=True)


if __name__ == "__main__":
    main()
