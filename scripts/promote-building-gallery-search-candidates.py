from __future__ import annotations

import json
import runpy
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CURATION = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-search-curation.json"
DOWNLOADS = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-search-downloads.json"
REGISTER = ROOT / "docs/design/persona-expansion-16-v1/building-gallery-register.json"
FETCH_SCRIPT = ROOT / "scripts/fetch-building-galleries-from-project-pages.py"
GALLERY_DIR = ROOT / "public/images/buildings/gallery"


def main() -> None:
    modules = runpy.run_path(str(FETCH_SCRIPT), run_name="gallery_writer")
    works = {work.id: work for work in modules["parse_works"]()}
    write_outputs = modules["write_outputs"]
    curation = json.loads(CURATION.read_text(encoding="utf-8"))
    downloads = json.loads(DOWNLOADS.read_text(encoding="utf-8"))["records"]
    current = json.loads(REGISTER.read_text(encoding="utf-8"))
    records_by_id = {record["id"]: record for record in current.get("records", [])}
    download_map = {(record["id"], record["candidateIndex"]): record for record in downloads}
    GALLERY_DIR.mkdir(parents=True, exist_ok=True)

    def remove_registered_images(building_id: str) -> None:
        existing = records_by_id.get(building_id)
        if not existing:
            return
        gallery_root = GALLERY_DIR.resolve()
        for image in existing.get("images", []):
            path = (ROOT / image["localPath"]).resolve()
            if gallery_root not in path.parents:
                raise RuntimeError(f"refusing to remove outside gallery directory: {path}")
            if path.exists():
                path.unlink()

    for building_id in curation.get("withdrawn", []):
        remove_registered_images(building_id)
        records_by_id.pop(building_id, None)
        print(f"WITHDREW {building_id}")

    for building_id, candidate_index in curation.get("primaryReplacements", {}).items():
        record = download_map[(building_id, candidate_index)]
        work = works[building_id]
        source = ROOT / record["localPath"]
        target = ROOT / "public/images/buildings" / work.image_file
        shutil.copy2(source, target)
        print(f"REPLACED PRIMARY {building_id} <- candidate {candidate_index}")

    for building_id, selected_indexes in curation["selections"].items():
        work = works[building_id]
        remove_registered_images(building_id)
        images = []
        for gallery_index, candidate_index in enumerate(selected_indexes, 2):
            record = download_map[(building_id, candidate_index)]
            source = ROOT / record["localPath"]
            target = GALLERY_DIR / f"{building_id.lower()}-{gallery_index:02}.webp"
            shutil.copy2(source, target)
            images.append({
                "localPath": str(target.relative_to(ROOT)).replace("\\", "/"),
                "alt": f"{work.name}补充建筑摄影视角 {gallery_index - 1}",
                "sourceLabel": record["title"],
                "sourceUrl": record["pageUrl"],
                "imageUrl": record["imageUrl"],
                "dimensions": record["dimensions"],
                "visualDistance": record["visualDistance"],
                "reviewStatus": "visually-approved",
            })
        records_by_id[building_id] = {
            "id": building_id,
            "name": work.name,
            "originalName": work.original_name,
            "sourcePage": images[0]["sourceUrl"],
            "images": images,
            "reviewStatus": "visually-approved",
            "curationNote": "Selected from search candidate contact sheets",
        }
        print(f"PROMOTED {building_id} images={len(images)}")

    write_outputs(records_by_id, current.get("failures", []))
    print(f"total_gallery_records={len(records_by_id)}")


if __name__ == "__main__":
    main()
