import React from 'react';
import { Award, Medal, Trophy } from 'lucide-react';

/**
 * Racepective Podium & Position Badges
 * Visually distinguishes P1 (Gold), P2 (Silver), and P3 (Bronze)
 * with refined metallic tones and ribbon/medal glyphs matching motorsport conventions.
 */

export function PositionBadge({ position, showMedalIcon = true, size = 'md', className = '' }) {
  const pos = parseInt(position, 10);

  // P1: Gold Championship Leader / Race Winner
  if (pos === 1) {
    return (
      <span
        className={`inline-flex items-center space-x-1 font-heading font-black text-amber-500 tracking-tight select-none ${className}`}
        title="P1 - Leader / Winner (Gold)"
      >
        <span className="text-base sm:text-lg">1</span>
        {showMedalIcon && (
          <svg
            className="w-4 h-4 text-amber-500 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )}
      </span>
    );
  }

  // P2: Silver Podium
  if (pos === 2) {
    return (
      <span
        className={`inline-flex items-center space-x-1 font-heading font-black text-slate-500 tracking-tight select-none ${className}`}
        title="P2 - 2nd Place (Silver)"
      >
        <span className="text-base sm:text-lg">2</span>
        {showMedalIcon && (
          <svg
            className="w-4 h-4 text-slate-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )}
      </span>
    );
  }

  // P3: Bronze Podium
  if (pos === 3) {
    return (
      <span
        className={`inline-flex items-center space-x-1 font-heading font-black text-amber-700 tracking-tight select-none ${className}`}
        title="P3 - 3rd Place (Bronze)"
      >
        <span className="text-base sm:text-lg">3</span>
        {showMedalIcon && (
          <svg
            className="w-4 h-4 text-amber-700/80 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        )}
      </span>
    );
  }

  // P4+: Neutral Clean Font
  return (
    <span
      className={`font-mono font-bold text-gray-700 text-sm select-none ${className}`}
    >
      {position || '--'}
    </span>
  );
}

/**
 * Compact Pill Position Variant
 */
export function PositionPill({ position, className = '' }) {
  const pos = parseInt(position, 10);

  if (pos === 1) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}>
        P1
      </span>
    );
  }
  if (pos === 2) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
        P2
      </span>
    );
  }
  if (pos === 3) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-orange-50 text-orange-800 border border-orange-200/80 ${className}`}>
        P3
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
      P{position || '--'}
    </span>
  );
}
