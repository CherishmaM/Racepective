import time
from datetime import datetime, timezone
from typing import Any, Optional, Tuple

class SimpleCache:
    """Thread-safe in-memory cache with TTL and timestamp tracking."""
    def __init__(self):
        self._store: dict[str, dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Tuple[Any, str]]:
        """Returns (value, last_updated_iso) if valid, else None."""
        entry = self._store.get(key)
        if not entry:
            return None
        now = time.time()
        if now > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["value"], entry["updated_at"]

    def set(self, key: str, value: Any, ttl_seconds: int = 600) -> str:
        """Stores a value with TTL and returns the ISO-8601 updated_at string."""
        now = time.time()
        iso_now = datetime.now(timezone.utc).isoformat()
        self._store[key] = {
            "value": value,
            "expires_at": now + ttl_seconds,
            "updated_at": iso_now,
        }
        return iso_now

    def clear(self):
        self._store.clear()

cache = SimpleCache()
