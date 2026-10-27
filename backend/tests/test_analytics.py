import pytest
import pandas as pd
import numpy as np

from app.services.analytics_service import (
    compute_places_gained,
    compute_cumulative_points,
    compute_points_gap_series,
    compute_consistency_metrics
)


# --- 1. Places Gained / Lost & Race Result Explainer Tests ---

def test_places_gained_normal_gain():
    """Driver starts P4 and finishes P2: gained 2 positions."""
    res = compute_places_gained(grid=4, finish=2, status="Finished")
    assert res["places_gained"] == 2
    assert res["status_category"] == "Finished"
    assert res["is_classified"] is True
    assert "Gained 2 position(s)" in res["explanation"]

def test_places_gained_normal_loss():
    """Driver starts P1 and finishes P3: lost 2 positions."""
    res = compute_places_gained(grid=1, finish=3, status="Finished")
    assert res["places_gained"] == -2
    assert res["status_category"] == "Finished"
    assert res["is_classified"] is True
    assert "Lost 2 position(s)" in res["explanation"]

def test_places_gained_maintained_position():
    """Driver starts P1 and wins: 0 net change."""
    res = compute_places_gained(grid=1, finish=1, status="Finished")
    assert res["places_gained"] == 0
    assert res["status_category"] == "Finished"
    assert res["is_classified"] is True
    assert "Maintained starting position" in res["explanation"]

def test_places_gained_dnf_unclassified():
    """Driver retires with engine failure and is not classified: places_gained must be None."""
    res = compute_places_gained(grid=3, finish=None, status="Engine")
    assert res["places_gained"] is None
    assert res["status_category"] == "DNF"
    assert res["is_classified"] is False
    assert "Retired" in res["explanation"]

def test_places_gained_dnf_classified_distance():
    """Driver retires late (>90% distance) and is classified P18: delta calculated with retirement note."""
    res = compute_places_gained(grid=2, finish=18, status="Accident")
    assert res["status_category"] == "DNF"
    assert res["is_classified"] is True
    assert res["finish"] == 18
    assert res["places_gained"] == (2 - 18)

def test_places_gained_dns():
    """Driver does not start: places_gained must be None and flagged DNS."""
    res = compute_places_gained(grid=8, finish=None, status="Did not start")
    assert res["places_gained"] is None
    assert res["status_category"] == "DNS"
    assert res["is_classified"] is False

def test_places_gained_dsq():
    """Driver is disqualified: places_gained must be None and flagged DSQ."""
    res = compute_places_gained(grid=2, finish=1, status="Disqualified")
    assert res["places_gained"] is None
    assert res["status_category"] == "DSQ"
    assert res["is_classified"] is False

def test_places_gained_pit_lane_start():
    """Driver starts from pit lane (grid=0): places_gained is None to avoid distorted delta."""
    res = compute_places_gained(grid=0, finish=11, status="Finished")
    assert res["places_gained"] is None
    assert res["status_category"] == "Pit Lane"
    assert res["is_classified"] is True
    assert "Started from pit lane" in res["explanation"]


# --- 2. Cumulative Points Tests ---

def test_compute_cumulative_points():
    """Verifies cumulative sum calculation across multiple rounds and drivers."""
    records = [
        {"round": 1, "driver_id": "antonelli", "points": 25.0},
        {"round": 1, "driver_id": "verstappen", "points": 18.0},
        {"round": 2, "driver_id": "antonelli", "points": 18.0},
        {"round": 2, "driver_id": "verstappen", "points": 25.0},
        {"round": 3, "driver_id": "antonelli", "points": 15.0},
        {"round": 3, "driver_id": "verstappen", "points": 0.0},
    ]

    df = compute_cumulative_points(records)
    assert len(df) == 6
    assert "cumulative_points" in df.columns

    # Check cumulative totals for Antonelli
    ant_df = df[df["driver_id"] == "antonelli"].sort_values(by="round")
    assert list(ant_df["cumulative_points"]) == [25.0, 43.0, 58.0]

    # Check cumulative totals for Verstappen
    ver_df = df[df["driver_id"] == "verstappen"].sort_values(by="round")
    assert list(ver_df["cumulative_points"]) == [18.0, 43.0, 43.0]

def test_compute_cumulative_points_empty():
    df = compute_cumulative_points([])
    assert len(df) == 0


# --- 3. Points Gap & Head-to-Head Tests ---

def test_compute_points_gap_series():
    """Verifies round-by-round gap, lead change tracking, and deterministic explanations."""
    results_a = [
        {"round": 1, "race_name": "Bahrain GP", "points": 25.0},
        {"round": 2, "race_name": "Saudi Arabia GP", "points": 0.0},
        {"round": 3, "race_name": "Australia GP", "points": 18.0},
    ]
    results_b = [
        {"round": 1, "race_name": "Bahrain GP", "points": 18.0},
        {"round": 2, "race_name": "Saudi Arabia GP", "points": 25.0},
        {"round": 3, "race_name": "Australia GP", "points": 15.0},
    ]

    gap_data = compute_points_gap_series(results_a, results_b, name_a="Antonelli", name_b="Verstappen", season="2026")

    series = gap_data["series"]
    assert len(series) == 3

    # Round 1: A=25, B=18 -> Gap = +7 (Antonelli leads)
    assert series[0]["gap"] == 7.0
    assert series[0]["leader"] == "Antonelli"

    # Round 2: A=25, B=43 -> Gap = -18 (Verstappen leads)
    assert series[1]["gap"] == -18.0
    assert series[1]["leader"] == "Verstappen"

    # Round 3: A=43, B=58 -> Gap = -15 (Verstappen leads)
    assert series[2]["gap"] == -15.0
    assert series[2]["leader"] == "Verstappen"

    summary = gap_data["summary"]
    assert summary["rounds_completed"] == 3
    assert summary["current_gap"] == -15.0
    assert summary["leader"] == "Verstappen"
    assert summary["lead_changes"] == 1
    assert summary["max_lead_a"] == 7.0
    assert summary["max_lead_b"] == 18.0

    # Insight check
    assert "Verstappen holds a 15.0 PTS advantage" in gap_data["insight"]
    assert "lead changed hands 1 time(s)" in gap_data["insight"]


# --- 4. Driver Consistency & Volatility Tests ---

def test_compute_consistency_metrics():
    """Verifies mean finish, standard deviation, and presence of limitation note."""
    finishes = [
        {"grid": 1, "finish": 1, "status": "Finished"},
        {"grid": 2, "finish": 2, "status": "Finished"},
        {"grid": 3, "finish": 1, "status": "Finished"},
        {"grid": 1, "finish": 2, "status": "Finished"},
        {"grid": 4, "finish": None, "status": "Engine"},  # DNF
    ]

    stats = compute_consistency_metrics(finishes)
    assert stats["total_starts"] == 5
    assert stats["classified_count"] == 4
    # Classified finishes: [1, 2, 1, 2] -> Mean = 1.5
    assert stats["mean_finish"] == 1.5
    # Standard deviation of [1, 2, 1, 2] with ddof=1 is sqrt(1/3) ~ 0.58
    assert stats["std_finish"] == pytest.approx(0.58, abs=0.02)
    assert stats["dnf_count"] == 1
    assert stats["dnf_rate"] == 20.0
    assert stats["best_finish"] == "P1"
    assert stats["worst_finish"] == "P2"
    assert stats["consistency_score"] > 80.0

    # Ensure limitation note is explicitly included and distinguishes consistency from pace
    assert "FINISHING-POSITION LIMITATION" in stats["limitation_note"]
    assert "does NOT represent true lap pace" in stats["limitation_note"]

def test_compute_consistency_metrics_window():
    """Windowing test: only take the last 2 completed races."""
    finishes = [
        {"grid": 10, "finish": 10, "status": "Finished"},
        {"grid": 1, "finish": 1, "status": "Finished"},
        {"grid": 1, "finish": 1, "status": "Finished"},
    ]
    stats = compute_consistency_metrics(finishes, window=2)
    assert stats["total_starts"] == 2
    assert stats["classified_count"] == 2
    assert stats["mean_finish"] == 1.0
    assert stats["std_finish"] == 0.0
