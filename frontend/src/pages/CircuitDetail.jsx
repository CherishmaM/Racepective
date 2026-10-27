import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  ArrowLeft, 
  MapPin, 
  Flag, 
  Calendar, 
  Trophy, 
  Award, 
  ExternalLink, 
  Navigation,
  Compass,
  ArrowRight,
  Info,
  CheckCircle2,
  Shield
} from 'lucide-react';

import { api } from '../services/api';
import { CircuitOutline, CIRCUIT_ASSETS } from '../data/assets';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import CircuitSectorMap from '../components/circuits/CircuitSectorMap';

// Custom red Leaflet motorsport marker
const redIcon = new L.DivIcon({
  className: 'custom-f1-marker',
  html: `<div style="
    background: #E10600;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  "><div style="background: white; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

export default function CircuitDetail() {
  const { circuitId } = useParams();
  const [circuit, setCircuit] = useState(null);
  const [history, setHistory] = useState(null);
  const [matchedRace, setMatchedRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    async function loadCircuitData() {
      try {
        setLoading(true);
        setError(null);
        setTileError(false);

        const [circRes, histRes, schedRes] = await Promise.all([
          api.getCircuitDetail(circuitId),
          api.getCircuitHistory(circuitId).catch(() => ({ data: null })),
          api.getCalendar('current').catch(() => ({ data: [] }))
        ]);

        const circData = circRes.data;
        if (!circData) {
          throw new Error(`Circuit '${circuitId}' not found.`);
        }

        setCircuit(circData);
        setHistory(histRes.data || null);

        const race = (schedRes.data || []).find(
          (r) => r.circuit?.circuit_id === circuitId
        );
        setMatchedRace(race || null);
      } catch (err) {
        setError(err.message || 'Unable to load circuit telemetry.');
      } finally {
        setLoading(false);
      }
    }

    loadCircuitData();
  }, [circuitId]);

  if (loading) return <LoadingSpinner message={`Loading circuit records for ${circuitId}...`} />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!circuit) return null;

  const lat = circuit.location?.lat || 0;
  const lng = circuit.location?.long || 0;
  const asset = CIRCUIT_ASSETS[circuitId.toLowerCase().replace(/-/g, '_')];

  return (
    <div className="space-y-8 pb-16">
      {/* Back Navigation */}
      <div>
        <Link
          to="/circuits"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-gray-500 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Circuit Geography & World Map</span>
        </Link>

        {/* Hero Card */}
        <div className="bg-[#121417] text-white p-6 sm:p-8 rounded-2xl border border-[#2B303A] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-[#E10600] text-xs font-mono font-bold text-white uppercase">
                FIA Grade 1 Circuit
              </span>
              <span className="text-xs font-mono text-gray-400">
                {circuit.location?.country}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              {circuit.circuit_name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-300 pt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{circuit.location?.locality}, {circuit.location?.country}</span>
              </span>
              <span className="text-gray-600">&bull;</span>
              <span>GPS: {lat.toFixed(4)}°, {lng.toFixed(4)}°</span>
            </div>
          </div>

          {/* External Wiki Link */}
          {circuit.url && (
            <a
              href={circuit.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#1F232B] hover:bg-[#2A2F3A] text-xs font-mono text-gray-200 border border-[#2E333E] transition-colors self-start md:self-center"
            >
              <span>Wikipedia Venue History</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Official Interactive Sector & Telemetry Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-heading font-black text-white uppercase tracking-wide flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse"></span>
            <span>Circuit Sector Breakdown & Live Telemetry Map</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 font-bold">
            BROADCAST TELEMETRY
          </span>
        </div>
        <CircuitSectorMap circuitId={circuitId} circuit={circuit} showControls={true} interactive={true} />
      </div>

      {/* Visual Track Inspection: Genuine Circuit Outline + High-Zoom Location Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genuine Circuit Track Outline */}
        <div className="space-y-2">
          <h2 className="text-sm font-heading font-black text-white uppercase tracking-wide flex items-center space-x-2">
            <Flag className="w-4 h-4 text-[#E10600]" />
            <span>Track Layout Outline</span>
          </h2>
          <CircuitOutline circuitId={circuitId} circuitName={circuit.circuit_name} />
        </div>

        {/* High-Zoom Satellite / OpenStreetMap Location Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-heading font-black text-white uppercase tracking-wide flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#E10600]" />
              <span>Track Location & Surroundings</span>
            </h2>
            <span className="text-[11px] font-mono text-gray-400">OpenStreetMap GPS Coordinates</span>
          </div>

          <div className="h-[340px] sm:h-[400px] rounded-2xl overflow-hidden border border-[#232936] shadow-xs relative bg-[#0B0D12]">
            {tileError && (
              <div className="absolute top-2 left-2 z-20 bg-amber-500/90 text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-xs">
                Tile server degraded — map coordinates verified
              </div>
            )}

            <MapContainer
              center={[lat, lng]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%', backgroundColor: '#0B0D12' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  tileerror: () => setTileError(true)
                }}
              />
              <Marker position={[lat, lng]} icon={redIcon}>
                <Popup>
                  <div className="p-1 font-mono text-xs">
                    <span className="font-bold text-[#121417] block">{circuit.circuit_name}</span>
                    <span className="text-gray-500 block">{circuit.location?.locality}, {circuit.location?.country}</span>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Track Specifications & Calendar Pairing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
          <span className="text-gray-400 uppercase text-[10px] block">Track Length</span>
          <span className="text-xl font-black text-white block mt-1">
            {asset?.lap_length_km ? `${asset.lap_length_km} km` : 'Standard GP Track'}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            {asset?.lap_length_km ? `${(asset.lap_length_km * 0.621371).toFixed(2)} miles` : 'FIA Approved'}
          </span>
        </div>

        <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
          <span className="text-gray-400 uppercase text-[10px] block">Corner Count</span>
          <span className="text-xl font-black text-white block mt-1">
            {asset?.turns ? `${asset.turns} Turns` : '--'}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">High-speed & technical</span>
        </div>

        <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
          <span className="text-gray-400 uppercase text-[10px] block">Pole Win Conversion</span>
          <span className="text-xl font-black text-indigo-400 block mt-1">
            {history?.pole_win_pct ? `${history.pole_win_pct}%` : '--'}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            {history?.pole_wins || 0} won from Grid 1
          </span>
        </div>

        <div className="bg-[#131720] p-4 rounded-xl border border-[#232936] shadow-xs">
          <span className="text-gray-400 uppercase text-[10px] block">Season Status</span>
          <span className="text-xl font-black text-[#E10600] block mt-1">
            {matchedRace ? `Round ${matchedRace.round}` : 'Historic Track'}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block truncate">
            {matchedRace?.race_name || 'World Championship circuit'}
          </span>
        </div>
      </div>

      {/* Host Grand Prix Callout */}
      {matchedRace && (
        <div className="bg-[#131720] text-white p-6 rounded-2xl border border-[#232936] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E10600]">
              Championship Calendar Event
            </span>
            <h3 className="font-heading font-black text-lg text-white">
              {matchedRace.race_name} (Round {matchedRace.round})
            </h3>
            <p className="text-xs font-mono text-gray-400 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Event Date: {matchedRace.date}</span>
              <span>&bull;</span>
              <span>Status: {matchedRace.state}</span>
            </p>
          </div>

          <Link
            to={`/races/${matchedRace.season}/${matchedRace.round}`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#E10600] hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors self-start sm:self-center shadow-xs"
          >
            <span>View Grand Prix Results & Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Historical Dominance & Recent Winners */}
      {history && (
        <div className="space-y-6">
          <div className="bg-[#131720] p-6 rounded-2xl border border-[#232936] shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-[#E10600]">
              <Info className="w-4 h-4" />
              <h3 className="font-heading font-black text-base text-white uppercase tracking-wide">
                Historical Grand Prix Records & Dominance
              </h3>
            </div>
            <p className="text-xs font-mono text-gray-300 leading-relaxed bg-[#0B0D12] p-4 rounded-xl border border-[#232936]">
              {history.insight}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Top Winning Drivers */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-gray-400 block">
                  Most Successful Drivers
                </span>
                <div className="space-y-2">
                  {(history.top_drivers || []).slice(0, 4).map((d) => (
                    <div key={d.name} className="flex justify-between items-center bg-[#0B0D12] p-2.5 rounded-lg border border-[#232936] font-mono text-xs">
                      <span className="font-bold text-white">{d.name}</span>
                      <span className="text-[#E10600] font-black">{d.wins} Wins</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Winning Constructors */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-gray-400 block">
                  Most Successful Constructors
                </span>
                <div className="space-y-2">
                  {(history.top_constructors || []).slice(0, 4).map((c) => (
                    <div key={c.name} className="flex justify-between items-center bg-[#0B0D12] p-2.5 rounded-lg border border-[#232936] font-mono text-xs">
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="text-blue-400 font-black">{c.wins} Wins</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Winners Log Table */}
          <div className="bg-[#131720] rounded-2xl border border-[#232936] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#232936] flex items-center justify-between">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-wider">
                Recent Grand Prix Winners at {circuit.circuit_name}
              </h3>
              <span className="text-[11px] font-mono text-gray-400">Jolpica-F1 Official Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#0B0D12] border-b border-[#232936] text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Season</th>
                    <th className="py-2.5 px-4">Winner</th>
                    <th className="py-2.5 px-4">Constructor</th>
                    <th className="py-2.5 px-4 text-center">Start Grid</th>
                    <th className="py-2.5 px-4 text-center">Pole Conversion</th>
                    <th className="py-2.5 px-4 text-right">Race Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232936] text-gray-300">
                  {(history.recent_winners || []).map((w, idx) => (
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
    </div>
  );
}
