"""
FastF1 Service
Provides telemetry, session timing, and weather metrics when supported by FastF1.
Operates as a supplementary feature on top of the primary Jolpica-F1 API data layer.
"""

import logging
import os
import tempfile
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Configure fastf1 cache directory in a safe temporary scratch location
FASTF1_CACHE_DIR = os.path.join(tempfile.gettempdir(), "racepective_fastf1_cache")
try:
    os.makedirs(FASTF1_CACHE_DIR, exist_ok=True)
    import fastf1
    if hasattr(fastf1, "configure"):
        fastf1.configure(cache_dir=FASTF1_CACHE_DIR)
    else:
        fastf1.Cache.enable_cache(FASTF1_CACHE_DIR)
    FASTF1_AVAILABLE = True
except Exception as e:
    logger.warning(f"FastF1 cache initialization failed: {e}. Telemetry will operate in mock/degraded mode.")
    FASTF1_AVAILABLE = False


class FastF1Service:
    def __init__(self):
        self.enabled = FASTF1_AVAILABLE

    def get_session_summary(self, year: int, round_num: int, session_type: str = "R") -> dict[str, Any]:
        """
        Attempts to load session timing, weather, and telemetry summary using FastF1.
        Returns a clean dictionary or an explicit unavailable message.
        """
        if not self.enabled:
            return {
                "available": False,
                "reason": "FastF1 engine not enabled or unsupported environment",
                "weather": None,
                "telemetry": None
            }

        try:
            session = fastf1.get_session(year, round_num, session_type)
            # Only attempt loading if session date has passed
            session.load(telemetry=False, weather=True, messages=False)

            weather_data = None
            if hasattr(session, "weather_data") and session.weather_data is not None and not session.weather_data.empty:
                w = session.weather_data
                weather_data = {
                    "air_temp_avg": round(float(w["AirTemp"].mean()), 1) if "AirTemp" in w else None,
                    "track_temp_avg": round(float(w["TrackTemp"].mean()), 1) if "TrackTemp" in w else None,
                    "humidity_avg": round(float(w["Humidity"].mean()), 1) if "Humidity" in w else None,
                    "rainfall": bool(w["Rainfall"].any()) if "Rainfall" in w else False,
                }

            return {
                "available": True,
                "session_name": session.name,
                "weather": weather_data,
                "year": year,
                "round": round_num
            }
        except Exception as e:
            logger.info(f"FastF1 session data unavailable for {year} R{round_num}: {e}")
            return {
                "available": False,
                "reason": f"Detailed session telemetry currently unavailable for {year} Round {round_num}",
                "weather": None
            }

fastf1_service = FastF1Service()
