import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  ArrowUpDown, 
  Users, 
  Award, 
  TrendingUp, 
  Filter,
  Flag,
  MapPin,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Zap,
  BarChart3,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

import { api } from '../services/api';
import { TeamColorBar, getTeamColor } from '../components/common/Badge';
import { getDriverColor, DARK_CHART_THEME } from '../utils/teamColors';
import { DriverAvatar } from '../data/assets';
import { ChartSkeleton, TableSkeleton } from '../components/common/SkeletonLoader';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import { HeroWireframeBrackets, TelemetryScanLine, LiveTelemetryWaveform, PageHeaderHero } from '../components/common/WireframeAnimations';

export default function Insights() {
  // Global Season & Active Tab
  const [season, setSeason] = useState('2026');
  const [seasons, setSeasons] = useState(['2026', '2025', '2024', '2023']);
  const [activeTab, setActiveTab] = useState('progression'); // 'progression', 'grid-finish', 'teammates', 'consistency', 'circuit-history'
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);

  // Common Reference Data
  const [driversList, setDriversList] = useState([]);
  const [constructorsList, setConstructorsList] = useState([]);
  const [completedRaces, setCompletedRaces] = useState([]);
  const [circuitsList, setCircuitsList] = useState([]);

  // Feature 1: Championship Progression
  const [progressionData, setProgressionData] = useState([]);
  const [progressionInsight, setProgressionInsight] = useState('');
  const [visibleDrivers, setVisibleDrivers] = useState({});

  // Feature 2: Points Gap
  const [gapDriverA, setGapDriverA] = useState('antonelli');
  const [gapDriverB, setGapDriverB] = useState('verstappen');
  const [gapData, setGapData] = useState(null);

  // Feature 3 & 8: Race Explainer & Driver Finishing Trends
  const [selectedRound, setSelectedRound] = useState(1);
  const [raceExplainer, setRaceExplainer] = useState(null);
  const [trendDriver, setTrendDriver] = useState('antonelli');
  const [driverTrend, setDriverTrend] = useState(null);

  // Feature 4: Driver Consistency
  const [consistencyWindow, setConsistencyWindow] = useState('all');
  const [consistencyData, setConsistencyData] = useState(null);

  // Feature 5 & 6: Teammates & Constructor Contributions
  const [teammateData, setTeammateData] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [constructorContrib, setConstructorContrib] = useState(null);

  // Feature 7: Circuit History
  const [selectedCircuitId, setSelectedCircuitId] = useState('monza');
  const [circuitHistory, setCircuitHistory] = useState(null);

  // Driver Colors Mapping
  const driverColors = {
    Antonelli: '#00D2BE',
    Russell: '#26648E',
    Hamilton: '#E8002D',
    Leclerc: '#FF3355',
    Verstappen: '#1E41FF',
    Norris: '#FF8000',
    Piastri: '#FFB800',
    Alonso: '#229971',
    Gasly: '#0093CC',
    Sainz: '#64C4FF',
    Hadjar: '#1E41FF',
    Lawson: '#6692FF',
    Bearman: '#B6BABD',
    Colapinto: '#0093CC',
    Bortoleto: '#C4151C',
    Hulkenberg: '#C4151C',
    Ocon: '#B6BABD',
    Bottas: '#D4AF37',
    Perez: '#D4AF37',
    Lindblad: '#6692FF',
    Tsunoda: '#6692FF',
    Stroll: '#229971',
    Albon: '#64C4FF'
  };

  // 1. Initial Reference Data Loading
  useEffect(() => {
    async function initBaseData() {
      try {
        setLoading(true);
        setError(null);

        const [seasonsRes, driversRes, teamsRes, schedRes, circRes] = await Promise.all([
          api.getSeasons().catch(() => ({ data: [{ season: '2026' }, { season: '2025' }, { season: '2024' }] })),
          api.getDrivers(season).catch(() => ({ data: [] })),
          api.getConstructorStandings(season).catch(() => ({ data: [] })),
          api.getCalendar(season).catch(() => ({ data: [] })),
          api.getCircuits(season).catch(() => ({ data: [] }))
        ]);

        if (seasonsRes.data?.length > 0) {
          setSeasons(seasonsRes.data.map(s => s.season).slice(0, 10));
        }

        const dList = driversRes.data || [];
        setDriversList(dList);
        if (dList.length >= 2) {
          setGapDriverA(dList[0].driver_id);
          setGapDriverB(dList[1].driver_id);
          setTrendDriver(dList[0].driver_id);
        }

        const cList = teamsRes.data || [];
        setConstructorsList(cList);

        const allRaces = schedRes.data || [];
        const finished = allRaces.filter(r => r.state === 'COMPLETED');
        setCompletedRaces(finished.length > 0 ? finished : allRaces.slice(0, 5));
        if (finished.length > 0) {
          setSelectedRound(finished[finished.length - 1].round);
        } else if (allRaces.length > 0) {
          setSelectedRound(allRaces[0].round);
        }

        const circuits = circRes.data || [];
        setCircuitsList(circuits);
        if (circuits.length > 0) {
          setSelectedCircuitId(circuits[0].circuit_id);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize analytics data.');
      } finally {
        setLoading(false);
      }
    }
    initBaseData();
  }, [season]);

  // 2. Tab Specific Data Fetching
  useEffect(() => {
    async function loadTabData() {
      setTabLoading(true);
      try {
        if (activeTab === 'progression') {
          const [progRes, gapRes] = await Promise.all([
            api.getProgression(season, 6),
            api.getPointsGap(season, gapDriverA, gapDriverB)
          ]);
          const progPayload = progRes.data?.data || progRes.data || [];
          setProgressionData(progPayload);
          setProgressionInsight(progRes.data?.insight || 'Cumulative round-by-round championship points progression.');
          setGapData(gapRes.data || null);

          if (progPayload.length > 0) {
            const keys = Object.keys(progPayload[0]).filter(k => k !== 'round' && k !== 'race');
            const initVis = {};
            keys.forEach(k => { initVis[k] = true; });
            setVisibleDrivers(initVis);
          }
        } else if (activeTab === 'grid-finish') {
          const [explRes, trendRes] = await Promise.all([
            api.getRaceExplainer(season, selectedRound),
            api.getFinishingTrends(season, trendDriver)
          ]);
          setRaceExplainer(explRes.data || null);
          setDriverTrend(trendRes.data || null);
        } else if (activeTab === 'teammates') {
          const [teamRes, contribRes] = await Promise.all([
            api.getTeammateComparison(season),
            api.getConstructorContributions(season)
          ]);
          const squads = teamRes.data || [];
          setTeammateData(squads);
          if (squads.length > 0 && !selectedTeam) {
            setSelectedTeam(squads[0]);
          }
          setConstructorContrib(contribRes.data || null);
        } else if (activeTab === 'consistency') {
          const constRes = await api.getDriverConsistency(season, consistencyWindow);
          setConsistencyData(constRes.data || null);
        } else if (activeTab === 'circuit-history') {
          const histRes = await api.getCircuitHistory(selectedCircuitId);
          setCircuitHistory(histRes.data || null);
        }
      } catch (err) {
        console.error('Error fetching tab data:', err);
      } finally {
        setTabLoading(false);
      }
    }

    loadTabData();
  }, [activeTab, season, gapDriverA, gapDriverB, selectedRound, trendDriver, consistencyWindow, selectedCircuitId]);

  // Filter Toggles for Progression
  const availableDriverKeys = useMemo(() => {
    if (!progressionData || progressionData.length === 0) return [];
    return Object.keys(progressionData[0]).filter(k => k !== 'round' && k !== 'race');
  }, [progressionData]);

  const toggleDriver = (key) => {
    setVisibleDrivers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <ChartSkeleton height="h-80" />
        <ChartSkeleton height="h-72" />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header Hero with Timing Grid Wireframe */}
      <PageHeaderHero
        badge="RACEPECTIVE INTELLIGENCE"
        title="Formula 1 Intelligence & Analytics"
        subtitle="Genuine telemetry-derived analytics: cumulative progression, points gap, grid-to-finish deltas, consistency volatility, and historical legacy"
        icon={LineChartIcon}
        wireframeVariant="timing"
        actions={
          <div className="flex items-center space-x-2 bg-[#1E232C] px-3.5 py-2 rounded-xl border border-[#2B303A] shadow-xs">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-400 uppercase">Season:</span>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="text-xs font-mono font-bold bg-transparent text-white focus:outline-hidden cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s} value={s} className="bg-[#121417] text-white">
                  {s} Championship
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-[#232936] text-xs font-mono scrollbar-none">
        {[
          { id: 'progression', label: '1. Title Progression & Gap', icon: TrendingUp },
          { id: 'grid-finish', label: '2. Grid vs Finish Deltas', icon: ArrowUpDown },
          { id: 'teammates', label: '3. Team Dynamics & Share', icon: Users },
          { id: 'consistency', label: '4. Consistency & Volatility', icon: Award },
          { id: 'circuit-history', label: '5. Circuit Historical Legacy', icon: Flag }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#E10600] text-white bg-[#131720] shadow-sm font-black'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1E2432]/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {tabLoading && (
        <div className="py-8">
          <LoadingSpinner message="Calculating race analytics and statistical models..." />
        </div>
      )}

      {/* 3. Tab Contents */}
      {!tabLoading && (
        <>
          {/* TAB 1: Championship Title Progression & Points Gap */}
          {activeTab === 'progression' && (
            <div className="space-y-8">
              {/* Feature 1: Cumulative Points Progression */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-[#E10600]" />
                        <span>Championship Points Progression</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        Cumulative points accumulation round-by-round across {season}
                      </p>
                    </div>

                    {/* Driver Line Filter Toggles */}
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                      <span className="text-[10px] text-gray-400 mr-1 uppercase">Drivers:</span>
                      {availableDriverKeys.map((key) => {
                        const active = visibleDrivers[key] !== false;
                        const color = getDriverColor(key) || driverColors[key] || '#64748B';
                        return (
                          <button
                            key={key}
                            onClick={() => toggleDriver(key)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all border ${
                              active
                                ? 'bg-[#1E2432] text-white border-[#2E3648] shadow-xs'
                                : 'bg-[#0B0D12] text-gray-600 border-[#1E2432] line-through'
                            }`}
                            style={active ? { borderLeftColor: color, borderLeftWidth: '3px' } : {}}
                          >
                            {key}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-[320px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis dataKey="race" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <YAxis stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <Tooltip contentStyle={DARK_CHART_THEME.tooltip} />
                        <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '8px', color: '#94A3B8' }} />
                        {availableDriverKeys.map((key) => {
                          if (visibleDrivers[key] === false) return null;
                          const color = getDriverColor(key) || driverColors[key] || '#64748B';
                          return (
                            <Line
                              key={key}
                              type="monotone"
                              dataKey={key}
                              stroke={color}
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: color }}
                              activeDot={{ r: 6 }}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Deterministic Insight Panel */}
                <div className="bg-[#0E1117] text-white rounded-2xl p-6 border border-[#232936] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[#E10600]">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">Championship Insight</span>
                    </div>
                    <h3 className="text-lg font-heading font-black text-white">
                      Title Progression Summary
                    </h3>
                    <p className="text-xs font-mono text-gray-300 leading-relaxed">
                      {progressionInsight}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#232936] font-mono text-xs">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Races Completed:</span>
                      <span className="text-white font-bold">{progressionData.length} Rounds</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Points System:</span>
                      <span className="text-white font-bold">25-18-15-12-10-8-6-4-2-1</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Data Grounding:</span>
                      <span className="text-emerald-400 font-bold">Official Jolpica-F1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Head-to-Head Points Gap */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-[#E10600]" />
                        <span>Driver Points Gap Analysis</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        Round-by-round points difference: Points({gapData?.driver_a?.name || 'Driver A'}) − Points({gapData?.driver_b?.name || 'Driver B'})
                      </p>
                    </div>

                    {/* Driver Selectors */}
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <select
                        value={gapDriverA}
                        onChange={(e) => setGapDriverA(e.target.value)}
                        className="bg-[#0B0D12] text-white px-2.5 py-1.5 rounded-lg border border-[#232936] font-bold focus:outline-none focus:border-[#E10600]"
                      >
                        {driversList.map(d => (
                          <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
                        ))}
                      </select>
                      <span className="text-gray-400 font-bold">vs</span>
                      <select
                        value={gapDriverB}
                        onChange={(e) => setGapDriverB(e.target.value)}
                        className="bg-[#0B0D12] text-white px-2.5 py-1.5 rounded-lg border border-[#232936] font-bold focus:outline-none focus:border-[#E10600]"
                      >
                        {driversList.map(d => (
                          <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="h-[280px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={gapData?.series || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis dataKey="race" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <YAxis stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                        <Tooltip
                          formatter={(val) => [`${val > 0 ? `+${val}` : val} PTS`, 'Points Gap']}
                          contentStyle={DARK_CHART_THEME.tooltip}
                        />
                        <Area
                          type="monotone"
                          dataKey="gap"
                          stroke={getDriverColor(gapDriverA) || '#E10600'}
                          fill={getDriverColor(gapDriverA) || '#E10600'}
                          fillOpacity={0.25}
                          strokeWidth={2.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Points Gap Insight Panel */}
                <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#E10600]">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">Head-to-Head Delta</span>
                    </div>
                    <div className="flex items-center space-x-3 pt-1">
                      <DriverAvatar
                        driverId={gapDriverA}
                        name={gapData?.driver_a?.name}
                        size="md"
                      />
                      <span className="font-mono text-xs font-bold text-gray-400">vs</span>
                      <DriverAvatar
                        driverId={gapDriverB}
                        name={gapData?.driver_b?.name}
                        size="md"
                      />
                    </div>
                    <h3 className="text-lg font-heading font-black text-white">
                      {gapData?.driver_a?.name} vs {gapData?.driver_b?.name}
                    </h3>
                    <p className="text-xs font-mono text-gray-300 leading-relaxed bg-[#0B0D12] p-3.5 rounded-xl border border-[#232936]">
                      {gapData?.insight || 'Analyzing head-to-head points advantage...'}
                    </p>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs pt-3 border-t border-[#232936]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Current Leader:</span>
                      <span className="text-white font-black">{gapData?.summary?.leader}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Net Points Gap:</span>
                      <span className="text-[#E10600] font-black text-sm">{Math.abs(gapData?.summary?.current_gap || 0)} PTS</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Lead Changes:</span>
                      <span className="text-white font-bold">{gapData?.summary?.lead_changes} time(s)</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Max Margin:</span>
                      <span className="text-white font-bold">{Math.max(gapData?.summary?.max_lead_a || 0, gapData?.summary?.max_lead_b || 0)} PTS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Grid vs Finish Deltas & Driver Trends */}
          {activeTab === 'grid-finish' && (
            <div className="space-y-8">
              {/* Feature 8: Race Result Explainer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                        <ArrowUpDown className="w-4 h-4 text-[#E10600]" />
                        <span>Race Result Explainer (Round {raceExplainer?.round || selectedRound})</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        Net positions gained (+) or lost (−) from grid start to official classification
                      </p>
                    </div>

                    {/* Round Selector */}
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="text-gray-400 uppercase text-[10px]">Grand Prix:</span>
                      <select
                        value={selectedRound}
                        onChange={(e) => setSelectedRound(Number(e.target.value))}
                        className="bg-[#0B0D12] text-white px-3 py-1.5 rounded-lg border border-[#232936] font-bold focus:outline-none focus:border-[#E10600]"
                      >
                        {completedRaces.map((r) => (
                          <option key={r.round} value={r.round}>
                            R{r.round}: {r.race_name.replace('Grand Prix', 'GP')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="h-[280px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(raceExplainer?.records || raceExplainer?.data || []).filter(r => r.delta !== null).slice(0, 16)}
                        margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis dataKey="driver" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" interval={0} />
                        <YAxis stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
                        <Tooltip
                          formatter={(val) => [`${val > 0 ? `+${val}` : val} positions`, 'Delta']}
                          contentStyle={DARK_CHART_THEME.tooltip}
                        />
                        <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                          {(raceExplainer?.records || raceExplainer?.data || []).filter(r => r.delta !== null).slice(0, 16).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.delta > 0 ? '#10B981' : entry.delta < 0 ? '#EF4444' : '#64748B'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Race Explainer Insight Panel */}
                <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#E10600]">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">Race Explainer Analysis</span>
                    </div>
                    <h3 className="text-lg font-heading font-black text-white">
                      {raceExplainer?.race_name || 'Grand Prix Explainer'}
                    </h3>
                    <p className="text-xs font-mono text-gray-300 leading-relaxed bg-[#0B0D12] p-3.5 rounded-xl border border-[#232936]">
                      {raceExplainer?.insight || 'No retirement or overtaking telemetry available.'}
                    </p>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs pt-3 border-t border-[#232936]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Pole Converted:</span>
                      <span className={`font-bold ${raceExplainer?.pole_converted ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {raceExplainer?.pole_converted ? 'Yes (P1 Won)' : 'No (Defeated)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Biggest Gainer:</span>
                      <span className="text-emerald-400 font-bold">
                        {raceExplainer?.biggest_mover ? `${raceExplainer.biggest_mover.driver} (+${raceExplainer.biggest_mover.delta})` : '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Total Retirements:</span>
                      <span className="text-red-400 font-bold">{raceExplainer?.retirements?.length || 0} DNF(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Driver Finishing Trends Across Season */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-[#E10600]" />
                        <span>Driver Finishing Trend ({driverTrend?.driver_name || trendDriver})</span>
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        Grid start (dashed line) vs. final classified position (solid line) across completed races
                      </p>
                    </div>

                    {/* Driver Selector */}
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="text-gray-400 uppercase text-[10px]">Driver:</span>
                      <select
                        value={trendDriver}
                        onChange={(e) => setTrendDriver(e.target.value)}
                        className="bg-[#0B0D12] text-white px-3 py-1.5 rounded-lg border border-[#232936] font-bold focus:outline-none focus:border-[#E10600]"
                      >
                        {driversList.map(d => (
                          <option key={d.driver_id} value={d.driver_id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="h-[280px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={driverTrend?.races || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis dataKey="race_name" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <YAxis reversed domain={[1, 20]} stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <Tooltip contentStyle={DARK_CHART_THEME.tooltip} />
                        <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '8px', color: '#94A3B8' }} />
                        <Line
                          type="monotone"
                          dataKey="grid"
                          name="Grid Position"
                          stroke="#64748B"
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#64748B' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="finish"
                          name="Classified Finish"
                          stroke={getDriverColor(trendDriver) || '#E10600'}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: getDriverColor(trendDriver) || '#E10600' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Driver Finishing Trend Insight Panel */}
                <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#E10600]">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">Trend Evaluation</span>
                    </div>
                    <h3 className="text-lg font-heading font-black text-white">
                      {driverTrend?.driver_name} Season Performance
                    </h3>
                    <p className="text-xs font-mono text-gray-300 leading-relaxed bg-[#0B0D12] p-3.5 rounded-xl border border-[#232936]">
                      {driverTrend?.insight || 'Telemetry loading...'}
                    </p>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs pt-3 border-t border-[#232936]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Average Grid:</span>
                      <span className="text-white font-bold">P{driverTrend?.avg_grid}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Average Finish:</span>
                      <span className="text-white font-bold">P{driverTrend?.avg_finish}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Net Positions Gained:</span>
                      <span className={`font-black ${driverTrend?.net_places_gained >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {driverTrend?.net_places_gained > 0 ? `+${driverTrend.net_places_gained}` : driverTrend?.net_places_gained}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Retirements / DNFs:</span>
                      <span className="text-white font-bold">{driverTrend?.dnf_count} race(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Team Dynamics & Constructor Share */}
          {activeTab === 'teammates' && (
            <div className="space-y-8">
              {/* Feature 5: Teammate Head-to-Head */}
              <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#E10600]" />
                      <span>Teammate Head-to-Head Battles</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      Race finishes, qualifying sessions, podiums, and constructor points contribution
                    </p>
                  </div>

                  {/* Constructor Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {teammateData.map((t) => (
                      <button
                        key={t.constructor_name}
                        onClick={() => setSelectedTeam(t)}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                          selectedTeam?.constructor_name === t.constructor_name
                            ? 'bg-[#E10600] text-white shadow-xs'
                            : 'bg-[#0B0D12] text-gray-400 hover:text-white hover:bg-[#1E2432]'
                        }`}
                      >
                        {t.constructor_name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTeam && (
                  <div className="bg-[#0B0D12] rounded-xl p-6 border border-[#232936] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232936] pb-4">
                      <div className="flex items-center space-x-3">
                        <TeamColorBar team={selectedTeam.constructor_name} />
                        <div>
                          <h3 className="font-heading font-black text-xl text-white">
                            {selectedTeam.constructor_name}
                          </h3>
                          <span className="text-xs text-gray-400 font-mono">
                            Team Total: {selectedTeam.total_team_points} PTS | Gap: {selectedTeam.points_difference} PTS
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-[#131720] px-3 py-1 rounded-md border border-[#232936] text-gray-300">
                        Intra-Team Metric Comparison
                      </span>
                    </div>

                    {/* Side-by-Side Driver Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Driver 1 */}
                      <div className="bg-[#131720] p-5 rounded-xl border border-[#232936] shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-gray-400">DRIVER 1</span>
                          <span className="font-mono text-xs font-black text-[#E10600] bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded">
                            {selectedTeam.driver_1.share_pct}% TEAM SHARE
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DriverAvatar
                            driverId={selectedTeam.driver_1.driver_id || selectedTeam.driver_1.name}
                            name={selectedTeam.driver_1.name}
                            team={selectedTeam.team}
                            size="md"
                          />
                          <div className="font-heading font-black text-xl text-white">
                            {selectedTeam.driver_1.name}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-2 border-t border-[#232936]">
                          <div className="bg-[#0B0D12] p-2 rounded border border-[#1E2432]">
                            <span className="text-[10px] text-gray-400 block uppercase">Points</span>
                            <span className="font-bold text-sm text-white">{selectedTeam.driver_1.points}</span>
                          </div>
                          <div className="bg-[#0B0D12] p-2 rounded border border-[#1E2432]">
                            <span className="text-[10px] text-gray-400 block uppercase">H2H Races</span>
                            <span className="font-bold text-sm text-emerald-400">{selectedTeam.driver_1.h2h_race_wins || 0} Wins</span>
                          </div>
                          <div className="bg-[#0B0D12] p-2 rounded border border-[#1E2432]">
                            <span className="text-[10px] text-gray-400 block uppercase">H2H Quali</span>
                            <span className="font-bold text-sm text-indigo-400">{selectedTeam.driver_1.h2h_quali_wins || 0} Poles</span>
                          </div>
                        </div>
                      </div>

                      {/* Driver 2 */}
                      <div className="bg-[#131720] p-5 rounded-xl border border-[#232936] shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-gray-400">DRIVER 2</span>
                          <span className="font-mono text-xs font-black text-slate-300 bg-[#1E2432] border border-[#2E3648] px-2 py-0.5 rounded">
                            {selectedTeam.driver_2.share_pct}% TEAM SHARE
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DriverAvatar
                            driverId={selectedTeam.driver_2.driver_id || selectedTeam.driver_2.name}
                            name={selectedTeam.driver_2.name}
                            team={selectedTeam.team}
                            size="md"
                          />
                          <div className="font-heading font-black text-xl text-white">
                            {selectedTeam.driver_2.name}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-2 border-t border-[#232936]">
                          <div className="bg-[#0B0D12] p-2 rounded border border-[#1E2432]">
                            <span className="text-[10px] text-gray-400 block uppercase">Points</span>
                            <span className="font-bold text-sm text-white">{selectedTeam.driver_2.points}</span>
                          </div>
                          <div className="bg-[#0B0D12] p-2 rounded border border-[#1E2432]">
                            <span className="text-[10px] text-gray-400 block uppercase">H2H Races</span>
                            <span className="font-bold text-sm text-emerald-400">{selectedTeam.driver_2.h2h_race_wins || 0} Wins</span>
                          </div>
                          <div className="bg-[#0B0D12] p-2 rounded border border-[#1E2432]">
                            <span className="text-[10px] text-gray-400 block uppercase">H2H Quali</span>
                            <span className="font-bold text-sm text-indigo-400">{selectedTeam.driver_2.h2h_quali_wins || 0} Poles</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Share Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
                        <span className="font-semibold text-gray-200">{selectedTeam.driver_1.name} ({selectedTeam.driver_1.share_pct}%)</span>
                        <span className="font-semibold text-gray-200">{selectedTeam.driver_2.name} ({selectedTeam.driver_2.share_pct}%)</span>
                      </div>
                      <div className="w-full bg-[#1E2432] h-3 rounded-full overflow-hidden flex border border-[#232936]">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${selectedTeam.driver_1.share_pct}%`,
                            backgroundColor: getTeamColor(selectedTeam.constructor_name)
                          }}
                        ></div>
                        <div
                          className="bg-slate-700 h-full transition-all duration-500"
                          style={{ width: `${selectedTeam.driver_2.share_pct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Teammate Insight Note */}
                    <div className="bg-[#131720] p-3.5 rounded-xl border border-[#232936] font-mono text-xs text-gray-300 flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                      <span>{selectedTeam.insight}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature 6: Constructor Comparison & Driver Contributions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#E10600]" />
                      <span>Constructor Points & Driver Contribution Split</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      Cumulative constructor points stacked by Driver 1 and Driver 2 contribution
                    </p>
                  </div>

                  <div className="h-[300px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={constructorContrib?.contributions || []}
                        margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis dataKey="constructor_name" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" interval={0} />
                        <YAxis stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <Tooltip contentStyle={DARK_CHART_THEME.tooltip} />
                        <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '8px', color: '#94A3B8' }} />
                        <Bar dataKey="driver_1_points" name="Driver 1 Points" stackId="a">
                          {(constructorContrib?.contributions || []).map((entry, idx) => (
                            <Cell key={`c1-${idx}`} fill={getTeamColor(entry.constructor_name)} />
                          ))}
                        </Bar>
                        <Bar dataKey="driver_2_points" name="Driver 2 Points" stackId="a" fill="#334155" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Constructor Contribution Insight Panel */}
                <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-[#E10600]">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider font-bold">Constructor Parity</span>
                    </div>
                    <h3 className="text-lg font-heading font-black text-white">
                      Scoring Distribution Insight
                    </h3>
                    <p className="text-xs font-mono text-gray-300 leading-relaxed bg-[#0B0D12] p-3.5 rounded-xl border border-[#232936]">
                      {constructorContrib?.insight || 'Analyzing team scoring balances...'}
                    </p>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs pt-3 border-t border-[#232936]">
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Total Constructors:</span>
                      <span className="text-white font-bold">{constructorContrib?.contributions?.length || 0} Teams</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span>Units:</span>
                      <span className="text-white font-bold">Points (PTS)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Driver Consistency & Volatility Index */}
          {activeTab === 'consistency' && (
            <div className="space-y-6">
              {/* Methodological Limitation Alert Box */}
              <div className="bg-amber-950/30 rounded-2xl p-5 border border-amber-900/50 text-amber-200 flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    Analytical Notice: Finishing Position Volatility vs. Underlying Pace
                  </h4>
                  <p className="text-xs font-mono leading-relaxed text-amber-200/80">
                    {consistencyData?.limitation_note}
                  </p>
                </div>
              </div>

              {/* Consistency Table */}
              <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#232936] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                      <Award className="w-4 h-4 text-[#E10600]" />
                      <span>Driver Consistency & Volatility Index</span>
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      Average classified finish, finishing variability (±σ standard deviation), and DNF rates
                    </p>
                  </div>

                  {/* Window Selector */}
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="text-gray-400 uppercase text-[10px]">Window:</span>
                    {['all', '5', '10'].map((w) => (
                      <button
                        key={w}
                        onClick={() => setConsistencyWindow(w)}
                        className={`px-3 py-1 rounded-md font-bold transition-colors ${
                          consistencyWindow === w
                            ? 'bg-[#E10600] text-white'
                            : 'bg-[#0B0D12] text-gray-400 hover:text-white hover:bg-[#1E2432]'
                        }`}
                      >
                        {w === 'all' ? 'All Races' : `Last ${w}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#0B0D12] border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Driver</th>
                        <th className="py-3 px-4">Team</th>
                        <th className="py-3 px-4 text-center">Classified / Starts</th>
                        <th className="py-3 px-4 text-center">Mean Finish</th>
                        <th className="py-3 px-4 text-center">Variability (±σ)</th>
                        <th className="py-3 px-4 text-center">Best / Worst</th>
                        <th className="py-3 px-4 text-center">DNF Rate</th>
                        <th className="py-3 px-4 text-right">Consistency Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#232936] font-mono text-gray-300">
                      {(consistencyData?.drivers || []).map((row, idx) => (
                        <tr key={row.driver_id} className="hover:bg-[#1E2432]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-400">#{idx + 1}</td>
                          <td className="py-3.5 px-4 font-sans font-bold text-white">{row.driver_name}</td>
                          <td className="py-3.5 px-4 text-gray-300 font-sans">
                            <div className="flex items-center space-x-2">
                              <TeamColorBar team={row.constructor_name} />
                              <span>{row.constructor_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center text-gray-300">
                            {row.classified_count} / {row.total_starts}
                          </td>
                          <td className="py-3.5 px-4 text-center text-white font-bold">
                            P{row.mean_finish}
                          </td>
                          <td className="py-3.5 px-4 text-center text-indigo-400 font-semibold">
                            ±{row.std_finish} pos
                          </td>
                          <td className="py-3.5 px-4 text-center text-gray-400 text-xs">
                            {row.best_finish} / {row.worst_finish}
                          </td>
                          <td className="py-3.5 px-4 text-center text-gray-400">
                            {row.dnf_rate}%
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#0B0D12] border border-[#2E3648] text-white font-black text-xs">
                              {row.consistency_score} / 100
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Circuit Historical Legacy */}
          {activeTab === 'circuit-history' && (
            <div className="space-y-8">
              {/* Circuit Selector Header */}
              <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-[#E10600]" />
                    <span>Venue Historical Records: {circuitHistory?.circuit_name}</span>
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    Authentic historical race results, top winning drivers, and pole position conversion rates
                  </p>
                </div>

                {/* Circuit Dropdown */}
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 uppercase text-[10px]">Select Track:</span>
                  <select
                    value={selectedCircuitId}
                    onChange={(e) => setSelectedCircuitId(e.target.value)}
                    className="bg-[#0B0D12] text-white px-3 py-1.5 rounded-lg border border-[#232936] font-bold focus:outline-none focus:border-[#E10600]"
                  >
                    {circuitsList.map((c) => (
                      <option key={c.circuit_id} value={c.circuit_id}>
                        {c.circuit_name} ({c.location?.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Circuit Statistics & Insight */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
                  <span className="text-gray-400 uppercase text-[10px] block">Grand Prix Held</span>
                  <span className="text-2xl font-black text-white block mt-1">{circuitHistory?.total_races || 0}</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">Official Championship Races</span>
                </div>
                <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
                  <span className="text-gray-400 uppercase text-[10px] block">Won from Pole</span>
                  <span className="text-2xl font-black text-indigo-400 block mt-1">{circuitHistory?.pole_win_pct}%</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">{circuitHistory?.pole_wins} victories from Grid 1</span>
                </div>
                <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
                  <span className="text-gray-400 uppercase text-[10px] block">Most Wins (Driver)</span>
                  <span className="text-base font-black text-white block mt-1 truncate">
                    {circuitHistory?.top_drivers?.[0]?.name || '--'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 block">{circuitHistory?.top_drivers?.[0]?.wins || 0} Grand Prix Victories</span>
                </div>
                <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
                  <span className="text-gray-400 uppercase text-[10px] block">Most Wins (Team)</span>
                  <span className="text-base font-black text-[#E10600] block mt-1 truncate">
                    {circuitHistory?.top_constructors?.[0]?.name || '--'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 block">{circuitHistory?.top_constructors?.[0]?.wins || 0} Team Victories</span>
                </div>
              </div>

              {/* Deterministic History Insight */}
              <div className="bg-[#131720] p-5 rounded-2xl border border-[#232936] shadow-xs flex items-start space-x-3">
                <Info className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Historical Circuit Overview & Dominance
                  </h4>
                  <p className="text-xs font-mono leading-relaxed text-gray-300">
                    {circuitHistory?.insight}
                  </p>
                </div>
              </div>

              {/* Charts & Recent Winners Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Winning Drivers Bar Chart */}
                <div className="bg-[#131720] p-6 rounded-2xl border border-[#232936] shadow-xs space-y-4">
                  <h3 className="text-sm font-heading font-black text-white uppercase tracking-wide">
                    All-Time Most Successful Drivers
                  </h3>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={circuitHistory?.top_drivers || []}
                        margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis type="number" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <YAxis type="category" dataKey="name" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" width={110} />
                        <Tooltip contentStyle={DARK_CHART_THEME.tooltip} />
                        <Bar dataKey="wins" name="Wins" fill="#E10600" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Winning Constructors Bar Chart */}
                <div className="bg-[#131720] p-6 rounded-2xl border border-[#232936] shadow-xs space-y-4">
                  <h3 className="text-sm font-heading font-black text-white uppercase tracking-wide">
                    All-Time Most Successful Constructors
                  </h3>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={circuitHistory?.top_constructors || []}
                        margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                        <XAxis type="number" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                        <YAxis type="category" dataKey="name" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" width={100} />
                        <Tooltip contentStyle={DARK_CHART_THEME.tooltip} />
                        <Bar dataKey="wins" name="Wins" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Winners Table */}
              <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#232936] flex items-center justify-between">
                  <h3 className="text-sm font-heading font-black text-white uppercase tracking-wide">
                    Recent Grand Prix Winners at {circuitHistory?.circuit_name}
                  </h3>
                  <span className="text-[11px] font-mono text-gray-400">Official Race Logs</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#0B0D12] border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                        <th className="py-2.5 px-4">Season</th>
                        <th className="py-2.5 px-4">Winner</th>
                        <th className="py-2.5 px-4">Constructor</th>
                        <th className="py-2.5 px-4 text-center">Starting Grid</th>
                        <th className="py-2.5 px-4 text-center">Pole Conversion</th>
                        <th className="py-2.5 px-4 text-right">Race Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#232936] font-mono text-gray-300">
                      {(circuitHistory?.recent_winners || []).map((w, idx) => (
                        <tr key={`${w.season}-${idx}`} className="hover:bg-[#1E2432]/40 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-white">{w.season}</td>
                          <td className="py-2.5 px-4 font-sans font-bold text-white">{w.winner}</td>
                          <td className="py-2.5 px-4 text-gray-300 font-sans">{w.constructor}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-gray-400">P{w.grid}</td>
                          <td className="py-2.5 px-4 text-center">
                            {w.won_from_pole ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                                Won from Pole
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-gray-400 bg-[#0B0D12] border border-[#232936]">
                                Overhauled Lead
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-right text-gray-400">{w.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
