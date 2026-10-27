import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ArrowRight, Trophy, Flag, Shield, Sparkles } from 'lucide-react';

import { api } from '../services/api';
import { TeamColorBar, getTeamColor } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/LoadingSpinner';
import { DriverAvatar } from '../data/assets';
import { PageHeaderHero } from '../components/common/WireframeAnimations';
import { PositionBadge } from '../components/common/PodiumBadge';
import { CountryFlag } from '../utils/flags';
import TeamSymbol from '../components/common/TeamSymbol';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDrivers('current');
      setDrivers(res.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load drivers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <CardSkeleton count={8} />
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={loadDrivers} />;

  // Unique teams list
  const teams = ['ALL', ...new Set(drivers.map((d) => d.constructor_name).filter(Boolean))];

  const filtered = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.nationality.toLowerCase().includes(search.toLowerCase()) ||
      d.constructor_name.toLowerCase().includes(search.toLowerCase()) ||
      (d.permanent_number && d.permanent_number.toString().includes(search));
    const matchesTeam = selectedTeam === 'ALL' || d.constructor_name === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header Hero with Apex Track Wireframe */}
      <PageHeaderHero
        badge="DRIVER GRID"
        title="2026 Formula 1 Driver Grid"
        subtitle="Active drivers, permanent numbers, constructor allocations, and career statistics"
        icon={Users}
        wireframeVariant="apex"
        actions={
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Search Box */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search driver or team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#1E232C] border border-[#2B303A] text-white placeholder-gray-500 rounded-xl focus:outline-none focus:border-[#E10600] transition-colors"
              />
            </div>

            {/* Team Dropdown */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-mono bg-[#1E232C] border border-[#2B303A] text-white rounded-xl focus:outline-none focus:border-[#E10600] font-medium transition-colors"
            >
              {teams.map((t) => (
                <option key={t} value={t} className="bg-[#121417] text-white">
                  {t === 'ALL' ? 'All Constructors' : t}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No Drivers Found"
          message="No driver matched your search filter criteria. Try resetting your query or team selection."
          onReset={() => {
            setSearch('');
            setSelectedTeam('ALL');
          }}
        />
      ) : (
        /* Driver Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((driver) => {
            const initials = driver.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2);
            const teamColor = getTeamColor(driver.constructor_name);

            return (
              <Link
                key={driver.driver_id}
                to={`/drivers/${driver.driver_id}`}
                className="relative bg-[#131720] rounded-2xl border border-[#232936] hover:border-[#384357] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group border-l-4"
                style={{ borderLeftColor: teamColor }}
              >
                {/* Subtle high-tech corner tick */}
                <div className="absolute top-2 right-2 font-mono text-[9px] text-gray-600 group-hover:text-[#E10600] transition-colors pointer-events-none select-none">
                  [R-26]
                </div>

                <div className="p-5 space-y-4">
                  {/* Header: Rank + Permanent Number */}
                  <div className="flex items-center justify-between">
                    <PositionBadge position={driver.position} />
                    <span className="font-mono text-xs font-black text-gray-300 bg-[#1A202C] px-2.5 py-0.5 rounded-md border border-[#2A3446] group-hover:border-gray-500 transition-colors">
                      #{driver.permanent_number || '—'}
                    </span>
                  </div>

                  {/* Driver Portrait & Details */}
                  <div className="flex items-center space-x-3.5 pt-1">
                    <div className="relative shrink-0">
                      <DriverAvatar
                        driverId={driver.driver_id}
                        name={driver.name}
                        code={driver.code || initials}
                        team={driver.constructor_name}
                        size="md"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#131720] shadow-xs"
                        style={{ backgroundColor: teamColor }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-black text-base text-white group-hover:text-[#E10600] transition-colors leading-snug truncate">
                        {driver.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono mt-0.5 truncate">
                        <TeamSymbol team={driver.constructor_name} className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate font-medium">{driver.constructor_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2432] font-mono text-xs text-gray-400">
                    <div className="bg-[#161B24] p-2.5 rounded-xl border border-[#202634]">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                        Points
                      </span>
                      <span className="font-heading font-black text-base text-white">
                        {driver.points || 0}
                      </span>
                    </div>
                    <div className="bg-[#161B24] p-2.5 rounded-xl border border-[#202634]">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-bold">
                        Wins
                      </span>
                      <span className="font-heading font-black text-base text-white">
                        {driver.wins || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Link */}
                <div className="bg-[#161B24] px-5 py-2.5 border-t border-[#1E2432] flex items-center justify-between text-xs font-mono text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CountryFlag country={driver.nationality} size="sm" />
                    <span className="text-[11px] font-medium text-gray-300">{driver.nationality}</span>
                  </div>
                  <span className="text-[#E10600] font-semibold text-[11px] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
