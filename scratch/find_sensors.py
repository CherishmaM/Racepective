from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# DRS 1 leader line and sensor:
# Inside x in [440, 615], y in [270, 360]
is_green = alpha & (g > 180) & (r < 50) & (b < 50)
y1, x1 = np.where(is_green & (arr[:,:,1] > 180) & (y_vals := np.arange(576)[:, None] < 360))
print("DRS 1 sensor top: y min =", y1.min(), "at x =", x1[y1 == y1.min()])
# Check the shape of DRS 1 leader line:
# from sensor dot to box
drs1_line_pts = list(zip(x1, y1))
print("DRS 1 sensor center roughly:", np.mean(x1[y1 < 300]), np.mean(y1[y1 < 300]))

# DRS 2 leader line and sensor:
# Inside x in [150, 200], y in [120, 260]
y2, x2 = np.where(is_green & (arr[:,:,1] > 180) & (np.arange(576)[:, None] < 260) & (np.arange(1024)[None, :] < 200))
print("DRS 2 sensor top: y min =", y2.min(), "at x =", x2[y2 == y2.min()])
print("DRS 2 sensor center roughly:", np.mean(x2[y2 < 140]), np.mean(y2[y2 < 140]))

# Speed Trap:
# Magenta box x=[655, 766], y=[39, 141]
# Pointer line goes from box to track at (763, 45)
# Let's inspect magenta pixels around (763, 45)
is_magenta = alpha & (r > 180) & (g < 100) & (b > 180)
ym, xm = np.where(is_magenta & (np.arange(576)[:, None] < 80))
print("Speed trap sensor on track: x =", np.mean(xm), "y =", np.mean(ym))
