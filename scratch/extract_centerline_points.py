from PIL import Image
import numpy as np
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\clean_track.png").convert('L')
track = np.array(im) > 128
dist = ndi.distance_transform_edt(track)

# Let's find ridge points: local maximum in either horizontal or vertical slice
ridge_h = (dist == ndi.maximum_filter(dist, size=(1, 5))) & (dist > 3)
ridge_v = (dist == ndi.maximum_filter(dist, size=(5, 1))) & (dist > 3)
ridge = ridge_h | ridge_v

pts = np.argwhere(ridge) # [y, x]
pts_set = set((p[1], p[0]) for p in pts) # (x, y)

start_pt = (200, 45)
closest_start = min(pts_set, key=lambda p: (p[0]-start_pt[0])**2 + (p[1]-start_pt[1])**2)

# Start by stepping eastward along the main straight (x increases)
second_pt = min([p for p in pts_set if p[0] > closest_start[0] + 5 and abs(p[1] - 45) < 10],
                key=lambda p: (p[0] - closest_start[0]))

ordered = [closest_start, second_pt]
pts_set.remove(closest_start)
if second_pt in pts_set:
    pts_set.remove(second_pt)

for _ in range(4000):
    curr = ordered[-1]
    prev = ordered[-2]
    # Direction vector
    vx = curr[0] - prev[0]
    vy = curr[1] - prev[1]
    vlen = max(0.001, np.hypot(vx, vy))
    vx /= vlen
    vy /= vlen

    # Look for forward candidates
    candidates = []
    for p in pts_set:
        dx = p[0] - curr[0]
        dy = p[1] - curr[1]
        d2 = dx*dx + dy*dy
        if 4 <= d2 <= 225: # between 2 and 15 px
            # Dot product with forward direction
            dot = (dx * vx + dy * vy) / max(0.001, np.sqrt(d2))
            if dot > -0.3: # don't double back 180 degrees
                candidates.append((d2 - dot * 10, p))

    if not candidates:
        # Relax constraints
        for p in pts_set:
            dx = p[0] - curr[0]
            dy = p[1] - curr[1]
            d2 = dx*dx + dy*dy
            if d2 <= 400:
                candidates.append((d2, p))

    if not candidates:
        break

    candidates.sort(key=lambda item: item[0])
    next_p = candidates[0][1]
    ordered.append(next_p)

    # Prune close points
    to_remove = [p for p in pts_set if (p[0]-next_p[0])**2 + (p[1]-next_p[1])**2 <= 25]
    for p in to_remove:
        pts_set.remove(p)

    # Stop if we looped back close to closest_start
    if len(ordered) > 100 and (next_p[0]-closest_start[0])**2 + (next_p[1]-closest_start[1])**2 < 100:
        print("Successfully looped back to start!")
        break

print("Clockwise ordered points:", len(ordered))

# Let's simplify points to ~20px step
simplified = [ordered[0]]
for p in ordered[1:]:
    last = simplified[-1]
    if (p[0]-last[0])**2 + (p[1]-last[1])**2 >= 256: # >= 16px
        simplified.append(p)

# Ensure closed loop
simplified.append(simplified[0])
print("Simplified clockwise points:", len(simplified))

# Output as JavaScript array of [x, y]
import json
with open(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\mexico_track_points.json", "w") as f:
    json.dump([[int(p[0]), int(p[1])] for p in simplified], f)
print("Saved mexico_track_points.json")
