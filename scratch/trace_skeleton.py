import numpy as np
from PIL import Image
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png").convert('RGB')
arr = np.array(im)

is_black = (arr[:,:,0] < 35) & (arr[:,:,1] < 35) & (arr[:,:,2] < 35)
is_red = (arr[:,:,0] > 180) & (arr[:,:,1] < 50) & (arr[:,:,2] < 50)
is_cyan = (arr[:,:,0] < 50) & (arr[:,:,1] > 180) & (arr[:,:,2] > 180)
is_yellow = (arr[:,:,0] > 180) & (arr[:,:,1] > 180) & (arr[:,:,2] < 50)

track_mask = is_black | is_red | is_cyan | is_yellow

# Remove text badges like turn numbers by morphological closing of holes,
# or finding the main loop
labels, num_features = ndi.label(track_mask)
sizes = ndi.sum(track_mask, labels, range(1, num_features + 1))
largest_label = 1 + np.argmax(sizes)
main_track = (labels == largest_label)

print("Main track pixel count:", np.sum(main_track))

# Let's find the distance transform to get the center ridge
dist = ndi.distance_transform_edt(main_track)
print("Max track thickness / 2:", np.max(dist))

# Save distance transform as image
norm_dist = (dist / np.max(dist) * 255).astype(np.uint8)
Image.fromarray(norm_dist).save(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\dist.png")

# Also find where the sector transitions occur:
# Sector 1: Red
# Sector 2: Cyan
# Sector 3: Yellow
red_pts = np.argwhere(is_red)
cyan_pts = np.argwhere(is_cyan)
yellow_pts = np.argwhere(is_yellow)
print("Red pts:", len(red_pts), "y range:", red_pts[:,0].min(), red_pts[:,0].max(), "x range:", red_pts[:,1].min(), red_pts[:,1].max())
print("Cyan pts:", len(cyan_pts), "y range:", cyan_pts[:,0].min(), cyan_pts[:,0].max(), "x range:", cyan_pts[:,1].min(), cyan_pts[:,1].max())
print("Yellow pts:", len(yellow_pts), "y range:", yellow_pts[:,0].min(), yellow_pts[:,0].max(), "x range:", yellow_pts[:,1].min(), yellow_pts[:,1].max())
