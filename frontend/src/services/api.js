/**
 * Racepective Frontend API Service
 * Shared data layer connecting React components to the Python FastAPI backend.
 * Uses VITE_API_BASE_URL with fallback to the relative /api proxy.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function fetchWithFallback(endpoint, options) {
  const clean = endpoint.replace(/^\/+/, '');
  const primaryUrl = `${API_BASE}/${clean}`;
  
  // Try primary URL
  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return await res.json();
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {}
    throw new Error(`API error (${res.status}): ${errorDetail}`);
  } catch (primaryErr) {
    // If not a network error (e.g. 404/500 from server), don't try alternate host
    if (primaryErr.message && primaryErr.message.startsWith('API error')) {
      throw primaryErr;
    }

    // Attempt fallback host if network connection failed
    const fallbackBase = API_BASE.startsWith('http') ? '/api' : 'http://127.0.0.1:8000/api';
    const fallbackUrl = `${fallbackBase}/${clean}`;
    try {
      const fbRes = await fetch(fallbackUrl, options);
      if (fbRes.ok) return await fbRes.json();
    } catch {}

    console.error(`[Racepective API] Failed request to ${primaryUrl} and fallback:`, primaryErr);
    throw primaryErr;
  }
}

async function request(endpoint) {
  return fetchWithFallback(endpoint, {
    headers: {
      'Accept': 'application/json',
    },
  });
}

export const api = {
  // System Health & Seasons
  getHealth: () => request('/health'),
  getStatus: () => request('/health'),
  getSeasons: () => request('/seasons'),

  // Race Calendar & Sessions
  getSeasonRaces: (year = 'current') => request(`/seasons/${year}/races`),
  getCalendar: (year = 'current') => request(`/seasons/${year}/races`),
  getNextRace: () => request('/races/next'),
  getLatestRace: () => request('/races/latest'),
  getLastRace: () => request('/races/latest'),
  getRaceDetail: (year, round) => request(`/races/${year}/${round}`),
  getRaceTelemetry: (year, round) => request(`/races/${year}/${round}/telemetry`),

  // Weather & Track Meteorology
  getWeather: (lat = 19.4042, lon = -99.0907) => 
    request(`/weather?lat=${lat}&lon=${lon}`),

  // Standings
  getDriverStandings: (year = 'current') => request(`/standings/drivers/${year}`),
  getConstructorStandings: (year = 'current') => request(`/standings/constructors/${year}`),

  // Drivers
  getDrivers: (season = 'current') => request(`/drivers?season=${season}`),
  getDriverDetail: (driverId, season = 'current') => request(`/drivers/${driverId}?season=${season}`),
  getDriverResults: (driverId, year = 'current') => request(`/drivers/${driverId}/results/${year}`),

  // Circuits
  getCircuits: (season = 'current') => request(`/circuits?season=${season}`),
  getCircuitDetail: (circuitId) => request(`/circuits/${circuitId}`),
  getCircuitHistory: (circuitId) => request(`/circuits/${circuitId}/history`),

  // Dashboard & Analytics
  getDashboard: () => request('/dashboard'),
  getProgression: (season = 'current', limit = 6) => request(`/analytics/progression?season=${season}&limit=${limit}`),
  getPointsGap: (season = 'current', driverA = 'antonelli', driverB = 'verstappen') => 
    request(`/analytics/points-gap?season=${season}&driver_a=${driverA}&driver_b=${driverB}`),
  getFinishingTrends: (season = 'current', driverId = 'antonelli') => 
    request(`/analytics/finishing-trends?season=${season}&driver_id=${driverId}`),
  getDriverConsistency: (season = 'current', window = 'all') => 
    request(`/analytics/driver-consistency?season=${season}&window=${window}`),
  getTeammateComparison: (season = 'current', constructorId = null) => 
    request(`/analytics/teammate-comparison?season=${season}${constructorId ? `&constructor_id=${constructorId}` : ''}`),
  getConstructorContributions: (season = 'current') => 
    request(`/analytics/constructor-contributions?season=${season}`),
  getRaceExplainer: (season = 'current', round = 18) => 
    request(`/analytics/race-explainer?season=${season}&round_num=${round}`),
  getPositionChanges: (season = 'current', round = 18) => 
    request(`/analytics/position-changes?season=${season}&round_num=${round}`),
  getConsistency: (season = 'current') => 
    request(`/analytics/consistency?season=${season}`),
};
