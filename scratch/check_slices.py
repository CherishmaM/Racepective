from PIL import Image
import numpy as np
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

track = alpha & (
    ((r < 35) & (g < 35) & (b < 35)) |
    ((r > 180) & (g < 50) & (b < 50)) |
    ((r < 50) & (g > 180) & (b > 180)) |
    ((r > 180) & (g > 180) & (b < 50))
)
track_filled = ndi.binary_fill_holes(track)
dist = ndi.distance_transform_edt(track_filled)

# Check vertical straight between T6 and T7:
# Turn 6 is at y=550. Track goes up to Turn 7 at y=345.
# Let's see what x the track is at for y in [350, 400, 450, 500, 540]:
for test_y in [350, 400, 450, 500, 530, 545]:
    xs = np.where(dist[test_y, :] > 5)[0]
    if len(xs) > 0:
        print(f"y={test_y}: track xs from {xs.min()} to {xs.max()}, center = {np.median(xs):.1f}, max dist = {dist[test_y, int(np.median(xs))]:.1f}")

# Check DRS Detection 1 area around y=283:
for test_y in [270, 280, 285, 290, 300]:
    xs = np.where(dist[test_y, :] > 5)[0]
    # Filter xs between 550 and 650
    m_xs = xs[(xs >= 550) & (xs <= 650)]
    if len(m_xs) > 0:
        print(f"y={test_y} (Esses): xs between 550-650: center = {np.median(m_xs):.1f}")
