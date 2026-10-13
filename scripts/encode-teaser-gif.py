"""Encode and validate the rendered teaser with one stable color palette."""

import argparse
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "drawer-teaser"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--width", type=int, choices=(640, 720), default=640)
width = parser.parse_args().width
frame_directory = OUTPUT / ("frames" if width == 640 else f"frames-{width}x480")
frames = [Image.open(frame_directory / f"frame-{i:02d}.png").convert("RGB") for i in range(24)]
assert all(frame.size == (width, 480) for frame in frames)

# Compare with the approved preview when available locally. Generated artifacts
# are ignored by Git, so a clean checkout can encode freshly rendered frames.
approved_name = (
    "drawer-opening-first-frame-640x480-orange-mirror.png" if width == 640
    else "drawer-opening-first-frame-720x480-large-mirror-arrow.png"
)
approved_path = OUTPUT / approved_name
approved_match = None
if approved_path.is_file():
    approved = Image.open(approved_path).convert("RGB")
    approved_match = ImageChops.difference(frames[0], approved).getbbox() is None
    assert approved_match, "First frame differs from the approved preview"

# A shared palette prevents the fixed text, borders, and original pair flickering.
atlas = Image.new("RGB", (width * 6, 480 * 4), "white")
for index, frame in enumerate(frames):
    atlas.paste(frame, ((index % 6) * width, (index // 6) * 480))
palette = atlas.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
# Keep the white background and approved design colors exact after quantization.
colors = palette.getpalette()
fixed_colors = []
for color in [(255, 255, 255), (217, 119, 6), (216, 223, 229), (143, 207, 225), (31, 79, 99), (35, 51, 68)]:
    nearest = min(range(256), key=lambda i: sum((colors[3 * i + channel] - color[channel]) ** 2 for channel in range(3)))
    colors[nearest * 3:nearest * 3 + 3] = color
    fixed_colors.append((color, nearest))
palette.putpalette(colors)
indexed_frames = [frame.quantize(palette=palette, dither=Image.Dither.NONE) for frame in frames]
# Pillow's palette lookup approximates nearby colors; restore exact solid pixels.
for frame, indexed in zip(frames, indexed_frames):
    for color, index in fixed_colors:
        red, green, blue = ImageChops.difference(frame, Image.new("RGB", frame.size, color)).split()
        difference = ImageChops.lighter(ImageChops.lighter(red, green), blue)
        mask = difference.point(lambda value: 255 if value == 0 else 0)
        indexed.paste(index, (0, 0), mask)

gif_path = OUTPUT / f"drawer-opening-teaser-{width}x480.gif"
indexed_frames[0].save(
    gif_path,
    save_all=True,
    append_images=indexed_frames[1:],
    duration=180,
    loop=0,
    disposal=1,
    optimize=False,
)

# Decode every frame to check timing, unchanged left side, and paired movement.
gif = Image.open(gif_path)
assert gif.size == (width, 480)
assert gif.n_frames == 24
assert gif.info["loop"] == 0
reference_static = None
durations = []
errors = []
animated_boxes = [(width - 214, 60, width - 50, 224), (width - 240, 232, width - 24, 448)]
for index in range(gif.n_frames):
    gif.seek(index)
    decoded = gif.convert("RGB")
    expected = indexed_frames[index].convert("RGB")
    assert ImageChops.difference(decoded, expected).getbbox() is None, f"Frame {index} decoded incorrectly"
    static = decoded.copy()
    for box in animated_boxes:
        static.paste((255, 255, 255), box)
    if reference_static is None:
        reference_static = static
    else:
        assert ImageChops.difference(static, reference_static).getbbox() is None, "Static region changed"
    assert decoded.getpixel((0, 0)) == (255, 255, 255), "Background is not white"
    if index:
        for box in animated_boxes:
            assert ImageChops.difference(frames[index].crop(box), frames[index - 1].crop(box)).getbbox(), "An animated region did not update"
    durations.append(gif.info["duration"])
    errors.append(sum(ImageStat.Stat(ImageChops.difference(decoded, frames[index])).mean) / 3)
assert durations == [180] * 24

frames[0].save(OUTPUT / f"drawer-opening-teaser-poster-{width}x480.png")
report = {
    "file": gif_path.name,
    "width": width,
    "height": 480,
    "frames": 24,
    "frame_duration_ms": 180,
    "loop_duration_seconds": sum(durations) / 1000,
    "loops": "infinite",
    "file_size_bytes": gif_path.stat().st_size,
    "first_frame_matches_approved_png": approved_match,
    "static_left_pair_and_labels_verified": True,
    "all_paired_frames_decode_correctly": True,
    "max_mean_absolute_rgb_quantization_error": round(max(errors), 3),
}
(OUTPUT / f"drawer-opening-teaser-{width}x480-validation.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
