from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png")
arr = np.array(im)

alpha = arr[:,:,3] > 128
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Actual black pixels on the track:
is_black = alpha & (r < 35) & (g < 35) & (b < 35)
print("Actual black track pixels:", np.sum(is_black))

is_red = alpha & (r > 180) & (g < 50) & (b < 50)
print("Actual red sector pixels:", np.sum(is_red))

is_cyan = alpha & (r < 50) & (g > 180) & (b > 180)
print("Actual cyan sector pixels:", np.sum(is_cyan))

is_yellow = alpha & (r > 180) & (g > 180) & (b < 50)
print("Actual yellow sector pixels:", np.sum(is_yellow))

# Entire track:
track = is_black | is_red | is_cyan | is_yellow
print("Total track pixels:", np.sum(track))

# Let's save the clean track mask
Image.fromarray((track * 255).astype(np.uint8)).save(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\clean_track.png")
print("Saved clean_track.png")
