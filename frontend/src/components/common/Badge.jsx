import React from 'react';
import { TEAM_COLORS, getTeamColor, getDriverColor, DARK_CHART_THEME } from '../../utils/teamColors';

export { TEAM_COLORS, getTeamColor, getDriverColor, DARK_CHART_THEME };

export function StateBadge({ state }) {
  if (state === 'COMPLETED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
        COMPLETED
      </span>
    );
  }
  if (state === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-red-950/80 text-red-300 border border-red-800/80 animate-pulse shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] mr-1.5 animate-ping"></span>
        LIVE ON TRACK
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#1A1F2B] text-slate-300 border border-[#2B3345] shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-1.5"></span>
      UPCOMING
    </span>
  );
}

export function PositionDeltaBadge({ delta }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
        +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-950/60 text-red-400 border border-red-800/60">
        {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-gray-500 bg-[#161B24] border border-[#232936]">
      0
    </span>
  );
}

export function TeamColorBar({ team = '' }) {
  const colorCode = getTeamColor(team);
  return <div className="w-1.5 h-full rounded-l shrink-0" style={{ backgroundColor: colorCode }} />;
}
