import React, { useEffect, useState } from 'react';
import { Trophy, ShieldCheck, Award } from 'lucide-react';

import { api } from '../services/api';
import { TeamColorBar } from '../components/common/Badge';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';

export default function Standings() {
  const [tab, setTab] = useState('drivers'); // 'drivers' or 'constructors'
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStandings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dRes, cRes] = await Promise.all([
        api.getDriverStandings('current'),
        api.getConstructorStandings('current')
      ]);
      setDrivers(dRes.data || []);
      setConstructors(cRes.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load championship standings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandings();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating 2026 World Championship Standings..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadStandings} />;

  const maxDriverPoints = drivers[0]?.points || 1;
  const maxConstructorPoints = constructors[0]?.points || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-[#121417]">
            2026 World Championship Standings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">
            Official points classification updated after each Grand Prix round
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs font-mono text-xs">
          <button
            onClick={() => setTab('drivers')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === 'drivers' ? 'bg-[#121417] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Drivers ({drivers.length})</span>
          </button>
          <button
            onClick={() => setTab('constructors')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === 'constructors' ? 'bg-[#121417] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Constructors ({constructors.length})</span>
          </button>
        </div>
      </div>

      {/* Driver Standings Table */}
      {tab === 'drivers' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-16">Pos</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Constructor</th>
                  <th className="py-3 px-4">Nationality</th>
                  <th className="py-3 px-4 text-center">Wins</th>
                  <th className="py-3 px-4 w-48 hidden md:table-cell">Points Ratio</th>
                  <th className="py-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {drivers.map((d) => {
                  const pct = Math.round((d.points / maxDriverPoints) * 100);
                  const isLeader = d.position === 1;

                  return (
                    <tr
                      key={d.driver_id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isLeader ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {isLeader ? (
                          <span className="flex items-center text-amber-500 font-black">
                            1 <Award className="w-3.5 h-3.5 ml-1" />
                          </span>
                        ) : (
                          d.position
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-[#121417]">
                        <div className="flex items-center space-x-2">
                          <span>{d.driver_name}</span>
                          {d.driver_number && (
                            <span className="text-[10px] font-mono text-gray-400 font-normal">
                              #{d.driver_number}
                            </span>
                          )}
                          {d.driver_code && (
                            <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-normal">
                              {d.driver_code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 font-sans">
                        <div className="flex items-center space-x-2">
                          <TeamColorBar team={d.constructor_name} />
                          <span>{d.constructor_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-sans">{d.nationality}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {d.wins > 0 ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">
                            {d.wins}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#E10600] h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-[#121417]">
                        {d.points} <span className="text-gray-400 text-xs font-normal">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Constructor Standings Table */}
      {tab === 'constructors' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-mono uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-16">Pos</th>
                  <th className="py-3 px-4">Constructor</th>
                  <th className="py-3 px-4">Headquarters</th>
                  <th className="py-3 px-4 text-center">Wins</th>
                  <th className="py-3 px-4 w-48 hidden md:table-cell">Championship Share</th>
                  <th className="py-3 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {constructors.map((c) => {
                  const pct = Math.round((c.points / maxConstructorPoints) * 100);
                  const isLeader = c.position === 1;

                  return (
                    <tr
                      key={c.constructor_id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isLeader ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-800">
                        {isLeader ? (
                          <span className="flex items-center text-amber-500 font-black">
                            1 <Award className="w-3.5 h-3.5 ml-1" />
                          </span>
                        ) : (
                          c.position
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-[#121417]">
                        <div className="flex items-center space-x-2">
                          <TeamColorBar team={c.constructor_name} />
                          <span>{c.constructor_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-sans">{c.nationality}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {c.wins > 0 ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">
                            {c.wins}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#121417] h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-[#121417]">
                        {c.points} <span className="text-gray-400 text-xs font-normal">PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
