from __future__ import annotations

import hashlib
import json
import runpy
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
OUTPUT = ROOT / "artifacts/qa/result-v7-galleries/cross-building-duplicate-audit.json"
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"


@dataclass(frozen=True)
class Asset:
    building_id: str
    role: str
    path: Path


def dhash(path: Path, size: int = 16) -> int:
    with Image.open(path) as source:
        image = source.convert("L").resize((size + 1, size), Image.Resampling.LANCZOS)
    value = 0
    pixels = list(image.getdata())
    for y in range(size):
        offset = y * (size + 1)
        for x in range(size):
            value = (value << 1) | int(pixels[offset + x] > pixels[offset + x + 1])
    return value


def main() -> None:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_source")
    works = modules["parse_works"]()
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    assets: list[Asset] = [
        Asset(work.id, "primary", ROOT / "public/images/buildings" / work.image_file)
        for work in works
    ]
    for record in data.get("records", []):
        for index, image in enumerate(record.get("images", []), 2):
            assets.append(Asset(record["id"], f"gallery-{index}", ROOT / image["localPath"]))

    fingerprints = []
    for asset in assets:
        raw = asset.path.read_bytes()
        fingerprints.append({
            "asset": asset,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "dhash": dhash(asset.path),
        })

    duplicates = []
    for left_index, left in enumerate(fingerprints):
        for right in fingerprints[left_index + 1:]:
            a, b = left["asset"], right["asset"]
            if a.building_id == b.building_id:
                continue
            hamming = bin(left["dhash"] ^ right["dhash"]).count("1")
            if left["sha256"] == right["sha256"] or hamming <= 8:
                duplicates.append({
                    "left": {"id": a.building_id, "role": a.role, "path": str(a.path.relative_to(ROOT)).replace("\\", "/")},
                    "right": {"id": b.building_id, "role": b.role, "path": str(b.path.relative_to(ROOT)).replace("\\", "/")},
                    "exact": left["sha256"] == right["sha256"],
                    "hamming": hamming,
                })
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"assetCount": len(assets), "duplicates": duplicates}, indent=2), encoding="utf-8")
    print(json.dumps({"assetCount": len(assets), "duplicateCount": len(duplicates), "duplicates": duplicates}, indent=2))


if __name__ == "__main__":
    main()
