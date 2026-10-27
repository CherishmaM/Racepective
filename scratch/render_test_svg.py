import numpy as np
from PIL import Image

# We will construct the exact SVG path matching the Hermanos Rodríguez circuit in media_1793048507254_f317c9fd.png
# Let's inspect the path segments:
# Main Straight (x=160 -> 850, y=45)
# T1-T3 Chicane
# T3-T4 Straight
# T4-T6 Hairpin
# T6-T7 Straight
# T7-T11 Esses
# T11-T12 Intermediate Straight
# T12-T16 Stadium (Foro Sol)
# T16-T17 Peraltada curve

# Let's write an exact SVG path string using smooth Beziers / arcs and verify overlay
svg_content = '''<svg viewBox="0 0 1024 576" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .track-base { fill: none; stroke: #121417; stroke-width: 22; stroke-linecap: round; stroke-linejoin: round; }
      .sector-1 { fill: none; stroke: #E10600; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
      .sector-2 { fill: none; stroke: #00D2BE; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
      .sector-3 { fill: none; stroke: #FFD100; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
    </style>
  </defs>
</svg>
'''
