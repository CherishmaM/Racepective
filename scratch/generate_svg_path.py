from PIL import Image
import numpy as np
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Colored sectors:
is_red = alpha & (r > 180) & (g < 50) & (b < 50)
is_cyan = alpha & (r < 50) & (g > 180) & (b > 180)
is_yellow = alpha & (r > 180) & (g > 180) & (b < 50)

# Also find the black track centerline by thinning/distance transform
track = alpha & (
    ((r < 35) & (g < 35) & (b < 35)) | is_red | is_cyan | is_yellow
)
track_filled = ndi.binary_fill_holes(track)
dist = ndi.distance_transform_edt(track_filled)

# Key track segments:
# Main Straight: (200, 45) -> (850, 45)
# Turn 1-3 Chicane:
# (850, 45) -> curve to (872, 52) -> (878, 68) [T1 apex]
# -> curve left to (860, 95) [T2 apex]
# -> curve right to (885, 120) [T3 apex]
# Straight down to Turn 4:
# (885, 120) -> straight down-right to (804, 399) [Sector 1 end / Sector 2 start]
# -> (770, 455) [T4 apex]
# -> (812, 482) [T5 apex]
# -> (785, 530) -> (745, 550) [T6 hairpin bottom]
# -> curve up to (725, 450) -> (725, 345) [T7 apex]
# -> curve left into Esses: (675, 345) [T8 apex]
# -> curve right to (650, 275) [T9 apex]
# DRS Detection 1 is at (606, 283)
# -> curve left to (540, 290) [T10 apex]
# -> curve right to (535, 230) [T11 apex]
# Intermediate straight:
# (535, 230) -> straight left to (336, 201) [Sector 2 end / Sector 3 start]
# -> straight left to (225, 204) [T12 entry]
# Stadium complex (Foro Sol):
# -> sharp right to (212, 205) [T12 apex] -> curve up to (200, 150) -> (194, 90) [T13 apex]
# -> curve down-left to (174, 140) [T14 apex]
# -> curve left to (150, 140) [T15 apex / DRS Detection 2 sensor]
# -> curve left to (95, 128) [T16 apex]
# Peraltada:
# -> curve up-right through (105, 55) [T17 apex]
# -> curve onto main straight at (150, 45) -> (200, 45) [Start/Finish line]!

# Let's verify these precise coordinates against dist:
test_pts = [
    (200, 45), (400, 45), (600, 45), (763, 45), (850, 45),
    (872, 52), (878, 68), (860, 95), (885, 120),
    (865, 200), (840, 300), (804, 399), (770, 455),
    (812, 482), (785, 530), (745, 550), (725, 450),
    (725, 345), (675, 345), (650, 275), (606, 283),
    (540, 290), (535, 230), (450, 215), (336, 201),
    (225, 204), (212, 205), (198, 120), (194, 90),
    (174, 140), (150, 140), (95, 128), (105, 55),
    (150, 45)
]

for x, y in test_pts:
    d = dist[int(y), int(x)]
    print(f"({x:3d}, {y:3d}): dist = {d:.1f}")
