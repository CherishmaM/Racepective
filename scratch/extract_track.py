from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png").convert('RGB')
arr = np.array(im)

# Red Sector 1:
red_y, red_x = np.where((arr[:,:,0] > 180) & (arr[:,:,1] < 50) & (arr[:,:,2] < 50))
print("Red Sector 1: x in [", red_x.min(), red_x.max(), "] y in [", red_y.min(), red_y.max(), "]")

# Cyan Sector 2:
cyan_y, cyan_x = np.where((arr[:,:,0] < 50) & (arr[:,:,1] > 180) & (arr[:,:,2] > 180))
print("Cyan Sector 2: x in [", cyan_x.min(), cyan_x.max(), "] y in [", cyan_y.min(), cyan_y.max(), "]")

# Yellow Sector 3:
yellow_y, yellow_x = np.where((arr[:,:,0] > 180) & (arr[:,:,1] > 180) & (arr[:,:,2] < 50))
print("Yellow Sector 3: x in [", yellow_x.min(), yellow_x.max(), "] y in [", yellow_y.min(), yellow_y.max(), "]")

# Let's find the turn badges
# In the image, turn badges are black shapes with white numbers like '01', '02', ..., '17'.
# Let's find white components (arr > 240 in all 3) that are inside black regions
is_white = (arr[:,:,0] > 240) & (arr[:,:,1] > 240) & (arr[:,:,2] > 240)
from scipy import ndimage as ndi
labels, num_features = ndi.label(is_white)
print("Total white components:", num_features)

turn_candidates = []
for i in range(1, num_features + 1):
    y, x = np.where(labels == i)
    if 10 < len(x) < 500:
        cy, cx = int(np.mean(y)), int(np.mean(x))
        nb = arr[max(0, cy-15):min(576, cy+15), max(0, cx-15):min(1024, cx+15)]
        black_count = np.sum((nb[:,:,0] < 30) & (nb[:,:,1] < 30) & (nb[:,:,2] < 30))
        if black_count > 100:
            turn_candidates.append((cx, cy, len(x), x.min(), x.max(), y.min(), y.max()))

print("Candidate turn text regions:", len(turn_candidates))
for c in sorted(turn_candidates, key=lambda item: item[0]):
    print("Turn candidate at x=", c[0], "y=", c[1], "size=", c[2], "box=[", c[3], c[4], c[5], c[6], "]")
