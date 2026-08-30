from __future__ import annotations

import json
import runpy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
CURATION = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-curation.json"
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"


def main() -> None:
    data = json.loads(REGISTER.read_text(encoding="utf-8"))
    curation = json.loads(CURATION.read_text(encoding="utf-8"))["records"]
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_writer")
    write_outputs = modules["write_outputs"]

    approved: dict[str, dict] = {}
    rejected_files: list[Path] = []
    for record in data.get("records", []):
        decision = curation.get(record["id"])
        if decision is None:
            continue
        keep_indexes = set(decision["keep"])
        kept_images = []
        for index, image in enumerate(record.get("images", [])):
            path = ROOT / image["localPath"]
            if index in keep_indexes:
                image["reviewStatus"] = "visually-approved"
                kept_images.append(image)
            else:
                rejected_files.append(path)
        if kept_images:
            record["images"] = kept_images
            record["reviewStatus"] = "visually-approved"
            record["curationNote"] = decision["note"]
            approved[record["id"]] = record

    failures = data.get("failures", [])
    write_outputs(approved, failures)
    for path in rejected_files:
        resolved = path.resolve()
        gallery_root = (ROOT / "public/images/buildings/gallery").resolve()
        if gallery_root not in resolved.parents:
            raise RuntimeError(f"refusing to remove outside gallery directory: {resolved}")
        if path.exists():
            path.unlink()
            print(f"REMOVED {path.relative_to(ROOT)}")
    print(f"approved_records={len(approved)} removed_files={len(rejected_files)}")


if __name__ == "__main__":
    main()
