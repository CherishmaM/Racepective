import numpy as np
from PIL import Image, ImageDraw
from scipy.interpolate import splprep, splev

# Verified landmark points along the Hermanos Rodríguez track:
waypoints = np.array([
    [200, 45],  # Start/Finish
    [400, 45],  # Main straight mid 1
    [600, 45],  # Main straight mid 2
    [763, 45],  # Speed Trap
    [850, 45],  # Main straight braking zone
    [875, 54],  # Turn 1 entry
    [880, 75],  # Turn 1 apex
    [858, 96],  # Turn 2 apex (chicane left)
    [886, 122], # Turn 3 apex (chicane right)
    [870, 180], # Straight to T4
    [840, 275], # Straight to T4 mid
    [810, 370], # Straight to T4 lower
    [804, 399], # Sector 1 END / Sector 2 START
    [792, 435], # Approach T4
    [768, 462], # Turn 4 apex
    [812, 484], # Turn 5 apex
    [790, 528], # Entry to T6 hairpin
    [744, 552], # Turn 6 hairpin apex
    [726, 520], # T6 exit
    [725, 430], # Straight up to T7
    [725, 345], # Turn 7 apex
    [678, 346], # Turn 8 apex
    [656, 305], # Transition into T9
    [648, 275], # Turn 9 apex
    [606, 280], # DRS Detection 1 sensor
    [545, 292], # Turn 10 apex
    [534, 255], # Transition to T11
    [535, 226], # Turn 11 apex
    [480, 218], # Straight to T12
    [400, 210], # Intermediate straight
    [336, 201], # Sector 2 END / Sector 3 START
    [250, 204], # Approach T12
    [215, 206], # Turn 12 apex
    [202, 160], # Curve up to stadium T13
    [194, 90],  # Turn 13 apex
    [174, 138], # Turn 14 apex
    [148, 140], # Turn 15 apex / DRS Detection 2 sensor
    [106, 138], # Turn 16 approach
    [93, 126],  # Turn 16 apex
    [95, 80],   # Peraltada entry
    [105, 54],  # Turn 17 apex
    [145, 45],  # Return onto main straight
    [200, 45]   # Start/Finish closed loop
])

# Fit smooth periodic cubic B-spline
tck, u = splprep([waypoints[:, 0], waypoints[:, 1]], s=2.0, per=True)
u_fine = np.linspace(0, 1, 400)
x_fine, y_fine = splev(u_fine, tck)

# Open original image and draw overlay
im = Image.open(r"C:\Users\sures\.gemini\antigravity\brain\e721896c-a6cc-4a08-a428-3e31fca3f2d0\.user_uploaded\media_1793048507254_f317c9fd.png").convert("RGBA")
overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)

# Draw spline in bright green
for i in range(len(x_fine) - 1):
    draw.line([(x_fine[i], y_fine[i]), (x_fine[i+1], y_fine[i+1])], fill=(0, 255, 0, 200), width=4)

# Draw waypoints in red
for x, y in waypoints:
    draw.ellipse([(x-4, y-4), (x+4, y+4)], fill=(255, 0, 0, 255))

combined = Image.alpha_composite(im, overlay)
combined.save(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\compare_overlay.png")
print("Saved compare_overlay.png successfully!")
