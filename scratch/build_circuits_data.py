import json

catalog = {}

# 1. Rodriguez (Mexico City)
catalog["rodriguez"] = {
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
  "sector1Stats": { "distance": "1.42 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "27.420s", "title": "Main Straight & Chicane" },
  "sector2Path": "M 804 400 L 792 438 C 785 452, 768 456, 768 468 C 768 480, 810 472, 812 485 C 814 505, 785 528, 744 530 C 724 532, 725 500, 725 450 L 725 355 C 725 342, 690 345, 678 346 C 660 347, 655 305, 650 278 C 645 272, 595 285, 545 292 C 530 295, 532 255, 535 228 L 336 201",
  "sector2Stats": { "distance": "1.74 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "30.850s", "title": "Flowing Esses & Turns 4-11" },
  "sector3Path": "M 336 201 L 225 204 C 215 204, 210 205, 204 185 C 198 160, 202 120, 194 95 C 186 95, 178 120, 175 138 C 172 142, 155 142, 148 140 C 135 138, 106 138, 93 126 C 82 110, 85 80, 105 70 C 125 65, 160 65, 200 65",
  "sector3Stats": { "distance": "1.14 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "19.510s", "title": "Foro Sol Stadium & Peraltada" },
  "startFinish": { "x": 200, "y": 65, "chevronX": 255, "chevronY": 38 },
  "speedTrap": { "sensor": { "x": 763, "y": 65 }, "badge": { "x": 655, "y": 95, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 748 110 Q 758 110, 763 67", "label": "SPEED\nTRAP", "recordSpeed": "354.2 km/h" },
  "drsDetections": [
    { "id": "1", "title": "DRS\nDETECTION\nZONE 1", "sensor": { "x": 606, "y": 280 }, "badge": { "x": 442, "y": 370, "width": 150, "height": 66, "rx": 10 }, "leaderLine": "M 606 280 L 606 403 L 592 403" },
    { "id": "2", "title": "DRS\nDETECTION\nZONE 2", "sensor": { "x": 160, "y": 126 }, "badge": { "x": 175, "y": 242, "width": 150, "height": 66, "rx": 10 }, "leaderLine": "M 160 126 L 160 275 L 175 275" }
  ],
  "drsActivations": [
    { "id": "main", "path": "M 315 42 L 860 42", "label": "DRS 1" },
    { "id": "t3-t4", "path": "M 925 180 L 800 440", "label": "DRS 2" },
    { "id": "straight-back", "path": "M 480 226 L 230 226", "label": "DRS 3" }
  ],
  "turns": [
    { "id": "01", "x": 892, "y": 62, "name": "Turn 1", "speed": "125 km/h", "gear": "Gear 3" },
    { "id": "02", "x": 863, "y": 127, "name": "Turn 2", "speed": "135 km/h", "gear": "Gear 3" },
    { "id": "03", "x": 924, "y": 125, "name": "Turn 3", "speed": "145 km/h", "gear": "Gear 4" },
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

# 2. Interlagos (Brazil) - Round 20
catalog["interlagos"] = {
  "circuit_id": "interlagos",
  "name": "Autódromo José Carlos Pace (Interlagos)",
  "locality": "São Paulo",
  "country": "Brazil",
  "lengthKm": "4.309 KM",
  "laps": 71,
  "turnsCount": 15,
  "drsZones": 2,
  "fullPath": "M 220 440 L 780 410 C 860 400, 890 350, 840 290 L 720 180 C 690 150, 710 110, 750 90 L 820 75 C 860 60, 840 55, 780 60 L 420 70 C 350 75, 300 110, 310 160 L 330 230 C 345 270, 315 310, 275 340 L 210 380 C 160 410, 170 435, 220 440 Z",
  "sector1Path": "M 220 440 L 780 410 C 860 400, 890 350, 840 290",
  "sector1Stats": { "distance": "1.38 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "18.420s", "title": "Pit Straight & Senna S" },
  "sector2Path": "M 840 290 L 720 180 C 690 150, 710 110, 750 90 L 820 75 C 860 60, 840 55, 780 60 L 420 70",
  "sector2Stats": { "distance": "1.78 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "34.810s", "title": "Reta Oposta & Infield Curves" },
  "sector3Path": "M 420 70 C 350 75, 300 110, 310 160 L 330 230 C 345 270, 315 310, 275 340 L 210 380 C 160 410, 170 435, 220 440",
  "sector3Stats": { "distance": "1.14 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "17.150s", "title": "Junção & Subida dos Boxes" },
  "startFinish": { "x": 400, "y": 425, "chevronX": 350, "chevronY": 455 },
  "speedTrap": { "sensor": { "x": 750, "y": 412 }, "badge": { "x": 640, "y": 465, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 720 465 L 750 422", "label": "SPEED\nTRAP", "recordSpeed": "349.5 km/h" },
  "drsDetections": [
    { "id": "1", "title": "DRS\nDETECTION\nZONE 1", "sensor": { "x": 840, "y": 290 }, "badge": { "x": 860, "y": 240, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 840 290 L 860 270" },
    { "id": "2", "title": "DRS\nDETECTION\nZONE 2", "sensor": { "x": 275, "y": 340 }, "badge": { "x": 130, "y": 280, width: 145, height: 66, rx: 10 }, "leaderLine": "M 275 340 L 220 310" }
  ],
  "drsActivations": [
    { "id": "reta-oposta", "path": "M 840 270 L 730 185", "label": "DRS 1" },
    { "id": "main-straight", "path": "M 240 425 L 750 395", "label": "DRS 2" }
  ],
  "turns": [
    { "id": "01", "x": 800, "y": 440, "name": "S do Senna 1", "speed": "115 km/h", "gear": "Gear 2" },
    { "id": "02", "x": 850, "y": 410, "name": "S do Senna 2", "speed": "130 km/h", "gear": "Gear 3" },
    { "id": "03", "x": 870, "y": 340, "name": "Curva do Sol", "speed": "225 km/h", "gear": "Gear 5" },
    { "id": "04", "x": 740, "y": 195, "name": "Descida do Lago", "speed": "145 km/h", "gear": "Gear 3" },
    { "id": "06", "x": 720, "y": 100, "name": "Ferradura", "speed: ": "210 km/h", "gear": "Gear 5" },
    { "id": "08", "x": 820, "y": 70, "name": "Curva do Laranjinha", "speed": "220 km/h", "gear": "Gear 5" },
    { "id": "09", "x": 620, "y": 65, "name": "Pinheirinho", "speed": "95 km/h", "gear": "Gear 2" },
    { "id": "10", "x": 450, "y": 65, "name": "Bico de Pato", "speed": "75 km/h", "gear": "Gear 1" },
    { "id": "11", "x": 330, "y": 120, "name": "Mergulho", "speed": "220 km/h", "gear": "Gear 5" },
    { "id": "12", "x": 320, "y": 240, "name": "Junção", "speed": "120 km/h", "gear": "Gear 3" },
    { "id": "14", "x": 230, "y": 380, "name": "Subida dos Boxes", "speed": "265 km/h", "gear": "Gear 7" }
  ]
}

# 3. Silverstone (Great Britain)
catalog["silverstone"] = {
  "circuit_id": "silverstone",
  "name": "Silverstone Circuit",
  "locality": "Silverstone",
  "country": "United Kingdom",
  "lengthKm": "5.891 KM",
  "laps": 52,
  "turnsCount": 18,
  "drsZones": 2,
  "fullPath": "M 180 180 C 230 150, 290 145, 360 145 C 430 145, 480 135, 530 110 C 590 90, 680 85, 760 95 C 820 102, 850 128, 840 160 C 830 195, 750 220, 690 245 C 630 270, 590 292, 600 325 C 610 358, 660 385, 730 398 C 800 411, 830 430, 820 468 C 810 502, 750 515, 670 508 C 590 502, 530 482, 450 488 C 370 495, 290 515, 230 495 C 170 475, 150 430, 160 385 C 170 340, 200 315, 210 275 C 220 235, 150 210, 180 180 Z",
  "sector1Path": "M 180 180 C 230 150, 290 145, 360 145 C 430 145, 480 135, 530 110 C 590 90, 680 85, 760 95",
  "sector1Stats": { "distance": "1.92 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "28.110s", "title": "Abbey, Farm Curve & Arena" },
  "sector2Path": "M 760 95 C 820 102, 850 128, 840 160 C 830 195, 750 220, 690 245 C 630 270, 590 292, 600 325 C 610 358, 660 385, 730 398",
  "sector2Stats": { "distance": "2.14 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "35.420s", "title": "Copse, Maggotts & Becketts" },
  "sector3Path": "M 730 398 C 800 411, 830 430, 820 468 C 810 502, 750 515, 670 508 C 590 502, 530 482, 450 488 C 370 495, 290 515, 230 495 C 170 475, 150 430, 160 385 C 170 340, 200 315, 210 275 C 220 235, 150 210, 180 180",
  "sector3Stats": { "distance": "1.83 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "23.490s", "title": "Stowe, Vale & Club" },
  "startFinish": { "x": 180, "y": 180, "chevronX": 220, "chevronY": 155 },
  "speedTrap": { "sensor": { "x": 720, "y": 90 }, "badge": { "x": 630, "y": 120, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 710 120 L 720 95", "label": "SPEED\nTRAP", "recordSpeed": "341.5 km/h" },
  "drsDetections": [
    { "id": "1", "title": "DRS\nDETECTION\nZONE 1", "sensor": { "x": 600, "y": 325 }, "badge": { "x": 440, "y": 320, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 600 325 L 585 345" }
  ],
  "drsActivations": [
    { "id": "wellington", "path": "M 360 135 L 520 105", "label": "DRS 1" },
    { "id": "hangar", "path": "M 610 335 L 720 390", "label": "DRS 2" }
  ],
  "turns": [
    { "id": "01", "x": 280, "y": 140, "name": "Abbey", "speed": "275 km/h", "gear": "Gear 7" },
    { "id": "03", "x": 540, "y": 105, "name": "Village", "speed": "110 km/h", "gear": "Gear 3" },
    { "id": "04", "x": 620, "y": 88, "name": "The Loop", "speed": "90 km/h", "gear": "Gear 2" },
    { "id": "09", "x": 845, "y": 145, "name": "Copse", "speed": "280 km/h", "gear": "Gear 7" },
    { "id": "10", "x": 745, "y": 225, "name": "Maggotts", "speed": "295 km/h", "gear": "Gear 8" },
    { "id": "11", "x": 660, "y": 258, "name": "Becketts", "speed": "255 km/h", "gear": "Gear 6" },
    { "id": "15", "x": 735, "y": 400, "name": "Stowe", "speed": "200 km/h", "gear": "Gear 5" },
    { "id": "16", "x": 825, "y": 470, "name": "Vale", "speed": "120 km/h", "gear": "Gear 3" },
    { "id": "18", "x": 660, "y": 515, "name": "Club", "speed": "190 km/h", "gear": "Gear 4" }
  ]
}

# 4. Monza (Italy) - with Safe Bounds Y >= 60
catalog["monza"] = {
  "circuit_id": "monza",
  "name": "Autodromo Nazionale Monza",
  "locality": "Monza",
  "country": "Italy",
  "lengthKm": "5.793 KM",
  "laps": 53,
  "turnsCount": 11,
  "drsZones": 2,
  "fullPath": "M 140 480 L 800 480 C 880 480, 900 430, 840 370 L 680 230 C 650 200, 650 160, 680 130 L 820 85 C 870 70, 840 60, 760 60 L 340 60 C 260 60, 220 80, 250 130 L 300 200 C 320 240, 300 280, 260 310 L 170 370 C 120 410, 120 480, 140 480 Z",
  "sector1Path": "M 140 480 L 800 480 C 880 480, 900 430, 840 370",
  "sector1Stats": { "distance": "2.10 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "26.850s", "title": "Main Straight & Variante del Rettifilo" },
  "sector2Path": "M 840 370 L 680 230 C 650 200, 650 160, 680 130 L 820 85",
  "sector2Stats": { "distance": "1.95 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "27.410s", "title": "Curva Grande, Roggia & Lesmo" },
  "sector3Path": "M 820 85 C 870 70, 840 60, 760 60 L 340 60 C 260 60, 220 80, 250 130 L 300 200 C 320 240, 300 280, 260 310 L 170 370 C 120 410, 120 480, 140 480",
  "sector3Stats": { "distance": "1.74 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "26.120s", "title": "Variante Ascari & Curva Parabolica" },
  "startFinish": { "x": 300, "y": 480, "chevronX": 350, "chevronY": 455 },
  "speedTrap": { "sensor": { "x": 760, "y": 480 }, "badge": { "x": 680, "y": 410, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 740 435 L 760 478", "label": "SPEED\nTRAP", "recordSpeed": "362.5 km/h" },
  "drsDetections": [
    { "id": "1", "title": "DRS\nDETECTION\nZONE 1", "sensor": { "x": 840, "y": 370 }, "badge": { "x": 870, "y": 320, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 840 370 L 870 340" }
  ],
  "drsActivations": [
    { "id": "main", "path": "M 320 460 L 780 460", "label": "DRS 1" }
  ],
  "turns": [
    { "id": "01", "x": 810, "y": 470, "name": "Variante del Rettifilo 1", "speed": "75 km/h", "gear": "Gear 1" },
    { "id": "02", "x": 840, "y": 440, "name": "Variante del Rettifilo 2", "speed": "85 km/h", "gear": "Gear 2" },
    { "id": "03", "x": 850, "y": 380, "name": "Curva Grande", "speed": "295 km/h", "gear": "Gear 7" },
    { "id": "04", "x": 740, "y": 280, "name": "Variante della Roggia", "speed": "115 km/h", "gear": "Gear 3" },
    { "id": "06", "x": 670, "y": 170, "name": "Curva di Lesmo 1", "speed": "185 km/h", "gear": "Gear 4" },
    { "id": "07", "x": 670, "y": 125, "name": "Curva di Lesmo 2", "speed": "170 km/h", "gear": "Gear 4" },
    { "id": "08", "x": 260, "y": 130, "name": "Variante Ascari", "speed": "165 km/h", "gear": "Gear 4" },
    { "id": "11", "x": 150, "y": 410, "name": "Curva Parabolica", "speed": "215 km/h", "gear": "Gear 5" }
  ]
}

# 5. Spa (Belgium) - with Safe Bounds Y >= 60
catalog["spa"] = {
  "circuit_id": "spa",
  "name": "Circuit de Spa-Francorchamps",
  "locality": "Stavelot",
  "country": "Belgium",
  "lengthKm": "7.004 KM",
  "laps": 44,
  "turnsCount": 19,
  "drsZones": 2,
  "fullPath": "M 180 240 C 200 180, 260 140, 340 140 L 680 140 C 760 140, 840 180, 860 250 C 880 310, 820 360, 760 390 L 640 430 C 600 450, 600 480, 640 500 C 680 520, 640 535, 560 535 L 380 535 C 300 535, 260 490, 260 440 L 260 360 C 260 310, 220 280, 180 270 C 140 255, 160 250, 180 240 Z",
  "sector1Path": "M 180 240 C 200 180, 260 140, 340 140 L 680 140",
  "sector1Stats": { "distance": "2.28 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "30.120s", "title": "La Source, Eau Rouge & Raidillon" },
  "sector2Path": "L 680 140 C 760 140, 840 180, 860 250 C 880 310, 820 360, 760 390 L 640 430",
  "sector2Stats": { "distance": "2.84 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "42.980s", "title": "Kemmel Straight, Les Combes & Pouhon" },
  "sector3Path": "M 640 430 C 600 450, 600 480, 640 500 C 680 520, 640 535, 560 535 L 380 535 C 300 535, 260 490, 260 440 L 260 360 C 260 310, 220 280, 180 270 C 140 255, 160 250, 180 240",
  "sector3Stats": { "distance": "1.88 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "28.450s", "title": "Blanchimont & Bus Stop Chicane" },
  "startFinish": { "x": 200, "y": 235, "chevronX": 240, "chevronY": 210 },
  "speedTrap": { "sensor": { "x": 650, "y": 140 }, "badge": { "x": 550, "y": 80, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 620 105 L 650 135", "label": "SPEED\nTRAP", "recordSpeed": "358.5 km/h" },
  "drsDetections": [
    { "id": "1", "title": "DRS\nDETECTION\nZONE 1", "sensor": { "x": 240, "y": 190 }, "badge": { "x": 160, "y": 120, "width": 145, "height": 66, "rx": 10 }, "leaderLine": "M 240 190 L 240 160" }
  ],
  "drsActivations": [
    { "id": "kemmel", "path": "M 440 125 L 650 125", "label": "DRS 1" }
  ],
  "turns": [
    { "id": "01", "x": 220, "y": 200, "name": "La Source", "speed": "75 km/h", "gear": "Gear 1" },
    { "id": "03", "x": 350, "y": 135, "name": "Eau Rouge", "speed": "305 km/h", "gear": "Gear 8" },
    { "id": "04", "x": 420, "y": 135, "name": "Raidillon", "speed": "310 km/h", "gear": "Gear 8" },
    { "id": "05", "x": 670, "y": 135, "name": "Les Combes", "speed": "140 km/h", "gear": "Gear 3" },
    { "id": "10", "x": 840, "y": 290, "name": "Pouhon", "speed": "275 km/h", "gear": "Gear 7" },
    { "id": "14", "x": 630, "y": 440, "name": "Stavelot", "speed": "190 km/h", "gear": "Gear 4" },
    { "id": "17", "x": 380, "y": 525, "name": "Blanchimont", "speed": "315 km/h", "gear": "Gear 8" },
    { "id": "19", "x": 250, "y": 410, "name": "Bus Stop Chicane", "speed": "85 km/h", "gear": "Gear 2" }
  ]
}

# 6. Monaco - with Safe Bounds Y >= 60
catalog["monaco"] = {
  "circuit_id": "monaco",
  "name": "Circuit de Monaco",
  "locality": "Monte Carlo",
  "country": "Monaco",
  "lengthKm": "3.337 KM",
  "laps": 78,
  "turnsCount": 19,
  "drsZones": 1,
  "fullPath": "M 240 430 L 680 430 C 740 430, 780 390, 770 330 L 750 250 C 740 200, 700 170, 650 170 L 520 170 C 480 170, 460 140, 480 110 L 520 80 C 540 65, 510 60, 470 65 L 360 85 C 310 105, 300 155, 320 205 L 340 255 C 350 295, 310 335, 270 345 L 210 355 C 160 365, 150 415, 190 430 Z",
  "sector1Path": "M 240 430 L 680 430 C 740 430, 780 390, 770 330",
  "sector1Stats": { "distance": "1.04 KM", "color": "#EF4444", "label": "SECTOR 1", "bestSplit": "18.910s", "title": "Sainte Dévote & Beau Rivage" },
  "sector2Path": "M 770 330 L 750 250 C 740 200, 700 170, 650 170 L 520 170 C 480 170, 460 140, 480 110 L 520 80 C 540 65, 510 60, 470 65",
  "sector2Stats": { "distance": "1.28 KM", "color": "#06B6D4", "label": "SECTOR 2", "bestSplit": "33.850s", "title": "Casino, Fairmont Hairpin & Tunnel" },
  "sector3Path": "M 470 65 L 360 85 C 310 105, 300 155, 320 205 L 340 255 C 350 295, 310 335, 270 345 L 210 355 C 160 365, 150 415, 190 430",
  "sector3Stats": { "distance": "1.01 KM", "color": "#FACC15", "label": "SECTOR 3", "bestSplit": "19.420s", "title": "Nouvelle Chicane, Tabac & Rascasse" },
  "startFinish": { "x": 320, "y": 430, "chevronX": 370, "chevronY": 405 },
  "speedTrap": { "sensor": { "x": 650, "y": 430 }, "badge": { "x": 550, "y": 465, "width": 92, "height": 48, "rx": 8 }, "leaderLine": "M 600 465 L 650 435", "label": "SPEED\nTRAP", "recordSpeed": "298.5 km/h" },
  "drsDetections": [
    { "id": "1", "title": "DRS\nDETECTION\nZONE 1", "sensor": { "x": 210, "y": 355 }, "badge": { "x": 130, "y": 285, width: 145, height: 66, rx: 10 }, "leaderLine": "M 210 355 L 210 325" }
  ],
  "drsActivations": [
    { "id": "pit", "path": "M 350 415 L 640 415", "label": "DRS 1" }
  ],
  "turns": [
    { "id": "01", "x": 690, "y": 440, "name": "Sainte Dévote", "speed": "85 km/h", "gear": "Gear 2" },
    { "id": "04", "x": 740, "y": 220, "name": "Casino Square", "speed": "125 km/h", "gear": "Gear 3" },
    { "id": "06", "x": 490, "y": 100, "name": "Fairmont Hairpin", "speed": "48 km/h", "gear": "Gear 1" },
    { "id": "09", "x": 380, "y": 75, "name": "Tunnel Exit", "speed": "280 km/h", "gear": "Gear 7" },
    { "id": "12", "x": 330, "y": 220, "name": "Tabac", "speed": "170 km/h", "gear": "Gear 4" },
    { "id": "15", "x": 250, "y": 345, "name": "Swimming Pool", "speed": "185 km/h", "gear": "Gear 4" },
    { "id": "18", "x": 190, "y": 400, "name": "La Rascasse", "speed": "60 km/h", "gear": "Gear 1" }
  ]
}

print(f"Generated {len(catalog)} baseline circuits")
