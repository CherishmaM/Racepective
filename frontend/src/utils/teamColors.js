/**
 * Racepective Central Verified F1 Team & Driver Color System
 * Maps every constructor and active driver to authentic Formula 1 livery colors.
 * Used consistently across all charts, tables, cards, tooltips, and telemetry indicators.
 */

export const TEAM_COLORS = {
  mercedes: '#00D2BE',        // Petronas Emerald Teal
  ferrari: '#E8002D',         // Scuderia Corsa Red
  mclaren: '#FF8000',         // Papaya Orange
  'red bull': '#1E41FF',      // Navy Blue
  red_bull: '#1E41FF',
  'aston martin': '#229971',  // British Racing Green
  aston_martin: '#229971',
  alpine: '#0093CC',          // Alpine French Blue
  williams: '#64C4FF',        // Electric Blue
  haas: '#B6BABD',            // Haas Platinum
  sauber: '#52E252',          // Neon Green
  'kick sauber': '#52E252',
  audi: '#C4151C',            // Audi Racing Red
  rb: '#6692FF',              // Visa Cash App Blue
  'rb f1 team': '#6692FF',
  'racing bulls': '#6692FF',
  racing_bulls: '#6692FF',
  cadillac: '#D4AF37',        // Cadillac Gold
  'cadillac f1 team': '#D4AF37',
  alphatauri: '#5E8FAA',
  renault: '#FFF500',
  default: '#E10600',
};

// Driver surname/id mapping to constructor color (with slight tonal distinction between teammates if needed)
export const DRIVER_COLORS = {
  // Mercedes
  antonelli: '#00D2BE',
  Antonelli: '#00D2BE',
  russell: '#26648E',
  Russell: '#26648E',
  
  // Ferrari
  hamilton: '#E8002D',
  Hamilton: '#E8002D',
  leclerc: '#FF3355',
  Leclerc: '#FF3355',

  // Red Bull
  verstappen: '#1E41FF',
  Verstappen: '#1E41FF',
  max_verstappen: '#1E41FF',
  hadjar: '#3671C6',
  Hadjar: '#3671C6',

  // McLaren
  norris: '#FF8000',
  Norris: '#FF8000',
  piastri: '#FFB800',
  Piastri: '#FFB800',

  // Aston Martin
  alonso: '#229971',
  Alonso: '#229971',
  stroll: '#35C294',
  Stroll: '#35C294',

  // Alpine
  gasly: '#0093CC',
  Gasly: '#0093CC',
  colapinto: '#FE86C9',
  Colapinto: '#FE86C9',

  // Williams
  albon: '#64C4FF',
  Albon: '#64C4FF',
  sainz: '#005AFF',
  Sainz: '#005AFF',

  // Haas
  bearman: '#E6002B',
  Bearman: '#E6002B',
  ocon: '#B6BABD',
  Ocon: '#B6BABD',

  // Audi / Sauber
  hulkenberg: '#C4151C',
  Hulkenberg: '#C4151C',
  bortoleto: '#FF4D55',
  Bortoleto: '#FF4D55',

  // Racing Bulls (RB)
  tsunoda: '#6692FF',
  Tsunoda: '#6692FF',
  lawson: '#85A9FF',
  Lawson: '#85A9FF',
  lindblad: '#4D7DFF',
  Lindblad: '#4D7DFF',

  // Cadillac
  bottas: '#D4AF37',
  Bottas: '#D4AF37',
  perez: '#F0C950',
  Perez: '#F0C950',
};

export function getTeamColor(team = '') {
  if (!team) return TEAM_COLORS.default;
  const key = team.toLowerCase().trim();
  for (const [k, color] of Object.entries(TEAM_COLORS)) {
    if (k !== 'default' && (key.includes(k) || k.includes(key))) {
      return color;
    }
  }
  return TEAM_COLORS.default;
}

export function getDriverColor(driverNameOrId = '', team = '') {
  if (!driverNameOrId) return team ? getTeamColor(team) : TEAM_COLORS.default;
  const key = driverNameOrId.toLowerCase().trim();
  if (DRIVER_COLORS[key]) return DRIVER_COLORS[key];
  for (const [k, color] of Object.entries(DRIVER_COLORS)) {
    if (key.includes(k.toLowerCase()) || k.toLowerCase().includes(key)) {
      return color;
    }
  }
  if (team) return getTeamColor(team);
  return TEAM_COLORS.default;
}

export const DARK_CHART_THEME = {
  tooltip: {
    backgroundColor: '#131720',
    borderColor: '#2B3342',
    borderRadius: '10px',
    color: '#F8F9FA',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  grid: {
    stroke: '#1E2432',
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#64748B',
    fontSize: 11,
    fontStyle: 'mono',
  },
  legend: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '11px',
    paddingTop: '8px',
    color: '#94A3B8',
  },
};
