import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  LineChart, 
  LayoutDashboard, 
  Menu, 
  X, 
  Activity,
  Radio
} from 'lucide-react';
import RacepectiveLogo from '../common/RacepectiveLogo';

export default function Navbar({ season = '2026', isDemo = false, lastUpdated = null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Standings', path: '/standings', icon: Trophy },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Circuits', path: '/circuits', icon: MapPin },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
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
    <nav className="bg-[#121417] border-b border-[#22252B] sticky top-0 z-50 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group transition-transform hover:opacity-95">
              <RacepectiveLogo variant="horizontal" size="sm" showTagline={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                      active
                        ? 'bg-[#1E2128] text-white border-b-2 border-[#E10600]'
                        : 'text-gray-300 hover:text-white hover:bg-[#181A1F]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#E10600]' : 'text-gray-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-[#1B1E24] px-2.5 py-1 rounded border border-[#2B303A] text-xs font-mono text-gray-300">
              <span className="text-gray-400 font-sans">Season:</span>
              <span className="font-bold text-white">{season}</span>
            </div>

            {isDemo ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
                <Radio className="w-3 h-3 mr-1 text-amber-400" />
                DEMO MODE
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Jolpica Live {lastUpdated ? `(${formatTime(lastUpdated)})` : ''}
              </span>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#1E2128] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#181A1F] border-b border-[#282C34] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                  active ? 'bg-[#22252C] text-white border-l-4 border-[#E10600]' : 'text-gray-300 hover:bg-[#20232A]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#E10600]' : 'text-gray-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#2B303A] flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>F1 Season {season}</span>
            <span>{isDemo ? 'DEMO CACHE' : 'LIVE FEED'}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
