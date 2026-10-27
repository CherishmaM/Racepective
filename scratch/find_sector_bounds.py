from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)
alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

is_red = alpha & (r > 180) & (g < 50) & (b < 50)
is_cyan = alpha & (r < 50) & (g > 180) & (b > 180)
is_yellow = alpha & (r > 180) & (g > 180) & (b < 50)

red_y, red_x = np.where(is_red)
print("Red: min x,y:", red_x.min(), red_y.min(), "max x,y:", red_x.max(), red_y.max())

# Sector 1 start (top straight):
print("Sector 1 start on top straight: min x =", red_x[red_y < 60].min(), "at y =", red_y[red_x == red_x[red_y < 60].min()])
# Sector 1 end (diagonal straight before turn 4):
print("Sector 1 end: max y =", red_y.max(), "at x =", red_x[red_y == red_y.max()])

# Sector 2:
cyan_y, cyan_x = np.where(is_cyan)
print("Sector 2 start: max y =", cyan_y.max(), "at x =", cyan_x[cyan_y == cyan_y.max()])
print("Sector 2 end: min x =", cyan_x.min(), "at y =", cyan_y[cyan_x == cyan_x.min()])

# Sector 3:
yellow_y, yellow_x = np.where(is_yellow)
print("Sector 3 start: max x on straight =", yellow_x[yellow_y > 180].max(), "at y =", yellow_y[(yellow_y > 180) & (yellow_x == yellow_x[yellow_y > 180].max())])
print("Sector 3 end on top straight: max x =", yellow_x[yellow_y < 60].max(), "at y =", yellow_y[(yellow_y < 60) & (yellow_x == yellow_x[yellow_y < 60].max())])
