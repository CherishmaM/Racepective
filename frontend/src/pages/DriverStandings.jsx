import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Users, ArrowRight, ArrowUpDown, Shield } from 'lucide-react';

import { api } from '../services/api';
import { TeamColorBar, PositionDeltaBadge, getTeamColor } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/LoadingSpinner';
import { DriverAvatar } from '../data/assets';
import { PageHeaderHero } from '../components/common/WireframeAnimations';
import { PositionBadge } from '../components/common/PodiumBadge';
import { CountryFlag } from '../utils/flags';
import TeamSymbol from '../components/common/TeamSymbol';

export default function DriverStandings() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comparison selector state
  const [compareDriverAId, setCompareDriverAId] = useState('');
  const [compareDriverBId, setCompareDriverBId] = useState('');

  const loadStandings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDriverStandings('current');
      const list = res.data || [];
      setDrivers(list);
      if (list.length >= 2) {
        setCompareDriverAId(list[0].driver_id);
        setCompareDriverBId(list[1].driver_id);
      }
    } catch (err) {
      setError(err.message || 'Unable to load driver championship standings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-44 bg-gray-200 rounded-xl animate-pulse"></div>
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadStandings} />;

  const driverA = drivers.find((d) => d.driver_id === compareDriverAId);
  const driverB = drivers.find((d) => d.driver_id === compareDriverBId);
  const maxPoints = drivers[0]?.points || 1;

  // Comparison calculations
  const totalComparePoints = (driverA?.points || 0) + (driverB?.points || 0) || 1;
  const pctA = Math.round(((driverA?.points || 0) / totalComparePoints) * 100);
  const pctB = Math.round(((driverB?.points || 0) / totalComparePoints) * 100);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header Hero with Standings Trajectory Matrix */}
      <PageHeaderHero
        badge="DRIVERS CHAMPIONSHIP"
        title="2026 Driver Championship Standings"
        subtitle="Official FIA Formula One World Championship points classification, head-to-head telemetry comparisons, and points distribution"
        icon={Trophy}
        wireframeVariant="standings"
        standingsData={drivers}
        standingsType="drivers"
        actions={
          <Link
            to="/standings/constructors"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E232C] hover:bg-[#282E3A] border border-[#2B303A] text-xs font-mono font-bold text-white shadow-xs transition-all hover:border-gray-500"
          >
            <Shield className="w-4 h-4 text-[#E10600]" />
            <span>Switch to Constructors &rarr;</span>
          </Link>
        }
      />

      {/* Driver Head-to-Head Comparison Card */}
      {driverA && driverB && (
        <div className="bg-[#131720] rounded-2xl border border-[#232936] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2432]">
            <div>
              <h2 className="text-sm font-heading font-black uppercase tracking-wider text-gray-400 font-mono">
                Driver Comparison Engine
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Select any two drivers to compare championship performance side-by-side
              </p>
            </div>

            {/* Selectors */}
            <div className="flex items-center space-x-2 font-mono text-xs">
              <select
                value={compareDriverAId}
                onChange={(e) => setCompareDriverAId(e.target.value)}
                className="bg-[#171D27] border border-[#2A3344] rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-[#E10600]"
              >
                {drivers.map((d) => (
                  <option key={d.driver_id} value={d.driver_id} className="bg-[#131720] text-white">
                    P{d.position} {d.driver_name}
                  </option>
                ))}
              </select>

              <span className="text-gray-500 font-bold">vs</span>

              <select
                value={compareDriverBId}
                onChange={(e) => setCompareDriverBId(e.target.value)}
                className="bg-[#171D27] border border-[#2A3344] rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none focus:border-[#E10600]"
              >
                {drivers.map((d) => (
                  <option key={d.driver_id} value={d.driver_id} className="bg-[#131720] text-white">
                    P{d.position} {d.driver_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side by side cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driver A Card */}
            <div className="bg-[#171D27] p-4 rounded-xl border border-[#232B38] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DriverAvatar
                  driverId={driverA.driver_id}
                  name={driverA.driver_name}
                  code={driverA.driver_code}
                  team={driverA.constructor_name}
                  size="md"
                />
                <div>
                  <div className="font-heading font-black text-base text-white">
                    {driverA.driver_name}
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
                    <TeamColorBar team={driverA.constructor_name} />
                    <span>{driverA.constructor_name} &bull; P{driverA.position}</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-lg font-black text-white">{driverA.points} <span className="text-xs font-normal text-gray-400">PTS</span></div>
                <div className="text-xs text-gray-400">{driverA.wins} {driverA.wins === 1 ? 'Win' : 'Wins'}</div>
              </div>
            </div>

            {/* Driver B Card */}
            <div className="bg-[#171D27] p-4 rounded-xl border border-[#232B38] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DriverAvatar
                  driverId={driverB.driver_id}
                  name={driverB.driver_name}
                  code={driverB.driver_code}
                  team={driverB.constructor_name}
                  size="md"
                />
                <div>
                  <div className="font-heading font-black text-base text-white">
                    {driverB.driver_name}
                  </div>
                  <div className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
                    <TeamColorBar team={driverB.constructor_name} />
                    <span>{driverB.constructor_name} &bull; P{driverB.position}</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-lg font-black text-white">{driverB.points} <span className="text-xs font-normal text-gray-400">PTS</span></div>
                <div className="text-xs text-gray-400">{driverB.wins} {driverB.wins === 1 ? 'Win' : 'Wins'}</div>
              </div>
            </div>
          </div>

          {/* Share Comparison Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
              <span>{driverA.driver_name} ({pctA}%)</span>
              <span>Points Delta: {Math.abs(driverA.points - driverB.points)} PTS</span>
              <span>{driverB.driver_name} ({pctB}%)</span>
            </div>
            <div className="w-full bg-[#1E2432] h-2.5 rounded-full overflow-hidden flex border border-[#2B3342]">
              <div className="bg-[#E10600] h-full transition-all" style={{ width: `${pctA}%` }}></div>
              <div className="bg-[#2B3345] h-full transition-all" style={{ width: `${pctB}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Standings Full Classification Table */}
      <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#181D28]/90 border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-14">Pos</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Constructor</th>
                <th className="py-3 px-4 text-center">Number</th>
                <th className="py-3 px-4">Nationality</th>
                <th className="py-3 px-4 text-center">Wins</th>
                <th className="py-3 px-4 w-44 hidden md:table-cell">Leader Ratio</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2432] font-mono">
              {drivers.map((d) => {
                const pct = Math.round((d.points / maxPoints) * 100);
                const isLeader = d.position === 1;
                const teamColor = getTeamColor(d.constructor_name);

                return (
                  <tr
                    key={d.driver_id}
                    className={`hover:bg-[#181D28]/80 transition-colors border-l-4 ${
                      isLeader ? 'bg-amber-950/20' : ''
                    }`}
                    style={{ borderLeftColor: teamColor }}
                  >
                    <td className="py-4 px-4 font-bold text-gray-300">
                      <PositionBadge position={d.position} />
                    </td>

                    <td className="py-4 px-4 font-sans font-bold text-white">
                      <div className="flex items-center space-x-3">
                        <DriverAvatar
                          driverId={d.driver_id}
                          name={d.driver_name}
                          code={d.driver_code}
                          team={d.constructor_name}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/drivers/${d.driver_id}`}
                              className="hover:text-[#E10600] transition-colors text-base font-heading font-black text-white"
                            >
                              {d.driver_name}
                            </Link>
                            {d.driver_number && (
                              <span className="text-[11px] font-mono font-bold text-gray-300 bg-[#1E2432] border border-[#2B3345] px-2 py-0.5 rounded">
                                #{d.driver_number}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 font-mono block -mt-0.5">
                            {d.driver_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-300 font-sans">
                      <div className="flex items-center space-x-2">
                        <TeamColorBar team={d.constructor_name} />
                        <TeamSymbol team={d.constructor_name} className="w-4 h-4 shrink-0" />
                        <span className="font-medium">{d.constructor_name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center text-gray-400 font-bold">
                      <span className="px-2 py-0.5 rounded bg-[#1E2432] text-gray-300 border border-[#2B3345] text-xs">
                        #{d.driver_number || '—'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-300 font-sans">
                      <div className="flex items-center space-x-2.5">
                        <CountryFlag country={d.nationality} size="sm" />
                        <span className="text-gray-200">{d.nationality}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold">
                      <span className="bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold px-2.5 py-0.5 rounded-md text-xs">
                        {d.wins || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="w-full bg-[#1E2432] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: teamColor }}
                        ></div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="text-base font-heading font-black text-white">
                        {d.points}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono block -mt-1 uppercase">
                        PTS
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/drivers/${d.driver_id}`}
                        className="text-xs font-semibold text-[#E10600] hover:text-red-400 inline-flex items-center gap-1 font-mono transition-colors"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
