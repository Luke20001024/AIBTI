from pathlib import Path
from PIL import Image, ImageOps


workspace = Path(__file__).resolve().parents[1]
source_root = workspace / "design" / "reference-source"
public_root = workspace / "public" / "images"


def optimize(kind: str, size: tuple[int, int], quality: int) -> None:
    source_dir = source_root / kind
    output_dir = public_root / kind
    output_dir.mkdir(parents=True, exist_ok=True)
    for source in source_dir.glob("*.source"):
        output = output_dir / f"{source.stem}.webp"
        try:
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image).convert("RGB")
                image.thumbnail(size, Image.Resampling.LANCZOS)
                image.save(output, "WEBP", quality=quality, method=6)
            print(f"OK\t{kind}\t{output.name}\t{output.stat().st_size}")
        except Exception as error:
            print(f"FAIL\t{kind}\t{source.name}\t{error}")


optimize("buildings", (1440, 1000), 78)
optimize("architects", (600, 800), 80)
