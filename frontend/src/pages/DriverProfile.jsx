import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Flag, 
  Award, 
  TrendingUp, 
  Calendar, 
  ExternalLink,
  ShieldAlert,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

import { api } from '../services/api';
import { TeamColorBar, PositionDeltaBadge, getTeamColor } from '../components/common/Badge';
import { DARK_CHART_THEME } from '../utils/teamColors';
import StatCard from '../components/common/StatCard';
import { TableSkeleton, ChartSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/LoadingSpinner';
import { DriverAvatar, DRIVER_PORTRAITS } from '../data/assets';

export default function DriverProfile() {
  const { driverId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDriverDetail(driverId, 'current');
      setProfile(res.data);
    } catch (err) {
      setError(err.message || `Unable to load driver profile for ${driverId}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [driverId]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-44 bg-[#131720] rounded-2xl animate-pulse border border-[#232936]"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
          <div className="h-24 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
          <div className="h-24 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
          <div className="h-24 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
        </div>
        <ChartSkeleton height="h-72" />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadProfile} />;
  if (!profile) return null;

  const driver = profile.driver;
  const stats = profile.stats || {};
  const races = profile.races || [];

  const teamColor = getTeamColor(driver.constructor_name) || '#E10600';

  // Chart data: inverted Y-axis so P1 is at top
  const chartData = races.map((r) => ({
    race: r.race_name,
    round: `R${r.round}`,
    finish: r.finish,
    grid: r.grid,
    points: r.points
  }));

  return (
    <div className="space-y-8 pb-12 text-[#F8F9FA]">
      {/* Back button */}
      <div>
        <Link
          to="/drivers"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Driver Grid</span>
        </Link>

        {/* Profile Hero Card */}
        <div className="bg-[#131720] text-white p-6 sm:p-8 rounded-2xl border border-[#232936] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center space-x-5 relative z-10">
            {/* Permitted Driver Portrait / Monogram Fallback */}
            <DriverAvatar
              driverId={driver.driver_id || driverId}
              name={driver.name}
              code={driver.code}
              team={driver.constructor_name}
              size="hero"
              className="ring-2 ring-[#232936] shadow-xl"
            />

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-[#E10600] text-xs font-mono font-bold text-white">
                  #{driver.permanent_number || '—'}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Rank P{driver.position || '—'} in 2026 Championship
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
                {driver.name}
              </h1>

              <div className="flex items-center space-x-2 text-xs font-mono text-gray-300 pt-1">
                <TeamColorBar team={driver.constructor_name} />
                <span className="font-bold text-white">{driver.constructor_name}</span>
                <span className="text-gray-500">&bull;</span>
                <span>{driver.nationality}</span>
                {driver.date_of_birth && (
                  <>
                    <span className="text-gray-500">&bull;</span>
                    <span>Born: {driver.date_of_birth}</span>
                  </>
                )}
              </div>

              {/* Asset attribution disclosure */}
              {DRIVER_PORTRAITS[(driver.driver_id || driverId).toLowerCase().replace(/-/g, '_')] && (
                <div className="text-[10px] font-mono text-gray-400 pt-1">
                  Photo: {DRIVER_PORTRAITS[(driver.driver_id || driverId).toLowerCase().replace(/-/g, '_')].author} ({DRIVER_PORTRAITS[(driver.driver_id || driverId).toLowerCase().replace(/-/g, '_')].license})
                </div>
              )}
            </div>
          </div>

          {/* Quick link to Wikipedia */}
          {driver.url && (
            <a
              href={driver.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#0B0D12] hover:bg-[#1E2432] text-xs font-mono text-gray-200 border border-[#232936] transition-colors self-start md:self-center"
            >
              <span>Driver Bio & History</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 4-Stat Metric Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Championship Points"
          value={driver.points || 0}
          subtitle={<span className="font-mono text-gray-400">{driver.wins || 0} Grand Prix Wins</span>}
          icon={Trophy}
          accent="red"
        />
        <StatCard
          title="Podium Finishes"
          value={stats.podiums || 0}
          subtitle={<span className="font-mono text-gray-400">{stats.points_finishes || 0} Top 10 Finishes</span>}
          icon={Award}
          accent="neutral"
        />
        <StatCard
          title="Average Finish"
          value={`P${stats.avg_finish || '—'}`}
          subtitle={<span className="font-mono text-gray-400">Best: {stats.best_finish}</span>}
          icon={Target}
          accent="neutral"
        />
        <StatCard
          title="Season Reliability"
          value={`${stats.dnfs || 0} DNF`}
          subtitle={<span className="font-mono text-gray-400">{stats.races_entered || 0} Races Started</span>}
          icon={ShieldAlert}
          accent={stats.dnfs > 2 ? 'amber' : 'green'}
        />
      </div>

      {/* Finishing Position Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#131720] rounded-2xl p-6 border border-[#232936] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#E10600]" />
                <span>Race-by-Race Finishing Position</span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Lower line position indicates stronger race results (P1 is the peak)
              </p>
            </div>
            <span className="text-[11px] font-mono text-gray-400 bg-[#0B0D12] px-2.5 py-1 rounded border border-[#232936]">
              2026 Season Performance
            </span>
          </div>

          <div className="h-[280px] sm:h-[320px] w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="driverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={teamColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={teamColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={DARK_CHART_THEME.grid.stroke} />
                <XAxis dataKey="race" stroke={DARK_CHART_THEME.axis.stroke} fontSize={11} fontStyle="mono" />
                <YAxis
                  stroke={DARK_CHART_THEME.axis.stroke}
                  fontSize={11}
                  fontStyle="mono"
                  domain={[1, 20]}
                  reversed={true}
                  ticks={[1, 5, 10, 15, 20]}
                  tickFormatter={(val) => `P${val}`}
                />
                <Tooltip
                  formatter={(val, name) => [`P${val}`, name === 'finish' ? 'Finished' : 'Started']}
                  contentStyle={DARK_CHART_THEME.tooltip}
                />
                <ReferenceLine y={3} stroke="#F59E0B" strokeDasharray="2 2" label={{ value: 'Podium Line', fill: '#F59E0B', fontSize: 10 }} />
                <ReferenceLine y={10} stroke="#64748B" strokeDasharray="2 2" label={{ value: 'Points Line', fill: '#94A3B8', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="finish"
                  stroke={teamColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#driverGrad)"
                  dot={{ r: 4, fill: teamColor }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Race Log Table */}
      <div className="bg-[#131720] rounded-xl border border-[#232936] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#232936] flex items-center justify-between">
          <h2 className="font-heading font-black text-base text-white">
            2026 Race-by-Race Classification Log
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {races.length} Grand Prix logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#0B0D12] border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Round</th>
                <th className="py-3 px-4">Grand Prix</th>
                <th className="py-3 px-4 text-center">Started</th>
                <th className="py-3 px-4 text-center">Finished</th>
                <th className="py-3 px-4 text-center">Delta</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936] font-mono text-gray-300">
              {races.map((r) => (
                <tr key={r.round} className="hover:bg-[#1E2432]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-400">R{r.round}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-white">
                    {r.race_name}
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-400">
                    P{r.grid || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    P{r.finish}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <PositionDeltaBadge delta={r.delta} />
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">
                    {r.status}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-white">
                    {r.points > 0 ? `+${r.points}` : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
