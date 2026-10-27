import sys
sys.path.append(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch")
import numpy as np
from PIL import Image
from scipy.interpolate import splprep, splev

im = Image.open(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\clean_track.png").convert("L")
track = np.array(im) > 128

from test_spline import waypoints
tck, u = splprep([waypoints[:, 0], waypoints[:, 1]], s=2.0, per=True)
u_fine = np.linspace(0, 1, 1000)
x_fine, y_fine = splev(u_fine, tck)

from scipy import ndimage as ndi
dist = ndi.distance_transform_edt(track)

d_vals = [dist[int(np.clip(y, 0, 575)), int(np.clip(x, 0, 1023))] for x, y in zip(x_fine, y_fine)]
outside = sum(d == 0 for d in d_vals)
print(f"Total test points: {len(d_vals)}, mean dist inside track: {np.mean(d_vals):.2f}px, outside count: {outside}")
