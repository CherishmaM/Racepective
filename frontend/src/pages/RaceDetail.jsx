import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, 
  Trophy, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Navigation,
  Timer,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

import { api } from '../services/api';
import { StateBadge, PositionDeltaBadge, TeamColorBar } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/LoadingSpinner';
import { DriverAvatar, CircuitOutline } from '../data/assets';

const redIcon = new L.DivIcon({
  className: 'custom-f1-marker',
  html: `<div style="
    background: #E10600;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -11],
});

export default function RaceDetail() {
  const { season = '2026', round } = useParams();
  const [race, setRace] = useState(null);
  const [activeTab, setActiveTab] = useState('race'); // 'race', 'qualifying', 'schedule'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRace = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRaceDetail(season, round);
      setRace(res.data);
    } catch (err) {
      setError(err.message || `Unable to load Round ${round} classification.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRace();
  }, [season, round]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-44 bg-[#131720] rounded-2xl animate-pulse border border-[#232936]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
          <div className="h-32 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
          <div className="h-32 bg-[#131720] rounded-xl animate-pulse border border-[#232936]"></div>
        </div>
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadRace} />;
  if (!race) return null;

  const results = race.results || [];
  const podium = race.podium || [];
  const qualifying = race.qualifying || [];
  const sessions = race.sessions || [];
  const lat = race.circuit?.location?.lat;
  const lng = race.circuit?.location?.long;

  return (
    <div className="space-y-8 pb-12 text-[#F8F9FA]">
      {/* Back button */}
      <div>
        <Link
          to="/calendar"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Race Calendar</span>
        </Link>

        {/* Grand Prix Header Hero */}
        <div className="bg-[#131720] text-white p-6 sm:p-8 rounded-2xl border border-[#232936] shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 rounded bg-[#E10600] text-white text-xs font-mono font-bold">
                ROUND {race.round}
              </span>
              <span className="text-xs font-mono text-gray-400">
                {race.season} Championship
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              {race.race_name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-300 pt-1">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
                <span>{race.circuit?.circuit_name}</span>
              </span>
              <span className="text-gray-500">&bull;</span>
              <span>{race.circuit?.location?.locality}, {race.circuit?.location?.country}</span>
              <span className="text-gray-500">&bull;</span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{race.date}</span>
              </span>
            </div>
          </div>

          {/* Winner Callout */}
          <div className="bg-[#0B0D12] p-4 rounded-xl border border-[#232936] flex items-center space-x-4 min-w-[240px]">
            <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Race Winner</div>
              <div className="font-heading font-black text-base text-white">
                {podium[0]?.driver_name || 'TBD'}
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {podium[0]?.constructor_name || 'Awaiting Results'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Podium Showcase + Circuit Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Podium Finishers (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-heading font-black text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#E10600]" />
            <span>Official Podium Finishers</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podium.map((p, index) => {
              const ranks = ['P1 Winner', 'P2 Runner-up', 'P3 Third'];
              const borders = [
                'border-amber-400/80 bg-gradient-to-b from-amber-500/15 to-[#131720]',
                'border-slate-300/80 bg-gradient-to-b from-slate-400/15 to-[#131720]',
                'border-amber-700/80 bg-gradient-to-b from-amber-700/15 to-[#131720]'
              ];
              const medals = ['text-amber-400', 'text-slate-300', 'text-amber-600'];

              return (
                <div
                  key={p.driver_id}
                  className={`bg-[#131720] rounded-xl p-5 border shadow-xs relative overflow-hidden flex flex-col justify-between ${borders[index] || 'border-[#232936]'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-bold uppercase tracking-wider ${medals[index]}`}>
                        {ranks[index]}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">
                        #{p.driver_number || '—'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <DriverAvatar
                        driverId={p.driver_id}
                        name={p.driver_name}
                        code={p.driver_code}
                        team={p.constructor_name}
                        size="md"
                      />
                      <div>
                        <Link
                          to={`/drivers/${p.driver_id}`}
                          className="font-heading font-black text-base text-white hover:text-[#E10600] transition-colors block leading-tight"
                        >
                          {p.driver_name}
                        </Link>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          {p.constructor_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#232936] flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400 truncate max-w-[110px]">
                      {p.time || 'Leader'}
                    </span>
                    <span className="font-black text-white bg-[#0B0D12] border border-[#232936] px-2 py-0.5 rounded">
                      +{p.points} PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Circuit Venue & Outline Card */}
        <div className="bg-[#131720] rounded-2xl p-5 border border-[#232936] shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-sm text-white">Circuit Location</h3>
              <p className="text-[11px] font-mono text-gray-400">{race.circuit?.circuit_name}</p>
            </div>
            {race.circuit?.circuit_id && (
              <Link
                to={`/circuits/${race.circuit.circuit_id}`}
                className="text-xs font-mono text-[#E10600] hover:underline inline-flex items-center gap-1 font-bold"
              >
                Profile &rarr;
              </Link>
            )}
          </div>

          <div className="h-44 w-full rounded-xl overflow-hidden border border-[#232936] relative z-10 bg-[#0B0D12]">
            {lat && lng ? (
              <MapContainer
                center={[lat, lng]}
                zoom={11}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', backgroundColor: '#0B0D12' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={redIcon}>
                  <Popup>
                    <div className="font-mono text-xs text-white">
                      <strong>{race.circuit?.circuit_name}</strong><br />
                      {race.circuit?.location?.locality}, {race.circuit?.location?.country}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-gray-500 bg-[#0B0D12]">
                GPS coordinates unavailable
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1 border-t border-[#232936]">
            <span>GPS: {lat?.toFixed(3)}, {lng?.toFixed(3)}</span>
            {race.circuit?.circuit_id && (
              <Link
                to={`/circuits/${race.circuit.circuit_id}`}
                className="text-[#E10600] hover:underline inline-flex items-center gap-1"
              >
                Track Geometry & Outlines &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Race Classification, Qualifying, Session Schedule */}
      <div>
        <div className="flex items-center space-x-2 border-b border-[#232936] mb-4 font-mono text-xs">
          <button
            onClick={() => setActiveTab('race')}
            className={`pb-3 font-bold transition-colors relative ${
              activeTab === 'race'
                ? 'text-white border-b-2 border-[#E10600]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Race Results ({results.length})
          </button>

          {qualifying.length > 0 && (
            <button
              onClick={() => setActiveTab('qualifying')}
              className={`pb-3 font-bold transition-colors relative ${
                activeTab === 'qualifying'
                  ? 'text-white border-b-2 border-[#E10600]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Qualifying Grid ({qualifying.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 font-bold transition-colors relative ${
              activeTab === 'schedule'
                ? 'text-white border-b-2 border-[#E10600]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Session Timetable ({sessions.length})
          </button>
        </div>

        {/* Tab 1: Race Classification Table */}
        {activeTab === 'race' && (
          <div className="bg-[#131720] rounded-xl border border-[#232936] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#0B0D12] border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-14">Pos</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Constructor</th>
                    <th className="py-3 px-4 text-center">Grid</th>
                    <th className="py-3 px-4 text-center">Delta</th>
                    <th className="py-3 px-4 text-center">Laps</th>
                    <th className="py-3 px-4">Time / Gap</th>
                    <th className="py-3 px-4">Fastest Lap</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232936] font-mono text-gray-300">
                  {results.map((r) => (
                    <tr key={r.driver_id} className="hover:bg-[#1E2432]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-400">
                        {r.position > 0 ? `P${r.position}` : 'DNF'}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold text-white">
                        <Link
                          to={`/drivers/${r.driver_id}`}
                          className="hover:text-[#E10600] transition-colors flex items-center space-x-2"
                        >
                          <DriverAvatar
                            driverId={r.driver_id}
                            name={r.driver_name}
                            code={r.driver_code}
                            team={r.constructor_name}
                            size="sm"
                          />
                          <span>{r.driver_name}</span>
                          {r.driver_code && (
                            <span className="text-[10px] font-mono text-gray-400 font-normal">
                              ({r.driver_code})
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 font-sans">
                        <div className="flex items-center space-x-2">
                          <TeamColorBar team={r.constructor_name} />
                          <span>{r.constructor_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-400">
                        P{r.grid || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <PositionDeltaBadge delta={r.position_change} />
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-400">
                        {r.laps}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {r.time || r.status}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">
                        {r.fastest_lap_time ? (
                          <span className={r.fastest_lap_rank === 1 ? 'text-purple-400 font-bold' : ''}>
                            {r.fastest_lap_time} {r.fastest_lap_rank === 1 && '🏎️'}
                          </span>
                        ) : (
                          '—'
                        )}
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
        )}

        {/* Tab 2: Qualifying Grid Table */}
        {activeTab === 'qualifying' && qualifying.length > 0 && (
          <div className="bg-[#131720] rounded-xl border border-[#232936] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#0B0D12] border-b border-[#232936] text-gray-400 font-mono uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4 w-14">Grid</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Constructor</th>
                    <th className="py-3 px-4">Q1</th>
                    <th className="py-3 px-4">Q2</th>
                    <th className="py-3 px-4">Q3 (Pole Shootout)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232936] font-mono text-gray-300">
                  {qualifying.map((q) => (
                    <tr key={q.position} className="hover:bg-[#1E2432]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-400">P{q.position}</td>
                      <td className="py-3 px-4 font-sans font-bold text-white">{q.driver_name}</td>
                      <td className="py-3 px-4 text-gray-300 font-sans">{q.constructor_name}</td>
                      <td className="py-3 px-4 text-gray-400">{q.q1 || '—'}</td>
                      <td className="py-3 px-4 text-gray-400">{q.q2 || '—'}</td>
                      <td className="py-3 px-4 font-bold text-white">{q.q3 || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Session Schedule */}
        {activeTab === 'schedule' && (
          <div className="bg-[#131720] rounded-xl border border-[#232936] p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="font-heading font-black text-base text-white">
                Grand Prix Weekend Timetable
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Official FIA session timeline across the event weekend
              </p>
            </div>

            <div className="divide-y divide-[#1E2432] font-mono text-xs">
              {sessions.map((sess, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between hover:bg-[#1E2432]/40 px-2 rounded transition-colors">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-[#E10600]" />
                    <span className="font-bold text-white text-sm font-sans">{sess.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <span>{sess.date}</span>
                    <span className="bg-[#0B0D12] border border-[#232936] px-2 py-0.5 rounded text-gray-200 font-bold">
                      {sess.time || 'TBD'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
