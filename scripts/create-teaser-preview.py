"""Compose the approval frame from the existing scientific teaser assets."""

import argparse
import base64
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "drawer-teaser"
ASSETS = ROOT / "public" / "imgs" / "drawer_open_seed_5_sample_288"

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--width", type=int, choices=(640, 720), default=640)
width = parser.parse_args().width


def data_uri(path, mime):
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def picture(prefix, frame=None):
    suffix = "" if frame is None else f"_{frame}"
    return data_uri(ASSETS / f"{prefix}{suffix}_agentview_image.png", "image/png")


regular = data_uri(ROOT / "public/fonts/MyriadPro-Regular.woff", "font/woff")
bold = data_uri(ROOT / "public/fonts/MyriadPro-Bold.woff", "font/woff")

html = """<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Drawer Opening — First Frame</title>
<style>
@font-face { font-family: Myriad; src: url('__REGULAR__'); font-weight: 400; }
@font-face { font-family: Myriad; src: url('__BOLD__'); font-weight: 700; }
* { box-sizing: border-box; }
html, body { margin: 0; width: __CANVAS_WIDTH__px; height: 480px; overflow: hidden; background: white; }
body { font-family: Myriad, Arial, sans-serif; color: #233344; }
main { position: relative; width: __CANVAS_WIDTH__px; height: 480px; background: white; }
.original { left: 18px; }
.transformed { left: __TRANSFORMED_LEFT__px; color: #1f4f63; }
.panel { position: absolute; top: 24px; width: 228px; height: 432px; border: 5px solid #d8dfe5; border-radius: 24px; overflow: hidden; }
.panel.transformed { border-color: #8fcfe1; }
.label { position: absolute; left: 0; width: 100%; margin: 0; text-align: center; font-size: 17px; font-weight: 700; line-height: 20px; z-index: 1; }
.observation-label { top: 8px; }
.action-label { top: 205px; }
.observation { position: absolute; left: 27px; top: 31px; width: 164px; height: 164px; border: 1px solid #b9c0c4; display: block; }
.action { position: absolute; left: 1px; top: 203px; width: 216px; height: 216px; display: block; }
.transform { position: absolute; left: __TRANSFORM_LEFT__px; top: 209px; width: 106px; height: 62px; color: #1f4f63; text-align: center; }
.transform span { display: block; position: relative; left: -15px; width: 136px; color: #d97706; font-size: 34px; font-weight: 700; letter-spacing: 0.8px; line-height: 36px; }
.transform svg { position: absolute; left: 0; top: 32px; width: 106px; height: 20px; }
__WIDE_TRANSFORM_STYLES__
</style>
<main aria-label="Drawer-opening observation and action jointly transformed by MIRROR at a reflection angle of zero degrees">
  <section class="panel original">
    <h2 class="label observation-label">Observation</h2>
    <img class="observation" src="__ORIGINAL_OBS__" alt="Original simulated drawer observation">
    <h2 class="label action-label">Action</h2>
    <img class="action" src="__ORIGINAL_ACT__" alt="Original action bar chart with delta x, delta y, delta z, and delta psi">
  </section>
  <div class="transform">
    <span>MIRROR</span>
    <svg viewBox="0 0 192 28" aria-hidden="true">
      <path d="M4 14 H181 M170 3 L183 14 L170 25" fill="none" stroke="#1f4f63" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <section class="panel transformed">
    <h2 class="label observation-label">Transformed Observation</h2>
    <img class="observation" src="__TRANSFORMED_OBS__" alt="Transformed simulated drawer observation at zero degrees">
    <h2 class="label action-label">Transformed Action</h2>
    <img class="action" src="__TRANSFORMED_ACT__" alt="Transformed action bar chart at zero degrees">
  </section>
</main>
</html>
"""

replacements = {
    "__WIDE_TRANSFORM_STYLES__": """
.transform { left: 268px; top: 196px; width: 184px; height: 88px; }
.transform span { left: 0; width: 184px; font-size: 46px; font-weight: 400; line-height: 52px; }
.transform svg { top: 49px; width: 184px; height: 28px; }
""" if width == 720 else "",
    "__CANVAS_WIDTH__": str(width),
    "__TRANSFORMED_LEFT__": str(width - 246),
    "__TRANSFORM_LEFT__": str((width - 106) // 2),
    "__REGULAR__": regular,
    "__BOLD__": bold,
    "__ORIGINAL_OBS__": picture("Obs_Group_obs_raw"),
    "__ORIGINAL_ACT__": picture("Act_Group_act"),
    "__TRANSFORMED_OBS__": picture("Obs_Group_obs_raw", 0),
    "__TRANSFORMED_ACT__": picture("Act_Group_act", 0),
}
for token, value in replacements.items():
    html = html.replace(token, value)

OUTPUT.mkdir(parents=True, exist_ok=True)
preview = OUTPUT / f"drawer-opening-first-frame-{width}x480.html"
preview.write_text(html)
print(preview)
