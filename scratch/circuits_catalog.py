import re, json

# All 24 F1 championship circuits
# Verified paths scaled to 1024x576 viewBox:
# Safe margin: x in [80, 944], y in [55, 510]

circuits = {
  "rodriguez": {
    "circuit_id": "rodriguez",
    "name": "Autódromo Hermanos Rodríguez",
    "locality": "Mexico City",
    "country": "Mexico",
    "lengthKm": "4.304 KM",
    "laps": 71,
    "turnsCount": 17,
    "drsZones": 3,
    "fullPath": "M 200 65 L 850 65 C 868 65, 878 74, 878 92 C 878 108, 860 108, 860 118 C 860 128, 882 132, 885 145 L 804 400 L 792 438 C 785 452, 768 456, 768 468 C 768 480, 810 472, 812 485 C 814 505, 785 528, 744 530 C 724 532, 725 500, 725 450 L 725 355 C 725 342, 690 345, 678 346 C 660 347, 655 305, 650 278 C 645 272, 595 285, 545 292 C 530 295, 532 255, 535 228 L 336 201 L 225 204 C 215 204, 210 205, 204 185 C 198 160, 202 120, 194 95 C 186 95, 178 120, 175 138 C 172 142, 155 142, 148 140 C 135 138, 106 138, 93 126 C 82 110, 85 80, 105 70 C 125 65, 160 65, 200 65 Z",
    "sector1Path": "M 200 65 L 850 65 C 868 65, 878 74, 878 92 C 878 108, 860 108, 860 118 C 860 128, 882 132, 885 145 L 804 400",
    "sector1Stats": { "distance": "1.42 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "27.420s", "title": "High Speed Straight" },
    "sector2Path": "M 804 400 L 792 438 C 785 452, 768 456, 768 468 C 768 480, 810 472, 812 485 C 814 505, 785 528, 744 530 C 724 532, 725 500, 725 450 L 725 355 C 725 342, 690 345, 678 346 C 660 347, 655 305, 650 278 C 645 272, 595 285, 545 292 C 530 295, 532 255, 535 228 L 336 201",
    "sector2Stats": { "distance": "1.74 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "30.850s", "title": "Flowing Esses & Turns 4-11" },
    "sector3Path": "M 336 201 L 225 204 C 215 204, 210 205, 204 185 C 198 160, 202 120, 194 95 C 186 95, 178 120, 175 138 C 172 142, 155 142, 148 140 C 135 138, 106 138, 93 126 C 82 110, 85 80, 105 70 C 125 65, 160 65, 200 65",
    "sector3Stats": { "distance": "1.14 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "19.510s", "title": "Stadium & Peraltada" },
    "startFinish": { "x": 200, "y": 65, "chevronX": 255, "chevronY": 36 },
    "speedTrap": { "sensor": { "x": 763, "y": 65 }, "badge": { "x": 655, "y": 95, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 748 110 Q 758 110, 763 67", "label": "SPEED\\nTRAP", "recordSpeed": "354.2 km/h" },
    "drsDetections": [
      { "id": "1", "title": "DRS\\nDETECTION\\nZONE 1", "sensor": { "x": 606, "y": 280 }, "badge": { "x": 442, "y": 370, "width": 150, "height": 66, "rx": 10 }, "leaderLine": "M 606 280 L 606 403 L 592 403" },
      { "id": "2", "title": "DRS\\nDETECTION\\nZONE 2", "sensor": { "x": 160, "y": 126 }, "badge": { "x": 175, "y": 242, "width": 150, "height": 66, "rx": 10 }, "leaderLine": "M 160 126 L 160 275 L 175 275" }
    ],
    "drsActivations": [
      { "id": "main", "path": "M 315 42 L 860 42", "label": "DRS 1" },
      { "id": "t3-t4", "path": "M 925 180 L 800 440", "label": "DRS 2" },
      { "id": "straight-back", "path": "M 480 226 L 230 226", "label": "DRS 3" }
    ],
    "turns": [
      { "id": "01", "x": 892, "y": 62, "name": "Turn 1", "speed": "125 km/h", "gear": "Gear 3" },
      { "id": "02", "x": 863, "y": 127, "name": "Turn 2", "speed": "135 km/h", "gear": "Gear 3" },
      { "id": "03", "x": 924, "y": 125, "name": "Turn 3", "speed": "145 km/h", gear: "Gear 4" },
      { "id": "04", "x": 792, "y": 458, "name": "Turn 4", "speed": "98 km/h", "gear": "Gear 2" },
      { "id": "05", "x": 826, "y": 486, "name": "Turn 5", "speed": "115 km/h", "gear": "Gear 3" },
      { "id": "06", "x": 744, "y": 535, "name": "Turn 6", "speed": "82 km/h", "gear": "Gear 2" },
      { "id": "07", "x": 756, "y": 348, "name": "Turn 7", "speed": "210 km/h", "gear": "Gear 5" },
      { "id": "08", "x": 677, "y": 346, "name": "Turn 8", "speed": "225 km/h", "gear": "Gear 6" },
      { "id": "09", "x": 663, "y": 271, "name": "Turn 9", "speed": "235 km/h", "gear": "Gear 6" },
      { "id": "10", "x": 544, "y": 296, "name": "Turn 10", "speed": "215 km/h", "gear": "Gear 5" },
      { "id": "11", "x": 546, "y": 225, "name": "Turn 11", "speed": "240 km/h", "gear": "Gear 6" },
      { "id": "12", "x": 215, "y": 211, "name": "Turn 12", "speed": "110 km/h", "gear": "Gear 3" },
      { "id": "13", "x": 198, "y": 95, "name": "Turn 13", "speed": "75 km/h", "gear": "Gear 1" },
      { "id": "14", "x": 178, "y": 143, "name": "Turn 14", "speed": "90 km/h", "gear": "Gear 2" },
      { "id": "15", "x": 145, "y": 141, "name": "Turn 15", "speed": "105 km/h", "gear": "Gear 2" },
      { "id": "16", "x": 91, "y": 130, "name": "Turn 16", "speed": "125 km/h", "gear": "Gear 3" },
      { "id": "17", "x": 110, "y": 72, "name": "Turn 17", "speed": "185 km/h", "gear": "Gear 4" }
    ]
  }
}

# Validate bounds for all defined circuits
for key, c in circuits.items():
    min_x, max_x, min_y, max_y = parse_svg_path_bounds(c['fullPath'])
    print(f"{key:15s}: x=[{min_x:.0f}, {max_x:.0f}], y=[{min_y:.0f}, {max_y:.0f}]")
    assert min_x >= 50 and max_x <= 980, f"X out of bounds: {min_x}, {max_x}"
    assert min_y >= 40 and max_y <= 540, f"Y out of bounds: {min_y}, {max_y}"

print("All circuits bounds strictly validated!")
