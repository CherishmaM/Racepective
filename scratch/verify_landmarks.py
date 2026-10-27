import numpy as np
from PIL import Image
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Track mask
track = alpha & (
    ((r < 35) & (g < 35) & (b < 35)) |
    ((r > 180) & (g < 50) & (b < 50)) |
    ((r < 50) & (g > 180) & (b > 180)) |
    ((r > 180) & (g > 180) & (b < 50))
)

# Fill holes in track to ensure solid track ribbon
track_filled = ndi.binary_fill_holes(track)

# Distance transform
dist = ndi.distance_transform_edt(track_filled)

# Start tracing from Start/Finish: x=200, y=45
# We want to find the sequence of points following the ridge of dist
# Let's find key control points by sampling every ~25-30 pixels along the loop
# We can do a walking tracer from (200, 45) in the direction (1, 0)
curr = np.array([45.0, 200.0]) # [y, x]
visited = np.zeros_like(track, dtype=bool)

# Let's define the key waypoint landmarks verified by the turns and sector bounds:
landmarks = [
    # Main straight (Sector 1 begins)
    ("START_FINISH", 200, 45),
    ("SPEED_TRAP", 763, 45),
    ("MAIN_STRAIGHT_END", 850, 45),
    # Turn 1, 2, 3 chicane
    ("T1_ENTRY", 870, 50),
    ("T1_APEX", 878, 65),
    ("T2_APEX", 860, 95),
    ("T3_APEX", 885, 120),
    ("S1_S2_STRAIGHT", 845, 250),
    ("S1_END_S2_START", 804, 399),
    # Turns 4, 5, 6
    ("T4_APEX", 770, 460),
    ("T5_APEX", 812, 482),
    ("T6_APEX", 735, 545),
    ("T6_EXIT", 725, 450),
    # Turns 7, 8, 9, 10, 11 (Esses)
    ("T7_APEX", 725, 345),
    ("T8_APEX", 665, 345),
    ("DRS_DET_1", 606, 283),
    ("T9_APEX", 650, 275),
    ("T10_APEX", 540, 290),
    ("T11_APEX", 535, 230),
    # Intermediate straight
    ("S2_END_S3_START", 336, 201),
    ("STADIUM_ENTRY_APPROACH", 250, 203),
    # Stadium complex (Foro Sol): Turns 12, 13, 14, 15, 16, 17
    ("T12_APEX", 215, 205),
    ("T12_TO_T13", 205, 150),
    ("T13_APEX", 195, 90),
    ("T14_APEX", 175, 140),
    ("T15_APEX", 145, 140), # DRS_DET_2 sensor
    ("T16_APEX", 95, 130),
    ("T17_APEX", 105, 55),
    ("MAIN_STRAIGHT_RETURN", 150, 45),
]

print("Landmarks defined:", len(landmarks))
# Verify each landmark is indeed inside or close to the track:
for name, x, y in landmarks:
    d = dist[int(y), int(x)]
    print(f"{name:25s} at ({x:3d}, {y:3d}): distance inside track = {d:.1f}px")
