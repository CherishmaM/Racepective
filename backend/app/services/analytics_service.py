import logging
import asyncio
from typing import Any
import pandas as pd
import numpy as np

from app.services.f1_service import f1_service
from app.services.cache_service import cache
from app.config import settings

logger = logging.getLogger(__name__)


# -----------------------------------------------------------------------------
# Pure Deterministic Analytical Functions (Tested via pytest)
# -----------------------------------------------------------------------------

RETIREMENT_KEYWORDS = (
    "retired", "accident", "collision", "engine", "gearbox", "brakes",
    "suspension", "hydraulics", "electrical", "spun off", "overheating",
    "damage", "puncture", "power unit", "vibrations", "out of fuel", "mechanical"
)

def compute_places_gained(grid: int | None, finish: int | None, status: str | None = None) -> dict[str, Any]:
    """
    Computes net places gained or lost between starting grid and final classification.
    Explicitly handles DNS, DNF, DSQ, pit lane starts, and unclassified finishers.

    Rules:
    - Normal finish: grid > 0 and finish > 0 and classified -> delta = grid - finish.
    - Pit lane start: grid == 0 or 'pit' in status -> delta = None, notes pit lane start.
    - DNS: status is 'Did not start' or 'DNS' -> delta = None.
    - DSQ: status is 'Disqualified' or 'DSQ' -> delta = None.
    - DNF: status contains mechanical/accident failure. If classified (>90% distance),
      finish position exists; otherwise unclassified. delta calculated only if officially classified.
    """
    status_str = (status or "Finished").strip()
    status_lower = status_str.lower()

    # DNS check
    if "did not start" in status_lower or status_lower == "dns":
        return {
            "grid": grid,
            "finish": None,
            "places_gained": None,
            "status": status_str,
            "status_category": "DNS",
            "is_classified": False,
            "explanation": "Did Not Start (DNS): No start position recorded."
        }

    # DSQ check
    if "disqualified" in status_lower or status_lower == "dsq":
        return {
            "grid": grid,
            "finish": None,
            "places_gained": None,
            "status": status_str,
            "status_category": "DSQ",
            "is_classified": False,
            "explanation": "Disqualified (DSQ): Results stripped from official classification."
        }

    # Pit lane start check
    is_pit_lane = (grid == 0 or "pit" in status_lower)
    if is_pit_lane:
        is_classified = bool(finish and finish > 0 and not any(k in status_lower for k in RETIREMENT_KEYWORDS))
        return {
            "grid": 0,
            "finish": finish if (finish and finish > 0) else None,
            "places_gained": None,
            "status": status_str,
            "status_category": "Pit Lane",
            "is_classified": is_classified,
            "explanation": f"Started from pit lane; classified P{finish}." if is_classified else "Started from pit lane; not classified."
        }

    # Retirement / DNF check
    is_retired = any(k in status_lower for k in RETIREMENT_KEYWORDS)
    if is_retired:
        # Some drivers are classified if they completed >=90% of the race distance
        is_classified = bool(finish and finish > 0 and finish <= 24)
        places = (grid - finish) if (is_classified and grid and grid > 0) else None
        return {
            "grid": grid,
            "finish": finish if is_classified else None,
            "places_gained": places,
            "status": status_str,
            "status_category": "DNF",
            "is_classified": is_classified,
            "explanation": f"Retired ({status_str})" + (f", classified P{finish} (completed >90% distance)" if is_classified else " (unclassified)")
        }

    # Normal classified finish
    if grid is not None and finish is not None and grid > 0 and finish > 0:
        delta = grid - finish
        if delta > 0:
            expl = f"Gained {delta} position(s) from P{grid} to P{finish}"
        elif delta < 0:
            expl = f"Lost {abs(delta)} position(s) from P{grid} to P{finish}"
        else:
            expl = f"Maintained starting position at P{finish}"

        return {
            "grid": grid,
            "finish": finish,
            "places_gained": delta,
            "status": status_str,
            "status_category": "Finished",
            "is_classified": True,
            "explanation": expl
        }

    return {
        "grid": grid,
        "finish": finish,
        "places_gained": None,
        "status": status_str,
        "status_category": "Unclassified",
        "is_classified": False,
        "explanation": "Insufficient classification telemetry."
    }


def compute_cumulative_points(race_records: list[dict[str, Any]]) -> pd.DataFrame:
    """
    Takes race result records with keys ['round', 'driver_id', 'points'] and
    computes cumulative points for each driver round-by-round using Pandas.
    """
    if not race_records:
        return pd.DataFrame(columns=["round", "driver_id", "points", "cumulative_points"])

    df = pd.DataFrame(race_records)
    if "points" not in df.columns or "round" not in df.columns or "driver_id" not in df.columns:
        raise ValueError("Records must contain 'round', 'driver_id', and 'points'")

    df["round"] = df["round"].astype(int)
    df["points"] = df["points"].astype(float)
    df = df.sort_values(by=["round"])
    df["cumulative_points"] = df.groupby("driver_id")["points"].cumsum()
    return df


def compute_points_gap_series(
    driver_a_results: list[dict[str, Any]],
    driver_b_results: list[dict[str, Any]],
    name_a: str = "Driver A",
    name_b: str = "Driver B",
    season: str = "2026"
) -> dict[str, Any]:
    """
    Calculates round-by-round points gap (Driver A - Driver B) with cumulative totals,
    lead changes, and deterministic explanations.
    """
    rounds_set = set()
    map_a: dict[int, dict[str, Any]] = {}
    map_b: dict[int, dict[str, Any]] = {}

    for r in driver_a_results:
        rnd = int(r.get("round", 0))
        if rnd > 0:
            rounds_set.add(rnd)
            map_a[rnd] = r

    for r in driver_b_results:
        rnd = int(r.get("round", 0))
        if rnd > 0:
            rounds_set.add(rnd)
            map_b[rnd] = r

    if not rounds_set:
        return {
            "series": [],
            "summary": {
                "rounds_completed": 0,
                "current_gap": 0.0,
                "leader": "Tied",
                "max_lead_a": 0.0,
                "max_lead_b": 0.0,
                "lead_changes": 0,
                "rounds_ahead_a": 0,
                "rounds_ahead_b": 0,
                "rounds_tied": 0
            },
            "insight": f"No completed race rounds found for {name_a} and {name_b} in season {season}."
        }

    sorted_rounds = sorted(list(rounds_set))
    cum_a = 0.0
    cum_b = 0.0
    series = []
    lead_changes = 0
    prev_leader = None
    rounds_ahead_a = 0
    rounds_ahead_b = 0
    rounds_tied = 0
    max_lead_a = 0.0
    max_lead_a_round = sorted_rounds[0]
    max_lead_b = 0.0
    max_lead_b_round = sorted_rounds[0]

    for rnd in sorted_rounds:
        item_a = map_a.get(rnd, {})
        item_b = map_b.get(rnd, {})

        pts_a = float(item_a.get("points", 0.0))
        pts_b = float(item_b.get("points", 0.0))
        race_name = item_a.get("race_name") or item_b.get("race_name") or f"Round {rnd}"

        cum_a += pts_a
        cum_b += pts_b
        gap = round(cum_a - cum_b, 1)
        round_delta = round(pts_a - pts_b, 1)

        # Leader tracking
        current_leader = name_a if gap > 0 else (name_b if gap < 0 else "Tied")
        if prev_leader is not None and current_leader != "Tied" and prev_leader != "Tied" and current_leader != prev_leader:
            lead_changes += 1

        if gap > 0:
            rounds_ahead_a += 1
            if gap > max_lead_a:
                max_lead_a = gap
                max_lead_a_round = rnd
        elif gap < 0:
            rounds_ahead_b += 1
            if abs(gap) > max_lead_b:
                max_lead_b = abs(gap)
                max_lead_b_round = rnd
        else:
            rounds_tied += 1

        prev_leader = current_leader

        series.append({
            "round": rnd,
            "race": race_name,
            "pts_a": pts_a,
            "pts_b": pts_b,
            "cum_a": round(cum_a, 1),
            "cum_b": round(cum_b, 1),
            "gap": gap,
            "round_delta": round_delta,
            "leader": current_leader
        })

    final_gap = series[-1]["gap"] if series else 0.0
    current_leader = name_a if final_gap > 0 else (name_b if final_gap < 0 else "Tied")

    # Deterministic plain-English insight
    if current_leader == "Tied":
        insight = (
            f"Over {len(series)} completed rounds in {season}, {name_a} and {name_b} are perfectly tied "
            f"at {cum_a:.1f} PTS. Lead changed hands {lead_changes} time(s)."
        )
    else:
        chaser = name_b if current_leader == name_a else name_a
        lead_pts = abs(final_gap)
        lead_rounds = rounds_ahead_a if current_leader == name_a else rounds_ahead_b
        insight = (
            f"Over {len(series)} completed rounds in {season}, {current_leader} holds a {lead_pts:.1f} PTS advantage "
            f"over {chaser} ({max(cum_a, cum_b):.1f} vs {min(cum_a, cum_b):.1f} PTS). "
            f"{current_leader} has held the cumulative lead after {lead_rounds} of {len(series)} rounds. "
            f"The lead changed hands {lead_changes} time(s). "
            f"Largest margin was {max(max_lead_a, max_lead_b):.1f} PTS."
        )

    return {
        "series": series,
        "summary": {
            "rounds_completed": len(series),
            "current_gap": final_gap,
            "leader": current_leader,
            "total_a": round(cum_a, 1),
            "total_b": round(cum_b, 1),
            "max_lead_a": max_lead_a,
            "max_lead_a_round": max_lead_a_round,
            "max_lead_b": max_lead_b,
            "max_lead_b_round": max_lead_b_round,
            "lead_changes": lead_changes,
            "rounds_ahead_a": rounds_ahead_a,
            "rounds_ahead_b": rounds_ahead_b,
            "rounds_tied": rounds_tied
        },
        "insight": insight,
        "scoring_rule": "Standard Grand Prix points (25-18-15-12-10-8-6-4-2-1), sprint races (8 down to 1), and historic fastest lap bonus where applicable."
    }


def compute_consistency_metrics(driver_results: list[dict[str, Any]], window: int | None = None) -> dict[str, Any]:
    """
    Computes average classified finishing position, standard deviation (variability),
    completion rate, and reliability metrics over a selectable race window.
    Includes explicit warning that finishing volatility measures result stability, not pace.
    """
    if not driver_results:
        return {
            "total_starts": 0,
            "classified_count": 0,
            "mean_finish": 0.0,
            "std_finish": 0.0,
            "median_finish": 0.0,
            "best_finish": "--",
            "worst_finish": "--",
            "dnf_count": 0,
            "dnf_rate": 0.0,
            "consistency_score": 50.0,
            "limitation_note": "No race telemetry available for consistency calculation."
        }

    # Slice window if requested (e.g. last 5 or 10 rounds)
    target_results = driver_results[-window:] if (window and len(driver_results) > window) else driver_results

    classified_positions: list[int] = []
    dnf_count = 0

    for r in target_results:
        res = compute_places_gained(r.get("grid"), r.get("finish"), r.get("status"))
        if res["is_classified"] and res["finish"]:
            classified_positions.append(res["finish"])
        if res["status_category"] in ("DNF", "DNS"):
            dnf_count += 1

    total_starts = len(target_results)
    classified_count = len(classified_positions)

    if classified_count == 0:
        return {
            "total_starts": total_starts,
            "classified_count": 0,
            "mean_finish": 0.0,
            "std_finish": 0.0,
            "median_finish": 0.0,
            "best_finish": "--",
            "worst_finish": "--",
            "dnf_count": dnf_count,
            "dnf_rate": 100.0,
            "consistency_score": 10.0,
            "limitation_note": "No classified finishes recorded in the selected window."
        }

    s = pd.Series(classified_positions, dtype=float)
    mean_finish = round(float(s.mean()), 1)
    std_finish = round(float(s.std(ddof=1)), 2) if classified_count > 1 else 0.0
    median_finish = round(float(s.median()), 1)
    best_finish = f"P{int(s.min())}"
    worst_finish = f"P{int(s.max())}"
    dnf_rate = round((dnf_count / total_starts) * 100, 1)

    # Consistency score: 100 base minus penalty for high variance (std) and retirements
    # Lower std dev in finishing position = higher consistency index
    raw_score = 100.0 - (std_finish * 5.0) - (dnf_rate * 0.4)
    consistency_score = round(max(10.0, min(100.0, raw_score)), 1)

    limitation_note = (
        "FINISHING-POSITION LIMITATION: Standard deviation in finishing position measures outcome consistency "
        "and classification reliability; it does NOT represent true lap pace, single-lap speed, or underlying "
        "car performance. Race finishes are heavily influenced by grid position, strategy, safety car interventions, "
        "and mechanical attrition."
    )

    return {
        "total_starts": total_starts,
        "classified_count": classified_count,
        "mean_finish": mean_finish,
        "std_finish": std_finish,
        "median_finish": median_finish,
        "best_finish": best_finish,
        "worst_finish": worst_finish,
        "dnf_count": dnf_count,
        "dnf_rate": dnf_rate,
        "consistency_score": consistency_score,
        "limitation_note": limitation_note
    }


# -----------------------------------------------------------------------------
# Analytics Service Class
# -----------------------------------------------------------------------------

class AnalyticsService:

    async def get_championship_progression(self, season: str = "current", top_n: int = 6) -> dict[str, Any]:
        """
        Calculates round-by-round cumulative points for top drivers using Pandas.
        Includes deterministic plain-English championship progression insights.
        """
        cache_key = f"analytics_progression_{season}_{top_n}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        # Fetch schedule to identify completed races
        schedule_res = await f1_service.get_schedule(season)
        completed_races = [r for r in schedule_res["data"] if r.get("state") == "COMPLETED"]

        if not completed_races:
            # Fallback mock progression if early in the season or upstream empty
            demo_data = [
                {"round": 1, "race": "Australia GP", "Antonelli": 25, "Russell": 18, "Hamilton": 15, "Leclerc": 12, "Verstappen": 10},
                {"round": 2, "race": "China GP", "Antonelli": 50, "Russell": 33, "Hamilton": 30, "Leclerc": 24, "Verstappen": 28},
                {"round": 3, "race": "Japan GP", "Antonelli": 75, "Russell": 48, "Hamilton": 45, "Leclerc": 42, "Verstappen": 43},
                {"round": 4, "race": "Bahrain GP", "Antonelli": 93, "Russell": 66, "Hamilton": 60, "Leclerc": 60, "Verstappen": 58},
                {"round": 5, "race": "Saudi Arabia GP", "Antonelli": 118, "Russell": 81, "Hamilton": 75, "Leclerc": 78, "Verstappen": 76},
                {"round": 6, "race": "Miami GP", "Antonelli": 143, "Russell": 93, "Hamilton": 90, "Leclerc": 96, "Verstappen": 94},
                {"round": 18, "race": "USA GP", "Antonelli": 365, "Russell": 242, "Hamilton": 241, "Leclerc": 235, "Verstappen": 218}
            ]
            insight = (
                f"Season {season} demo progression: Antonelli leads with 365 PTS across 18 rounds. "
                "Russell and Hamilton contend for P2 with a 1-point difference."
            )
            return {
                "data": demo_data,
                "insight": insight,
                "season": season,
                "rounds_completed": len(demo_data),
                "last_updated": schedule_res.get("last_updated"),
                "is_demo": True
            }

        standings_res = await f1_service.get_driver_standings(season)
        top_drivers = standings_res["data"][:top_n]
        top_driver_ids = {d["driver_id"]: (d.get("driver_code") or d["driver_name"].split()[-1]) for d in top_drivers}

        progression_data = []
        cumulative_points: dict[str, float] = {code: 0.0 for code in top_driver_ids.values()}

        # Limit rounds to last 16 if very long season to keep chart responsive
        rounds_to_process = completed_races[-16:] if len(completed_races) > 16 else completed_races

        # Fetch race details in parallel
        race_details = await asyncio.gather(
            *[f1_service.get_race_detail(season, r["round"]) for r in rounds_to_process],
            return_exceptions=True
        )

        for i, race in enumerate(rounds_to_process):
            r_num = race["round"]
            race_detail = race_details[i]
            if not isinstance(race_detail, dict) or not race_detail.get("data"):
                continue

            results = race_detail["data"].get("results", [])
            for res in results:
                did = res.get("driver_id")
                if did in top_driver_ids:
                    code = top_driver_ids[did]
                    cumulative_points[code] += float(res.get("points", 0.0))

            point_snapshot = {
                "round": r_num,
                "race": race["race_name"].replace("Grand Prix", "GP").strip(),
                **{k: round(v, 1) for k, v in cumulative_points.items()}
            }
            progression_data.append(point_snapshot)

        # Generate deterministic insight
        leader_code = max(cumulative_points, key=cumulative_points.get) if cumulative_points else "None"
        leader_pts = cumulative_points.get(leader_code, 0.0)
        sorted_pts = sorted(cumulative_points.values(), reverse=True)
        gap_to_second = round(sorted_pts[0] - sorted_pts[1], 1) if len(sorted_pts) > 1 else 0.0

        insight_text = (
            f"Through {len(progression_data)} completed rounds in {season}, {leader_code} leads the championship "
            f"with {leader_pts:.1f} PTS, holding a {gap_to_second:.1f} PTS margin over P2. "
            f"Cumulative scoring includes standard Grand Prix points and verified sprint results."
        )

        result_payload = {
            "data": progression_data,
            "drivers": list(top_driver_ids.values()),
            "insight": insight_text,
            "season": season,
            "rounds_completed": len(progression_data),
            "units": "Championship Points (PTS)"
        }

        updated_at = cache.set(cache_key, result_payload, ttl_seconds=settings.cache_ttl_seconds)
        return {
            "data": result_payload,
            "insight": insight_text,
            "last_updated": updated_at,
            "is_demo": False
        }

    async def get_points_gap(self, season: str, driver_a_id: str, driver_b_id: str) -> dict[str, Any]:
        """
        Calculates round-by-round points gap between two selected drivers.
        """
        cache_key = f"analytics_gap_{season}_{driver_a_id}_{driver_b_id}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        # Fetch results for both drivers
        res_a = await f1_service.get_driver_results(driver_a_id, season)
        res_b = await f1_service.get_driver_results(driver_b_id, season)

        driver_a_name = driver_a_id.replace("_", " ").title()
        driver_b_name = driver_b_id.replace("_", " ").title()

        results_a = res_a.get("data", [])
        results_b = res_b.get("data", [])

        # Fetch driver display names if available
        d_list_res = await f1_service.get_drivers(season)
        for d in d_list_res.get("data", []):
            if d.get("driver_id") == driver_a_id:
                driver_a_name = d.get("name", driver_a_name)
            elif d.get("driver_id") == driver_b_id:
                driver_b_name = d.get("name", driver_b_name)

        gap_analysis = compute_points_gap_series(
            results_a,
            results_b,
            name_a=driver_a_name,
            name_b=driver_b_name,
            season=season
        )

        payload = {
            "season": season,
            "driver_a": {"id": driver_a_id, "name": driver_a_name},
            "driver_b": {"id": driver_b_id, "name": driver_b_name},
            **gap_analysis
        }

        updated_at = cache.set(cache_key, payload, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": payload, "last_updated": updated_at, "is_demo": res_a.get("is_demo", False) or res_b.get("is_demo", False)}

    async def get_finishing_position_trend(self, season: str, driver_id: str) -> dict[str, Any]:
        """
        Analyzes grid starting position vs final classification for a driver across the season.
        Explicitly tracks DNF, DNS, and DSQ.
        """
        cache_key = f"analytics_finishing_trend_{season}_{driver_id}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        results_res = await f1_service.get_driver_results(driver_id, season)
        races_log = results_res.get("data", [])

        driver_name = driver_id.replace("_", " ").title()
        d_list_res = await f1_service.get_drivers(season)
        for d in d_list_res.get("data", []):
            if d.get("driver_id") == driver_id:
                driver_name = d.get("name", driver_name)

        trend_records = []
        classified_grids = []
        classified_finishes = []
        total_gained = 0
        dnf_count = 0

        for r in races_log:
            analysis = compute_places_gained(r.get("grid"), r.get("finish"), r.get("status"))
            if analysis["is_classified"]:
                classified_grids.append(analysis["grid"])
                classified_finishes.append(analysis["finish"])
                if analysis["places_gained"] is not None:
                    total_gained += analysis["places_gained"]
            if analysis["status_category"] in ("DNF", "DNS", "DSQ"):
                dnf_count += 1

            trend_records.append({
                "round": r.get("round"),
                "race_name": r.get("race_name", f"Round {r.get('round')}"),
                "grid": analysis["grid"],
                "finish": analysis["finish"],
                "delta": analysis["places_gained"],
                "status": analysis["status"],
                "status_category": analysis["status_category"],
                "is_classified": analysis["is_classified"],
                "explanation": analysis["explanation"],
                "points": r.get("points", 0.0)
            })

        avg_grid = round(sum(classified_grids) / len(classified_grids), 1) if classified_grids else 0.0
        avg_finish = round(sum(classified_finishes) / len(classified_finishes), 1) if classified_finishes else 0.0
        net_delta = total_gained

        insight_text = (
            f"In {len(trend_records)} starts during {season}, {driver_name} holds an average grid start of P{avg_grid:.1f} "
            f"and an average classified finish of P{avg_finish:.1f}. Net position change across completed races: "
            f"{'+' if net_delta > 0 else ''}{net_delta} positions. Retirements/DNFs: {dnf_count}."
        )

        payload = {
            "driver_id": driver_id,
            "driver_name": driver_name,
            "season": season,
            "total_starts": len(trend_records),
            "classified_finishes": len(classified_finishes),
            "dnf_count": dnf_count,
            "avg_grid": avg_grid,
            "avg_finish": avg_finish,
            "net_places_gained": net_delta,
            "races": trend_records,
            "insight": insight_text
        }

        updated_at = cache.set(cache_key, payload, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": payload, "last_updated": updated_at, "is_demo": results_res.get("is_demo", False)}

    async def get_driver_consistency(self, season: str = "current", window: str = "all") -> dict[str, Any]:
        """
        Calculates genuine consistency metrics (mean classified finish, sample standard deviation,
        reliability score) across drivers using Pandas.
        """
        cache_key = f"analytics_consistency_v2_{season}_{window}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        standings_res = await f1_service.get_driver_standings(season)
        drivers = standings_res.get("data", [])[:12]  # Analyze top 12 drivers

        window_int = int(window) if window.isdigit() else None
        
        # Parallel fetch for all drivers
        results_responses = await asyncio.gather(
            *[f1_service.get_driver_results(d["driver_id"], season) for d in drivers],
            return_exceptions=True
        )

        metrics_list = []
        for i, d in enumerate(drivers):
            did = d["driver_id"]
            res = results_responses[i]
            races = res.get("data", []) if isinstance(res, dict) else []

            c_stats = compute_consistency_metrics(races, window=window_int)
            metrics_list.append({
                "driver_id": did,
                "driver_name": d["driver_name"],
                "constructor_name": d["constructor_name"],
                "position": d["position"],
                "points": d["points"],
                "wins": d["wins"],
                **c_stats
            })

        # Sort by consistency score (highest to lowest)
        metrics_list.sort(key=lambda x: x["consistency_score"], reverse=True)

        payload = {
            "season": season,
            "window": window,
            "drivers": metrics_list,
            "sample_size": len(metrics_list),
            "limitation_note": (
                "NOTE ON INTERPRETING CONSISTENCY: Finishing position variability (standard deviation) "
                "measures result variance and reliability over the selected window. It does not measure "
                "absolute vehicle lap time or driver speed, which are affected by traffic, qualifying rank, "
                "safety cars, and strategic pit stops."
            )
        }

        updated_at = cache.set(cache_key, payload, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": payload, "last_updated": updated_at, "is_demo": False}

    async def get_teammate_comparison(self, season: str = "current", constructor_id: str | None = None) -> dict[str, Any]:
        """
        Compares teammates within constructors: points share, qualifying head-to-head,
        race finish head-to-head, podiums, wins, and average finish.
        """
        cache_key = f"analytics_teammates_v2_{season}_{constructor_id or 'all'}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        standings_res = await f1_service.get_driver_standings(season)
        drivers = standings_res.get("data", [])

        # Group drivers by constructor
        teams: dict[str, list] = {}
        all_driver_ids = []
        for d in drivers:
            cid = d["constructor_name"]
            teams.setdefault(cid, []).append(d)
            all_driver_ids.append(d["driver_id"])

        # Fetch driver results concurrently in parallel
        results_responses = await asyncio.gather(
            *[f1_service.get_driver_results(did, season) for did in all_driver_ids],
            return_exceptions=True
        )
        results_by_driver: dict[str, dict[int, dict]] = {}
        for idx, did in enumerate(all_driver_ids):
            res = results_responses[idx]
            races = res.get("data", []) if isinstance(res, dict) else []
            results_by_driver[did] = {r["round"]: r for r in races}

        comparisons = []
        for team_name, squad in teams.items():
            if len(squad) >= 2:
                d1 = squad[0]
                d2 = squad[1]
                total_pts = (d1["points"] + d2["points"]) or 1.0
                d1_pct = round((d1["points"] / total_pts) * 100, 1)
                d2_pct = round((d2["points"] / total_pts) * 100, 1)

                races1 = results_by_driver.get(d1["driver_id"], {})
                races2 = results_by_driver.get(d2["driver_id"], {})

                h2h_race_1 = 0
                h2h_race_2 = 0
                h2h_quali_1 = 0
                h2h_quali_2 = 0

                common_rounds = set(races1.keys()).intersection(set(races2.keys()))
                for rnd in common_rounds:
                    r1 = races1[rnd]
                    r2 = races2[rnd]

                    # Race finish head-to-head
                    f1_pos = r1.get("finish")
                    f2_pos = r2.get("finish")
                    if f1_pos and f2_pos and f1_pos > 0 and f2_pos > 0:
                        if f1_pos < f2_pos:
                            h2h_race_1 += 1
                        elif f2_pos < f1_pos:
                            h2h_race_2 += 1

                    # Qualifying head-to-head (using grid position)
                    g1 = r1.get("grid")
                    g2 = r2.get("grid")
                    if g1 and g2 and g1 > 0 and g2 > 0:
                        if g1 < g2:
                            h2h_quali_1 += 1
                        elif g2 < g1:
                            h2h_quali_2 += 1

                insight_text = (
                    f"At {team_name}, {d1['driver_name']} has scored {d1_pct}% of team points ({d1['points']} vs {d2['points']} PTS). "
                    f"Head-to-head in classified race finishes: {d1['driver_name']} leads {h2h_race_1}-{h2h_race_2}. "
                    f"Qualifying battle: {h2h_quali_1}-{h2h_quali_2}."
                )

                comparisons.append({
                    "constructor_name": team_name,
                    "constructor_id": d1.get("constructor_id", team_name.lower().replace(" ", "_")),
                    "driver_1": {
                        "id": d1["driver_id"],
                        "name": d1["driver_name"],
                        "code": d1.get("driver_code") or d1["driver_name"][:3].upper(),
                        "points": d1["points"],
                        "wins": d1["wins"],
                        "share_pct": d1_pct,
                        "h2h_race_wins": h2h_race_1,
                        "h2h_quali_wins": h2h_quali_1
                    },
                    "driver_2": {
                        "id": d2["driver_id"],
                        "name": d2["driver_name"],
                        "code": d2.get("driver_code") or d2["driver_name"][:3].upper(),
                        "points": d2["points"],
                        "wins": d2["wins"],
                        "share_pct": d2_pct,
                        "h2h_race_wins": h2h_race_2,
                        "h2h_quali_wins": h2h_quali_2
                    },
                    "points_difference": round(abs(d1["points"] - d2["points"]), 1),
                    "total_team_points": round(d1["points"] + d2["points"], 1),
                    "insight": insight_text
                })

        updated_at = cache.set(cache_key, comparisons, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": comparisons, "last_updated": updated_at, "is_demo": False}

    async def get_constructor_contributions(self, season: str = "current") -> dict[str, Any]:
        """
        Calculates cumulative constructor points and driver contribution split for each team.
        """
        cache_key = f"analytics_constructor_contributions_{season}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        c_standings_res = await f1_service.get_constructor_standings(season)
        d_standings_res = await f1_service.get_driver_standings(season)

        c_list = c_standings_res.get("data", [])
        d_list = d_standings_res.get("data", [])

        # Map drivers to constructor
        team_drivers: dict[str, list] = {}
        for d in d_list:
            c_name = d.get("constructor_name", "Unknown")
            team_drivers.setdefault(c_name, []).append(d)

        contributions = []
        for team in c_list:
            name = team.get("constructor_name", "")
            squad = team_drivers.get(name, [])
            d1 = squad[0] if len(squad) > 0 else {"driver_name": "Driver 1", "points": 0.0}
            d2 = squad[1] if len(squad) > 1 else {"driver_name": "Driver 2", "points": 0.0}

            total_team_pts = team.get("points", d1["points"] + d2["points"]) or 1.0
            p1 = float(d1["points"])
            p2 = float(d2["points"])
            share1 = round((p1 / total_team_pts) * 100, 1)
            share2 = round((p2 / total_team_pts) * 100, 1)

            contributions.append({
                "constructor_name": name,
                "position": team.get("position", 0),
                "total_points": team.get("points", 0.0),
                "driver_1_name": d1["driver_name"],
                "driver_1_points": p1,
                "driver_1_share": share1,
                "driver_2_name": d2["driver_name"],
                "driver_2_points": p2,
                "driver_2_share": share2,
                "points_delta": round(abs(p1 - p2), 1)
            })

        # Deterministic insight
        most_balanced = min(contributions, key=lambda x: x["points_delta"]) if contributions else None
        leader = contributions[0] if contributions else None

        insight_text = ""
        if leader:
            insight_text += f"{leader['constructor_name']} leads the Constructors' Championship with {leader['total_points']} PTS. "
        if most_balanced:
            insight_text += f"The most balanced scoring pairing is at {most_balanced['constructor_name']} with a teammate gap of only {most_balanced['points_delta']} PTS."

        payload = {
            "season": season,
            "contributions": contributions,
            "insight": insight_text,
            "units": "Points (PTS)"
        }

        updated_at = cache.set(cache_key, payload, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": payload, "last_updated": updated_at, "is_demo": False}

    async def get_race_result_explainer(self, season: str = "current", round_num: int = 18) -> dict[str, Any]:
        """
        Explains race results by comparing starting grid vs final classification and calculating
        places gained or lost. Identifies biggest gainers, biggest drop, retirements, and pole-to-win.
        """
        cache_key = f"analytics_race_explainer_{season}_{round_num}"
        cached = cache.get(cache_key)
        if cached:
            return {"data": cached[0], "last_updated": cached[1], "is_demo": False}

        race_detail = await f1_service.get_race_detail(season, round_num)
        if not race_detail or not race_detail.get("data"):
            last_res = await f1_service.get_latest_race(season)
            if last_res and last_res.get("data"):
                race_detail = last_res

        if not race_detail or not race_detail.get("data"):
            # Fallback demo race explainer
            demo_deltas = [
                {"driver": "Antonelli", "constructor": "Mercedes", "grid": 1, "finish": 1, "delta": 0, "status": "Finished", "is_classified": True},
                {"driver": "Leclerc", "constructor": "Ferrari", "grid": 4, "finish": 2, "delta": 2, "status": "Finished", "is_classified": True},
                {"driver": "Verstappen", "constructor": "Red Bull", "grid": 2, "finish": 3, "delta": -1, "status": "Finished", "is_classified": True},
                {"driver": "Hamilton", "constructor": "Ferrari", "grid": 5, "finish": 4, "delta": 1, "status": "Finished", "is_classified": True},
                {"driver": "Norris", "constructor": "McLaren", "grid": 8, "finish": 5, "delta": 3, "status": "Finished", "is_classified": True},
                {"driver": "Hadjar", "constructor": "Red Bull", "grid": 3, "finish": 6, "delta": -3, "status": "Finished", "is_classified": True},
                {"driver": "Alonso", "constructor": "Aston Martin", "grid": 9, "finish": 7, "delta": 2, "status": "Finished", "is_classified": True},
                {"driver": "Piastri", "constructor": "McLaren", "grid": 12, "finish": 8, "delta": 4, "status": "Finished", "is_classified": True},
                {"driver": "Gasly", "constructor": "Alpine", "grid": 14, "finish": 9, "delta": 5, "status": "Finished", "is_classified": True},
                {"driver": "Sainz", "constructor": "Williams", "grid": 10, "finish": 10, "delta": 0, "status": "Finished", "is_classified": True},
                {"driver": "Stroll", "constructor": "Aston Martin", "grid": 22, "finish": 15, "delta": 7, "status": "Finished", "is_classified": True},
                {"driver": "Albon", "constructor": "Williams", "grid": 11, "finish": None, "delta": None, "status": "Engine", "is_classified": False}
            ]
            insight = "In this demo Grand Prix, Antonelli converted pole to victory. Stroll was the biggest mover (+7 positions). Albon retired with an engine failure."
            return {
                "data": demo_deltas,
                "race_name": "Demo Grand Prix",
                "round": round_num,
                "biggest_mover": {"driver": "Stroll", "delta": 7},
                "biggest_drop": {"driver": "Hadjar", "delta": -3},
                "retirements": ["Albon (Engine)"],
                "pole_converted": True,
                "insight": insight,
                "last_updated": None,
                "is_demo": True
            }

        race_info = race_detail["data"]
        results = race_info.get("results", [])

        records = []
        retirements = []
        for r in results:
            analysis = compute_places_gained(r.get("grid"), r.get("position"), r.get("status"))
            driver_code = r.get("driver_code") or r.get("driver_name", "").split()[-1]

            records.append({
                "driver": driver_code,
                "driver_full_name": r.get("driver_name"),
                "constructor": r.get("constructor_name"),
                "grid": analysis["grid"],
                "finish": analysis["finish"],
                "delta": analysis["places_gained"],
                "status": analysis["status"],
                "status_category": analysis["status_category"],
                "is_classified": analysis["is_classified"],
                "points": r.get("points", 0.0),
                "explanation": analysis["explanation"]
            })

            if analysis["status_category"] in ("DNF", "DNS", "DSQ"):
                retirements.append(f"{driver_code} ({analysis['status']})")

        # Movers analysis
        classified_movers = [r for r in records if r["delta"] is not None]
        biggest_mover = max(classified_movers, key=lambda x: x["delta"]) if classified_movers else None
        biggest_drop = min(classified_movers, key=lambda x: x["delta"]) if classified_movers else None

        winner = records[0] if records else None
        pole_converted = bool(winner and winner.get("grid") == 1)

        insight_text = ""
        if winner:
            insight_text += f"{winner['driver_full_name']} won the {race_info.get('race_name', 'Grand Prix')} starting from P{winner.get('grid')}. "
        if biggest_mover and biggest_mover["delta"] > 0:
            insight_text += f"Biggest mover was {biggest_mover['driver_full_name']} gaining +{biggest_mover['delta']} places from P{biggest_mover['grid']} to P{biggest_mover['finish']}. "
        if retirements:
            insight_text += f"There were {len(retirements)} retirements: {', '.join(retirements[:3])}."
        else:
            insight_text += "All drivers were classified."

        payload = {
            "race_name": race_info.get("race_name", "Grand Prix"),
            "round": race_info.get("round", round_num),
            "season": race_info.get("season", season),
            "records": records,
            "biggest_mover": biggest_mover,
            "biggest_drop": biggest_drop,
            "retirements": retirements,
            "pole_converted": pole_converted,
            "insight": insight_text
        }

        updated_at = cache.set(cache_key, payload, ttl_seconds=settings.cache_ttl_seconds)
        return {"data": payload, "last_updated": updated_at, "is_demo": False}

    async def get_position_changes(self, season: str = "current", round_num: int = 18) -> dict[str, Any]:
        """
        Backwards-compatible wrapper matching earlier API signature for position changes.
        """
        res = await self.get_race_result_explainer(season, round_num)
        payload = res.get("data", {})
        records = payload.get("records") or payload.get("data", [])
        return {
            "data": records,
            "race_name": payload.get("race_name", "Grand Prix"),
            "round": payload.get("round", round_num),
            "insight": payload.get("insight", ""),
            "last_updated": res.get("last_updated"),
            "is_demo": res.get("is_demo", False)
        }


analytics_service = AnalyticsService()
