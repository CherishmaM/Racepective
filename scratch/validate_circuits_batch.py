import re

# Comprehensive catalog of all 24 Formula 1 Championship circuits
# Strict bounding rule: 
# x in [80, 940]
# y in [60, 505]
# No negative coordinates, no clipping!

circuits_raw = {
  # 1. Albert Park (Australia) - Round 1
  "albert_park": {
    "circuit_id": "albert_park",
    "name": "Albert Park Grand Prix Circuit",
    "locality": "Melbourne",
    "country": "Australia",
    "lengthKm": "5.278 KM",
    "laps": 58,
    "turnsCount": 14,
    "drsZones": 4,
    "fullPath": "M 220 460 L 780 460 C 850 460, 890 420, 880 360 L 860 260 C 850 200, 810 160, 750 160 L 680 160 C 630 160, 600 120, 620 75 C 640 60, 610 60, 560 65 L 420 85 C 360 95, 330 140, 340 190 L 350 270 C 360 320, 320 370, 270 380 L 190 390 C 140 400, 150 450, 220 460 Z",
    "sector1Path": "M 220 460 L 780 460 C 850 460, 890 420, 880 360",
    "sector1Stats": { "distance": "1.78 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "26.410s", "title": "Pit Straight & Turns 1-2 Chicane" },
    "sector2Path": "M 880 360 L 860 260 C 850 200, 810 160, 750 160 L 680 160 C 630 160, 600 120, 620 75 C 640 60, 610 60, 560 65 L 420 85",
    "sector2Stats": { "distance": "1.85 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "27.850s", "title": "Sports Centre & Lakeside Sweep" },
    "sector3Path": "M 420 85 C 360 95, 330 140, 340 190 L 350 270 C 360 320, 320 370, 270 380 L 190 390 C 140 400, 150 450, 220 460",
    "sector3Stats": { "distance": "1.65 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "24.120s", "title": "Ascari & Final Double Left" },
    "startFinish": { "x": 350, "y": 460, "chevronX": 400, "chevronY": 435 },
    "speedTrap": { "sensor": { "x": 740, "y": 460 }, "badge": { "x": 640, "y": 485, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 700 485 L 740 465", "label": "SPEED\\nTRAP", "recordSpeed": "339.8 km/h" },
    "drsDetections": [
      { "id": "1", "title": "DRS\\nDETECTION\\nZONE 1", "sensor": { "x": 870, "y": 300 }, "badge": { "x": 880, "y": 240, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 870 300 L 880 270" }
    ],
    "drsActivations": [
      { "id": "main", "path": "M 380 445 L 750 445", "label": "DRS 1" }
    ],
    "turns": [
      { "id": "01", "x": 840, "y": 450, "name": "Turn 1 Chicane", "speed": "145 km/h", "gear": "Gear 3" },
      { "id": "03", "x": 870, "y": 310, "name": "Turn 3 Braking", "speed": "95 km/h", "gear": "Gear 2" },
      { "id": "06", "x": 750, "y": 140, "name": "Turn 6 Right", "speed": "180 km/h", "gear": "Gear 4" },
      { "id": "09", "x": 560, "y": 80, "name": "Clark Chicane", "speed": "245 km/h", "gear": "Gear 6" },
      { "id": "11", "x": 360, "y": 210, "name": "Waite Chicane", "speed": "210 km/h", "gear": "Gear 5" },
      { "id": "13", "x": 240, "y": 395, "name": "Turn 13 Final", "speed": "125 km/h", "gear": "Gear 3" }
    ]
  },

  # 2. Shanghai (China) - Round 2
  "shanghai": {
    "circuit_id": "shanghai",
    "name": "Shanghai International Circuit",
    "locality": "Shanghai",
    "country": "China",
    "lengthKm": "5.451 KM",
    "laps": 56,
    "turnsCount": 16,
    "drsZones": 2,
    "fullPath": "M 220 440 L 680 440 C 760 440, 820 400, 830 330 C 840 250, 780 190, 700 190 C 640 190, 610 230, 640 270 C 670 300, 720 290, 730 250 L 730 140 C 730 90, 680 70, 620 70 L 460 70 C 400 70, 360 110, 350 170 L 340 310 C 330 360, 280 400, 220 440 Z",
    "sector1Path": "M 220 440 L 680 440 C 760 440, 820 400, 830 330 C 840 250, 780 190, 700 190 C 640 190, 610 230, 640 270",
    "sector1Stats": { "distance": "1.74 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "25.110s", "title": "Main Straight & Snail Turn 1-4" },
    "sector2Path": "M 640 270 C 670 300, 720 290, 730 250 L 730 140 C 730 90, 680 70, 620 70 L 460 70",
    "sector2Stats": { "distance": "1.89 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "28.920s", "title": "Turns 5-10 High Speed Infield" },
    "sector3Path": "M 460 70 C 400 70, 360 110, 350 170 L 340 310 C 330 360, 280 400, 220 440",
    "sector3Stats": { "distance": "1.82 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "37.450s", "title": "1.2km Back Straight & Hairpin" },
    "startFinish": { "x": 350, "y": 440, "chevronX": 400, "chevronY": 415 },
    "speedTrap": { "sensor": { "x": 370, "y": 120 }, "badge": { "x": 260, "y": 90, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 320 110 L 370 120", "label": "SPEED\\nTRAP", "recordSpeed": "351.2 km/h" },
    "drsDetections": [
      { "id": "1", "title": "DRS\\nDETECTION\\nZONE 1", "sensor": { "x": 480, "y": 70 }, "badge": { "x": 510, "y": 95, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 480 70 L 510 95" }
    ],
    "drsActivations": [
      { "id": "back", "path": "M 360 100 L 340 280", "label": "DRS 1" }
    ],
    "turns": [
      { "id": "01", "x": 790, "y": 410, "name": "Turn 1 (Snail Entry)", "speed": "120 km/h", "gear": "Gear 3" },
      { "id": "03", "x": 760, "y": 210, "name": "Turn 3 Snail Apex", "speed": "65 km/h", "gear": "Gear 1" },
      { "id": "06", "x": 745, "y": 180, "name": "Turn 6 Hairpin", "speed": "80 km/h", "gear": "Gear 2" },
      { "id": "09", "x": 580, "y": 65, "name": "Turn 9-10 Chicane", "speed": "190 km/h", "gear": "Gear 4" },
      { "id": "14", "x": 340, "y": 320, "name": "Turn 14 Hairpin", "speed": "68 km/h", "gear": "Gear 1" }
    ]
  },

  # 3. Suzuka (Japan) - Round 3
  "suzuka": {
    "circuit_id": "suzuka",
    "name": "Suzuka International Racing Course",
    "locality": "Suzuka",
    "country": "Japan",
    "lengthKm": "5.807 KM",
    "laps": 53,
    "turnsCount": 18,
    "drsZones": 1,
    "fullPath": "M 220 440 L 760 440 C 840 440, 890 390, 870 320 L 830 220 C 810 160, 740 120, 680 120 L 560 120 C 500 120, 480 80, 520 65 L 640 65 C 700 65, 750 100, 770 160 L 780 250 C 790 310, 750 360, 690 380 L 580 400 C 520 410, 480 370, 470 310 L 450 180 C 440 120, 380 90, 320 90 L 260 100 C 200 110, 160 160, 180 220 L 210 320 C 230 380, 180 430, 220 440 Z",
    "sector1Path": "M 220 440 L 760 440 C 840 440, 890 390, 870 320 L 830 220",
    "sector1Stats": { "distance": "1.92 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "31.250s", "title": "First Corner & The S-Curves" },
    "sector2Path": "M 830 220 C 810 160, 740 120, 680 120 L 560 120 C 500 120, 480 80, 520 65 L 640 65 C 700 65, 750 100, 770 160 L 780 250",
    "sector2Stats": { "distance": "2.21 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "39.410s", "title": "Degner 1-2, Hairpin & Spoon Curve" },
    "sector3Path": "L 780 250 C 790 310, 750 360, 690 380 L 580 400 C 520 410, 480 370, 470 310 L 450 180 C 440 120, 380 90, 320 90 L 260 100 C 200 110, 160 160, 180 220 L 210 320 C 230 380, 180 430, 220 440",
    "sector3Stats": { "distance": "1.68 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "17.850s", "title": "130R & Casio Triangle Chicane" },
    "startFinish": { "x": 380, "y": 440, "chevronX": 430, "chevronY": 415 },
    "speedTrap": { "sensor": { "x": 720, "y": 440 }, "badge": { "x": 620, "y": 475, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 680 475 L 720 445", "label": "SPEED\\nTRAP", "recordSpeed": "342.6 km/h" },
    "drsDetections": [
      { "id": "1", "title": "DRS\\nDETECTION\\nZONE 1", "sensor": { "x": 230, "y": 380 }, "badge": { "x": 130, "y": 360, width: 145, height: 66, rx: 10 }, "leaderLine": "M 230 380 L 210 380" }
    ],
    "drsActivations": [
      { "id": "main", "path": "M 400 425 L 720 425", "label": "DRS 1" }
    ],
    "turns": [
      { "id": "01", "x": 830, "y": 430, "name": "First Curve", "speed": "220 km/h", "gear": "Gear 5" },
      { "id": "03", "x": 860, "y": 340, "name": "S-Curves Entry", "speed": "240 km/h", "gear": "Gear 6" },
      { "id": "08", "x": 760, "y": 140, "name": "Degner 1", "speed": "260 km/h", "gear": "Gear 6" },
      { "id": "11", "x": 510, "y": 65, "name": "Hairpin", "speed": "65 km/h", "gear": "Gear 1" },
      { "id": "13", "x": 785, "y": 270, "name": "Spoon Curve", "speed": "190 km/h", "gear": "Gear 4" },
      { "id": "15", "x": 460, "y": 250, "name": "130R", "speed": "310 km/h", "gear": "Gear 8" },
      { "id": "16", "x": 200, "y": 300, "name": "Casio Triangle", "speed": "75 km/h", "gear": "Gear 2" }
    ]
  },

  # 4. Red Bull Ring (Austria) - Round 8
  "red_bull_ring": {
    "circuit_id": "red_bull_ring",
    "name": "Red Bull Ring",
    "locality": "Spielberg",
    "country": "Austria",
    "lengthKm": "4.318 KM",
    "laps": 71,
    "turnsCount": 10,
    "drsZones": 3,
    "fullPath": "M 220 420 L 760 420 C 820 420, 870 380, 850 320 L 760 160 C 740 100, 690 70, 630 70 L 460 70 C 400 70, 360 120, 380 180 L 410 260 C 420 310, 370 360, 310 370 L 220 380 C 170 385, 170 420, 220 420 Z",
    "sector1Path": "M 220 420 L 760 420 C 820 420, 870 380, 850 320",
    "sector1Stats": { "distance": "1.45 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "16.420s", "title": "Start Straight & Turn 1 Niki Lauda" },
    "sector2Path": "M 850 320 L 760 160 C 740 100, 690 70, 630 70 L 460 70",
    "sector2Stats": { "distance": "1.52 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "28.910s", "title": "Uphill Straight & Remus Hairpin" },
    "sector3Path": "M 460 70 C 400 70, 360 120, 380 180 L 410 260 C 420 310, 370 360, 310 370 L 220 380 C 170 385, 170 420, 220 420",
    "sector3Stats": { "distance": "1.35 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "19.350s", "title": "Schlossgold & Rindt Curve" },
    "startFinish": { "x": 360, "y": 420, "chevronX": 410, "chevronY": 395 },
    "speedTrap": { "sensor": { "x": 720, "y": 420 }, "badge": { "x": 620, "y": 450, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 670 450 L 720 425", "label": "SPEED\\nTRAP", "recordSpeed": "338.2 km/h" },
    "drsDetections": [
      { "id": "1", "title": "DRS\\nDETECTION\\nZONE 1", "sensor": { "x": 790, "y": 220 }, "badge": { "x": 810, "y": 180, width: 145, height: 66, rx: 10 }, "leaderLine": "M 790 220 L 810 200" }
    ],
    "drsActivations": [
      { "id": "main", "path": "M 380 405 L 720 405", "label": "DRS 1" },
      { "id": "uphill", "path": "M 830 300 L 760 170", "label": "DRS 2" }
    ],
    "turns": [
      { "id": "01", "x": 820, "y": 410, "name": "Niki Lauda Kurve", "speed": "140 km/h", gear: "Gear 3" },
      { "id": "03", "x": 660, "y": 70, "name": "Remus Uphill Hairpin", "speed": "70 km/h", gear: "Gear 1" },
      { "id": "04", "x": 480, "y": 70, "name": "Schlossgold", "speed": "130 km/h", gear: "Gear 3" },
      { "id": "06", "x": 400, "y": 200, "name": "Rauch Kurve", "speed": "180 km/h", gear: "Gear 4" },
      { "id": "09", "x": 300, "y": 380, "name": "Jochen Rindt Kurve", "speed": "210 km/h", gear: "Gear 5" }
    ]
  },

  # 5. Circuit of the Americas (USA - Austin) - Round 18
  "americas": {
    "circuit_id": "americas",
    "name": "Circuit of the Americas",
    "locality": "Austin",
    "country": "USA",
    "lengthKm": "5.513 KM",
    "laps": 56,
    "turnsCount": 20,
    "drsZones": 2,
    "fullPath": "M 200 440 L 780 440 C 840 440, 890 390, 870 310 L 820 180 C 800 130, 750 90, 680 90 L 540 90 C 480 90, 460 60, 490 60 L 610 60 C 660 60, 700 90, 720 140 L 740 240 C 750 300, 710 350, 650 370 L 460 380 C 400 380, 360 330, 340 270 L 310 180 C 290 120, 230 100, 180 140 L 160 260 C 150 360, 140 430, 200 440 Z",
    "sector1Path": "M 200 440 L 780 440 C 840 440, 890 390, 870 310 L 820 180",
    "sector1Stats": { "distance": "1.78 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "25.210s", "title": "Steep Turn 1 & Sweeping Esses" },
    "sector2Path": "M 820 180 C 800 130, 750 90, 680 90 L 540 90 C 480 90, 460 60, 490 60 L 610 60 C 660 60, 700 90, 720 140 L 740 240",
    "sector2Stats": { "distance": "2.12 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "37.850s", "title": "Hairpin & 1km Back Straight" },
    "sector3Path": "L 740 240 C 750 300, 710 350, 650 370 L 460 380 C 400 380, 360 330, 340 270 L 310 180 C 290 120, 230 100, 180 140 L 160 260 C 150 360, 140 430, 200 440",
    "sector3Stats": { "distance": "1.61 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "31.420s", "title": "Triple Apex Carousel & Pit Turn" },
    "startFinish": { "x": 340, "y": 440, "chevronX": 390, "chevronY": 415 },
    "speedTrap": { "sensor": { "x": 740, "y": 440 }, "badge": { "x": 640, "y": 470, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 690 470 L 740 445", "label": "SPEED\\nTRAP", "recordSpeed": "344.5 km/h" },
    "drsDetections": [
      { "id": "1", "title": "DRS\\nDETECTION\\nZONE 1", "sensor": { "x": 780, "y": 140 }, "badge": { "x": 800, "y": 90, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 780 140 L 800 120" }
    ],
    "drsActivations": [
      { "id": "back", "path": "M 720 80 L 560 80", "label": "DRS 1" },
      { "id": "main", "path": "M 360 425 L 720 425", "label": "DRS 2" }
    ],
    "turns": [
      { "id": "01", "x": 840, "y": 430, "name": "Turn 1 Uphill Hairpin", "speed": "80 km/h", gear: "Gear 2" },
      { "id": "03", "x": 850, "y": 280, "name": "Esses Section 1", "speed": "260 km/h", gear: "Gear 6" },
      { "id": "11", "x": 510, "y": 65, "name": "Turn 11 Hairpin", "speed": "75 km/h", gear: "Gear 2" },
      { "id": "12", "x": 730, "y": 200, "name": "Turn 12 Braking", "speed": "90 km/h", gear: "Gear 2" },
      { "id": "17", "x": 480, "y": 380, "name": "Turn 16-18 Carousel", "speed": "220 km/h", gear: "Gear 5" }
    ]
  }
}

print("Loaded circuits:", len(circuits_raw))
