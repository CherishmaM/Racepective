"""
Demo Fallback Data for Racepective.
This dataset is strictly used as an offline/network failure fallback.
All payloads returned from here explicitly include `is_demo: True`.
"""

from datetime import datetime, timezone

DEMO_TIMESTAMP = datetime.now(timezone.utc).isoformat()
DEMO_SEASON = "2026"

DEMO_SCHEDULE = [
    {
        "season": "2026",
        "round": 1,
        "race_name": "Australian Grand Prix",
        "circuit": {
            "circuit_id": "albert_park",
            "circuit_name": "Albert Park Grand Prix Circuit",
            "location": {"lat": -37.8497, "long": 144.968, "locality": "Melbourne", "country": "Australia"},
            "url": "https://en.wikipedia.org/wiki/Albert_Park_Circuit"
        },
        "date": "2026-03-08",
        "time": "04:00:00Z",
        "iso_start_time": "2026-03-08T04:00:00Z",
        "state": "COMPLETED",
        "winner": "Andrea Kimi Antonelli",
        "winner_team": "Mercedes"
    },
    {
        "season": "2026",
        "round": 18,
        "race_name": "United States Grand Prix",
        "circuit": {
            "circuit_id": "americas",
            "circuit_name": "Circuit of the Americas",
            "location": {"lat": 30.1328, "long": -97.6411, "locality": "Austin", "country": "USA"},
            "url": "https://en.wikipedia.org/wiki/Circuit_of_the_Americas"
        },
        "date": "2026-10-25",
        "time": "20:00:00Z",
        "iso_start_time": "2026-10-25T20:00:00Z",
        "state": "COMPLETED",
        "winner": "Andrea Kimi Antonelli",
        "winner_team": "Mercedes"
    },
    {
        "season": "2026",
        "round": 19,
        "race_name": "Mexico City Grand Prix",
        "circuit": {
            "circuit_id": "rodriguez",
            "circuit_name": "Autódromo Hermanos Rodríguez",
            "location": {"lat": 19.4042, "long": -99.0907, "locality": "Mexico City", "country": "Mexico"},
            "url": "https://en.wikipedia.org/wiki/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez"
        },
        "date": "2026-11-01",
        "time": "20:00:00Z",
        "iso_start_time": "2026-11-01T20:00:00Z",
        "state": "UPCOMING"
    },
    {
        "season": "2026",
        "round": 20,
        "race_name": "São Paulo Grand Prix",
        "circuit": {
            "circuit_id": "interlagos",
            "circuit_name": "Autódromo José Carlos Pace",
            "location": {"lat": -23.7036, "long": -46.6997, "locality": "São Paulo", "country": "Brazil"},
            "url": "https://en.wikipedia.org/wiki/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace"
        },
        "date": "2026-11-08",
        "time": "17:00:00Z",
        "iso_start_time": "2026-11-08T17:00:00Z",
        "state": "UPCOMING"
    }
]

DEMO_DRIVER_STANDINGS = [
    {
        "position": 1,
        "points": 365.0,
        "wins": 9,
        "driver_id": "antonelli",
        "driver_number": "12",
        "driver_code": "ANT",
        "driver_name": "Andrea Kimi Antonelli",
        "nationality": "Italian",
        "constructor_id": "mercedes",
        "constructor_name": "Mercedes"
    },
    {
        "position": 2,
        "points": 242.0,
        "wins": 3,
        "driver_id": "russell",
        "driver_number": "63",
        "driver_code": "RUS",
        "driver_name": "George Russell",
        "nationality": "British",
        "constructor_id": "mercedes",
        "constructor_name": "Mercedes"
    },
    {
        "position": 3,
        "points": 241.0,
        "wins": 1,
        "driver_id": "hamilton",
        "driver_number": "44",
        "driver_code": "HAM",
        "driver_name": "Lewis Hamilton",
        "nationality": "British",
        "constructor_id": "ferrari",
        "constructor_name": "Ferrari"
    },
    {
        "position": 4,
        "points": 235.0,
        "wins": 2,
        "driver_id": "leclerc",
        "driver_number": "16",
        "driver_code": "LEC",
        "driver_name": "Charles Leclerc",
        "nationality": "Monegasque",
        "constructor_id": "ferrari",
        "constructor_name": "Ferrari"
    },
    {
        "position": 5,
        "points": 218.0,
        "wins": 2,
        "driver_id": "max_verstappen",
        "driver_number": "3",
        "driver_code": "VER",
        "driver_name": "Max Verstappen",
        "nationality": "Dutch",
        "constructor_id": "red_bull",
        "constructor_name": "Red Bull"
    },
    {
        "position": 6,
        "points": 195.0,
        "wins": 1,
        "driver_id": "norris",
        "driver_number": "1",
        "driver_code": "NOR",
        "driver_name": "Lando Norris",
        "nationality": "British",
        "constructor_id": "mclaren",
        "constructor_name": "McLaren"
    },
    {
        "position": 7,
        "points": 182.0,
        "wins": 0,
        "driver_id": "piastri",
        "driver_number": "81",
        "driver_code": "PIA",
        "driver_name": "Oscar Piastri",
        "nationality": "Australian",
        "constructor_id": "mclaren",
        "constructor_name": "McLaren"
    }
]

DEMO_CONSTRUCTOR_STANDINGS = [
    {
        "position": 1,
        "points": 607.0,
        "wins": 12,
        "constructor_id": "mercedes",
        "constructor_name": "Mercedes",
        "nationality": "German"
    },
    {
        "position": 2,
        "points": 476.0,
        "wins": 3,
        "constructor_id": "ferrari",
        "constructor_name": "Ferrari",
        "nationality": "Italian"
    },
    {
        "position": 3,
        "points": 377.0,
        "wins": 1,
        "constructor_id": "mclaren",
        "constructor_name": "McLaren",
        "nationality": "British"
    },
    {
        "position": 4,
        "points": 298.0,
        "wins": 2,
        "constructor_id": "red_bull",
        "constructor_name": "Red Bull",
        "nationality": "Austrian"
    }
]
