from typing import Any, Optional
from pydantic import BaseModel, Field

class APIStatusResponse(BaseModel):
    status: str
    app_version: str
    season: str
    last_updated: str
    jolpica_connected: bool
    is_demo: bool

class LocationInfo(BaseModel):
    lat: float
    long: float
    locality: str
    country: str

class CircuitInfo(BaseModel):
    circuit_id: str
    circuit_name: str
    location: LocationInfo
    url: Optional[str] = None

class RaceScheduleItem(BaseModel):
    season: str
    round: int
    race_name: str
    circuit: CircuitInfo
    date: str
    time: Optional[str] = None
    iso_start_time: str
    state: str = Field(description="COMPLETED, IN_PROGRESS, or UPCOMING")
    winner: Optional[str] = None
    winner_team: Optional[str] = None

class DriverStandingItem(BaseModel):
    position: int
    points: float
    wins: int
    driver_id: str
    driver_number: Optional[str] = None
    driver_code: Optional[str] = None
    driver_name: str
    nationality: str
    constructor_id: str
    constructor_name: str

class ConstructorStandingItem(BaseModel):
    position: int
    points: float
    wins: int
    constructor_id: str
    constructor_name: str
    nationality: str

class RaceResultItem(BaseModel):
    position: int
    driver_id: str
    driver_name: str
    driver_code: Optional[str] = None
    driver_number: Optional[str] = None
    constructor_name: str
    constructor_id: str
    grid: int
    position_change: int
    laps: int
    status: str
    time: Optional[str] = None
    points: float
    fastest_lap_rank: Optional[int] = None
    fastest_lap_time: Optional[str] = None

class RaceDetailResponse(BaseModel):
    season: str
    round: int
    race_name: str
    circuit: CircuitInfo
    date: str
    state: str
    results: list[RaceResultItem]
    podium: list[RaceResultItem]
    is_demo: bool = False
    last_updated: str

class DashboardOverview(BaseModel):
    season: str
    last_updated: str
    is_demo: bool
    next_race: Optional[RaceScheduleItem] = None
    last_race: Optional[dict[str, Any]] = None
    driver_leader: Optional[DriverStandingItem] = None
    constructor_leader: Optional[ConstructorStandingItem] = None
    top_drivers: list[DriverStandingItem] = []
    top_constructors: list[ConstructorStandingItem] = []
    total_races: int = 0
    completed_races: int = 0
