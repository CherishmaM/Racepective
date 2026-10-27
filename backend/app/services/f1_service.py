import logging
import ssl
from datetime import datetime, timezone, timedelta
from typing import Any, Optional
import httpx

from app.config import settings
from app.services.cache_service import cache
from app.data import demo_fallback

logger = logging.getLogger(__name__)

class F1Service:
    def __init__(self):
        self.base_url = settings.jolpica_base_url
        self.timeout = settings.request_timeout

    async def _fetch_from_api(self, endpoint: str) -> Optional[dict]:
        """Fetch JSON payload from Jolpica F1 API with configured timeout and system SSL certs."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            ssl_ctx = ssl.create_default_context()
            async with httpx.AsyncClient(verify=ssl_ctx, timeout=self.timeout) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    return res.json()
                logger.warning(f"Jolpica returned status {res.status_code} for {url}")
                return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    def _determine_race_state(self, date_str: str, time_str: Optional[str], has_results: bool) -> str:
        """
        Carefully evaluates race state from documented UTC date and time:
        - If official results are registered, state is COMPLETED.
        - Only marked IN_PROGRESS if current UTC time is between race start and start + 3 hours.
        - Future races are NEVER marked as live or in progress.
        """
        if has_results:
            return "COMPLETED"

        if not date_str:
            return "UPCOMING"

        try:
            if not time_str:
                time_str = "12:00:00Z"
            iso_str = f"{date_str}T{time_str.replace('Z', '')}+00:00"
            race_start = datetime.fromisoformat(iso_str)
            now = datetime.now(timezone.utc)
            race_end = race_start + timedelta(hours=3)

            if now > race_end:
                return "COMPLETED"
            elif race_start <= now <= race_end:
                return "IN_PROGRESS"
            else:
                return "UPCOMING"
        except Exception:
            return "UPCOMING"

    async def get_seasons(self) -> dict[str, Any]:
        """Fetch list of all available Formula One championship seasons."""
        cache_key = "seasons_list"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api("seasons.json?limit=100")
        if not raw or "MRData" not in raw:
            demo_seasons = [{"season": str(y), "url": f"https://en.wikipedia.org/wiki/{y}_Formula_One_World_Championship"} for y in range(2026, 2015, -1)]
            return {
                "data": demo_seasons,
                "total": len(demo_seasons),
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        seasons_raw = raw["MRData"].get("SeasonTable", {}).get("Seasons", [])
        parsed = [{"season": s.get("season"), "url": s.get("url")} for s in seasons_raw if s.get("season")]
        parsed.sort(key=lambda x: int(x["season"]) if x["season"].isdigit() else 0, reverse=True)

        updated_at = cache.set(cache_key, parsed, ttl_seconds=settings.cache_historical_ttl_seconds)
        return {
            "data": parsed,
            "total": len(parsed),
            "last_updated": updated_at,
            "is_demo": False,
            "upstream_available": True
        }

    async def get_schedule(self, season: str = "current") -> dict[str, Any]:
        """Fetch full race calendar with verified states and session start times."""
        cache_key = f"schedule_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}.json?limit=100")
        if not raw or "MRData" not in raw:
            return {
                "data": demo_fallback.DEMO_SCHEDULE,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        race_table = raw["MRData"].get("RaceTable", {})
        actual_season = race_table.get("season", season)
        raw_races = race_table.get("Races", [])

        # Check last completed round to avoid marking completed races as upcoming
        last_results_raw = await self._fetch_from_api(f"{season}/last/results.json")
        last_completed_round = 0
        if last_results_raw and "MRData" in last_results_raw:
            last_round_str = last_results_raw["MRData"].get("RaceTable", {}).get("round")
            if last_round_str and last_round_str.isdigit():
                last_completed_round = int(last_round_str)

        formatted_races = []
        for r in raw_races:
            round_num = int(r.get("round", 0))
            has_results = round_num <= last_completed_round and round_num > 0
            state = self._determine_race_state(r.get("date", ""), r.get("time"), has_results)
            loc = r.get("Circuit", {}).get("Location", {})

            time_val = r.get("time", "12:00:00Z")
            iso_start = f"{r.get('date', '')}T{time_val}"

            formatted_races.append({
                "season": actual_season,
                "round": round_num,
                "race_name": r.get("raceName", "Grand Prix"),
                "circuit": {
                    "circuit_id": r.get("Circuit", {}).get("circuitId", "unknown"),
                    "circuit_name": r.get("Circuit", {}).get("circuitName", "Circuit"),
                    "location": {
                        "lat": float(loc.get("lat", 0.0)),
                        "long": float(loc.get("long", 0.0)),
                        "locality": loc.get("locality", ""),
                        "country": loc.get("country", "")
                    },
                    "url": r.get("Circuit", {}).get("url")
                },
                "date": r.get("date", ""),
                "time": time_val,
                "iso_start_time": iso_start,
                "state": state
            })

        updated_at = cache.set(cache_key, formatted_races, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": formatted_races, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_next_race(self, season: str = "current") -> dict[str, Any]:
        """Returns the immediate next scheduled Grand Prix."""
        schedule_res = await self.get_schedule(season)
        races = schedule_res.get("data", [])

        next_race = None
        for r in races:
            if r["state"] in ("UPCOMING", "IN_PROGRESS"):
                next_race = r
                break

        return {
            "data": next_race,
            "season": races[0]["season"] if races else "2026",
            "last_updated": schedule_res.get("last_updated"),
            "is_demo": schedule_res.get("is_demo", False),
            "upstream_available": schedule_res.get("upstream_available", True)
        }

    async def get_latest_race(self, season: str = "current") -> dict[str, Any]:
        """Fetch detailed results and podium of the most recently concluded Grand Prix."""
        cache_key = f"latest_race_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/last/results.json")
        if not raw or "MRData" not in raw:
            # Fallback to last race in demo data
            demo_last = demo_fallback.DEMO_SCHEDULE[1]
            return {
                "data": {
                    **demo_last,
                    "winner": {"driver_name": demo_last["winner"], "constructor_name": demo_last["winner_team"]},
                    "podium": [],
                    "results": []
                },
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        races = raw["MRData"].get("RaceTable", {}).get("Races", [])
        if not races:
            return {
                "data": None,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "is_demo": False,
                "upstream_available": True
            }

        race = races[0]
        results_raw = race.get("Results", [])

        results = []
        for res in results_raw:
            d_info = res.get("Driver", {})
            c_info = res.get("Constructor", {})
            grid = int(res.get("grid", 0)) if str(res.get("grid", "")).isdigit() else 0
            pos = int(res.get("position", 0)) if str(res.get("position", "")).isdigit() else 0
            pos_change = (grid - pos) if (grid > 0 and pos > 0) else 0

            fastest_lap = res.get("FastestLap", {})
            results.append({
                "position": pos,
                "driver_id": d_info.get("driverId", ""),
                "driver_name": f"{d_info.get('givenName', '')} {d_info.get('familyName', '')}".strip(),
                "driver_code": d_info.get("code"),
                "driver_number": d_info.get("permanentNumber") or res.get("number"),
                "constructor_name": c_info.get("name", "Unknown"),
                "constructor_id": c_info.get("constructorId", ""),
                "grid": grid,
                "position_change": pos_change,
                "laps": int(res.get("laps", 0)) if str(res.get("laps", "")).isdigit() else 0,
                "status": res.get("status", "Finished"),
                "time": res.get("Time", {}).get("time"),
                "points": float(res.get("points", 0.0)),
                "fastest_lap_rank": int(fastest_lap.get("rank")) if fastest_lap.get("rank") else None,
                "fastest_lap_time": fastest_lap.get("Time", {}).get("time")
            })

        loc = race.get("Circuit", {}).get("Location", {})
        race_data = {
            "season": race.get("season", season),
            "round": int(race.get("round", 0)),
            "race_name": race.get("raceName", "Grand Prix"),
            "date": race.get("date", ""),
            "circuit": {
                "circuit_id": race.get("Circuit", {}).get("circuitId", ""),
                "circuit_name": race.get("Circuit", {}).get("circuitName", ""),
                "location": {
                    "lat": float(loc.get("lat", 0.0)),
                    "long": float(loc.get("long", 0.0)),
                    "locality": loc.get("locality", ""),
                    "country": loc.get("country", "")
                }
            },
            "winner": results[0] if results else None,
            "results": results,
            "podium": results[:3] if len(results) >= 3 else results
        }

        updated_at = cache.set(cache_key, race_data, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": race_data, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_race_detail(self, season: str, round_num: int) -> dict[str, Any]:
        """Fetch race results, qualifying grid, and session timetable for a specific year and round."""
        cache_key = f"race_detail_{season}_{round_num}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/{round_num}/results.json")
        if not raw or "MRData" not in raw:
            # Fallback
            demo_match = next((r for r in demo_fallback.DEMO_SCHEDULE if r["round"] == round_num), None)
            if not demo_match:
                demo_match = demo_fallback.DEMO_SCHEDULE[0]

            fallback_data = {
                **demo_match,
                "results": [],
                "podium": [],
                "qualifying": [],
                "sessions": [
                    {"name": "Practice 1 (FP1)", "date": demo_match["date"], "time": "12:30:00Z"},
                    {"name": "Official Qualifying", "date": demo_match["date"], "time": "15:00:00Z"},
                    {"name": "Grand Prix Main Race", "date": demo_match["date"], "time": demo_match["time"]}
                ]
            }
            return {
                "data": fallback_data,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        races = raw["MRData"].get("RaceTable", {}).get("Races", [])
        if not races:
            # Attempt to fetch schedule info if race has no results yet (upcoming)
            sched_raw = await self._fetch_from_api(f"{season}/{round_num}.json")
            if sched_raw and "MRData" in sched_raw:
                s_races = sched_raw["MRData"].get("RaceTable", {}).get("Races", [])
                if s_races:
                    sr = s_races[0]
                    loc = sr.get("Circuit", {}).get("Location", {})
                    upcoming_data = {
                        "season": sr.get("season", season),
                        "round": int(sr.get("round", round_num)),
                        "race_name": sr.get("raceName", "Grand Prix"),
                        "date": sr.get("date", ""),
                        "time": sr.get("time", ""),
                        "circuit": {
                            "circuit_id": sr.get("Circuit", {}).get("circuitId", ""),
                            "circuit_name": sr.get("Circuit", {}).get("circuitName", ""),
                            "location": {
                                "lat": float(loc.get("lat", 0.0)),
                                "long": float(loc.get("long", 0.0)),
                                "locality": loc.get("locality", ""),
                                "country": loc.get("country", "")
                            },
                            "url": sr.get("Circuit", {}).get("url")
                        },
                        "results": [],
                        "podium": [],
                        "qualifying": [],
                        "sessions": [
                            {"name": "Practice 1", "date": sr.get("FirstPractice", {}).get("date"), "time": sr.get("FirstPractice", {}).get("time")},
                            {"name": "Practice 2", "date": sr.get("SecondPractice", {}).get("date"), "time": sr.get("SecondPractice", {}).get("time")},
                            {"name": "Qualifying", "date": sr.get("Qualifying", {}).get("date"), "time": sr.get("Qualifying", {}).get("time")},
                            {"name": "Grand Prix Race", "date": sr.get("date"), "time": sr.get("time")}
                        ]
                    }
                    return {"data": upcoming_data, "last_updated": datetime.now(timezone.utc).isoformat(), "is_demo": False, "upstream_available": True}

            return {"data": None, "last_updated": datetime.now(timezone.utc).isoformat(), "is_demo": False, "upstream_available": True}

        race = races[0]
        results_raw = race.get("Results", [])

        results = []
        for res in results_raw:
            d_info = res.get("Driver", {})
            c_info = res.get("Constructor", {})
            grid = int(res.get("grid", 0)) if str(res.get("grid", "")).isdigit() else 0
            pos = int(res.get("position", 0)) if str(res.get("position", "")).isdigit() else 0
            pos_change = (grid - pos) if (grid > 0 and pos > 0) else 0

            fastest_lap = res.get("FastestLap", {})
            results.append({
                "position": pos,
                "driver_id": d_info.get("driverId", ""),
                "driver_name": f"{d_info.get('givenName', '')} {d_info.get('familyName', '')}".strip(),
                "driver_code": d_info.get("code"),
                "driver_number": d_info.get("permanentNumber") or res.get("number"),
                "constructor_name": c_info.get("name", "Unknown"),
                "constructor_id": c_info.get("constructorId", ""),
                "grid": grid,
                "position_change": pos_change,
                "laps": int(res.get("laps", 0)) if str(res.get("laps", "")).isdigit() else 0,
                "status": res.get("status", "Finished"),
                "time": res.get("Time", {}).get("time"),
                "points": float(res.get("points", 0.0)),
                "fastest_lap_rank": int(fastest_lap.get("rank")) if fastest_lap.get("rank") else None,
                "fastest_lap_time": fastest_lap.get("Time", {}).get("time")
            })

        # Fetch qualifying results if available
        qual_raw = await self._fetch_from_api(f"{season}/{round_num}/qualifying.json")
        qualifying = []
        if qual_raw and "MRData" in qual_raw:
            q_races = qual_raw["MRData"].get("RaceTable", {}).get("Races", [])
            if q_races:
                for q in q_races[0].get("QualifyingResults", []):
                    d = q.get("Driver", {})
                    c = q.get("Constructor", {})
                    qualifying.append({
                        "position": int(q.get("position", 0)),
                        "driver_name": f"{d.get('givenName', '')} {d.get('familyName', '')}".strip(),
                        "constructor_name": c.get("name", ""),
                        "q1": q.get("Q1"),
                        "q2": q.get("Q2"),
                        "q3": q.get("Q3")
                    })

        # Fetch round schedule for official session timings
        sessions = []
        schedule_raw = await self._fetch_from_api(f"{season}/{round_num}.json")
        if schedule_raw and "MRData" in schedule_raw:
            s_races = schedule_raw["MRData"].get("RaceTable", {}).get("Races", [])
            if s_races:
                sr = s_races[0]
                if sr.get("FirstPractice"):
                    sessions.append({"name": "Practice 1 (FP1)", "date": sr["FirstPractice"].get("date"), "time": sr["FirstPractice"].get("time")})
                if sr.get("SecondPractice"):
                    sessions.append({"name": "Practice 2 (FP2)", "date": sr["SecondPractice"].get("date"), "time": sr["SecondPractice"].get("time")})
                if sr.get("ThirdPractice"):
                    sessions.append({"name": "Practice 3 (FP3)", "date": sr["ThirdPractice"].get("date"), "time": sr["ThirdPractice"].get("time")})
                if sr.get("Sprint"):
                    sessions.append({"name": "Sprint Race", "date": sr["Sprint"].get("date"), "time": sr["Sprint"].get("time")})
                if sr.get("Qualifying"):
                    sessions.append({"name": "Official Qualifying", "date": sr["Qualifying"].get("date"), "time": sr["Qualifying"].get("time")})
                sessions.append({"name": "Grand Prix Main Race", "date": sr.get("date"), "time": sr.get("time")})

        if not sessions:
            r_date = race.get("date", "2026-10-25")
            sessions = [
                {"name": "Practice 1 (FP1)", "date": r_date, "time": "12:30:00Z"},
                {"name": "Practice 2 (FP2)", "date": r_date, "time": "16:00:00Z"},
                {"name": "Official Qualifying", "date": r_date, "time": "15:00:00Z"},
                {"name": "Grand Prix Main Race", "date": r_date, "time": race.get("time", "19:00:00Z")}
            ]

        loc = race.get("Circuit", {}).get("Location", {})
        data = {
            "season": race.get("season", season),
            "round": int(race.get("round", round_num)),
            "race_name": race.get("raceName", ""),
            "date": race.get("date", ""),
            "time": race.get("time", ""),
            "circuit": {
                "circuit_id": race.get("Circuit", {}).get("circuitId", ""),
                "circuit_name": race.get("Circuit", {}).get("circuitName", ""),
                "location": {
                    "lat": float(loc.get("lat", 0.0)),
                    "long": float(loc.get("long", 0.0)),
                    "locality": loc.get("locality", ""),
                    "country": loc.get("country", "")
                },
                "url": race.get("Circuit", {}).get("url")
            },
            "results": results,
            "podium": results[:3] if len(results) >= 3 else results,
            "qualifying": qualifying,
            "sessions": sessions
        }

        updated_at = cache.set(cache_key, data, ttl_seconds=settings.cache_historical_ttl_seconds)
        return {"data": data, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_driver_standings(self, season: str = "current") -> dict[str, Any]:
        """Fetch driver championship standings for the requested season."""
        cache_key = f"driver_standings_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/driverStandings.json?limit=100")
        if not raw or "MRData" not in raw:
            return {
                "data": demo_fallback.DEMO_DRIVER_STANDINGS,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        standings_lists = raw["MRData"].get("StandingsTable", {}).get("StandingsLists", [])
        if not standings_lists:
            return {
                "data": demo_fallback.DEMO_DRIVER_STANDINGS,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        driver_standings_raw = standings_lists[0].get("DriverStandings", [])
        parsed = []
        for d in driver_standings_raw:
            driver_info = d.get("Driver", {})
            constructors = d.get("Constructors", [{}])
            primary_constructor = constructors[0] if constructors else {}

            parsed.append({
                "position": int(d.get("position", 0)),
                "points": float(d.get("points", 0.0)),
                "wins": int(d.get("wins", 0)),
                "driver_id": driver_info.get("driverId", ""),
                "driver_number": driver_info.get("permanentNumber"),
                "driver_code": driver_info.get("code"),
                "driver_name": f"{driver_info.get('givenName', '')} {driver_info.get('familyName', '')}".strip(),
                "nationality": driver_info.get("nationality", ""),
                "constructor_id": primary_constructor.get("constructorId", "unknown"),
                "constructor_name": primary_constructor.get("name", "Independent")
            })

        updated_at = cache.set(cache_key, parsed, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": parsed, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_constructor_standings(self, season: str = "current") -> dict[str, Any]:
        """Fetch constructor championship standings for the requested season."""
        cache_key = f"constructor_standings_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/constructorStandings.json?limit=100")
        if not raw or "MRData" not in raw:
            return {
                "data": demo_fallback.DEMO_CONSTRUCTOR_STANDINGS,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        standings_lists = raw["MRData"].get("StandingsTable", {}).get("StandingsLists", [])
        if not standings_lists:
            return {
                "data": demo_fallback.DEMO_CONSTRUCTOR_STANDINGS,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        constructors_raw = standings_lists[0].get("ConstructorStandings", [])
        parsed = []
        for c in constructors_raw:
            constructor_info = c.get("Constructor", {})
            parsed.append({
                "position": int(c.get("position", 0)),
                "points": float(c.get("points", 0.0)),
                "wins": int(c.get("wins", 0)),
                "constructor_id": constructor_info.get("constructorId", ""),
                "constructor_name": constructor_info.get("name", "Unknown"),
                "nationality": constructor_info.get("nationality", "")
            })

        updated_at = cache.set(cache_key, parsed, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": parsed, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_driver_detail(self, driver_id: str, season: str = "current") -> dict[str, Any]:
        """Fetch driver identity, team, and current season statistics."""
        cache_key = f"driver_detail_{season}_{driver_id}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"drivers/{driver_id}.json")
        driver_meta = {}
        if raw and "MRData" in raw:
            d_list = raw["MRData"].get("DriverTable", {}).get("Drivers", [])
            if d_list:
                dm = d_list[0]
                driver_meta = {
                    "driver_id": dm.get("driverId", driver_id),
                    "permanent_number": dm.get("permanentNumber"),
                    "code": dm.get("code"),
                    "name": f"{dm.get('givenName', '')} {dm.get('familyName', '')}".strip(),
                    "date_of_birth": dm.get("dateOfBirth"),
                    "nationality": dm.get("nationality", ""),
                    "url": dm.get("url")
                }

        # Match standing for current points & position
        standings_res = await self.get_driver_standings(season)
        standing_match = next((s for s in standings_res["data"] if s["driver_id"] == driver_id), None)

        if not driver_meta and standing_match:
            driver_meta = {
                "driver_id": driver_id,
                "permanent_number": standing_match.get("driver_number"),
                "code": standing_match.get("driver_code"),
                "name": standing_match["driver_name"],
                "nationality": standing_match["nationality"],
                "constructor_name": standing_match["constructor_name"],
                "constructor_id": standing_match["constructor_id"],
                "points": standing_match["points"],
                "wins": standing_match["wins"],
                "position": standing_match["position"]
            }

        if standing_match and driver_meta:
            driver_meta["constructor_name"] = standing_match["constructor_name"]
            driver_meta["constructor_id"] = standing_match["constructor_id"]
            driver_meta["points"] = standing_match["points"]
            driver_meta["wins"] = standing_match["wins"]
            driver_meta["position"] = standing_match["position"]

        # Fetch results for that driver in season
        results_res = await self.get_driver_results(driver_id, season)
        races_log = results_res.get("data", [])

        finish_positions = [r["finish"] for r in races_log if r.get("finish") and r["finish"] > 0]
        podiums = sum(1 for p in finish_positions if p <= 3)
        points_finishes = sum(1 for p in finish_positions if p <= 10)
        dnfs = sum(1 for r in races_log if "Retire" in r.get("status", "") or "Accident" in r.get("status", ""))
        avg_finish = round(sum(finish_positions) / len(finish_positions), 1) if finish_positions else 0.0

        profile = {
            "driver": driver_meta or {
                "driver_id": driver_id,
                "name": driver_id.replace("_", " ").title(),
                "nationality": "International",
                "constructor_name": "Formula 1 Grid",
                "points": 150.0,
                "wins": 1,
                "position": 5
            },
            "stats": {
                "races_entered": len(races_log),
                "podiums": podiums,
                "points_finishes": points_finishes,
                "dnfs": dnfs,
                "avg_finish": avg_finish,
                "best_finish": f"P{min(finish_positions)}" if finish_positions else "--",
                "worst_finish": f"P{max(finish_positions)}" if finish_positions else "--",
            },
            "races": races_log
        }

        updated_at = cache.set(cache_key, profile, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": profile, "last_updated": updated_at, "is_demo": results_res.get("is_demo", False), "upstream_available": results_res.get("upstream_available", True)}

    async def get_driver_results(self, driver_id: str, season: str = "current") -> dict[str, Any]:
        """Fetch race-by-race finishes for a specific driver in a given championship season."""
        cache_key = f"driver_results_{driver_id}_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/drivers/{driver_id}/results.json?limit=100")
        if not raw or "MRData" not in raw:
            # Fallback
            demo_log = [
                {"round": 1, "race_name": "Australian GP", "date": "2026-03-08", "grid": 2, "finish": 1, "delta": 1, "points": 25.0, "status": "Finished"},
                {"round": 2, "race_name": "Chinese GP", "date": "2026-03-15", "grid": 1, "finish": 2, "delta": -1, "points": 18.0, "status": "Finished"},
                {"round": 3, "race_name": "Japanese GP", "date": "2026-03-29", "grid": 3, "finish": 1, "delta": 2, "points": 25.0, "status": "Finished"},
                {"round": 18, "race_name": "United States GP", "date": "2026-10-25", "grid": 1, "finish": 1, "delta": 0, "points": 25.0, "status": "Finished"}
            ]
            return {
                "data": demo_log,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        races_raw = raw["MRData"].get("RaceTable", {}).get("Races", [])
        parsed = []
        for r in races_raw:
            results = r.get("Results", [])
            if results:
                res = results[0]
                grid = int(res.get("grid", 0)) if str(res.get("grid", "")).isdigit() else 0
                pos_str = res.get("position", "")
                pos = int(pos_str) if pos_str.isdigit() else 20
                pts = float(res.get("points", 0.0))
                status = res.get("status", "Finished")

                parsed.append({
                    "round": int(r.get("round", 0)),
                    "race_name": r.get("raceName", "").replace("Grand Prix", "GP").strip(),
                    "date": r.get("date", ""),
                    "grid": grid,
                    "finish": pos,
                    "delta": (grid - pos) if (grid > 0 and pos > 0) else 0,
                    "points": pts,
                    "status": status,
                    "circuit": r.get("Circuit", {}).get("circuitName")
                })

        updated_at = cache.set(cache_key, parsed, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": parsed, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_circuits(self, season: str = "current") -> dict[str, Any]:
        """Fetch all circuits in the calendar with geographic coordinates."""
        cache_key = f"circuits_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/circuits.json?limit=100")
        if not raw or "MRData" not in raw:
            circuits_map = {}
            for r in demo_fallback.DEMO_SCHEDULE:
                c = r["circuit"]
                circuits_map[c["circuit_id"]] = {
                    "circuit_id": c["circuit_id"],
                    "circuit_name": c["circuit_name"],
                    "location": c["location"],
                    "url": c.get("url")
                }
            return {
                "data": list(circuits_map.values()),
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        circuits_raw = raw["MRData"].get("CircuitTable", {}).get("Circuits", [])
        parsed = []
        for c in circuits_raw:
            loc = c.get("Location", {})
            parsed.append({
                "circuit_id": c.get("circuitId", ""),
                "circuit_name": c.get("circuitName", ""),
                "location": {
                    "lat": float(loc.get("lat", 0.0)),
                    "long": float(loc.get("long", 0.0)),
                    "locality": loc.get("locality", ""),
                    "country": loc.get("country", "")
                },
                "url": c.get("url")
            })

        updated_at = cache.set(cache_key, parsed, ttl_seconds=settings.cache_historical_ttl_seconds)
        return {"data": parsed, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_circuit_detail(self, circuit_id: str) -> dict[str, Any]:
        """Fetch specific circuit details, location, and metadata."""
        cache_key = f"circuit_detail_{circuit_id}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"circuits/{circuit_id}.json")
        if not raw or "MRData" not in raw:
            # Fallback search
            circuits_res = await self.get_circuits("current")
            found = next((c for c in circuits_res["data"] if c["circuit_id"] == circuit_id), None)
            return {
                "data": found or {
                    "circuit_id": circuit_id,
                    "circuit_name": circuit_id.replace("_", " ").title(),
                    "location": {"lat": 0.0, "long": 0.0, "locality": "Grand Prix Track", "country": "International"},
                    "url": None
                },
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        circuits_raw = raw["MRData"].get("CircuitTable", {}).get("Circuits", [])
        if not circuits_raw:
            return {"data": None, "last_updated": datetime.now(timezone.utc).isoformat(), "is_demo": False, "upstream_available": True}

        c = circuits_raw[0]
        loc = c.get("Location", {})
        circuit_data = {
            "circuit_id": c.get("circuitId", circuit_id),
            "circuit_name": c.get("circuitName", ""),
            "location": {
                "lat": float(loc.get("lat", 0.0)),
                "long": float(loc.get("long", 0.0)),
                "locality": loc.get("locality", ""),
                "country": loc.get("country", "")
            },
            "url": c.get("url")
        }

        updated_at = cache.set(cache_key, circuit_data, ttl_seconds=settings.cache_historical_ttl_seconds)
        return {"data": circuit_data, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_circuit_history(self, circuit_id: str) -> dict[str, Any]:
        """Fetch historical race winners and statistics for a specific circuit."""
        cache_key = f"circuit_history_{circuit_id}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"circuits/{circuit_id}/results/1.json?limit=100")
        if not raw or "MRData" not in raw:
            # Fallback demo historical winners
            demo_history = {
                "circuit_id": circuit_id,
                "circuit_name": circuit_id.replace("_", " ").title(),
                "total_races": 12,
                "first_year": 2012,
                "last_year": 2026,
                "pole_win_pct": 58.3,
                "pole_wins": 7,
                "top_drivers": [
                    {"name": "Lewis Hamilton", "wins": 5},
                    {"name": "Max Verstappen", "wins": 4},
                    {"name": "Sebastian Vettel", "wins": 2},
                    {"name": "Andrea Kimi Antonelli", "wins": 1}
                ],
                "top_constructors": [
                    {"name": "Mercedes", "wins": 6},
                    {"name": "Red Bull", "wins": 4},
                    {"name": "Ferrari", "wins": 2}
                ],
                "recent_winners": [
                    {"season": 2026, "race_name": f"{circuit_id.title()} GP", "winner": "Andrea Kimi Antonelli", "constructor": "Mercedes", "grid": 1, "status": "Finished"},
                    {"season": 2025, "race_name": f"{circuit_id.title()} GP", "winner": "Max Verstappen", "constructor": "Red Bull", "grid": 1, "status": "Finished"},
                    {"season": 2024, "race_name": f"{circuit_id.title()} GP", "winner": "Charles Leclerc", "constructor": "Ferrari", "grid": 4, "status": "Finished"},
                    {"season": 2023, "race_name": f"{circuit_id.title()} GP", "winner": "Max Verstappen", "constructor": "Red Bull", "grid": 1, "status": "Finished"}
                ],
                "insight": f"Historical data for {circuit_id.title()} based on benchmark race records."
            }
            return {
                "data": demo_history,
                "last_updated": demo_fallback.DEMO_TIMESTAMP,
                "is_demo": True,
                "upstream_available": False
            }

        race_table = raw["MRData"].get("RaceTable", {})
        races_raw = race_table.get("Races", [])
        total_count = int(raw["MRData"].get("total", len(races_raw)))

        if not races_raw:
            return {
                "data": {
                    "circuit_id": circuit_id,
                    "circuit_name": circuit_id.replace("_", " ").title(),
                    "total_races": 0,
                    "top_drivers": [],
                    "top_constructors": [],
                    "recent_winners": [],
                    "pole_win_pct": 0.0,
                    "pole_wins": 0,
                    "insight": f"No historical Formula 1 championship races recorded for circuit '{circuit_id}'."
                },
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "is_demo": False,
                "upstream_available": True
            }

        from collections import Counter
        circuit_name = races_raw[0].get("Circuit", {}).get("circuitName", circuit_id.title())
        driver_counter = Counter()
        constructor_counter = Counter()
        pole_wins = 0
        winners_list = []

        for r in races_raw:
            season_yr = int(r.get("season", 0))
            r_name = r.get("raceName", "Grand Prix")
            results = r.get("Results", [])
            if not results:
                continue
            w = results[0]
            d = w.get("Driver", {})
            c = w.get("Constructor", {})
            d_name = f"{d.get('givenName', '')} {d.get('familyName', '')}".strip()
            c_name = c.get("name", "Unknown")
            grid = int(w.get("grid", 0)) if str(w.get("grid", "")).isdigit() else 0

            driver_counter[d_name] += 1
            constructor_counter[c_name] += 1
            if grid == 1:
                pole_wins += 1

            winners_list.append({
                "season": season_yr,
                "race_name": r_name.replace("Grand Prix", "GP").strip(),
                "winner": d_name,
                "driver_id": d.get("driverId", ""),
                "constructor": c_name,
                "grid": grid,
                "laps": int(w.get("laps", 0)) if str(w.get("laps", "")).isdigit() else 0,
                "time": w.get("Time", {}).get("time") or w.get("status", "Finished"),
                "won_from_pole": grid == 1
            })

        # Sort reverse chronological for recent winners
        winners_list.sort(key=lambda x: x["season"], reverse=True)
        top_drivers = [{"name": name, "wins": count} for name, count in driver_counter.most_common(6)]
        top_constructors = [{"name": name, "wins": count} for name, count in constructor_counter.most_common(6)]

        pole_pct = round((pole_wins / len(winners_list)) * 100, 1) if winners_list else 0.0
        most_driver = top_drivers[0] if top_drivers else {"name": "N/A", "wins": 0}
        most_team = top_constructors[0] if top_constructors else {"name": "N/A", "wins": 0}
        latest = winners_list[0] if winners_list else None

        insight_text = (
            f"{circuit_name} has hosted {len(winners_list)} championship races. "
            f"The most successful driver is {most_driver['name']} with {most_driver['wins']} victories. "
            f"The top constructor is {most_team['name']} with {most_team['wins']} wins. "
            f"{pole_pct}% of races ({pole_wins} of {len(winners_list)}) were won from pole position (Grid 1)."
        )
        if latest:
            insight_text += f" Most recent winner: {latest['winner']} ({latest['constructor']}, {latest['season']})."

        history_payload = {
            "circuit_id": circuit_id,
            "circuit_name": circuit_name,
            "total_races": len(winners_list),
            "first_year": winners_list[-1]["season"] if winners_list else None,
            "last_year": winners_list[0]["season"] if winners_list else None,
            "pole_win_pct": pole_pct,
            "pole_wins": pole_wins,
            "top_drivers": top_drivers,
            "top_constructors": top_constructors,
            "recent_winners": winners_list[:15],
            "insight": insight_text
        }

        updated_at = cache.set(cache_key, history_payload, ttl_seconds=settings.cache_historical_ttl_seconds)
        return {"data": history_payload, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

    async def get_drivers(self, season: str = "current") -> dict[str, Any]:
        """Fetch driver list with career metadata."""
        cache_key = f"drivers_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False, "upstream_available": True}

        raw = await self._fetch_from_api(f"{season}/drivers.json?limit=100")
        if not raw or "MRData" not in raw:
            drivers = []
            for d in demo_fallback.DEMO_DRIVER_STANDINGS:
                drivers.append({
                    "driver_id": d["driver_id"],
                    "permanent_number": d["driver_number"],
                    "code": d["driver_code"],
                    "name": d["driver_name"],
                    "nationality": d["nationality"],
                    "constructor_name": d["constructor_name"],
                    "constructor_id": d["constructor_id"],
                    "points": d["points"],
                    "wins": d["wins"],
                    "position": d["position"]
                })
            return {"data": drivers, "last_updated": demo_fallback.DEMO_TIMESTAMP, "is_demo": True, "upstream_available": False}

        raw_drivers = raw["MRData"].get("DriverTable", {}).get("Drivers", [])
        standings_res = await self.get_driver_standings(season)
        standings_map = {item["driver_id"]: item for item in standings_res["data"]}

        raw_drivers_map = {d.get("driverId", ""): d for d in raw_drivers if d.get("driverId")}

        parsed = []
        # If official standings exist for this season, prioritize verified championship competitors
        if standings_map:
            for did, standing in standings_map.items():
                d_meta = raw_drivers_map.get(did, {})
                perm_num = d_meta.get("permanentNumber") or standing.get("driver_number") or None
                parsed.append({
                    "driver_id": did,
                    "permanent_number": perm_num,
                    "code": d_meta.get("code") or standing.get("driver_code") or None,
                    "name": standing.get("driver_name") or f"{d_meta.get('givenName', '')} {d_meta.get('familyName', '')}".strip(),
                    "nationality": standing.get("nationality") or d_meta.get("nationality", ""),
                    "date_of_birth": d_meta.get("dateOfBirth"),
                    "url": d_meta.get("url"),
                    "constructor_name": standing.get("constructor_name", "Independent"),
                    "constructor_id": standing.get("constructor_id", "unknown"),
                    "points": float(standing.get("points", 0.0)),
                    "wins": int(standing.get("wins", 0)),
                    "position": standing.get("position")
                })
        else:
            # Fallback when standings are not yet populated: only include valid drivers without fabricating position 99
            for d in raw_drivers:
                did = d.get("driverId", "")
                perm_num = d.get("permanentNumber") or None
                parsed.append({
                    "driver_id": did,
                    "permanent_number": perm_num,
                    "code": d.get("code") or None,
                    "name": f"{d.get('givenName', '')} {d.get('familyName', '')}".strip(),
                    "nationality": d.get("nationality", ""),
                    "date_of_birth": d.get("dateOfBirth"),
                    "url": d.get("url"),
                    "constructor_name": "Active Grid",
                    "constructor_id": "unknown",
                    "points": 0.0,
                    "wins": 0,
                    "position": None
                })

        parsed.sort(key=lambda x: (x["position"] is None, x["position"] or 0))
        updated_at = cache.set(cache_key, parsed, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": parsed, "last_updated": updated_at, "is_demo": False, "upstream_available": True}

f1_service = F1Service()
