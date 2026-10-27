import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Clock, 
  Filter, 
  Trophy, 
  Search, 
  Layers, 
  Sparkles, 
  X,
  ExternalLink,
  Flag,
  Navigation
} from 'lucide-react';

import { api } from '../services/api';
import { StateBadge, TeamColorBar, getTeamColor } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import { PageHeaderHero, CircuitWireframe, LiveTelemetryWaveform } from '../components/common/WireframeAnimations';
import { CountryFlag } from '../utils/flags';
import { DriverAvatar } from '../data/assets';

export default function Calendar() {
  const [season, setSeason] = useState('2026');
  const seasons = ['2026', '2025', '2024', '2023'];

  // View switch: 'schedule' (vertical timeline) vs 'month' (month cards)
  const [viewMode, setViewMode] = useState('schedule');
  const [filter, setFilter] = useState('ALL'); // ALL, UPCOMING, COMPLETED, IN_PROGRESS
  const [searchQuery, setSearchQuery] = useState('');

  // Schedule data
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inspector state
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedRaceDetail, setSelectedRaceDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load calendar for selected season
  const loadCalendar = async (targetSeason) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCalendar(targetSeason);
      const races = res.data || [];
      setSchedule(races);

      // Default inspector to next upcoming race or latest completed race
      const upcoming = races.find(r => r.state === 'UPCOMING');
      const latestCompleted = [...races].reverse().find(r => r.state === 'COMPLETED');
      const initialRound = (upcoming || latestCompleted || races[0])?.round || 1;
      setSelectedRound(initialRound);
    } catch (err) {
      setError(err.message || 'Unable to load race calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar(season);
  }, [season]);

  // Fetch full race detail (with podium & sessions) when selectedRound changes
  useEffect(() => {
    let isCurrent = true;
    async function fetchDetail() {
      if (!selectedRound) return;
      try {
        setDetailLoading(true);
        const res = await api.getRaceDetail(season, selectedRound);
        if (isCurrent) {
          setSelectedRaceDetail(res.data);
        }
      } catch (err) {
        console.warn(`[Calendar] Failed to load detail for round ${selectedRound}:`, err);
        if (isCurrent) {
          setSelectedRaceDetail(null);
        }
      } finally {
        if (isCurrent) {
          setDetailLoading(false);
        }
      }
    }
    fetchDetail();
    return () => { isCurrent = false; };
  }, [season, selectedRound]);

  // Season navigation handlers (< and >)
  const handlePrevSeason = () => {
    const idx = seasons.indexOf(season);
    if (idx < seasons.length - 1) {
      setSeason(seasons[idx + 1]);
    }
  };

  const handleNextSeason = () => {
    const idx = seasons.indexOf(season);
    if (idx > 0) {
      setSeason(seasons[idx - 1]);
    }
  };

  // Progress metrics
  const totalRaces = schedule.length;
  const completedRaces = schedule.filter(r => r.state === 'COMPLETED').length;
  const inProgressRaces = schedule.filter(r => r.state === 'IN_PROGRESS').length;
  const upcomingRaces = schedule.filter(r => r.state === 'UPCOMING').length;
  const completionPct = totalRaces > 0 ? Math.round((completedRaces / totalRaces) * 100) : 0;

  // Filtered schedule
  const filteredRaces = useMemo(() => {
    return schedule.filter((r) => {
      // Filter by state
      if (filter === 'UPCOMING' && r.state !== 'UPCOMING') return false;
      if (filter === 'COMPLETED' && r.state !== 'COMPLETED') return false;
      if (filter === 'IN_PROGRESS' && r.state !== 'IN_PROGRESS') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (r.race_name || '').toLowerCase().includes(q);
        const matchCircuit = (r.circuit?.circuit_name || '').toLowerCase().includes(q);
        const matchCountry = (r.circuit?.location?.country || '').toLowerCase().includes(q);
        const matchLocality = (r.circuit?.location?.locality || '').toLowerCase().includes(q);
        const matchRound = String(r.round) === q || `r${r.round}` === q;
        if (!matchName && !matchCircuit && !matchCountry && !matchLocality && !matchRound) {
          return false;
        }
      }
      return true;
    });
  }, [schedule, filter, searchQuery]);

  // Group races by month for the Month view
  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredRaces.forEach((race) => {
      if (!race.date) return;
      const d = new Date(race.date);
      const monthKey = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(race);
    });
    return groups;
  }, [filteredRaces]);

  // Currently inspected race object from schedule
  const currentRace = schedule.find(r => r.round === selectedRound) || schedule[0];

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 bg-[#131720] rounded w-64 animate-pulse"></div>
        <CardSkeleton count={6} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={() => loadCalendar(season)} />;

  return (
    <div className="space-y-8 pb-12 text-[#F8F9FA]">
      {/* 1. Page Header Hero with Ambient Circuit Wireframe */}
      <PageHeaderHero
        badge={`${season} CALENDAR & TIMETABLE`}
        title={`${season} FIA Formula One World Championship`}
        subtitle={`${totalRaces} Grands Prix scheduled across 5 continents • Official verified UTC sessions, timetables and circuit destinations`}
        icon={CalendarIcon}
        wireframeVariant="circuit"
        circuit={season === '2026' ? 'spa' : 'monza'}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Season Selector with Prev / Next Navigation */}
            <div className="flex items-center bg-[#131720] p-1 rounded-xl border border-[#232936] shadow-xs">
              <button
                onClick={handlePrevSeason}
                disabled={seasons.indexOf(season) === seasons.length - 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E2432] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Season"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="bg-transparent text-white font-mono font-bold text-xs px-2 py-1 focus:outline-none cursor-pointer"
              >
                {seasons.map((s) => (
                  <option key={s} value={s} className="bg-[#131720] text-white">
                    {s} Season
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextSeason}
                disabled={seasons.indexOf(season) === 0}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E2432] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Season"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Total Scheduled Rounds Badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#131720] px-3 py-1.5 rounded-xl border border-[#232936] font-mono text-xs">
              <Flag className="w-3.5 h-3.5 text-[#E10600]" />
              <span className="text-gray-400">Total Rounds:</span>
              <span className="text-white font-black">{totalRaces}</span>
            </div>
          </div>
        }
      />

      {/* 2. Season Progress Bar & Summary Bar */}
      <div className="bg-[#131720] rounded-2xl p-4 sm:p-5 border border-[#232936] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="space-y-1.5 flex-1">
          <div className="flex justify-between items-center text-gray-400 text-[11px]">
            <span className="uppercase tracking-wider font-bold flex items-center gap-1.5 text-gray-300">
              <Sparkles className="w-3.5 h-3.5 text-[#E10600]" />
              Championship Calendar Progress
            </span>
            <span className="text-white font-bold">
              {completedRaces} / {totalRaces} Completed &bull; <span className="text-emerald-400">{completionPct}%</span>
            </span>
          </div>
          <div className="w-full bg-[#0B0D12] h-2.5 rounded-full overflow-hidden border border-[#232936]">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-[#E10600] transition-all duration-700 ease-out"
              style={{ width: `${completionPct}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-400 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#232936]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{completedRaces} Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>{upcomingRaces} Upcoming</span>
          </div>
          {inProgressRaces > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-red-400 font-bold">{inProgressRaces} Active</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Calendar View Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        {/* View Switch: Schedule (Timeline) vs Month (Calendar Grid) */}
        <div className="flex items-center bg-[#131720] p-1 rounded-xl border border-[#232936] shadow-xs">
          <button
            onClick={() => setViewMode('schedule')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'schedule'
                ? 'bg-[#E10600] text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-[#1E2432]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schedule Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'month'
                ? 'bg-[#E10600] text-white shadow-xs'
                : 'text-gray-400 hover:text-white hover:bg-[#1E2432]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Month Grid</span>
          </button>
        </div>

        {/* Filter Pills & Venue Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center bg-[#131720] p-1 rounded-xl border border-[#232936]">
            {[
              { id: 'ALL', label: `All (${totalRaces})` },
              { id: 'UPCOMING', label: `Upcoming (${upcomingRaces})` },
              { id: 'COMPLETED', label: `Completed (${completedRaces})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  filter === f.id
                    ? 'bg-[#1E2432] text-white font-bold border border-[#2E3648]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Grand Prix or circuit..."
              className="w-full bg-[#131720] border border-[#232936] rounded-xl pl-8 pr-7 py-1.5 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-[#E10600]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredRaces.length === 0 ? (
        <EmptyState
          title="No Races Match Criteria"
          message={`No events found matching your filter (${filter}) and search criteria in the ${season} championship.`}
          onReset={() => { setFilter('ALL'); setSearchQuery(''); }}
        />
      ) : viewMode === 'schedule' ? (
        /* 4. RACE SCHEDULE EXPLORER (Timeline List + Sticky Inspector Drawer) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Timeline Track connecting rounds with milestone nodes (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#232936]">
              {filteredRaces.map((race) => {
                const isSelected = selectedRound === race.round;
                const isCompleted = race.state === 'COMPLETED';
                const isInProgress = race.state === 'IN_PROGRESS';

                return (
                  <div key={race.round} className="relative mb-5 last:mb-0 group">
                    {/* Milestone Beacon Node on Timeline Track Spine */}
                    <div className="absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                      ) : isInProgress ? (
                        <div className="relative w-5 h-5 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg">
                          <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping"></span>
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#131720] border-2 border-gray-600 flex items-center justify-center">
                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        </div>
                      )}
                    </div>

                    {/* Timeline Race Card */}
                    <div
                      onClick={() => setSelectedRound(race.round)}
                      className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 border ${
                        isSelected
                          ? 'bg-[#181D28] border-[#E10600] ring-1 ring-[#E10600]/40 shadow-lg'
                          : 'bg-[#131720] border-[#232936] hover:border-gray-600 hover:bg-[#161B24]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Round Number & Status Badge */}
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-[#0B0D12] border border-[#232936] text-[#E10600]">
                            ROUND {String(race.round).padStart(2, '0')}
                          </span>
                          <StateBadge state={race.state} />
                        </div>

                        {/* Date & UTC Start Time */}
                        <div className="flex items-center space-x-3 text-xs font-mono text-gray-400">
                          <div className="flex items-center space-x-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-gray-300 font-bold">{race.date}</span>
                          </div>
                          {race.time && (
                            <div className="flex items-center space-x-1 text-gray-400">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              <span>{race.time}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grand Prix Title with Flag */}
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2.5">
                            <CountryFlag
                              country={race.circuit?.location?.country}
                              raceName={race.race_name}
                              size="sm"
                            />
                            <h3 className="text-base sm:text-lg font-heading font-black text-white group-hover:text-[#E10600] transition-colors leading-tight">
                              {race.race_name}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-400 font-mono flex items-center space-x-1.5 pl-6">
                            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span className="truncate">
                              {race.circuit?.circuit_name} &bull; {race.circuit?.location?.locality}, {race.circuit?.location?.country}
                            </span>
                          </p>
                        </div>

                        {/* Inspect action pill */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRound(race.round);
                          }}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
                            isSelected
                              ? 'bg-[#E10600] text-white shadow-xs'
                              : 'bg-[#0B0D12] text-gray-400 border border-[#232936] hover:text-white hover:border-gray-500'
                          }`}
                        >
                          <span>{isSelected ? 'Inspecting' : 'Inspect'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Winner Showcase for Completed Rounds */}
                      {race.state === 'COMPLETED' && race.winner && (
                        <div className="mt-3 pt-3 border-t border-[#232936] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center space-x-2 text-emerald-400">
                            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                              Winner: <strong className="text-white">{race.winner}</strong> ({race.winner_team})
                            </span>
                          </div>
                          <Link
                            to={`/races/${race.season || season}/${race.round}`}
                            className="text-[#E10600] hover:text-red-400 font-bold flex items-center space-x-1"
                          >
                            <span>Classification</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Race Details Inspector (Sticky Panel on Desktop) (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-[#131720] border border-[#232936] rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header: Grand Prix & Round */}
              <div className="flex items-start justify-between gap-3 border-b border-[#232936] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-[#0B0D12] border border-[#232936] text-[#E10600]">
                      ROUND {String(currentRace?.round || 1).padStart(2, '0')}
                    </span>
                    <StateBadge state={currentRace?.state} />
                  </div>
                  <h2 className="text-xl font-heading font-black text-white leading-tight">
                    {currentRace?.race_name}
                  </h2>
                </div>

                <CountryFlag
                  country={currentRace?.circuit?.location?.country}
                  raceName={currentRace?.race_name}
                  size="md"
                />
              </div>

              {/* Circuit & Geography */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Circuit Venue:</span>
                  <Link
                    to={currentRace?.circuit?.circuit_id ? `/circuits/${currentRace.circuit.circuit_id}` : '/circuits'}
                    className="text-white font-bold hover:text-[#E10600] transition-colors truncate max-w-[220px]"
                    title="View circuit geography and track details"
                  >
                    {currentRace?.circuit?.circuit_name}
                  </Link>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Destination:</span>
                  <span className="text-gray-300 font-semibold">
                    {currentRace?.circuit?.location?.locality}, {currentRace?.circuit?.location?.country}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Race Date:</span>
                  <span className="text-white font-bold">{currentRace?.date}</span>
                </div>
                {currentRace?.time && (
                  <div className="flex justify-between items-center text-gray-400">
                    <span>UTC Start Time:</span>
                    <span className="text-emerald-400 font-bold">{currentRace.time}</span>
                  </div>
                )}
              </div>

              {/* Circuit Vector Wireframe Showcase */}
              <div className="bg-[#0B0D12] p-4 rounded-xl border border-[#232936] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span className="uppercase text-gray-300 font-bold flex items-center gap-1.5">
                    <Navigation className="w-3 h-3 text-[#E10600]" />
                    Vector Track Geometry
                  </span>
                  <span className="text-emerald-400">GPS ACCREDITED</span>
                </div>
                <div className="h-28 w-full flex items-center justify-center">
                  <CircuitWireframe
                    circuit={
                      currentRace?.circuit?.circuit_id?.includes('monza')
                        ? 'monza'
                        : currentRace?.circuit?.circuit_id?.includes('spa')
                        ? 'spa'
                        : 'silverstone'
                    }
                    className="h-full w-full"
                    opacity={0.85}
                  />
                </div>
              </div>

              {/* Official Podium Finishers for Completed Races */}
              {currentRace?.state === 'COMPLETED' && (
                <div className="space-y-3 pt-2 border-t border-[#232936]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-gray-300 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      Official Podium Finishers
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">VERIFIED</span>
                  </div>

                  {detailLoading ? (
                    <div className="py-4">
                      <LoadingSpinner message="Fetching verified podium classification..." />
                    </div>
                  ) : selectedRaceDetail?.results && selectedRaceDetail.results.length >= 3 ? (
                    <div className="space-y-2">
                      {selectedRaceDetail.results.slice(0, 3).map((res) => (
                        <div
                          key={res.position}
                          className="bg-[#0B0D12] p-2.5 rounded-xl border border-[#232936] flex items-center justify-between font-mono text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${
                                res.position === 1
                                  ? 'bg-amber-400 text-black shadow-xs'
                                  : res.position === 2
                                  ? 'bg-slate-300 text-black'
                                  : 'bg-amber-700 text-white'
                              }`}
                            >
                              P{res.position}
                            </span>
                            <DriverAvatar
                              driverId={res.driver_id}
                              name={res.driver_name}
                              team={res.constructor_name}
                              size="sm"
                            />
                            <div>
                              <span className="font-sans font-bold text-white block">
                                {res.driver_name}
                              </span>
                              <div className="flex items-center space-x-1.5 text-[10px] text-gray-400">
                                <TeamColorBar team={res.constructor_name} />
                                <span>{res.constructor_name}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-gray-400 font-mono text-[11px] font-bold">
                            {res.time || `${res.points} PTS`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : currentRace.winner ? (
                    <div className="bg-[#0B0D12] p-3 rounded-xl border border-[#232936] text-xs font-mono flex items-center space-x-3">
                      <span className="w-6 h-6 rounded bg-amber-400 text-black font-black flex items-center justify-center">
                        P1
                      </span>
                      <div>
                        <span className="font-sans font-bold text-white block">{currentRace.winner}</span>
                        <span className="text-gray-400 text-[10px]">{currentRace.winner_team}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-gray-500 italic">
                      Classification awaiting FIA ratification.
                    </p>
                  )}
                </div>
              )}

              {/* Weekend Sessions Schedule if available */}
              {selectedRaceDetail?.sessions && selectedRaceDetail.sessions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#232936]">
                  <span className="text-xs font-mono font-bold text-gray-300 block">
                    Weekend Grand Prix Timetable
                  </span>
                  <div className="divide-y divide-[#1E2432] text-xs font-mono bg-[#0B0D12] rounded-xl border border-[#232936] overflow-hidden">
                    {selectedRaceDetail.sessions.map((s, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-gray-400">
                        <span className="text-gray-200">{s.name}</span>
                        <span className="text-gray-400 text-[11px]">{s.date} {s.time ? `• ${s.time}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deep Link to Full Classification & Race Hub */}
              <div className="pt-2">
                <Link
                  to={`/races/${currentRace?.season || season}/${currentRace?.round}`}
                  className="w-full py-2.5 px-4 bg-[#E10600] hover:bg-red-700 text-white rounded-xl font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <span>
                    {currentRace?.state === 'COMPLETED'
                      ? 'View Full Results, Grid & Classification'
                      : 'View Race Hub & Track Guide'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 5. MONTH GRID VIEW (Grouped by Calendar Month) */
        <div className="space-y-8">
          {Object.entries(monthlyGroups).map(([monthName, races]) => (
            <div key={monthName} className="space-y-4">
              <div className="flex items-center space-x-3 pb-2 border-b border-[#232936]">
                <CalendarIcon className="w-4 h-4 text-[#E10600]" />
                <h2 className="text-lg font-heading font-black text-white">{monthName}</h2>
                <span className="font-mono text-xs text-gray-400">({races.length} Round{races.length > 1 ? 's' : ''})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {races.map((race) => (
                  <div
                    key={race.round}
                    className="bg-[#131720] rounded-2xl border border-[#232936] hover:border-gray-600 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#0B0D12] text-[#E10600] border border-[#232936]">
                          ROUND {race.round}
                        </span>
                        <StateBadge state={race.state} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CountryFlag
                            country={race.circuit?.location?.country}
                            raceName={race.race_name}
                            size="sm"
                          />
                          <h3 className="font-heading font-black text-base text-white truncate">
                            {race.race_name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-400 font-mono flex items-center space-x-1 pl-5">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span className="truncate">{race.circuit?.circuit_name}</span>
                        </p>
                      </div>

                      <div className="bg-[#0B0D12] rounded-lg p-2.5 font-mono text-xs text-gray-400 flex items-center justify-between border border-[#1E2432]">
                        <span className="text-gray-200">{race.date}</span>
                        {race.time && <span>{race.time}</span>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#232936] flex items-center justify-between font-mono text-xs">
                      <Link
                        to={`/races/${race.season || season}/${race.round}`}
                        className="text-[#E10600] hover:text-red-400 font-bold flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <span className="text-gray-400 text-[11px]">
                        {race.circuit?.location?.country}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
