import React from 'react';
import logoFull from '../../assets/logo.png';
import logoMark from '../../assets/logo-mark.png';
import logoWordmark from '../../assets/logo-wordmark.png';
import logoBanner from '../../assets/logo-banner.png';

/**
 * Racepective Official Logo Component
 * 
 * Supports:
 * - variant="full"       -> Complete vertical lockup (Emblem + RACEPECTIVE + Tagline)
 * - variant="mark"       -> Emblem mark only (Checkered racing 'R' with red accents)
 * - variant="wordmark"   -> Wordmark only ("RACEPECTIVE" with red accent 'A')
 * - variant="horizontal" -> Inline lockup: Emblem + Wordmark/Tagline side-by-side
 * - variant="banner"     -> Cinematic banner with subtle circuit wireframes
 */
export default function RacepectiveLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
  onClick = null,
}) {
  // Size presets
  const markSizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  const fullSizeClasses = {
    sm: 'max-w-[180px]',
    md: 'max-w-[240px]',
    lg: 'max-w-[360px]',
    xl: 'max-w-[480px]',
  };

  if (variant === 'banner') {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-[#232936] bg-[#0B0D12] ${className}`}>
        <img
          src={logoBanner}
          alt="Racepective — See racing differently."
          className="w-full h-auto object-cover object-center"
          loading="eager"
        />
      </div>
    );
  }

  if (variant === 'mark') {
    return (
      <img
        src={logoMark}
        alt="Racepective"
        className={`${markSizeClasses[size] || markSizeClasses.md} object-contain transition-transform group-hover:scale-105 ${className}`}
        loading="eager"
        onClick={onClick}
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <img
        src={logoWordmark}
        alt="RACEPECTIVE"
        className={`h-4 sm:h-5 w-auto object-contain ${className}`}
        loading="eager"
        onClick={onClick}
      />
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${fullSizeClasses[size] || fullSizeClasses.md} ${className}`}>
        <img
          src={logoFull}
          alt="Racepective — See racing differently."
          className="w-full h-auto object-contain"
          loading="eager"
          onClick={onClick}
        />
      </div>
    );
  }

  // Default: Horizontal lockup (Emblem + stylized Wordmark & Tagline)
  return (
    <div className={`flex items-center space-x-3 group ${className}`} onClick={onClick}>
      {/* Emblem Mark */}
      <div className="shrink-0 flex items-center justify-center">
        <img
          src={logoMark}
          alt="Racepective"
          className={`${markSizeClasses[size] || markSizeClasses.md} object-contain transition-transform group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(225,6,0,0.25)]`}
          loading="eager"
        />
      </div>

      {/* Wordmark and Tagline */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center space-x-2">
          <img
            src={logoWordmark}
            alt="RACEPECTIVE"
            className="h-4 sm:h-4.5 w-auto object-contain brightness-110"
            loading="eager"
          />
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse"></span>
        </div>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5 whitespace-nowrap">
            See racing differently.
          </span>
        )}
      </div>
    </div>
  );
}
