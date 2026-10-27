import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Trophy, 
  ShieldCheck, 
  Users, 
  MapPin, 
  LineChart, 
  Menu, 
  X, 
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Pin,
  PinOff
} from 'lucide-react';
import RacepectiveLogo from '../common/RacepectiveLogo';

export default function Sidebar({ season = '2026', isDemo = false, lastUpdated = null }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [standingsHovered, setStandingsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileStandingsOpen, setMobileStandingsOpen] = useState(true);

  const location = useLocation();
  const isStandingsActive = location.pathname.startsWith('/standings');
  const isExpanded = isPinned || isHovered;

  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
    { name: 'Race Calendar', path: '/calendar', icon: CalendarIcon },
  ];

  const standingsSubItems = [
    { name: 'Driver Standings', path: '/standings/drivers', icon: Trophy, badge: 'P1 ANT' },
    { name: 'Constructor Standings', path: '/standings/constructors', icon: ShieldCheck, badge: 'P1 MERCEDES' },
  ];

  const secondaryNavItems = [
    { name: 'Drivers & Profiles', path: '/drivers', icon: Users },
    { name: 'Circuits Map', path: '/circuits', icon: MapPin },
    { name: 'Insights & Analytics', path: '/insights', icon: LineChart },
  ];

  const formatTime = (iso) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Live';
    }
  };

  return (
    <>
      {/* ============================================================ */}
      {/* 1. Mobile Sticky Top Header (Hidden on lg+ screens) */}
      {/* ============================================================ */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#121417] border-b border-[#22252B] px-4 py-3 flex items-center justify-between text-white">
        <Link to="/" className="flex items-center space-x-2">
          <RacepectiveLogo variant="horizontal" size="xs" showTagline={false} />
          <span className="text-[10px] font-mono bg-[#1E232C] px-1.5 py-0.5 rounded text-gray-300">
            {season}
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#1A1D24] text-gray-300 hover:text-white focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] bg-[#121417] h-full shadow-2xl flex flex-col border-r border-[#22262E] animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between border-b border-[#22262E]">
              <RacepectiveLogo variant="horizontal" size="xs" showTagline={false} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-[#1A1D24]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-gray-300">
              {/* Season & Data Feed */}
              <div className="bg-[#171A21] rounded-xl p-3 border border-[#252A35] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Championship:</span>
                  <span className="font-bold text-white bg-[#222733] px-2 py-0.5 rounded text-[11px]">
                    {season} Season
                  </span>
                </div>
                <div className="pt-1 border-t border-[#222733] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">Data Feed:</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-emerald-300 bg-emerald-950/70 border border-emerald-800/40 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    Jolpica Live {lastUpdated ? `(${formatTime(lastUpdated)})` : ''}
                  </span>
                </div>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500">
                  Navigation
                </div>

                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          isActive
                            ? 'bg-[#1E232C] text-white border-l-4 border-[#E10600] font-bold shadow-xs'
                            : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
                          <span className="truncate">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}

                {/* Standings Accordion Group on Mobile */}
                <div className="pt-1">
                  <button
                    onClick={() => setMobileStandingsOpen(!mobileStandingsOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      isStandingsActive
                        ? 'bg-[#1E232C] text-white border-l-4 border-[#E10600] font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Trophy className={`w-4 h-4 shrink-0 ${isStandingsActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
                      <span>Standings</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileStandingsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileStandingsOpen && (
                    <div className="ml-4 pl-3 border-l-2 border-[#262C38] space-y-1 mt-1">
                      {standingsSubItems.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                                isActive
                                  ? 'bg-[#E10600]/15 text-[#E10600] font-bold'
                                  : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                              }`
                            }
                          >
                            <div className="flex items-center space-x-2.5">
                              <SubIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{sub.name}</span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1A1F2B] text-gray-400">
                              {sub.badge}
                            </span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>

                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                          isActive
                            ? 'bg-[#1E232C] text-white border-l-4 border-[#E10600] font-bold shadow-xs'
                            : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
                          <span className="truncate">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-[#22262E] text-[10px] font-mono text-gray-500">
              Racepective &bull; Official Formula 1 Intelligence
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)}></div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. Desktop Collapsible Hover-Expand Sidebar */}
      {/* ============================================================ */}
      {/* Stable spacer keeps main content width identical whether sidebar is open or closed */}
      <div className="hidden lg:block w-16 shrink-0 h-screen" aria-hidden="true" />

      {/* Floating Hover-Expand Drawer */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setStandingsHovered(false);
        }}
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-50 flex-col bg-[#121417] border-r border-[#22262E] transition-all duration-300 ease-out select-none ${
          isExpanded
            ? 'w-64 shadow-[25px_0_60px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.06]'
            : 'w-16 shadow-[10px_0_30px_rgba(0,0,0,0.4)]'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full justify-between p-3 text-gray-300">
          <div className="space-y-5">
            {/* 1. Header / Brand Mark */}
            <div className="flex items-center justify-between px-1 pt-1 min-h-[44px]">
              {isExpanded ? (
                <div className="flex items-center justify-between w-full">
                  <Link to="/" className="block transition-transform hover:opacity-95">
                    <RacepectiveLogo variant="horizontal" size="xs" showTagline={true} />
                  </Link>
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    title={isPinned ? 'Unpin sidebar (auto-collapse on mouse leave)' : 'Pin sidebar open'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isPinned 
                        ? 'text-[#E10600] bg-[#E10600]/10 hover:bg-[#E10600]/20' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E232C]'
                    }`}
                  >
                    {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <Link to="/" className="mx-auto block p-1 transition-transform hover:scale-105" title="Racepective">
                  <RacepectiveLogo variant="mark" size="xs" />
                </Link>
              )}
            </div>

            {/* 2. Championship Status Card */}
            {isExpanded ? (
              <div className="px-1 animate-in fade-in duration-200">
                <div className="bg-[#171A21] rounded-xl p-2.5 border border-[#252A35] space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400 text-[11px]">Championship:</span>
                    <span className="font-bold text-white bg-[#222733] px-2 py-0.5 rounded text-[10px]">
                      {season} Season
                    </span>
                  </div>

                  <div className="pt-1 border-t border-[#222733] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-gray-400">Data Feed:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-emerald-300 bg-emerald-950/70 border border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                      Jolpica Live
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-1" title={`2026 Season • Jolpica Live`}>
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#171A21] border border-[#252A35] text-[10px] font-mono text-gray-400 font-bold">
                  26
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-[#121417]"></span>
                </div>
              </div>
            )}

            {/* 3. Navigation List */}
            <nav className="space-y-1.5 pt-1">
              {isExpanded && (
                <div className="px-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500 animate-in fade-in duration-150">
                  Navigation
                </div>
              )}

              {/* Main Nav Items (Dashboard, Race Calendar) */}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    title={!isExpanded ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isExpanded ? 'space-x-3 px-3 py-2.5' : 'justify-center p-2.5'
                      } rounded-xl text-xs font-mono font-medium transition-all ${
                        isActive
                          ? 'bg-[#1E232C] text-white border-l-4 border-[#E10600] font-bold shadow-xs'
                          : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
                        {isExpanded && <span className="truncate">{item.name}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* ============================================================ */}
              {/* Standings Group: Hover-Open Tab / Dropdown Sub-menu */}
              {/* ============================================================ */}
              <div
                className="relative"
                onMouseEnter={() => setStandingsHovered(true)}
                onMouseLeave={() => setStandingsHovered(false)}
              >
                {/* Parent Standings Item */}
                <div
                  className={`flex items-center ${
                    isExpanded ? 'justify-between px-3 py-2.5' : 'justify-center p-2.5'
                  } rounded-xl text-xs font-mono font-medium cursor-pointer transition-all ${
                    isStandingsActive
                      ? 'bg-[#1E232C] text-white border-l-4 border-[#E10600] font-bold shadow-xs'
                      : standingsHovered
                      ? 'bg-[#181B22] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                  }`}
                  title={!isExpanded ? 'Championship Standings' : undefined}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Trophy className={`w-4 h-4 shrink-0 ${isStandingsActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
                    {isExpanded && <span className="truncate">Standings</span>}
                  </div>

                  {isExpanded && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        standingsHovered || isStandingsActive ? 'rotate-90 text-gray-300' : ''
                      }`}
                    />
                  )}
                </div>

                {/* Sub-menu Tab (Opened on Hover!) */}
                {/* Case A: When sidebar is Expanded (Nested smooth dropdown underneath) */}
                {isExpanded && (standingsHovered || isStandingsActive) && (
                  <div className="ml-4 pl-3 border-l-2 border-[#262C38] space-y-1 mt-1.5 pt-1 animate-in slide-in-from-top-1 duration-150">
                    {standingsSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                              isActive
                                ? 'bg-[#E10600]/15 text-[#E10600] font-bold border-l-2 border-[#E10600]'
                                : 'text-gray-400 hover:text-white hover:bg-[#1A1F2A]'
                            }`
                          }
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{sub.name}</span>
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                )}

                {/* Case B: When sidebar is Collapsed Rail (Floating Flyout Tab to the right!) */}
                {!isExpanded && standingsHovered && (
                  <div
                    className="absolute left-full top-0 ml-2 w-60 bg-[#141822] border border-[#2B3342] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.9)] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-[#222836] flex items-center justify-between mb-1">
                      <span className="text-[#E10600] font-bold">STANDINGS HUB</span>
                      <span className="text-gray-400 text-[9px]">2026 FIA</span>
                    </div>

                    {standingsSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                              isActive
                                ? 'bg-[#E10600]/15 text-[#E10600] font-bold border-l-2 border-[#E10600]'
                                : 'text-gray-300 hover:text-white hover:bg-[#1E2432]'
                            }`
                          }
                        >
                          <div className="flex items-center space-x-2.5">
                            <SubIcon className="w-3.5 h-3.5 text-[#E10600]" />
                            <span>{sub.name}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2230] text-gray-400">
                            {sub.badge}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Secondary Nav Items (Drivers, Circuits, Insights) */}
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={!isExpanded ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        isExpanded ? 'space-x-3 px-3 py-2.5' : 'justify-center p-2.5'
                      } rounded-xl text-xs font-mono font-medium transition-all ${
                        isActive
                          ? 'bg-[#1E232C] text-white border-l-4 border-[#E10600] font-bold shadow-xs'
                          : 'text-gray-400 hover:text-white hover:bg-[#181B22]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E10600]' : 'text-gray-400'}`} />
                        {isExpanded && <span className="truncate">{item.name}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* 4. Desktop Sidebar Footer */}
          {isExpanded ? (
            <div className="pt-3 border-t border-[#22262E] px-2 space-y-1.5 text-[10px] font-mono text-gray-500 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span>Telemetry Source</span>
                <a
                  href="https://github.com/jolpica/jolpica-f1"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white inline-flex items-center gap-1"
                >
                  Jolpica F1 <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="text-[9px] text-gray-600 truncate">
                Racepective &bull; Independent F1 Platform
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2" title="Jolpica F1 Telemetry Live">
              <span className="w-2 h-2 rounded-full bg-[#E10600]/80"></span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
