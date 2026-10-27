import numpy as np
from PIL import Image, ImageDraw
import xml.etree.ElementTree as ET

# Test path
path_d = (
    "M 200 45 "
    "L 850 45 "
    "C 868 45, 878 54, 878 72 "
    "C 878 88, 860 88, 860 98 "
    "C 860 108, 882 112, 885 125 "
    "L 804 399 "
    "L 792 438 "
    "C 785 452, 768 456, 768 468 "
    "C 768 480, 810 472, 812 485 "
    "C 814 505, 785 548, 744 550 "
    "C 724 552, 725 520, 725 450 "
    "L 725 355 "
    "C 725 342, 690 345, 678 346 "
    "C 660 347, 655 305, 650 278 "
    "C 645 272, 595 285, 545 292 "
    "C 530 295, 532 255, 535 228 "
    "L 336 201 "
    "L 225 204 "
    "C 215 204, 210 205, 204 185 "
    "C 198 160, 202 120, 194 90 "
    "C 186 90, 178 120, 175 138 "
    "C 172 142, 155 142, 148 140 "
    "C 135 138, 106 138, 93 126 "
    "C 82 110, 85 70, 105 54 "
    "C 125 45, 160 45, 200 45 Z"
)

# Also test dividing it into the 3 sectors:
# Sector 1 (Red): from start/finish to L 804 399
sector1_d = (
    "M 200 45 "
    "L 850 45 "
    "C 868 45, 878 54, 878 72 "
    "C 878 88, 860 88, 860 98 "
    "C 860 108, 882 112, 885 125 "
    "L 804 399"
)

# Sector 2 (Cyan): from L 804 399 to L 336 201
sector2_d = (
    "M 804 399 "
    "L 792 438 "
    "C 785 452, 768 456, 768 468 "
    "C 768 480, 810 472, 812 485 "
    "C 814 505, 785 548, 744 550 "
    "C 724 552, 725 520, 725 450 "
    "L 725 355 "
    "C 725 342, 690 345, 678 346 "
    "C 660 347, 655 305, 650 278 "
    "C 645 272, 595 285, 545 292 "
    "C 530 295, 532 255, 535 228 "
    "L 336 201"
)

# Sector 3 (Yellow): from L 336 201 back to M 200 45
sector3_d = (
    "M 336 201 "
    "L 225 204 "
    "C 215 204, 210 205, 204 185 "
    "C 198 160, 202 120, 194 90 "
    "C 186 90, 178 120, 175 138 "
    "C 172 142, 155 142, 148 140 "
    "C 135 138, 106 138, 93 126 "
    "C 82 110, 85 70, 105 54 "
    "C 125 45, 160 45, 200 45"
)

# Let's save a clean SVG and test it
svg_test = f'''<svg viewBox="0 0 1024 576" width="1024" height="576" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="576" fill="#0E1117" />
  <!-- Base track -->
  <path d="{path_d}" stroke="#1F242F" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="{path_d}" stroke="#2A3240" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  
  <!-- Sectors -->
  <path d="{sector1_d}" stroke="#EF4444" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="{sector2_d}" stroke="#06B6D4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  <path d="{sector3_d}" stroke="#EAB308" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
</svg>'''

with open(r"C:\Users\sures\.gemini\antigravity\scratch\gridlens\scratch\test_track.svg", "w") as f:
    f.write(svg_test)
print("Saved test_track.svg!")
