import logging
import re
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Path, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.services.f1_service import f1_service
from app.services.analytics_service import analytics_service
from app.services.fastf1_service import fastf1_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("racepective")

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Formula 1 Analytics and Race Intelligence API powered by Jolpica-F1 and FastF1."
)

# CORS configured for development and production environments
allow_credentials = "*" not in settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_year(year: str) -> str:
    """Validate season year parameter: must be 'current' or integer between 1950 and 2030."""
    cleaned = year.strip().lower()
    if cleaned == "current":
        return "current"
    if not cleaned.isdigit():
        raise HTTPException(
            status_code=400,
            detail=f"Invalid year '{year}'. Year must be 'current' or an integer between 1950 and 2030."
        )
    val = int(cleaned)
    if val < 1950 or val > 2030:
        raise HTTPException(
            status_code=400,
            detail=f"Season year {val} out of range. Formula One seasons run from 1950 to 2030."
        )
    return str(val)

def validate_round(round_num: int) -> int:
    """Validate championship round number."""
    if round_num < 1 or round_num > 35:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid round {round_num}. Championship rounds must be between 1 and 35."
        )
    return round_num

def validate_identifier(name: str, value: str) -> str:
    """Validate driver_id or circuit_id identifier."""
    if not re.match(r"^[a-zA-Z0-9_\-]+$", value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {name} format: '{value}'. Alphanumeric, hyphen and underscores only."
        )
    return value


# --- Health & Status ---

@app.get("/api/health")
@app.get("/api/status")
async def get_health():
    """System health check, active season, Jolpica connectivity state, and timestamp."""
    try:
        schedule = await f1_service.get_schedule("current")
        connected = schedule.get("upstream_available", True)
        is_demo = schedule.get("is_demo", False)
        season = schedule["data"][0]["season"] if schedule.get("data") else "2026"
    except Exception as e:
        logger.error(f"Health check error: {e}")
        connected = False
        is_demo = True
        season = "2026"

    return {
        "status": "online",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "season": season,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "jolpica_connected": connected,
        "is_demo": is_demo,
        "upstream_available": connected
    }


# --- Seasons & Races ---

@app.get("/api/seasons")
async def get_seasons():
    """List of all available Formula One world championship seasons."""
    return await f1_service.get_seasons()

@app.get("/api/seasons/{year}/races")
@app.get("/api/calendar")
async def get_season_races(year: str = "current"):
    """Race calendar for a specified season with upcoming, completed, and in-progress states."""
    valid_year = validate_year(year)
    return await f1_service.get_schedule(valid_year)

@app.get("/api/races/next")
async def get_next_race():
    """Immediate next upcoming Grand Prix with countdown metadata."""
    return await f1_service.get_next_race("current")

@app.get("/api/races/latest")
@app.get("/api/races/last")
async def get_latest_race():
    """Most recently concluded Grand Prix results and podium classification."""
    return await f1_service.get_latest_race("current")

@app.get("/api/races/{year}/{round_num}")
async def get_race_detail(year: str, round_num: int):
    """Specific Grand Prix details with qualifying, race classification, and session timetable."""
    valid_year = validate_year(year)
    valid_round = validate_round(round_num)
    res = await f1_service.get_race_detail(valid_year, valid_round)
    if not res.get("data"):
        raise HTTPException(status_code=404, detail=f"Grand Prix Round {valid_round} for season {valid_year} not found")
    return res

@app.get("/api/races/{year}/{round_num}/telemetry")
async def get_race_telemetry(year: int, round_num: int):
    """Supplementary session timing & weather telemetry via FastF1 when available."""
    validate_round(round_num)
    return fastf1_service.get_session_summary(year, round_num)


# --- Standings ---

@app.get("/api/standings/drivers")
@app.get("/api/standings/drivers/{year}")
async def get_driver_standings(year: str = "current"):
    """Driver world championship standings for a given year."""
    valid_year = validate_year(year)
    return await f1_service.get_driver_standings(valid_year)

@app.get("/api/standings/constructors")
@app.get("/api/standings/constructors/{year}")
async def get_constructor_standings(year: str = "current"):
    """Constructor world championship standings for a given year."""
    valid_year = validate_year(year)
    return await f1_service.get_constructor_standings(valid_year)


# --- Drivers ---

@app.get("/api/drivers")
async def get_drivers(season: str = Query("current")):
    """Complete driver roster with constructor allocations and stats."""
    valid_season = validate_year(season)
    return await f1_service.get_drivers(valid_season)

@app.get("/api/drivers/{driver_id}")
async def get_driver_detail(driver_id: str, season: str = Query("current")):
    """Specific driver profile, season statistics, and career information."""
    valid_id = validate_identifier("driver_id", driver_id)
    valid_season = validate_year(season)
    return await f1_service.get_driver_detail(valid_id, valid_season)

@app.get("/api/drivers/{driver_id}/results/{year}")
async def get_driver_results(driver_id: str, year: str):
    """Race-by-race finishes for a specific driver in a given championship season."""
    valid_id = validate_identifier("driver_id", driver_id)
    valid_year = validate_year(year)
    return await f1_service.get_driver_results(valid_id, valid_year)


# --- Circuits ---

@app.get("/api/circuits")
async def get_circuits(season: str = Query("current")):
    """All Formula One circuits with real geographic coordinates for Leaflet maps."""
    valid_season = validate_year(season)
    return await f1_service.get_circuits(valid_season)

@app.get("/api/circuits/{circuit_id}")
async def get_circuit_detail(circuit_id: str):
    """Specific circuit information, locality, and GPS track coordinates."""
    valid_id = validate_identifier("circuit_id", circuit_id)
    res = await f1_service.get_circuit_detail(valid_id)
    if not res.get("data"):
        raise HTTPException(status_code=404, detail=f"Circuit '{circuit_id}' not found")
    return res

@app.get("/api/circuits/{circuit_id}/history")
async def get_circuit_history(circuit_id: str):
    """Past Grand Prix winners, pole conversion rate, and historical statistics for a circuit."""
    valid_id = validate_identifier("circuit_id", circuit_id)
    return await f1_service.get_circuit_history(valid_id)


# --- Home Dashboard & Analytics Aggregations ---

@app.get("/api/dashboard")
async def get_dashboard():
    """Aggregated payload powering the primary Home overview."""
    schedule_res = await f1_service.get_schedule("current")
    races = schedule_res.get("data", [])

    next_race = None
    last_completed = None
    completed_count = 0

    for r in races:
        if r["state"] == "COMPLETED":
            last_completed = r
            completed_count += 1
        elif r["state"] in ("UPCOMING", "IN_PROGRESS") and not next_race:
            next_race = r

    drivers_res = await f1_service.get_driver_standings("current")
    constructors_res = await f1_service.get_constructor_standings("current")
    last_race_res = await f1_service.get_latest_race("current")

    drivers = drivers_res.get("data", [])
    constructors = constructors_res.get("data", [])

    season_val = races[0]["season"] if races else "2026"
    is_demo = schedule_res.get("is_demo", False) or drivers_res.get("is_demo", False)

    return {
        "season": season_val,
        "last_updated": schedule_res.get("last_updated"),
        "is_demo": is_demo,
        "upstream_available": schedule_res.get("upstream_available", True),
        "total_races": len(races),
        "completed_races": completed_count,
        "next_race": next_race,
        "last_race": last_race_res.get("data") if last_race_res else last_completed,
        "driver_leader": drivers[0] if drivers else None,
        "constructor_leader": constructors[0] if constructors else None,
        "top_drivers": drivers[:5],
        "top_constructors": constructors[:5]
    }

@app.get("/api/analytics/progression")
async def get_progression(season: str = Query("current"), limit: int = Query(6)):
    """Round-by-round points progression for top title contenders."""
    valid_season = validate_year(season)
    return await analytics_service.get_championship_progression(valid_season, top_n=limit)

@app.get("/api/analytics/points-gap")
async def get_points_gap(
    season: str = Query("current"),
    driver_a: str = Query(..., description="Driver A identifier"),
    driver_b: str = Query(..., description="Driver B identifier")
):
    """Round-by-round cumulative points difference and delta between two drivers."""
    valid_season = validate_year(season)
    valid_a = validate_identifier("driver_a", driver_a)
    valid_b = validate_identifier("driver_b", driver_b)
    return await analytics_service.get_points_gap(valid_season, valid_a, valid_b)

@app.get("/api/analytics/finishing-trends")
async def get_finishing_trends(
    season: str = Query("current"),
    driver_id: str = Query(..., description="Driver identifier")
):
    """Starting grid versus final classification across completed rounds with DNF/DNS handling."""
    valid_season = validate_year(season)
    valid_id = validate_identifier("driver_id", driver_id)
    return await analytics_service.get_finishing_position_trend(valid_season, valid_id)

@app.get("/api/analytics/driver-consistency")
@app.get("/api/analytics/consistency")
async def get_driver_consistency(
    season: str = Query("current"),
    window: str = Query("all", description="Race window: 'all', '5', or '10'")
):
    """Mean classified finishing position, standard deviation (variability), and reliability."""
    valid_season = validate_year(season)
    return await analytics_service.get_driver_consistency(valid_season, window=window)

@app.get("/api/analytics/teammate-comparison")
async def get_teammate_comparison(
    season: str = Query("current"),
    constructor_id: str | None = Query(None)
):
    """Head-to-head teammate comparison across constructors."""
    valid_season = validate_year(season)
    return await analytics_service.get_teammate_comparison(valid_season, constructor_id=constructor_id)

@app.get("/api/analytics/constructor-contributions")
async def get_constructor_contributions(season: str = Query("current")):
    """Cumulative points and driver percentage contribution breakdown by constructor."""
    valid_season = validate_year(season)
    return await analytics_service.get_constructor_contributions(valid_season)

@app.get("/api/analytics/race-explainer")
@app.get("/api/analytics/position-changes")
async def get_race_explainer(season: str = Query("current"), round_num: int = Query(18)):
    """Grid start vs race finish position changes and detailed race outcome explainer."""
    valid_season = validate_year(season)
    valid_round = validate_round(round_num)
    return await analytics_service.get_race_result_explainer(valid_season, valid_round)

@app.get("/api/weather")
async def get_weather(
    lat: float = Query(19.4042, description="Circuit latitude"),
    lon: float = Query(-99.0907, description="Circuit longitude")
):
    """Live track meteorology and weather telemetry via Open-Meteo with fallback."""
    try:
        import httpx
        url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m"
        )
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, headers={"User-Agent": "RacepectiveF1/1.0"})
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                air_temp = round(current.get("temperature_2m", 23.0), 1)
                code = current.get("weather_code", 0)
                is_clear = code in [0, 1]
                track_offset = 16.0 if is_clear else 9.0
                track_temp = round(air_temp + track_offset, 1)
                precip = current.get("precipitation", 0.0)
                wind_spd = round(current.get("wind_speed_10m", 9.0), 1)
                wind_dir = current.get("wind_direction_10m", 180)
                humidity = current.get("relative_humidity_2m", 36)

                if code == 0:
                    condition = "Clear Sky"
                    icon = "sun"
                elif code in [1, 2]:
                    condition = "Partly Cloudy"
                    icon = "cloud-sun"
                elif code == 3:
                    condition = "Overcast"
                    icon = "cloud"
                elif code in [51, 53, 55, 61, 63, 65, 80, 81]:
                    condition = "Light Rain"
                    icon = "cloud-rain"
                else:
                    condition = "Dry"
                    icon = "sun"

                return {
                    "status": "success",
                    "air_temp_c": air_temp,
                    "air_temp_f": round(air_temp * 9 / 5 + 32, 1),
                    "track_temp_c": track_temp,
                    "track_temp_f": round(track_temp * 9 / 5 + 32, 1),
                    "humidity": humidity,
                    "wind_speed_kmh": wind_spd,
                    "wind_direction_deg": wind_dir,
                    "precipitation_mm": precip,
                    "rain_risk_percent": min(100, int(precip * 50)) if precip > 0 else 5,
                    "condition": condition,
                    "icon": icon,
                    "track_status": "WET" if precip > 0.5 else "DAMP" if precip > 0 else "DRY"
                }
    except Exception as e:
        logger.warning(f"Could not fetch live weather from Open-Meteo ({e}); using venue baseline.")

    # High-altitude Mexico City venue meteorological baseline
    return {
        "status": "fallback",
        "air_temp_c": 23.4,
        "air_temp_f": 74.1,
        "track_temp_c": 39.2,
        "track_temp_f": 102.6,
        "humidity": 36,
        "wind_speed_kmh": 9.2,
        "wind_direction_deg": 330,
        "precipitation_mm": 0.0,
        "rain_risk_percent": 5,
        "condition": "Partly Cloudy",
        "icon": "cloud-sun",
        "track_status": "DRY"
    }
