from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PERSONA_ROOT = ROOT / "public/images/personas"
ARCHITECT_ROOT = ROOT / "public/images/architects-v7-illustrated"


def convert(source: Path, destination: Path, *, quality: int = 90) -> tuple[int, int]:
    with Image.open(source) as image:
        image.convert("RGB").save(destination, "WEBP", quality=quality, method=6)
    return source.stat().st_size, destination.stat().st_size


def main() -> None:
    sources = sorted(PERSONA_ROOT.glob("*/hero-poster-v1.png"))
    sources.extend(sorted(ARCHITECT_ROOT.glob("*-illustrated-v1.png")))
    if len(sources) != 24:
        raise RuntimeError(f"Expected 24 mobile source images, found {len(sources)}")

    total_before = 0
    total_after = 0
    for source in sources:
        destination = source.with_suffix(".webp")
        before, after = convert(source, destination)
        total_before += before
        total_after += after
        print(f"{source.relative_to(ROOT)} -> {destination.name}: {before} -> {after} bytes")

    reduction = 100 * (1 - total_after / total_before)
    print(f"Total: {total_before} -> {total_after} bytes ({reduction:.1f}% reduction)")


if __name__ == "__main__":
    main()
