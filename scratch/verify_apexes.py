import numpy as np
from PIL import Image
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\clean_track.png").convert("L")
track = np.array(im) > 128
dist = ndi.distance_transform_edt(track)

# Let's sample points along the Bezier path using matplotlib / svgpathtools or cubic bezier math
def eval_bezier(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    mt = 1 - t
    mt2 = mt * mt
    mt3 = mt2 * mt
    return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3

# Let's test the key turn apexes
apexes = [
    ("T1", 878, 72),
    ("T2", 860, 98),
    ("T3", 885, 125),
    ("T4", 768, 468),
    ("T5", 812, 485),
    ("T6", 744, 550),
    ("T7", 725, 345),
    ("T8", 678, 346),
    ("T9", 650, 278),
    ("T10", 545, 292),
    ("T11", 535, 228),
    ("T12", 212, 205),
    ("T13", 194, 90),
    ("T14", 175, 138),
    ("T15", 148, 140),
    ("T16", 93, 126),
    ("T17", 105, 54)
]

for name, x, y in apexes:
    d = dist[int(y), int(x)]
    print(f"{name:4s} ({x:3d}, {y:3d}): dist inside track = {d:.1f}px")
