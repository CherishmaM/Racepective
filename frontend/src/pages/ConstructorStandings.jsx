import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trophy, Award, Users, ArrowRight } from 'lucide-react';

import { api } from '../services/api';
import { TeamColorBar, getTeamColor } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/LoadingSpinner';
import { PageHeaderHero } from '../components/common/WireframeAnimations';
import { PositionBadge } from '../components/common/PodiumBadge';
import { CountryFlag } from '../utils/flags';
import TeamSymbol from '../components/common/TeamSymbol';

export default function ConstructorStandings() {
  const [constructors, setConstructors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConstructors = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cRes, dRes] = await Promise.all([
        api.getConstructorStandings('current'),
        api.getDriverStandings('current').catch(() => ({ data: [] }))
      ]);
      setConstructors(cRes.data || []);
      setDrivers(dRes.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load constructor championship standings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConstructors();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadConstructors} />;

  const maxPoints = constructors[0]?.points || 1;

  // Group drivers by constructor
  const driversByTeam = {};
  drivers.forEach((d) => {
    const key = d.constructor_name;
    if (!driversByTeam[key]) driversByTeam[key] = [];
    driversByTeam[key].push(d);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header Hero with Standings Trajectory Matrix */}
      <PageHeaderHero
        badge="CONSTRUCTORS CHAMPIONSHIP"
        title="2026 Constructor Championship Standings"
        subtitle="World Constructors' Championship rankings, team headquarters, engineering squads, and points distribution"
        icon={ShieldCheck}
        wireframeVariant="standings"
        standingsData={constructors}
        standingsType="constructors"
        actions={
          <Link
            to="/standings/drivers"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1E232C] hover:bg-[#282E3A] border border-[#2B303A] text-xs font-mono font-bold text-white shadow-xs transition-all hover:border-gray-500"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Switch to Drivers &rarr;</span>
          </Link>
        }
      />

      {/* Constructor Standings Table */}
      <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#181D28]/90 border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4 w-14">Pos</th>
                <th className="py-3.5 px-4">Constructor</th>
                <th className="py-3.5 px-4">Driver Squad</th>
                <th className="py-3.5 px-4">Headquarters</th>
                <th className="py-3.5 px-4 text-center">Wins</th>
                <th className="py-3.5 px-4 w-48 hidden md:table-cell">Points Share</th>
                <th className="py-3.5 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2432] font-mono">
              {constructors.map((c) => {
                const pct = Math.round((c.points / maxPoints) * 100);
                const isLeader = c.position === 1;
                const teamDrivers = driversByTeam[c.constructor_name] || [];
                const teamColor = getTeamColor(c.constructor_name);

                return (
                  <tr
                    key={c.constructor_id}
                    className={`hover:bg-[#181D28]/80 transition-colors border-l-4 ${
                      isLeader ? 'bg-amber-950/20' : ''
                    }`}
                    style={{ borderLeftColor: teamColor }}
                  >
                    <td className="py-4 px-4 font-bold text-gray-300">
                      <PositionBadge position={c.position} />
                    </td>

                    <td className="py-4 px-4 font-sans font-bold text-white">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-1.5 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: teamColor }}
                        />
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-[#161B24] border border-[#262F3E] flex items-center justify-center p-2 shadow-xs group-hover:border-[#384358] transition-colors">
                          <TeamSymbol
                            team={c.constructor_name}
                            className="w-5 h-5 transition-transform hover:scale-110"
                          />
                        </div>
                        <div>
                          <span className="text-base font-heading font-black block text-white">
                            {c.constructor_name}
                          </span>
                          <span className="text-[11px] text-gray-500 font-mono block -mt-0.5 lowercase">
                            {c.constructor_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-sans text-xs">
                      {teamDrivers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {teamDrivers.map((d) => (
                            <Link
                              key={d.driver_id}
                              to={`/drivers/${d.driver_id}`}
                              className="px-2.5 py-1 rounded-md bg-[#1A202C] hover:bg-[#252C3D] text-slate-200 hover:text-white text-xs font-mono font-medium transition-colors border border-[#2A3446] inline-flex items-center gap-1"
                            >
                              <span>{d.driver_name.split(' ').pop()}</span>
                              <span className="text-gray-400 font-bold">
                                (#{d.driver_number || '—'})
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 font-mono text-xs">2026 Lineup</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-gray-300 font-sans">
                      <div className="flex items-center space-x-2.5">
                        <CountryFlag country={c.nationality} size="sm" />
                        <span className="font-medium text-xs sm:text-sm text-gray-200">{c.nationality}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center font-bold">
                      <span className="bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold px-2.5 py-0.5 rounded-md text-xs">
                        {c.wins || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                          <span>{pct}% share</span>
                        </div>
                        <div className="w-full bg-[#1E2432] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: teamColor }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="text-base sm:text-lg font-heading font-black text-white">
                        {c.points}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono block -mt-1 uppercase tracking-wider">
                        PTS
                      </span>
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
