from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


SCRIPT_DIR = Path(__file__).resolve().parent
MINI_ROOT = SCRIPT_DIR.parent
PROJECT_ROOT = MINI_ROOT.parent
INTERFACE_DIR = PROJECT_ROOT / "public" / "images" / "interface"

HOME_SOURCE = INTERFACE_DIR / "home-persona-ensemble-source.png"
HOME_OUTPUT = INTERFACE_DIR / "home-persona-ensemble-v1.webp"
HOME_EXTENSION_OUTPUT = INTERFACE_DIR / "home-persona-ensemble-extension-v1.webp"
DRAW_SOURCE = INTERFACE_DIR / "draw-paper-blueprint-source.png"
DRAW_OUTPUT = INTERFACE_DIR / "draw-paper-blueprint-v1.webp"


def build_home_asset() -> dict[str, object]:
    with Image.open(HOME_SOURCE) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")

    source_width, source_height = image.size
    target_height = round(source_width * 7 / 6)
    if target_height > source_height:
        raise ValueError("The supplied home artwork is too short for a 6:7 crop")

    # Remove only the excess empty wall at the top. No person, building, or
    # lower-scene content is regenerated or removed.
    crop_top = source_height - target_height
    cropped = image.crop((0, crop_top, source_width, source_height))
    rendered = cropped.resize((900, 1050), Image.Resampling.LANCZOS)
    rendered.save(HOME_OUTPUT, "WEBP", quality=80, method=6, optimize=True)

    return {
        "source": str(HOME_SOURCE),
        "sourceSize": [source_width, source_height],
        "crop": [0, crop_top, source_width, source_height],
        "output": str(HOME_OUTPUT),
        "outputSize": list(rendered.size),
        "bytes": HOME_OUTPUT.stat().st_size,
    }


def smoothstep(value: float) -> float:
    clamped = max(0.0, min(1.0, value))
    return clamped * clamped * (3.0 - 2.0 * clamped)


def vertical_mask(width: int, height: int, values: list[int]) -> Image.Image:
    column = Image.new("L", (1, height))
    column.putdata(values)
    return column.resize((width, height), Image.Resampling.NEAREST)


def build_home_extension() -> dict[str, object]:
    # Derive the continuation from the exact decoded runtime artwork. The first
    # rows therefore match the displayed hero edge pixel-for-pixel; below that
    # edge the reflected scene gradually becomes blurred and darker.
    with Image.open(HOME_OUTPUT) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")

    width, height = image.size
    strip_height = min(220, height)
    extension_height = 620
    strip = image.crop((0, height - strip_height, width, height))
    reflection = ImageOps.flip(strip).resize((width, extension_height), Image.Resampling.BICUBIC)
    blurred = reflection.filter(ImageFilter.GaussianBlur(radius=30))

    blur_values = []
    dark_values = []
    for y in range(extension_height):
        blur_progress = smoothstep((y - 10) / 155)
        dark_progress = smoothstep(y / (extension_height - 1))
        blur_values.append(round(255 * blur_progress))
        dark_values.append(round(255 * 0.56 * dark_progress))

    extension = Image.composite(
        blurred,
        reflection,
        vertical_mask(width, extension_height, blur_values),
    )
    extension = Image.composite(
        Image.new("RGB", extension.size, "#071014"),
        extension,
        vertical_mask(width, extension_height, dark_values),
    )

    # Preserve a short exact seam guard after blur/dark compositing. Saving this
    # derivative losslessly prevents a new codec boundary from appearing.
    extension.paste(reflection.crop((0, 0, width, 4)), (0, 0))
    extension.save(HOME_EXTENSION_OUTPUT, "WEBP", lossless=True, method=6)

    return {
        "source": str(HOME_OUTPUT),
        "sourceSize": [width, height],
        "sourceStrip": [0, height - strip_height, width, height],
        "output": str(HOME_EXTENSION_OUTPUT),
        "outputSize": list(extension.size),
        "bytes": HOME_EXTENSION_OUTPUT.stat().st_size,
    }


def build_draw_background() -> dict[str, object]:
    with Image.open(DRAW_SOURCE) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")

    image.save(DRAW_OUTPUT, "WEBP", quality=74, method=6, optimize=True)
    return {
        "source": str(DRAW_SOURCE),
        "sourceSize": list(image.size),
        "output": str(DRAW_OUTPUT),
        "outputSize": list(image.size),
        "bytes": DRAW_OUTPUT.stat().st_size,
    }


def main() -> None:
    missing = [str(path) for path in (HOME_SOURCE, DRAW_SOURCE) if not path.is_file()]
    if missing:
        raise FileNotFoundError(f"Missing supplied interface sources: {missing}")

    report = {
        "home": build_home_asset(),
        "homeExtension": build_home_extension(),
        "drawBackground": build_draw_background(),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
