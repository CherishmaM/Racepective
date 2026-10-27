import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "season" in data
    assert "last_updated" in data
    assert "jolpica_connected" in data
    assert "is_demo" in data

def test_get_seasons():
    res = client.get("/api/seasons")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert len(data["data"]) > 0
    assert "season" in data["data"][0]

def test_get_season_races_and_validation():
    # Valid season
    res = client.get("/api/seasons/2026/races")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert len(data["data"]) > 0
    first_race = data["data"][0]
    assert "race_name" in first_race
    assert first_race["state"] in ("COMPLETED", "IN_PROGRESS", "UPCOMING")

    # Invalid season: string
    res_bad = client.get("/api/seasons/invalid_year/races")
    assert res_bad.status_code == 400

    # Invalid season: out of range
    res_out = client.get("/api/seasons/1900/races")
    assert res_out.status_code == 400

def test_get_next_and_latest_race():
    res_next = client.get("/api/races/next")
    assert res_next.status_code == 200
    assert "data" in res_next.json()

    res_latest = client.get("/api/races/latest")
    assert res_latest.status_code == 200
    data = res_latest.json()
    assert "data" in data
    assert data["data"] is not None
    assert "race_name" in data["data"]

def test_get_race_detail_and_validation():
    # Valid round
    res = client.get("/api/races/2026/18")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert "circuit" in data["data"]
    assert "results" in data["data"]

    # Invalid round: out of range
    res_bad_round = client.get("/api/races/2026/99")
    assert res_bad_round.status_code == 400

def test_driver_and_constructor_standings_by_year():
    # Driver standings
    res_d = client.get("/api/standings/drivers/2026")
    assert res_d.status_code == 200
    data_d = res_d.json()
    assert "data" in data_d
    assert len(data_d["data"]) > 0
    assert data_d["data"][0]["position"] == 1

    # Constructor standings
    res_c = client.get("/api/standings/constructors/2026")
    assert res_c.status_code == 200
    data_c = res_c.json()
    assert "data" in data_c
    assert len(data_c["data"]) > 0
    assert "constructor_name" in data_c["data"][0]

def test_driver_profile_and_season_results():
    # Driver detail
    res_prof = client.get("/api/drivers/antonelli")
    assert res_prof.status_code == 200
    data_p = res_prof.json()["data"]
    assert "driver" in data_p
    assert "stats" in data_p
    assert "races" in data_p

    # Driver season results
    res_res = client.get("/api/drivers/antonelli/results/2026")
    assert res_res.status_code == 200
    data_r = res_res.json()
    assert "data" in data_r
    assert len(data_r["data"]) > 0
    assert "finish" in data_r["data"][0]

def test_circuits_and_circuit_detail():
    # All circuits
    res_circ = client.get("/api/circuits")
    assert res_circ.status_code == 200
    data_circ = res_circ.json()
    assert "data" in data_circ
    assert len(data_circ["data"]) > 0

    # Specific circuit detail
    res_detail = client.get("/api/circuits/americas")
    assert res_detail.status_code == 200
    data_d = res_detail.json()["data"]
    assert data_d["circuit_id"] == "americas"
    assert "location" in data_d
    assert "lat" in data_d["location"]
    assert "long" in data_d["location"]

def test_circuit_history_endpoint():
    res = client.get("/api/circuits/monza/history")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["circuit_id"] == "monza"
    assert "total_races" in data
    assert "top_drivers" in data
    assert "top_constructors" in data
    assert "insight" in data

def test_analytics_endpoints():
    # 1. Progression
    res_prog = client.get("/api/analytics/progression?season=2026")
    assert res_prog.status_code == 200
    assert "data" in res_prog.json()

    # 2. Points gap
    res_gap = client.get("/api/analytics/points-gap?season=2026&driver_a=antonelli&driver_b=verstappen")
    assert res_gap.status_code == 200
    data_gap = res_gap.json()["data"]
    assert "series" in data_gap
    assert "summary" in data_gap
    assert "insight" in data_gap

    # 3. Finishing trends
    res_trend = client.get("/api/analytics/finishing-trends?season=2026&driver_id=antonelli")
    assert res_trend.status_code == 200
    data_trend = res_trend.json()["data"]
    assert "races" in data_trend
    assert "avg_grid" in data_trend
    assert "avg_finish" in data_trend
    assert "insight" in data_trend

    # 4. Consistency
    res_const = client.get("/api/analytics/driver-consistency?season=2026&window=all")
    assert res_const.status_code == 200
    data_const = res_const.json()["data"]
    assert "drivers" in data_const
    assert "limitation_note" in data_const

    # 5. Teammate comparison
    res_team = client.get("/api/analytics/teammate-comparison?season=2026")
    assert res_team.status_code == 200
    assert "data" in res_team.json()

    # 6. Constructor contributions
    res_contrib = client.get("/api/analytics/constructor-contributions?season=2026")
    assert res_contrib.status_code == 200
    data_contrib = res_contrib.json()["data"]
    assert "contributions" in data_contrib
    assert "insight" in data_contrib

    # 7. Race explainer
    res_expl = client.get("/api/analytics/race-explainer?season=2026&round_num=18")
    assert res_expl.status_code == 200
    data_expl = res_expl.json()["data"]
    assert "records" in data_expl or "data" in data_expl
    assert "insight" in data_expl

def test_weather_endpoint():
    res = client.get("/api/weather?lat=19.4042&lon=-99.0907")
    assert res.status_code == 200
    data = res.json()
    assert "air_temp_c" in data
    assert "track_temp_c" in data
    assert "track_status" in data
    assert "condition" in data
    assert "humidity" in data
    assert "wind_speed_kmh" in data
