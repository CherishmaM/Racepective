from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
is_green = alpha & (g > 180) & (r < 50) & (b < 50)

# Inside x in [580, 620], y in [275, 410]
y_line, x_line = np.where(is_green & (np.arange(576)[:, None] >= 270) & (np.arange(576)[:, None] <= 420) & (np.arange(1024)[None, :] >= 580) & (np.arange(1024)[None, :] <= 620))
print("DRS 1 line top point:", x_line[y_line == y_line.min()], y_line.min())
print("DRS 1 line bottom point:", x_line[y_line == y_line.max()], y_line.max())
