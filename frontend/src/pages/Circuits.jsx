import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  ExternalLink, 
  Compass, 
  Calendar,
  Layers,
  Flag,
  ArrowRight,
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

import { api } from '../services/api';
import { LoadingSpinner, ErrorMessage } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { CIRCUIT_ASSETS } from '../data/assets';
import { PageHeaderHero, CircuitWireframe } from '../components/common/WireframeAnimations';
import { CountryFlag } from '../utils/flags';
import CircuitSectorMap from '../components/circuits/CircuitSectorMap';

// Standard Leaflet marker icon with racing-red accent
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

// Pulsing animated Leaflet marker icon for the upcoming Grand Prix circuit
const upcomingIcon = new L.DivIcon({
  className: 'custom-f1-upcoming-marker',
  html: `<div style="
    position: relative;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #E10600;
      opacity: 0.55;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    "></div>
    <div style="
      background: #E10600;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 16px rgba(225,6,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 10;
    ">
      <div style="background: white; width: 7px; height: 7px; border-radius: 50%;"></div>
    </div>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

// Helper component to smoothly fly to selected circuit
function FlyToLocation({ coords, zoom = 10 }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, zoom, { duration: 1.5 });
    }
  }, [coords, zoom, map]);
  return null;
}

export default function Circuits() {
  const [searchParams] = useSearchParams();
  const [circuits, setCircuits] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [upcomingRace, setUpcomingRace] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [viewMode, setViewMode] = useState('sectors'); // 'sectors' (authentic telemetry sector map) | 'world' (geographic pins)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tileError, setTileError] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setTileError(false);
      const [circRes, schedRes, nextRes] = await Promise.all([
        api.getCircuits('current'),
        api.getCalendar('current').catch(() => ({ data: [] })),
        api.getNextRace().catch(() => null)
      ]);
      const list = circRes.data || [];
      const scheduleList = schedRes.data || [];
      const nextRaceData = nextRes?.data || scheduleList.find(r => r.state === 'UPCOMING') || null;

      setCircuits(list);
      setSchedule(scheduleList);
      setUpcomingRace(nextRaceData);

      // Determine initial selected circuit (requested query > upcoming race > list[0])
      const queryCircuit = searchParams.get('circuit')?.toLowerCase();
      const upcomingCircuitId = nextRaceData?.circuit?.circuit_id?.toLowerCase();

      let target = null;
      if (queryCircuit) {
        target = list.find(c => c.circuit_id?.toLowerCase() === queryCircuit || c.circuit_name?.toLowerCase().includes(queryCircuit));
      }
      if (!target && upcomingCircuitId) {
        target = list.find(c => c.circuit_id?.toLowerCase() === upcomingCircuitId || c.circuit_name?.toLowerCase().includes(upcomingCircuitId));
      }
      if (!target && list.length > 0) {
        target = list[0];
      }

      if (target) {
        setSelectedCircuit(target);
        if (target.location?.lat && target.location?.long) {
          setSelectedCoords([target.location.lat, target.location.long]);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to load circuit coordinates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  if (loading) return <LoadingSpinner message="Mapping World Championship Circuits..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  const upcomingRound = upcomingRace?.round || 19;

  // Helper to match a circuit to its scheduled championship race
  const getCircuitRace = (circuitId) => {
    if (!circuitId) return null;
    const cleanId = circuitId.toLowerCase().replace(/[-_\s]/g, '');
    return schedule.find((r) => {
      const rCid = (r.circuit?.circuit_id || '').toLowerCase().replace(/[-_\s]/g, '');
      return rCid === cleanId;
    });
  };

  const filtered = circuits.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const race = getCircuitRace(c.circuit_id);
    return (
      c.circuit_name.toLowerCase().includes(q) ||
      c.location?.locality?.toLowerCase().includes(q) ||
      c.location?.country?.toLowerCase().includes(q) ||
      (race?.race_name && race.race_name.toLowerCase().includes(q))
    );
  });

  // Upcoming championship circuits (Round >= upcomingRound or state === 'UPCOMING')
  const upcomingCircuits = filtered
    .filter((c) => {
      const race = getCircuitRace(c.circuit_id);
      if (race) {
        return race.state === 'UPCOMING' || race.round >= upcomingRound;
      }
      return c.circuit_id === upcomingRace?.circuit?.circuit_id;
    })
    .sort((a, b) => {
      const rA = getCircuitRace(a.circuit_id);
      const rB = getCircuitRace(b.circuit_id);
      return (rA?.round ?? 999) - (rB?.round ?? 999);
    });

  // Past concluded championship circuits
  const pastCircuits = filtered
    .filter((c) => {
      const race = getCircuitRace(c.circuit_id);
      if (race) {
        return race.state === 'COMPLETED' || race.round < upcomingRound;
      }
      return c.circuit_id !== upcomingRace?.circuit?.circuit_id;
    })
    .sort((a, b) => {
      const rA = getCircuitRace(a.circuit_id);
      const rB = getCircuitRace(b.circuit_id);
      return (rA?.round ?? 999) - (rB?.round ?? 999);
    });

  const handleSelectCircuit = (circuit) => {
    setSelectedCircuit(circuit);
    const lat = circuit.location?.lat;
    const lng = circuit.location?.long;
    if (lat && lng) {
      setSelectedCoords([lat, lng]);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleFocusUpcoming = () => {
    if (!upcomingRace?.circuit) return;
    const upId = upcomingRace.circuit.circuit_id?.toLowerCase();
    const target = circuits.find(c => c.circuit_id?.toLowerCase() === upId || c.circuit_name?.toLowerCase().includes(upId));
    if (target) {
      handleSelectCircuit(target);
    }
  };

  // Find corresponding race in calendar
  const matchedRace = schedule.find(
    (r) => r.circuit?.circuit_id === selectedCircuit?.circuit_id
  );

  const selectedAsset = selectedCircuit
    ? CIRCUIT_ASSETS[selectedCircuit.circuit_id?.toLowerCase().replace(/-/g, '_')]
    : null;

  const renderCircuitCard = (c, isUpcomingSection = false) => {
    const isSelected = selectedCircuit?.circuit_id === c.circuit_id;
    const isNextRace = c.circuit_id === upcomingRace?.circuit?.circuit_id;
    const lat = c.location?.lat;
    const lng = c.location?.long;
    const asset = CIRCUIT_ASSETS[c.circuit_id?.toLowerCase().replace(/-/g, '_')];
    const race = getCircuitRace(c.circuit_id);

    return (
      <div
        key={c.circuit_id}
        tabIndex={0}
        role="button"
        aria-label={`Select ${c.circuit_name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSelectCircuit(c);
          }
        }}
        onClick={() => handleSelectCircuit(c)}
        className={`bg-[#131720] rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between group focus:outline-hidden focus:ring-2 focus:ring-[#E10600] relative overflow-hidden ${
          isSelected
            ? 'border-[#E10600] ring-2 ring-red-500/20 shadow-lg border-l-4 border-l-[#E10600]'
            : isNextRace
            ? 'border-emerald-500/60 hover:border-emerald-400 hover:shadow-md border-l-4 border-l-emerald-500'
            : isUpcomingSection
            ? 'border-[#263142] hover:border-[#3D4D68] hover:shadow-xs border-l-4 border-l-cyan-500/70'
            : 'border-[#202633] hover:border-[#333E52] hover:shadow-xs border-l-4 border-l-[#2E3646]'
        }`}
      >
        <div className="space-y-2">
          {/* Top metadata pill bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 min-w-0">
              <CountryFlag country={c.location?.country} size="xs" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 truncate">
                {c.location?.country}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {isNextRace ? (
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded font-black border border-emerald-700/80 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>NEXT GP &bull; RD {race?.round || 19}</span>
                </span>
              ) : isUpcomingSection && race ? (
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded font-bold border border-cyan-800/60">
                  RD {race.round} &bull; UPCOMING
                </span>
              ) : race ? (
                <span className="text-[10px] font-mono text-gray-400 bg-[#1A1F2C] px-2 py-0.5 rounded font-medium border border-[#2B3448]">
                  RD {race.round} &bull; COMPLETED
                </span>
              ) : (
                <span className="text-[10px] font-mono text-gray-500 bg-[#161B24] px-1.5 py-0.5 rounded border border-[#232938]">
                  CALENDAR VENUE
                </span>
              )}
            </div>
          </div>

          {/* Grand Prix & Circuit Name */}
          <div className="pt-0.5">
            {race?.race_name && (
              <div className="text-[11px] font-mono font-bold text-gray-300 flex items-center space-x-1 mb-0.5">
                <Flag className="w-3 h-3 text-[#E10600] shrink-0" />
                <span className="truncate">{race.race_name}</span>
              </div>
            )}
            <h3 className="font-heading font-black text-sm sm:text-base text-white group-hover:text-[#E10600] transition-colors leading-snug line-clamp-1">
              {c.circuit_name}
            </h3>
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mt-1">
              <span className="flex items-center space-x-1 truncate">
                <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                <span className="truncate">{c.location?.locality}</span>
              </span>
              {race?.date && (
                <span className="flex items-center space-x-1 text-gray-400 shrink-0 text-[11px]">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span>{race.date}</span>
                </span>
              )}
            </div>
          </div>

          {/* Technical badges: layout status + coordinates */}
          <div className="flex items-center space-x-2 pt-1 text-[10px] font-mono">
            {asset?.hasOutline ? (
              <span className="text-emerald-400/90 bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium border border-emerald-900/50 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Layout</span>
              </span>
            ) : (
              <span className="text-gray-500 bg-[#161B24] px-1.5 py-0.5 rounded border border-[#242C3B]">
                GPS Trace
              </span>
            )}
            {lat && (
              <span className="text-gray-500 hidden sm:inline">
                {lat.toFixed(2)}°, {lng.toFixed(2)}°
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-3.5 pt-2.5 border-t border-[#1E2432] flex items-center justify-between text-xs font-mono">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectCircuit(c);
            }}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
              isSelected
                ? 'text-[#E10600] bg-red-950/50 font-bold'
                : 'text-gray-400 hover:text-white hover:bg-[#1A202C]'
            }`}
            title="Focus this circuit on the map above"
          >
            <Navigation className="w-3 h-3" />
            <span>{isSelected ? 'Active on Map' : 'Focus Map'}</span>
          </button>

          <Link
            to={`/circuits/${c.circuit_id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1 text-[#E10600] hover:text-red-400 font-bold transition-colors py-1 px-1.5 hover:underline"
          >
            <span>Track Profile</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header Hero with Circuit Wireframe (Always displays Upcoming GP circuit) */}
      <PageHeaderHero
        badge="CIRCUIT GEOGRAPHY"
        title="World Circuit Geography & Interactive Map"
        subtitle="Verified geographic coordinates across Formula One host circuits with OpenStreetMap tiles and authentic track telemetry"
        icon={Compass}
        wireframeVariant="circuit"
        circuit={upcomingRace?.circuit?.circuit_id || 'rodriguez'}
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {upcomingRace && (
              <button
                onClick={handleFocusUpcoming}
                className="px-3.5 py-2 rounded-xl bg-[#E10600] hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs shrink-0"
                title="Fly directly to the upcoming Grand Prix track on the map"
              >
                <Navigation className="w-3.5 h-3.5 animate-pulse" />
                <span>Upcoming GP: {upcomingRace.circuit?.location?.locality || upcomingRace.race_name}</span>
              </button>
            )}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                aria-label="Search Grand Prix circuits by name, city, or country"
                placeholder="Search venue, city or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-[#1E232C] border border-[#2B303A] text-white placeholder-gray-500 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
              />
            </div>
          </div>
        }
      />

      {/* View Switcher: Sector & Telemetry Map (Default, matches user request) vs World GPS Pins */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-3 rounded-2xl border border-[#212735]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('sectors')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-xs ${
              viewMode === 'sectors'
                ? 'bg-[#E10600] text-white shadow-red-900/40 ring-1 ring-red-400/30'
                : 'bg-[#181D26] text-gray-400 hover:text-white hover:bg-[#202735]'
            }`}
          >
            <div className="flex items-center -space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
              <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
            </div>
            <span>Sector & Telemetry Map</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              LIVE CAR ANIMATION
            </span>
          </button>

          <button
            onClick={() => setViewMode('world')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
              viewMode === 'world'
                ? 'bg-[#E10600] text-white shadow-red-900/40 ring-1 ring-red-400/30'
                : 'bg-[#181D26] text-gray-400 hover:text-white hover:bg-[#202735]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>World Geographic GPS</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
          <span className="text-gray-500">Active Circuit:</span>
          <strong className="text-white font-bold">{selectedCircuit?.circuit_name || 'Autódromo Hermanos Rodríguez'}</strong>
        </div>
      </div>

      {/* Main Interactive Map & Venue Telemetry Centerpiece (Centered, Full-Width & Large) */}
      <div className="w-full rounded-2xl bg-[#090B0F] border border-[#202735] shadow-2xl overflow-hidden flex flex-col">
        {/* Telemetry Sector Map OR Leaflet Map */}
        {viewMode === 'sectors' ? (
          <CircuitSectorMap
            circuitId={selectedCircuit?.circuit_id || upcomingRace?.circuit?.circuit_id || 'rodriguez'}
            circuit={selectedCircuit || upcomingRace?.circuit}
            showControls={true}
            interactive={true}
            className="!border-0 !rounded-none !shadow-none"
          />
        ) : (
          <div className="w-full h-[460px] sm:h-[540px] lg:h-[600px] overflow-hidden relative z-10 bg-[#0E1117]">
            {tileError && (
              <div className="absolute top-3 left-3 z-20 bg-amber-600/90 text-white text-xs font-mono px-3 py-1.5 rounded-lg shadow-md flex items-center space-x-1.5 backdrop-blur-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Map tile provider degraded — vector positions active</span>
              </div>
            )}

            <MapContainer
              center={selectedCoords || (upcomingRace?.circuit?.location ? [upcomingRace.circuit.location.lat, upcomingRace.circuit.location.long] : [19.4042, -99.0907])}
              zoom={selectedCoords ? 10 : 3}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', backgroundColor: '#0B0D12' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{
                  tileerror: () => setTileError(true)
                }}
              />

              {selectedCoords && <FlyToLocation coords={selectedCoords} />}

              {circuits.map((circuit) => {
                const lat = circuit.location?.lat;
                const lng = circuit.location?.long;
                if (!lat || !lng) return null;

                const isUpcoming = circuit.circuit_id === upcomingRace?.circuit?.circuit_id;
                const isSelected = circuit.circuit_id === selectedCircuit?.circuit_id;

                return (
                  <Marker
                    key={circuit.circuit_id}
                    position={[lat, lng]}
                    icon={isUpcoming ? upcomingIcon : redIcon}
                    zIndexOffset={isUpcoming ? 1000 : (isSelected ? 500 : 0)}
                    eventHandlers={{
                      click: () => handleSelectCircuit(circuit),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[210px] text-white">
                        {isUpcoming && (
                          <div className="mb-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#E10600] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            <span>Next Grand Prix &bull; Round {upcomingRace.round}</span>
                          </div>
                        )}
                        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                          {circuit.location?.locality}, {circuit.location?.country}
                        </div>
                        <div className="font-heading font-black text-sm text-white mt-0.5">
                          {circuit.circuit_name}
                        </div>
                        <div className="text-[11px] font-mono text-gray-300 mt-1.5 pt-1.5 border-t border-gray-700 flex justify-between">
                          <span>Lat: {lat.toFixed(3)}°</span>
                          <span>Long: {lng.toFixed(3)}°</span>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-gray-700">
                          <Link
                            to={`/circuits/${circuit.circuit_id}`}
                            className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-[#E10600] hover:text-red-400"
                          >
                            <span>Track Profile & Records</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {/* Integrated Circuit & Grand Prix Inspector Deck (Replaces right sidebar & removes duplicate 3rd map) */}
        {selectedCircuit ? (
          <div className="border-t border-[#1D2534] bg-linear-to-b from-[#0E121A] via-[#0B0E14] to-[#07090E] p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {/* 1. Host Grand Prix & Round */}
              <div className="bg-[#121622]/90 p-4 rounded-xl border border-[#202838] flex flex-col justify-between space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>Host Grand Prix</span>
                  </span>
                  {matchedRace ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-300 font-bold rounded border border-cyan-800/60">
                      Round {matchedRace.round}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#171D28] text-gray-400 rounded">
                      Championship
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-heading font-black text-sm sm:text-base text-white truncate">
                    {matchedRace?.race_name || `${selectedCircuit.circuit_name}`}
                  </div>
                  <div className="text-xs font-mono text-gray-400 flex items-center space-x-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>{matchedRace?.date || 'Formula One Calendar Venue'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Geographic GPS Coordinates */}
              <div className="bg-[#121622]/90 p-4 rounded-xl border border-[#202838] flex flex-col justify-between space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>GPS Coordinates</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <CountryFlag country={selectedCircuit.location?.country} size="xs" />
                    <span className="text-[10px] font-mono text-gray-300 font-bold uppercase">
                      {selectedCircuit.location?.country}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-mono font-bold text-sm sm:text-base text-gray-200">
                    {selectedCircuit.location?.lat?.toFixed(4)}° N, {selectedCircuit.location?.long?.toFixed(4)}° E
                  </div>
                  <div className="text-xs font-mono text-gray-400 flex items-center space-x-1.5 pt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{selectedCircuit.location?.locality}, {selectedCircuit.location?.country}</span>
                  </div>
                </div>
              </div>

              {/* 3. Track Certification & Layout */}
              <div className="bg-[#121622]/90 p-4 rounded-xl border border-[#202838] flex flex-col justify-between space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track Homologation</span>
                  </span>
                  {selectedCircuit?.circuit_id === upcomingRace?.circuit?.circuit_id ? (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-bold border border-emerald-800/80 animate-pulse">
                      NEXT GP
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      FIA Grade 1
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-heading font-black text-sm sm:text-base text-white">
                    {selectedAsset?.hasOutline ? 'Verified Vector Outline' : 'FIA Grade 1 Circuit'}
                  </div>
                  <div className="text-xs font-mono text-gray-400 pt-1">
                    <span>{selectedCircuit.lengthKm || 'Grand Prix Circuit'} &bull; {selectedCircuit.turnsCount ? `${selectedCircuit.turnsCount} Turns` : 'FIA Homologated'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Action CTA Links */}
              <div className="flex flex-col justify-center gap-2">
                <Link
                  to={`/circuits/${selectedCircuit.circuit_id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E10600] hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-red-950/50 hover:shadow-red-900/60 group"
                >
                  <span>View Full Circuit & Track Records</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                {selectedCircuit.url && (
                  <a
                    href={selectedCircuit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-[#141822] hover:bg-[#1C2230] text-gray-300 hover:text-white text-[11px] font-mono font-medium flex items-center justify-center space-x-1.5 transition-colors border border-[#252E3E]"
                  >
                    <span>Wikipedia Overview</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-mono text-gray-500 border-t border-[#1D2534]">
            Select a circuit from the list below to inspect venue telemetry and records
          </div>
        )}
      </div>

      {/* Accessible, Categorized Circuit Directory: Upcoming Grand Prix at Top, Past Circuits Below */}
      <div className="space-y-8">
        {filtered.length === 0 ? (
          <EmptyState
            title="No Circuits Found"
            message={`No circuits match your search for "${search}".`}
            onReset={() => setSearch('')}
          />
        ) : (
          <div className="space-y-8">
            {/* 1. UPCOMING RACES SECTION AT THE TOP */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-[#121822] via-[#10141D] to-[#121822] p-4 rounded-2xl border border-emerald-900/50 shadow-xs">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide">
                      Upcoming Grand Prix Circuits
                    </h3>
                    <span className="text-xs font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      {upcomingCircuits.length} Upcoming {upcomingCircuits.length === 1 ? 'Round' : 'Rounds'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Scheduled Formula One circuits remaining in the active 2026 championship season
                  </p>
                </div>

                {upcomingRace && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFocusUpcoming}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors border border-emerald-800/80 shadow-xs"
                      title="Fly directly to next Grand Prix track"
                    >
                      <Navigation className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                      <span>Next Race: {upcomingRace.circuit?.location?.locality || upcomingRace.race_name} (Round {upcomingRace.round})</span>
                    </button>
                  </div>
                )}
              </div>

              {upcomingCircuits.length === 0 ? (
                <div className="p-6 bg-[#131720] rounded-2xl border border-[#232936] text-center text-xs font-mono text-gray-500">
                  No upcoming circuits match your search query.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingCircuits.map((c) => renderCircuitCard(c, true))}
                </div>
              )}
            </section>

            {/* 2. PAST CIRCUITS SECTION */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-2xl border border-[#212735]">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                    <h3 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide">
                      Past Circuits & Completed Rounds
                    </h3>
                    <span className="text-xs font-mono font-bold bg-[#1C222E] text-gray-300 border border-[#2C3649] px-2.5 py-0.5 rounded-full">
                      {pastCircuits.length} Completed
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Grand Prix venues that have concluded racing rounds earlier in the season
                  </p>
                </div>

                <span className="text-xs font-mono text-gray-500 hidden sm:inline">
                  Click any past venue to inspect track telemetry & records
                </span>
              </div>

              {pastCircuits.length === 0 ? (
                <div className="p-6 bg-[#131720] rounded-2xl border border-[#232936] text-center text-xs font-mono text-gray-500">
                  No past circuits match your search query.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastCircuits.map((c) => renderCircuitCard(c, false))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
