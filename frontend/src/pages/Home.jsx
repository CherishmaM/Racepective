import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Flag, 
  MapPin, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Clock,
  ArrowRight,
  Gauge,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  Thermometer
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import { api } from '../services/api';
import Countdown from '../components/common/Countdown';
import StatCard from '../components/common/StatCard';
import { StateBadge, TeamColorBar, PositionDeltaBadge } from '../components/common/Badge';
import { getDriverColor, getTeamColor, DARK_CHART_THEME } from '../utils/teamColors';
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/LoadingSpinner';
import { DriverAvatar } from '../data/assets';
import RacepectiveLogo from '../components/common/RacepectiveLogo';
import TeamSymbol, { MercedesSymbol } from '../components/common/TeamSymbol';
import { CountryFlag } from '../utils/flags';
import { CIRCUIT_SECTOR_DATA } from '../components/circuits/CircuitSectorMap';
import FiaStartGantry from '../components/common/FiaStartGantry';
import { 
  CircuitWireframe, 
  HeroTrackStage,
  TelemetryScanLine, 
  HeroWireframeBrackets, 
  TechnicalGridBackdrop 
} from '../components/common/WireframeAnimations';

export default function Home() {
  const [data, setData] = useState(null);
  const [progression, setProgression] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, progRes] = await Promise.all([
        api.getDashboard(),
        api.getProgression('current').catch(() => ({ data: [] }))
      ]);
      setData(dashRes);
      const progList = Array.isArray(progRes.data) ? progRes.data : (progRes.data?.data || []);
      setProgression(progList);

      // Fetch live track meteorology for next race venue
      const nextCircuit = dashRes.next_race?.circuit;
      const lat = parseFloat(nextCircuit?.location?.lat) || 19.4042;
      const lon = parseFloat(nextCircuit?.location?.long) || -99.0907;
      api.getWeather(lat, lon)
        .then(w => setWeather(w))
        .catch(err => console.warn('Could not load live weather:', err));
    } catch (err) {
      setError(err.message || 'Failed to connect to F1 data services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton height="h-80" />
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const nextRace = data.next_race;
  const lastRace = data.last_race;
  const driverLeader = data.driver_leader;
  const constructorLeader = data.constructor_leader;
  const recentResults = lastRace?.results?.slice(0, 5) || [];

  const availableProgressionKeys = progression.length > 0
    ? Object.keys(progression[0]).filter(k => k !== 'round' && k !== 'race')
    : [];

  const circuitId = (nextRace?.circuit?.circuit_id || 'rodriguez').toLowerCase().replace(/[-_\s]/g, '');
  const circuitStats = (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[circuitId]) 
    || (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA.rodriguez) 
    || {};
  const lapsCount = circuitStats.laps || 71;
  const lengthNum = parseFloat(circuitStats.lengthKm) || 4.304;
  const totalKm = (lapsCount * lengthNum).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Next Grand Prix Spotlight Card with Racepective Wireframe Telemetry */}
      {nextRace ? (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-b from-[#0F131B] via-[#131722] to-[#0D1016] border border-[#263246] text-white p-5 sm:p-7 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Subtle Technical Grid Backdrop */}
          <TechnicalGridBackdrop opacity="opacity-15" />

          {/* Sweeping Telemetry Scan Line */}
          <TelemetryScanLine />

          {/* HUD Wireframe Precision Brackets */}
          <HeroWireframeBrackets color="border-[#E10600]/40" />

          {/* Soft atmospheric radial gradients */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-radial from-[#E10600]/10 via-transparent to-transparent pointer-events-none blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-radial from-[#06B6D4]/8 via-transparent to-transparent pointer-events-none blur-3xl" />

          <div className="relative z-10 space-y-6">
            {/* ========================================================
                TOP SECTION: GRAND PRIX NARRATIVE & DEDICATED HERO TRACK STAGE
                ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Headline, Info & Action Suite (Zero text overlap) */}
              <div className="lg:col-span-6 xl:col-span-5 space-y-4">
                <div className="space-y-3">
                  {/* Brand Telemetry Tagline */}
                  <div className="flex items-center space-x-2.5 font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                    <RacepectiveLogo variant="mark" size="xs" />
                    <span className="text-white font-bold tracking-wider">RACEPECTIVE</span>
                    <span>&bull;</span>
                    <span className="text-gray-400">See racing differently.</span>
                  </div>

                  {/* Badges & Round Info */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="px-2.5 py-1 rounded-md bg-[#E10600] text-white text-xs font-mono font-black tracking-wider uppercase shadow-xs">
                      Round {nextRace.round}
                    </span>
                    <StateBadge state={nextRace.state} />
                    <div className="flex items-center space-x-1.5 text-xs text-gray-300 font-mono bg-[#0D1017] px-2.5 py-1 rounded-md border border-[#222A3A]">
                      <CountryFlag country={nextRace.circuit?.location?.country} size="xs" />
                      <span>{nextRace.circuit?.location?.country}</span>
                      <span className="text-gray-600">&bull;</span>
                      <span>{nextRace.date}</span>
                    </div>
                  </div>

                  {/* Grand Prix Name & Circuit (High Contrast Typography) */}
                  <div className="pt-1">
                    <h1 className="text-3xl sm:text-4xl xl:text-5xl font-heading font-black tracking-tight text-white leading-[1.04] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                      {nextRace.race_name}
                    </h1>
                    <p className="text-sm flex items-center space-x-1.5 mt-2 font-mono">
                      <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
                      <span className="font-bold text-white text-sm sm:text-base">
                        {nextRace.circuit?.circuit_name}
                      </span>
                      <span className="text-gray-600">&bull;</span>
                      <span className="text-gray-400 text-xs sm:text-sm font-normal">
                        {nextRace.circuit?.location?.locality}, {nextRace.circuit?.location?.country}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Championship Run-In (Clean typography, no box) */}
                <div className="space-y-1.5 font-mono text-xs max-w-lg pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="font-bold text-gray-200">2026 World Championship Finale</span>
                    <span className="text-gray-600">&bull;</span>
                    <span className="text-emerald-400 font-bold text-[11px] tracking-wide">5 Rounds Remaining</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    Round 19 kicks off the high-altitude Americas triple-header before the 2026 championship climax in the Middle East.
                  </p>
                </div>

                {/* Action Buttons: Dominant Red + Ghost Outline */}
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/circuits?circuit=${nextRace.circuit?.circuit_id || 'rodriguez'}`}
                    className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-[#E10600] hover:bg-red-700 text-white text-xs font-mono font-bold tracking-wide transition-all shadow-lg shadow-red-900/50 hover:shadow-red-600/60 border border-red-500/50 group"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-white group-hover:scale-110 transition-transform"
                    >
                      <path d="M4 14 C4 8 8 4 14 4 C18 4 20 7 20 11 C20 15 17 19 13 19 C9 19 8 16 6 16 C4 16 4 14 4 14 Z" />
                    </svg>
                    <span>Inspect Upcoming Circuit Map</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    to="/calendar"
                    className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-[#2F3A4E] hover:border-gray-300 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white text-xs font-mono font-medium tracking-wide transition-colors"
                  >
                    <span>Season Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: HERO TRACK (Floats seamlessly on the hero canvas) */}
              <div className="lg:col-span-6 xl:col-span-7 relative flex flex-col justify-between">
                {/* Subtle Floating Header */}
                <div className="flex items-center justify-end font-mono text-[10px] pb-1">
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-bold flex items-center space-x-1">
                    <span>GPS TELEMETRY ACTIVE</span>
                  </span>
                </div>

                {/* Clean, Unobstructed Hero Track Render with Live Animation */}
                <div className="relative w-full h-64 sm:h-72 lg:h-80 flex items-center justify-center my-1">
                  <HeroTrackStage
                    circuit={nextRace?.circuit?.circuit_id || 'rodriguez'}
                    className="w-full h-full"
                    accentColor="#E10600"
                  />
                </div>

                {/* Floating Specs Line */}
                <div className="flex items-center justify-between font-mono text-[10px] text-gray-400 pt-1">
                  <span className="flex items-center space-x-1.5 flex-wrap">
                    <span className="text-gray-300 font-bold">{circuitStats.lengthKm || '4.304 KM'}</span>
                    <span>&bull;</span>
                    <span className="text-cyan-400">{circuitStats.turnsCount || 17} Turns</span>
                    <span>&bull;</span>
                    <span className="text-pink-400">{circuitStats.drsZones || 3} DRS Zones</span>
                    <span>&bull;</span>
                    <span className="text-amber-300 font-semibold">{circuitStats.speedTrap?.recordSpeed || '342.5 km/h'}</span>
                  </span>
                  <Link
                    to={`/circuits?circuit=${nextRace.circuit?.circuit_id || 'rodriguez'}`}
                    className="text-[#E10600] hover:text-white font-bold transition-colors inline-flex items-center space-x-1 group"
                  >
                    <span>Full Telemetry</span>
                    <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ========================================================
                BOTTOM SECTION: INTEGRATED FIA COMMAND & TELEMETRY DECK
                ======================================================== */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:divide-x xl:divide-white/[0.07]">
                {/* 1. FIA Start Gantry & Countdown */}
                <div className="space-y-2 xl:pr-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
                      FIA Start Gantry
                    </span>
                    <FiaStartGantry />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span className="uppercase font-semibold text-gray-300">Race Lights Out In</span>
                      <span>{nextRace.time ? `${nextRace.time.slice(0, 5)} UTC` : '20:00 UTC'}</span>
                    </div>
                    <div className="bg-[#080B10]/90 p-2 rounded-xl border border-white/[0.06] flex items-center justify-center">
                      <Countdown targetIsoString={nextRace.iso_start_time} />
                    </div>
                  </div>
                </div>

                {/* 2. Quick Telemetry Matrix */}
                <div className="space-y-1.5 xl:px-6">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <span>Circuit Quick Specs</span>
                    <span className="text-emerald-400 font-bold">{circuitStats.lengthKm || '4.304 KM'}</span>
                  </div>
                  <div className="bg-[#080B10]/90 rounded-xl border border-white/[0.06] grid grid-cols-2 divide-x divide-y divide-white/[0.05] overflow-hidden font-mono text-xs">
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Length</span>
                      <span className="font-heading font-black text-sm text-white">{circuitStats.lengthKm || '4.304 KM'}</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Distance</span>
                      <span className="font-heading font-black text-sm text-emerald-400">{lapsCount} Laps</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Apexes</span>
                      <span className="font-heading font-black text-sm text-[#06B6D4]">{circuitStats.turnsCount || 17} Turns</span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">DRS Zones</span>
                      <span className="font-heading font-black text-sm text-pink-400">{circuitStats.drsZones || 3} Zones</span>
                    </div>
                  </div>
                </div>

                {/* 3. Weekend Sessions Schedule Ribbon */}
                <div className="space-y-1.5 xl:px-6">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#E10600]" />
                      <span>Weekend Schedule</span>
                    </span>
                    <span className="text-emerald-400 font-bold">Round {nextRace.round}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
                    <div className="bg-[#080B10]/90 py-2 px-1 rounded-lg border border-white/[0.06] text-gray-400">
                      <span className="block font-bold text-gray-300">FP1/2</span>
                      <span className="text-[8px] text-gray-500">Friday</span>
                    </div>
                    <div className="bg-[#080B10]/90 py-2 px-1 rounded-lg border border-white/[0.06] text-gray-400">
                      <span className="block font-bold text-gray-300">FP3</span>
                      <span className="text-[8px] text-gray-500">Saturday</span>
                    </div>
                    <div className="bg-[#080B10]/90 py-2 px-1 rounded-lg border border-white/[0.06] text-gray-400">
                      <span className="block font-bold text-cyan-300">Quali</span>
                      <span className="text-[8px] text-gray-500">Sat 15:00</span>
                    </div>
                    <div className="bg-linear-to-b from-[#E10600]/30 to-[#990000]/30 py-2 px-1 rounded-lg border border-[#E10600]/70 text-white font-bold shadow-md shadow-red-950/40">
                      <span className="block text-red-300">Grand Prix</span>
                      <span className="text-[8px] text-emerald-400">Sun 14:00</span>
                    </div>
                  </div>
                </div>

                {/* 4. Track Meteorology & Live Sector Map CTA */}
                <div className="space-y-1.5 xl:pl-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center space-x-1.5">
                      <Thermometer className="w-3 h-3 text-amber-400" />
                      <span>Track Meteorology</span>
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{weather?.condition || 'Clear Sky'}</span>
                    </span>
                  </div>
                  <div className="bg-[#080B10]/90 rounded-xl border border-white/[0.06] grid grid-cols-2 divide-x divide-y divide-white/[0.05] overflow-hidden font-mono text-xs">
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Air / Track</span>
                      <span className="font-heading font-black text-xs sm:text-sm text-white">
                        {weather?.air_temp_c ?? 23.4}°C{' '}
                        <span className="text-amber-400 text-xs font-normal">/ {weather?.track_temp_c ?? 39.2}°C</span>
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Track State</span>
                      <span className={`font-heading font-black text-xs sm:text-sm ${weather?.track_status === 'WET' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {weather?.track_status || 'DRY'}
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Wind Velocity</span>
                      <span className="font-heading font-black text-xs sm:text-sm text-cyan-400">
                        {weather?.wind_speed_kmh ?? 9.2} km/h
                      </span>
                    </div>
                    <div className="p-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block">Humidity</span>
                      <span className="font-heading font-black text-xs sm:text-sm text-gray-300">
                        {weather?.humidity ?? 36}%
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/circuits?circuit=${nextRace.circuit?.circuit_id || 'rodriguez'}`}
                    className="inline-flex items-center justify-center space-x-2 py-1.5 px-3 rounded-xl bg-[#E10600]/15 hover:bg-[#E10600] text-[#E10600] hover:text-white border border-[#E10600]/40 hover:border-transparent text-xs font-mono font-bold tracking-wide transition-all group mt-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:bg-white animate-pulse" />
                    <span>Launch Live Sector Map</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-[#121417] text-white p-6 rounded-2xl border border-[#2B303A]">
          <TechnicalGridBackdrop opacity="opacity-15" />
          <HeroWireframeBrackets color="border-[#E10600]/40" />
          <div className="relative z-10">
            <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">
              <span className="text-[#E10600] font-bold">RACEPECTIVE</span>
              <span>&bull;</span>
              <span>See racing differently.</span>
            </div>
            <h2 className="text-xl font-bold">2026 Championship Season Active</h2>
            <p className="text-sm text-gray-400 font-mono">All scheduled races are up to date.</p>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Previous GP Winner"
          value={lastRace?.winner?.driver_name || lastRace?.winner || 'Andrea Kimi Antonelli'}
          subtitle={
            <span className="font-mono text-gray-400 truncate flex items-center gap-1.5">
              <span>{lastRace?.race_name || 'United States GP'}</span>
              <span className="text-gray-600">&bull;</span>
              <span className="text-[#00D2BE] inline-flex items-center gap-1 font-semibold">
                <MercedesSymbol className="w-3.5 h-3.5 text-[#00D2BE]" />
                {lastRace?.winner?.constructor_name || 'Mercedes'}
              </span>
            </span>
          }
          icon={Trophy}
          accent="red"
        />

        <StatCard
          title="Drivers' Leader"
          value={driverLeader?.driver_name || 'Andrea Kimi Antonelli'}
          subtitle={
            <span className="font-mono text-gray-400 flex items-center justify-between w-full">
              <span>{driverLeader?.points || 365} Pts &bull; {driverLeader?.wins || 9} Wins</span>
              <span className="text-[11px] text-[#00D2BE] inline-flex items-center gap-1 font-semibold pl-1">
                <MercedesSymbol className="w-3 h-3 text-[#00D2BE]" />
                Mercedes
              </span>
            </span>
          }
          icon={Flag}
          accent="neutral"
        />

        <StatCard
          title="Constructors' Leader"
          value={constructorLeader?.constructor_name || 'Mercedes'}
          size="sm"
          subtitle={
            <span className="font-mono text-gray-400">
              {constructorLeader?.points || 607} Pts &bull; {constructorLeader?.wins || 12} Wins
            </span>
          }
          icon={<TeamSymbol team={constructorLeader?.constructor_name || 'Mercedes'} className="w-5 h-5 text-[#00D2BE] transition-transform hover:scale-110 drop-shadow-[0_0_8px_rgba(0,210,190,0.5)]" />}
          symbol={<TeamSymbol team={constructorLeader?.constructor_name || 'Mercedes'} className="w-5 h-5 text-[#00D2BE] shrink-0 drop-shadow-[0_0_6px_rgba(0,210,190,0.4)]" />}
          accent="mercedes"
        />

        <div className="bg-[#131720] rounded-2xl p-5 border border-[#232936] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Season Progress
            </span>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white">
              {data.completed_races} <span className="text-sm font-normal text-gray-500">/ {data.total_races || 24} GPs</span>
            </div>
            <div className="w-full bg-[#1E2432] rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-[#E10600] h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(((data.completed_races || 18) / (data.total_races || 24)) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Championship Progression Chart on Dashboard */}
      {progression.length > 0 && (
        <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#E10600]" />
                <h2 className="text-base font-heading font-black text-white">
                  Championship Points Progression
                </h2>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Cumulative points accumulation across recent Grand Prix rounds
              </p>
            </div>
            <Link
              to="/insights"
              className="text-xs font-mono font-semibold text-[#E10600] hover:text-red-400 flex items-center space-x-1 transition-colors"
            >
              <span>Full Analytics Suite</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-[280px] sm:h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progression} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2432" />
                <XAxis dataKey="race" stroke="#64748B" fontSize={11} fontStyle="mono" />
                <YAxis stroke="#64748B" fontSize={11} fontStyle="mono" />
                <Tooltip contentStyle={DARK_CHART_THEME.tooltip} />
                <Legend wrapperStyle={DARK_CHART_THEME.legend} />
                {availableProgressionKeys.slice(0, 5).map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={getDriverColor(key)}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: getDriverColor(key) }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. Split Section: Compact Driver Standings & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compact Driver Standings */}
        <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#1E2432] flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-base text-white">Driver Standings</h2>
                <p className="text-xs text-gray-400 font-mono">Top championship leaders</p>
              </div>
              <Link
                to="/standings/drivers"
                className="text-xs font-mono font-semibold text-[#E10600] hover:text-red-400 flex items-center space-x-1 transition-colors"
              >
                <span>Full Standings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#1A202C]">
              {data.top_drivers?.map((driver) => (
                <Link
                  key={driver.driver_id}
                  to={`/drivers/${driver.driver_id}`}
                  className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-[#181D28]/80 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-5 text-center font-mono font-bold text-xs text-gray-400">
                      {driver.position}
                    </div>
                    <DriverAvatar
                      driverId={driver.driver_id}
                      name={driver.driver_name}
                      code={driver.driver_code}
                      team={driver.constructor_name}
                      size="sm"
                    />
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-[#E10600] flex items-center space-x-2 transition-colors">
                        <span>{driver.driver_name}</span>
                        {driver.driver_number && (
                          <span className="text-[10px] font-mono text-gray-500 font-normal">
                            #{driver.driver_number}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
                        <TeamColorBar team={driver.constructor_name} />
                        <TeamSymbol team={driver.constructor_name} className="w-3.5 h-3.5 shrink-0" />
                        <span>{driver.constructor_name} &bull; {driver.wins} {driver.wins === 1 ? 'Win' : 'Wins'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-black text-sm text-white">{driver.points}</span>
                    <span className="text-xs text-gray-500 ml-1">PTS</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#161B24] border-t border-[#1E2432] text-center">
            <Link
              to="/standings/drivers"
              className="text-xs font-mono font-semibold text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <span>Compare drivers head-to-head</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Results (Last Grand Prix) */}
        <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[#1E2432] flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-base text-white">Recent Results</h2>
                <p className="text-xs text-gray-400 font-mono">
                  {lastRace?.race_name || 'Round 18 Classification'}
                </p>
              </div>
              {lastRace?.round && (
                <Link
                  to={`/races/${data.season}/${lastRace.round}`}
                  className="text-xs font-mono font-semibold text-[#E10600] hover:text-red-400 flex items-center space-x-1 transition-colors"
                >
                  <span>Full Classification</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="divide-y divide-[#1A202C]">
              {recentResults.length > 0 ? (
                recentResults.map((res) => (
                  <div key={res.driver_id} className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-[#181D28]/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 text-center font-mono font-bold text-xs text-gray-400">
                        P{res.position}
                      </div>
                      <DriverAvatar
                        driverId={res.driver_id}
                        name={res.driver_name}
                        code={res.driver_code}
                        team={res.constructor_name}
                        size="sm"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center space-x-2">
                          <Link
                            to={`/drivers/${res.driver_id}`}
                            className="hover:text-[#E10600] transition-colors"
                          >
                            {res.driver_name}
                          </Link>
                          {res.driver_code && (
                            <span className="text-[10px] font-mono text-gray-500 font-normal">
                              ({res.driver_code})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
                          <TeamColorBar team={res.constructor_name} />
                          <TeamSymbol team={res.constructor_name} className="w-3.5 h-3.5 shrink-0" />
                          <span>{res.constructor_name} &bull; Started P{res.grid}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 font-mono text-right">
                      <PositionDeltaBadge delta={res.position_change} />
                      <div className="w-16">
                        <span className="font-black text-sm text-white">+{res.points}</span>
                        <span className="text-[10px] text-gray-500 block -mt-1">PTS</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center font-mono text-xs text-gray-500">
                  Awaiting latest race classifications...
                </div>
              )}
            </div>
          </div>

          {lastRace?.round && (
            <div className="p-3 bg-[#161B24] border-t border-[#1E2432] text-center">
              <Link
                to={`/races/${data.season}/${lastRace.round}`}
                className="text-xs font-mono font-semibold text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <span>View qualifying lap times & session details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
