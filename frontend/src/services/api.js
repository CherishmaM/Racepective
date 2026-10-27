/**
 * Racepective Frontend API Service
 * Shared data layer connecting React components to the Python FastAPI backend.
 * Uses VITE_API_BASE_URL with fallback to the relative /api proxy.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function request(endpoint) {
  const url = `${API_BASE}/${endpoint.replace(/^\/+/, '')}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errJson = await res.json();
        if (errJson.detail) errorDetail = errJson.detail;
      } catch {
        // Use status text if response is not JSON
      }
      throw new Error(`API error (${res.status}): ${errorDetail}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`[Racepective API] Failed request to ${url}:`, err);
    throw err;
  }
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
