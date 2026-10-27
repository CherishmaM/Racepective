from PIL import Image
import numpy as np
from scipy import ndimage as ndi

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Pure green pixels:
is_green = alpha & (g > 180) & (r < 50) & (b < 50)

# Connected components of green:
labels, num = ndi.label(is_green)
print("Total green features:", num)

features = []
for i in range(1, num + 1):
    y, x = np.where(labels == i)
    features.append((len(x), x.min(), x.max(), y.min(), y.max(), int(np.mean(x)), int(np.mean(y))))

# Sort by size descending
features.sort(key=lambda f: f[0], reverse=True)
for f in features[:15]:
    print(f"Green feature: size={f[0]:4d}, x=[{f[1]:3d}, {f[2]:3d}], y=[{f[3]:3d}, {f[4]:3d}], center=({f[5]:3d}, {f[6]:3d})")
