from __future__ import annotations

import hashlib
import json
import shutil
import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageOps


if len(sys.argv) != 4:
    raise SystemExit("usage: optimize-images.py <jobs.json> <dist-root> <report.json>")

jobs_path = Path(sys.argv[1])
dist_root = Path(sys.argv[2])
report_path = Path(sys.argv[3])
payload = json.loads(jobs_path.read_text(encoding="utf-8"))
jobs = payload["jobs"]

tier_rank = {"hero": 0, "question": 1, "ui": 2, "primary": 3, "architect": 4, "gallery": 5}
tier_settings = {
    # Question images render as small choice cards on phones. Keeping an 800 px
    # long edge preserves more than 2x device detail while recovering enough
    # package headroom for the supplied home and draw-page artwork.
    "question": {"max_edge": 800, "quality": 72},
    "primary": {"max_edge": 760, "quality": 56},
    "architect": {"max_edge": 640, "quality": 68},
    # Gallery images remain visible at mobile detail-view sizes, but are encoded
    # slightly more tightly because the XHS deployment service limits packages to
    # 200 files. The build embeds this tier into one classic script to preserve
    # every image without shipping 130 separate files.
    "gallery": {"max_edge": 500, "quality": 33},
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


groups: dict[str, list[dict]] = defaultdict(list)
for job in jobs:
    source = Path(job["source"])
    if not source.is_file():
        raise FileNotFoundError(source)
    job["sourceBytes"] = source.stat().st_size
    job["sha256"] = sha256(source)
    groups[job["sha256"]].append(job)

entries: list[dict] = []
outputs: list[dict] = []

for digest, group in groups.items():
    best = min(group, key=lambda item: tier_rank[item["tier"]])
    tier = best["tier"]
    source = Path(best["source"])

    if tier in {"hero", "ui"}:
        folder = "personas" if tier == "hero" else "ui"
        filename = f'{best.get("name") or source.stem}{source.suffix.lower()}'
        relative = Path("assets") / "media" / folder / filename
        destination = dist_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        with Image.open(source) as opened:
            width, height = opened.size
    elif tier == "question":
        relative = Path("assets") / "media" / "questions" / f'{best.get("name") or source.stem}.webp'
        destination = dist_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        settings = tier_settings[tier]
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGB")
            if max(image.size) > settings["max_edge"]:
                image.thumbnail((settings["max_edge"], settings["max_edge"]), Image.Resampling.LANCZOS)
            width, height = image.size
            image.save(destination, "WEBP", quality=settings["quality"], method=6, optimize=True)
    else:
        relative = Path("assets") / "media" / tier / f"{digest[:18]}.webp"
        destination = dist_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        settings = tier_settings[tier]
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened)
            if image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info):
                rgba = image.convert("RGBA")
                background = Image.new("RGB", rgba.size, "#f2eee5")
                background.paste(rgba, mask=rgba.getchannel("A"))
                image = background
            else:
                image = image.convert("RGB")
            if max(image.size) > settings["max_edge"]:
                image.thumbnail((settings["max_edge"], settings["max_edge"]), Image.Resampling.LANCZOS)
            width, height = image.size
            image.save(destination, "WEBP", quality=settings["quality"], method=6, optimize=True)

    output_path = "./" + relative.as_posix()
    output_bytes = destination.stat().st_size
    outputs.append({
        "path": output_path,
        "tier": tier,
        "bytes": output_bytes,
        "width": width,
        "height": height,
        "sourceCount": len(group),
    })
    for job in group:
        entries.append({
            "key": job["key"],
            "output": output_path,
            "tier": job["tier"],
            "encodedTier": tier,
            "roles": job["roles"],
            "sourceBytes": job["sourceBytes"],
            "outputBytes": output_bytes,
            "width": width,
            "height": height,
            "sha256": digest,
        })

entries.sort(key=lambda item: item["key"])
outputs.sort(key=lambda item: item["path"])

source_bytes = sum(job["sourceBytes"] for job in jobs)
output_bytes = sum(item["bytes"] for item in outputs)
summary = {
    "sourceEntries": len(jobs),
    "exactDuplicateGroups": sum(1 for group in groups.values() if len(group) > 1),
    "outputFiles": len(outputs),
    "sourceBytes": source_bytes,
    "outputBytes": output_bytes,
    "savedBytes": source_bytes - output_bytes,
    "outputMegabytes": round(output_bytes / 1024 / 1024, 3),
}

report = {
    "version": 2,
    "entries": entries,
    "outputs": outputs,
    "outputFiles": len(outputs),
    "summary": summary,
}
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False))
