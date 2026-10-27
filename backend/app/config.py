import os
from pydantic import BaseModel

def parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS")
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return ["*"]

class Settings(BaseModel):
    app_name: str = "Racepective API"
    app_version: str = "1.1.0"
    jolpica_base_url: str = os.getenv("JOLPICA_BASE_URL", "https://api.jolpi.ca/ergast/f1")
    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "600"))  # 10 minutes
    cache_historical_ttl_seconds: int = int(os.getenv("CACHE_HISTORICAL_TTL_SECONDS", "86400"))  # 24 hours
    default_season: str = os.getenv("DEFAULT_SEASON", "current")
    cors_origins: list[str] = parse_cors_origins()
    request_timeout: float = float(os.getenv("REQUEST_TIMEOUT", "10.0"))
    debug: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

settings = Settings()
