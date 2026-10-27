import numpy as np
from PIL import Image
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Detect the precise centers of turn pill badges from the image
# Turn numbers 01 to 17
# Let's find each turn badge in the image:
turn_badges = [
    {"turn": "01", "x": 892, "y": 42, "anchor": "top-right"},
    {"turn": "02", "x": 863, "y": 107, "anchor": "inner"},
    {"turn": "03", "x": 924, "y": 105, "anchor": "outer"},
    {"turn": "04", "x": 792, "y": 458, "anchor": "outer"},
    {"turn": "05", "x": 826, "y": 486, "anchor": "outer"},
    {"turn": "06", "x": 744, "y": 554, "anchor": "hairpin"},
    {"turn": "07", "x": 756, "y": 348, "anchor": "outer"},
    {"turn": "08", "x": 677, "y": 346, "anchor": "outer"},
    {"turn": "09", "x": 663, "y": 271, "anchor": "outer"},
    {"turn": "10", "x": 544, "y": 296, "anchor": "outer"},
    {"turn": "11", "x": 546, "y": 225, "anchor": "outer"},
    {"turn": "12", "x": 215, "y": 211, "anchor": "inner"},
    {"turn": "13", "x": 198, "y": 89, "anchor": "top"},
    {"turn": "14", "x": 178, "y": 143, "anchor": "inner"},
    {"turn": "15", "x": 145, "y": 141, "anchor": "inner"},
    {"turn": "16", "x": 91, "y": 130, "anchor": "outer"},
    {"turn": "17", "x": 110, "y": 52, "anchor": "top-left"},
]

# Check turn badge colors
for tb in turn_badges:
    x, y = tb["x"], tb["y"]
    # Check that this is inside a black region
    patch = arr[y-5:y+5, x-5:x+5]
    print(f"Turn {tb['turn']} at ({x}, {y}): center rgb={arr[y,x, :3]}")

# Now let's trace the full track path cleanly with Bezier curves or polyline
# The image resolution is 1024x576.
# Let's verify the DRS boxes:
# DRS DETECTION ZONE 1: box x in [442, 611], y in [370, 470], pointer line goes to (606, 283)
# DRS DETECTION ZONE 2: box x in [155, 324], y in [230, 335], pointer line goes to (158, 126)
# SPEED TRAP: box x in [655, 766], y in [39, 141], pointer line goes to (763, 45)
# Checkered flag at (200, 16)
# Direction arrows at (255, 16)
