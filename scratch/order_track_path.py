from PIL import Image
import numpy as np
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)

alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Turn pill badges: these are small black circular badges near turns
# Let's separate the track from the turn badges and DRS boxes:
is_black = alpha & (r < 35) & (g < 35) & (b < 35)
is_red = alpha & (r > 180) & (g < 50) & (b < 50)
is_cyan = alpha & (r < 50) & (g > 180) & (b > 180)
is_yellow = alpha & (r > 180) & (g > 180) & (b < 50)

# In the image, turn pills are connected or close to the track.
# But the main track is a single continuous closed loop.
track_raw = is_black | is_red | is_cyan | is_yellow

# Compute distance transform of track
dist = ndi.distance_transform_edt(track_raw)

# Ridge points: where dist is high or local maximum
# Track half-width in image is roughly:
print("Max distance in track:", np.max(dist))

# Simple morphological thinning / skeletonization
def simple_thinning(binary_img):
    # Standard Zhang-Suen or medial axis
    from scipy.ndimage import binary_erosion
    # Let's find ridge via distance transform local maxima
    max_filtered = ndi.maximum_filter(dist, size=7)
    ridge = (dist == max_filtered) & (dist > 3)
    return ridge

ridge = simple_thinning(track_raw)
print("Ridge points count:", np.sum(ridge))

Image.fromarray((ridge * 255).astype(np.uint8)).save(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\ridge.png")
