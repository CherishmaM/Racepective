import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, ArrowUpDown, Users, Award } from 'lucide-react';

import { api } from '../services/api';
import { TeamColorBar } from '../components/common/Badge';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';

export default function Analytics() {
  const [progression, setProgression] = useState([]);
  const [posChanges, setPosChanges] = useState({ data: [], race_name: '' });
  const [teammates, setTeammates] = useState([]);
  const [consistency, setConsistency] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [progRes, posRes, teamRes, constRes] = await Promise.all([
        api.getProgression('current'),
        api.getPositionChanges('current', 18),
        api.getTeammateComparison('current'),
        api.getConsistency('current')
      ]);

      setProgression(progRes.data || []);
      setPosChanges(posRes);
      setTeammates(teamRes.data || []);
      setConsistency(constRes.data || []);
      if (teamRes.data?.length > 0) {
        setSelectedTeam(teamRes.data[0]);
      }
    } catch (err) {
      setError(err.message || 'Unable to compute analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Synthesizing telemetry & computing championship analytics..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadAnalytics} />;

  // Driver line colors for progression chart
  const driverColors = {
    Antonelli: '#00D2BE',
    Russell: '#26648E',
    Hamilton: '#E8002D',
    Leclerc: '#FF3355',
    Verstappen: '#1E41FF',
    Norris: '#FF8000',
    Piastri: '#FFB800'
  };

  // Find keys present in progression objects
  const availableDriverKeys = progression.length > 0
    ? Object.keys(progression[0]).filter(k => k !== 'round' && k !== 'race')
    : [];

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#121417]">
          Championship Intelligence & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">
          Visual metrics: Title progression, grid-to-finish delta, teammate head-to-heads, and consistency indexes
        </p>
      </div>

      {/* Section 1: Championship Progression Line Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-heading font-black text-[#121417] flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#E10600]" />
              <span>Championship Points Progression</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Cumulative points accumulation round-by-round across the 2026 season
            </p>
          </div>
          <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
            Top Contenders
          </span>
        </div>

        <div className="h-[340px] sm:h-[400px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progression} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="race" stroke="#94A3B8" fontSize={11} fontStyle="mono" />
              <YAxis stroke="#94A3B8" fontSize={11} fontStyle="mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181A1F',
                  borderColor: '#2B303A',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px', paddingTop: '10px' }} />
              {availableDriverKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={driverColors[key] || '#64748B'}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: driverColors[key] || '#64748B' }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Position Changes / Overtakes Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-heading font-black text-[#121417] flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-[#E10600]" />
              <span>Grid Start vs. Race Finish Delta</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Net positions gained (+) or lost (-) during the {posChanges.race_name || 'latest Grand Prix'}
            </p>
          </div>
          <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
            Over/Under Starts
          </span>
        </div>

        <div className="h-[320px] sm:h-[360px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={posChanges.data?.slice(0, 14)} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="driver" stroke="#94A3B8" fontSize={11} fontStyle="mono" interval={0} />
              <YAxis stroke="#94A3B8" fontSize={11} fontStyle="mono" />
              <ReferenceLine y={0} stroke="#CBD5E1" strokeWidth={1.5} />
              <Tooltip
                formatter={(val) => [`${val > 0 ? `+${val}` : val} positions`, 'Delta']}
                contentStyle={{
                  backgroundColor: '#181A1F',
                  borderColor: '#2B303A',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                {posChanges.data?.slice(0, 14).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.delta > 0 ? '#10B981' : entry.delta < 0 ? '#EF4444' : '#94A3B8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 3: Teammate Head-to-Head Comparison */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-heading font-black text-[#121417] flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#E10600]" />
              <span>Teammate Head-to-Head Battles</span>
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Intra-team performance parity and constructor points contribution
            </p>
          </div>

          {/* Constructor Selector Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {teammates.map((t) => (
              <button
                key={t.constructor_name}
                onClick={() => setSelectedTeam(t)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  selectedTeam?.constructor_name === t.constructor_name
                    ? 'bg-[#121417] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.constructor_name}
              </button>
            ))}
          </div>
        </div>

        {selectedTeam && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
              <div className="flex items-center space-x-3">
                <TeamColorBar team={selectedTeam.constructor_name} />
                <div>
                  <h3 className="font-heading font-black text-xl text-[#121417]">
                    {selectedTeam.constructor_name}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    Points Difference: {selectedTeam.points_difference} PTS
                  </span>
                </div>
              </div>
            </div>

            {/* Side-by-side Driver Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver 1 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-400">
                    DRIVER 1
                  </span>
                  <span className="font-mono text-xs font-black text-[#E10600] bg-red-50 px-2 py-0.5 rounded">
                    {selectedTeam.driver_1.share_pct}% TEAM SHARE
                  </span>
                </div>
                <div className="font-heading font-black text-xl text-[#121417]">
                  {selectedTeam.driver_1.name}
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-400 block uppercase">Points</span>
                    <span className="font-bold text-base text-[#121417]">{selectedTeam.driver_1.points}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-400 block uppercase">Wins</span>
                    <span className="font-bold text-base text-[#121417]">{selectedTeam.driver_1.wins}</span>
                  </div>
                </div>
              </div>

              {/* Driver 2 */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-400">
                    DRIVER 2
                  </span>
                  <span className="font-mono text-xs font-black text-slate-700 bg-gray-100 px-2 py-0.5 rounded">
                    {selectedTeam.driver_2.share_pct}% TEAM SHARE
                  </span>
                </div>
                <div className="font-heading font-black text-xl text-[#121417]">
                  {selectedTeam.driver_2.name}
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-400 block uppercase">Points</span>
                    <span className="font-bold text-base text-[#121417]">{selectedTeam.driver_2.points}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-[10px] text-gray-400 block uppercase">Wins</span>
                    <span className="font-bold text-base text-[#121417]">{selectedTeam.driver_2.wins}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Share Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-gray-500 mb-1.5">
                <span>{selectedTeam.driver_1.name} ({selectedTeam.driver_1.share_pct}%)</span>
                <span>{selectedTeam.driver_2.name} ({selectedTeam.driver_2.share_pct}%)</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#E10600] h-full transition-all"
                  style={{ width: `${selectedTeam.driver_1.share_pct}%` }}
                ></div>
                <div
                  className="bg-[#121417] h-full transition-all"
                  style={{ width: `${selectedTeam.driver_2.share_pct}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Driver Consistency Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-heading font-black text-[#121417] flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#E10600]" />
            <span>Driver Consistency & Reliability Index</span>
          </h2>
          <p className="text-xs text-gray-500 font-mono">
            Evaluating scoring regularity, average finishing positions, and podium efficiency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4 text-center">Avg Finish</th>
                <th className="py-3 px-4 text-center">Podium Rate</th>
                <th className="py-3 px-4 text-right">Consistency Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {consistency.map((row) => (
                <tr key={row.driver_name} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-700">P{row.position}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-[#121417]">{row.driver_name}</td>
                  <td className="py-3.5 px-4 text-gray-600 font-sans">
                    <div className="flex items-center space-x-2">
                      <TeamColorBar team={row.constructor_name} />
                      <span>{row.constructor_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-700 font-bold">
                    P{row.avg_finish}
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-600">
                    {row.podium_pct}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-900 text-white font-black text-xs">
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
  );
}
