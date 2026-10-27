import React, { useState, useEffect } from 'react';
import { Gauge, Play, Pause, Zap } from 'lucide-react';
import { CIRCUIT_SECTOR_DATA } from '../circuits/CircuitSectorMap';
import { getTeamColor, getDriverColor } from '../../utils/teamColors';

/**
 * Racepective Technical Wireframe System
 * Lightweight, accessible SVG wireframes and CSS animations.
 * Provides authentic motorsport aesthetics without heavy 3D or visual noise.
 * Strictly respects prefers-reduced-motion and is pointer-events-none.
 */

// Genuine F1 Circuit SVG Track Outlines (Normalized 500x500 Coordinate Space)
export const CIRCUIT_PATHS = {
  silverstone: {
    name: 'Silverstone Circuit',
    lengthKm: '5.891 KM',
    coords: '52.0786° N, 1.0169° W',
    // Realistic Silverstone GP layout path
    d: 'M 85 140 C 110 120, 140 115, 175 115 C 210 115, 235 105, 260 85 C 290 60, 335 55, 375 62 C 405 68, 420 88, 415 112 C 410 138, 370 158, 340 178 C 310 198, 290 215, 295 240 C 300 265, 325 285, 360 295 C 395 305, 410 320, 405 348 C 400 375, 370 385, 330 380 C 290 375, 260 360, 220 365 C 180 370, 140 390, 110 375 C 80 360, 70 325, 75 290 C 80 255, 95 235, 100 205 C 105 175, 70 160, 85 140 Z',
  },
  monza: {
    name: 'Autodromo Nazionale Monza',
    lengthKm: '5.793 KM',
    coords: '45.6199° N, 9.2811° E',
    // Realistic Monza GP high-speed layout
    d: 'M 70 380 L 390 380 C 430 380, 440 350, 410 320 L 330 250 C 315 235, 315 210, 330 195 L 400 130 C 425 105, 410 70, 370 70 L 160 70 C 120 70, 100 95, 115 125 L 140 175 C 150 195, 140 220, 120 235 L 75 270 C 50 290, 50 380, 70 380 Z',
  },
  spa: {
    name: 'Circuit de Spa-Francorchamps',
    lengthKm: '7.004 KM',
    coords: '50.4372° N, 5.9714° E',
    // Realistic Spa layout with Eau Rouge & Kemmel
    d: 'M 90 200 C 100 150, 130 120, 170 120 L 330 120 C 370 120, 410 140, 420 180 C 430 220, 400 250, 370 270 L 310 310 C 290 325, 290 350, 310 370 C 330 390, 310 420, 270 420 L 180 420 C 140 420, 120 390, 120 360 L 120 300 C 120 270, 100 250, 80 240 C 60 230, 80 220, 90 200 Z',
  },
  rodriguez: {
    name: 'Autódromo Hermanos Rodríguez',
    lengthKm: '4.304 KM',
    coords: '19.4042° N, 99.0907° W',
    // Realistic Mexico City GP layout with main straight, Esses & Foro Sol stadium
    d: 'M 60 380 L 380 380 C 410 380, 420 355, 395 330 L 290 230 C 275 215, 280 185, 305 175 L 400 135 C 425 125, 420 80, 385 75 L 150 75 C 115 75, 105 110, 130 135 L 180 185 C 200 205, 195 235, 170 250 L 115 285 C 80 305, 60 340, 60 380 Z',
  },
  interlagos: {
    name: 'Autódromo José Carlos Pace',
    lengthKm: '4.309 KM',
    coords: '23.7036° S, 46.6997° W',
    // Realistic Interlagos layout with Senna S, Curva do Sol & Junção
    d: 'M 110 360 C 130 390, 180 400, 240 390 L 360 370 C 400 360, 420 320, 390 280 L 320 190 C 300 165, 315 130, 345 115 L 390 95 C 420 80, 405 45, 365 50 L 210 70 C 170 75, 140 105, 150 145 L 165 205 C 175 240, 150 270, 120 290 C 90 310, 95 335, 110 360 Z',
  }
};

/**
 * Compute tight-fitting dynamic viewBox for any SVG path string with aspect ratio matching
 */
export function getOptimizedTrackViewBox(pathStr, targetAspect = 1.35, defaultBox = '0 0 1024 576') {
  if (!pathStr) return defaultBox;
  const numbers = pathStr.match(/[-+]?\d*\.?\d+/g);
  if (!numbers || numbers.length < 8) return defaultBox;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < numbers.length - 1; i += 2) {
    const x = parseFloat(numbers[i]);
    const y = parseFloat(numbers[i + 1]);
    if (!isNaN(x) && !isNaN(y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (!isFinite(minX) || !isFinite(maxX) || maxX <= minX || maxY <= minY) return defaultBox;

  const tw = maxX - minX;
  const th = maxY - minY;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Track should occupy ~84% of the viewport (16% margin for glows & live beacon)
  let vw, vh;
  if (tw / th > targetAspect) {
    // Width constrained
    vw = tw * 1.20;
    vh = vw / targetAspect;
  } else {
    // Height constrained
    vh = th * 1.20;
    vw = vh * targetAspect;
  }

  const vx = cx - vw / 2;
  const vy = cy - vh / 2;
  return `${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`;
}

/**
 * Animated Formula 1 Circuit Wireframe
 * Renders a live tracing vector wireframe of an authentic Grand Prix track.
 * Employs CSS stroke-dashoffset animation + native SVG animateMotion beacon.
 */
export function CircuitWireframe({
  circuit = 'rodriguez',
  className = '',
  accentColor = '#E10600',
  showTelemetryTags = true,
  opacity = 0.85
}) {
  const norm = (circuit || '').toLowerCase().replace(/[-_\s]/g, '');
  let resolvedKey = 'rodriguez';
  if (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[circuit]) resolvedKey = circuit;
  else if (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[norm]) resolvedKey = norm;
  else if (CIRCUIT_SECTOR_DATA) {
    for (const k of Object.keys(CIRCUIT_SECTOR_DATA)) {
      if (norm.includes(k) || k.includes(norm)) {
        resolvedKey = k;
        break;
      }
    }
  }

  const track = (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[resolvedKey]) || CIRCUIT_PATHS[resolvedKey] || CIRCUIT_PATHS.rodriguez;
  const pathD = track?.fullPath || track?.d;
  const isGeoBox = Boolean(track?.fullPath);
  const viewBox = track?.viewBox || (isGeoBox ? '0 0 1024 576' : '0 0 500 450');

  return (
    <div
      className={`relative select-none pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle Wireframe Glow Filter */}
          <filter id={`wireframe-glow-${circuit}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={accentColor} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Base Static Blueprint Wireframe Track (Dotted) */}
        <path
          d={pathD}
          stroke="#2A313E"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Outer Racing Boundary Wireframe */}
        <path
          d={pathD}
          stroke="#1F2530"
          strokeWidth="10"
          strokeOpacity="0.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dynamic Animated Tracing Beam with Dual-Layer Luminous Core */}
        <path
          d={pathD}
          stroke={accentColor}
          strokeWidth="6"
          strokeOpacity="0.25"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#wireframe-glow-${circuit})`}
        />
        <path
          d={pathD}
          stroke={accentColor}
          strokeWidth="2.75"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-circuit-draw"
        />
        <path
          d={pathD}
          stroke="#FFFFFF"
          strokeWidth="1.25"
          strokeOpacity="0.75"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Live Animated Racing Car with Directional Heading Arrow & Beacon */}
        <g filter={`url(#wireframe-glow-${circuit})`}>
          {/* Comet Streak 1 */}
          <circle r="4" fill="#E10600" fillOpacity="0.5">
            <animateMotion
              path={pathD}
              dur="8s"
              begin="-0.12s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Pulsing Radar Ring */}
          <circle r="10" fill="#E10600" fillOpacity="0.3">
            <animateMotion
              path={pathD}
              dur="8s"
              repeatCount="indefinite"
              rotate="auto"
            />
            <animate attributeName="r" values="5;14;5" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Car Core Beacon */}
          <circle r="5" fill="#E10600" stroke="#FFFFFF" strokeWidth="1.5">
            <animateMotion
              path={pathD}
              dur="8s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>
          <circle r="2" fill="#FFFFFF">
            <animateMotion
              path={pathD}
              dur="8s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Directional Aerodynamic Racing Car Chevron (Rotates with track heading!) */}
          <g>
            <animateMotion
              path={pathD}
              dur="8s"
              repeatCount="indefinite"
              rotate="auto"
            />
            <polygon
              points="12,0 -2,-5 2,0 -2,5"
              fill="#FFFFFF"
              stroke="#E10600"
              strokeWidth="1.5"
            />
          </g>
        </g>

        {/* Technical Data Annotations */}
        {showTelemetryTags && track && (
          <g fontFamily="monospace" fontSize="9" fill="#717D96" opacity="0.8">
            <text x="35" y="40" letterSpacing="0.08em">
              TRACK // {track.name?.toUpperCase()}
            </text>
            <text x="35" y="54" fill={accentColor} fontWeight="bold" letterSpacing="0.05em">
              {track.locality}, {track.country}
            </text>
            <text x="35" y="68" fill="#10B981" letterSpacing="0.05em">
              GPS SURVEY &bull; {track.lengthKm} &bull; {track.turnsCount || 16} TURNS
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Helper to sample a coordinate along an SVG path string for milestone badges
function getPathPointAtRatio(pathStr, ratio = 0.5) {
  if (!pathStr) return null;
  const matches = pathStr.match(/[-+]?\d*\.?\d+\s+[-+]?\d*\.?\d+/g);
  if (!matches || matches.length === 0) return null;
  const targetIdx = Math.min(Math.floor(matches.length * ratio), matches.length - 1);
  const parts = matches[targetIdx].trim().split(/\s+/).map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { x: parts[0], y: parts[1] };
  }
  return null;
}

/**
 * HeroTrackStage
 * The central hero visual display for the championship circuit.
 * Features:
 * - Authentic FIA geospatial track contour with multi-layer glow (soft outer red bloom + luminous bright core)
 * - Subtle topographical elevation contour curves & technical coordinate mesh grid underneath
 * - Authentic Start / Finish line marker with cyan/white perpendicular bar, direction chevrons & badge
 * - Authentic S1 (Red), S2 (Cyan), S3 (Yellow) sector paths with technical floating milestone tags
 * - Live animated car/telemetry beacon with directional apex tracking
 */
export function HeroTrackStage({
  circuit = 'rodriguez',
  className = '',
  accentColor = '#E10600',
  showSectors = true,
  showStartFinish = true,
  showElevation = true,
  opacity = 1,
  animationDur = 9,
  autoScale = true
}) {
  const norm = (circuit || '').toLowerCase().replace(/[-_\s]/g, '');
  let resolvedKey = 'rodriguez';
  if (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[circuit]) resolvedKey = circuit;
  else if (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[norm]) resolvedKey = norm;
  else if (CIRCUIT_SECTOR_DATA) {
    for (const k of Object.keys(CIRCUIT_SECTOR_DATA)) {
      if (norm.includes(k) || k.includes(norm)) {
        resolvedKey = k;
        break;
      }
    }
  }

  const track = (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[resolvedKey]) || CIRCUIT_SECTOR_DATA?.rodriguez;
  if (!track) return null;

  const pathD = track.fullPath;
  const viewBox = autoScale
    ? getOptimizedTrackViewBox(pathD, 1.35, track.viewBox || '0 0 1024 576')
    : (track.viewBox || '0 0 1024 576');
  const glowId = `hero-track-glow-${resolvedKey}`;
  const gridId = `hero-track-grid-${resolvedKey}`;

  // Parse viewBox coordinates for responsive background grid bounds
  const vbParts = viewBox.split(' ').map(Number);
  const [vbX, vbY, vbW, vbH] = vbParts.length === 4 ? vbParts : [0, 0, 1024, 576];

  // Sector label positions for known venues or sampled from sector paths
  const isMexico = resolvedKey === 'rodriguez';
  const s1Pos = isMexico 
    ? { x: 760, y: 115 } 
    : (getPathPointAtRatio(track.sector1Path, 0.5) ? { x: getPathPointAtRatio(track.sector1Path, 0.5).x - 19, y: getPathPointAtRatio(track.sector1Path, 0.5).y - 9 } : null);
  const s2Pos = isMexico 
    ? { x: 635, y: 485 } 
    : (getPathPointAtRatio(track.sector2Path, 0.5) ? { x: getPathPointAtRatio(track.sector2Path, 0.5).x - 19, y: getPathPointAtRatio(track.sector2Path, 0.5).y - 9 } : null);
  const s3Pos = isMexico 
    ? { x: 210, y: 110 } 
    : (getPathPointAtRatio(track.sector3Path, 0.5) ? { x: getPathPointAtRatio(track.sector3Path, 0.5).x - 19, y: getPathPointAtRatio(track.sector3Path, 0.5).y - 9 } : null);

  const sfData = track.startFinish || (pathD ? { ...getPathPointAtRatio(pathD, 0.0), isAuto: true } : null);

  const elevationInfo = track.locality && track.country
    ? `GEO COORD // ${track.locality.toUpperCase()}, ${track.country.toUpperCase()}`
    : 'FIA HOMOLOGATION GRADE 1';
  const trackDistInfo = `${track.name?.toUpperCase() || 'GRAND PRIX CIRCUIT'} • ${track.lengthKm || '5.0 KM'}`;

  return (
    <div
      className={`relative select-none pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Multi-stage Gaussian Blur & Outer Glow Filters */}
          <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.88   0 0 0 0 0.02   0 0 0 0 0   0 0 0 0.7 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Technical Coordinate Mesh Pattern */}
          <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F2838" strokeWidth="0.75" strokeOpacity="0.4" />
            <circle cx="40" cy="40" r="1" fill="#323E54" opacity="0.5" />
          </pattern>
        </defs>

        {/* 1. Faint Technical Elevation & Topography Contour Grid Underneath */}
        {showElevation && (
          <g className="elevation-contours">
            <rect
              x={vbX - 100}
              y={vbY - 100}
              width={vbW + 200}
              height={vbH + 200}
              fill={`url(#${gridId})`}
              opacity="0.45"
            />

            {!autoScale && isMexico && (
              <>
                <path
                  d="M 120 480 C 260 520, 500 530, 800 490 C 920 470, 960 410, 900 340 C 840 270, 850 180, 720 120 C 590 60, 360 50, 240 90 C 120 130, 80 240, 100 350 Z"
                  stroke="#222C3E"
                  strokeWidth="1.25"
                  strokeDasharray="4 6"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d="M 180 430 C 300 460, 520 470, 750 440 C 840 420, 870 370, 830 310 C 780 250, 780 190, 680 140 C 580 90, 380 90, 290 120 C 190 150, 150 230, 160 320 Z"
                  stroke="#2A374C"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                  fill="none"
                  opacity="0.45"
                />
                <path
                  d="M 240 370 C 340 400, 520 410, 690 390 C 760 375, 780 340, 750 290 C 710 230, 700 180, 620 150 C 540 120, 400 120, 330 150 C 250 180, 220 240, 230 300 Z"
                  stroke="#31415A"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.4"
                />
              </>
            )}

            <g fontFamily="monospace" fontSize="9" fill="#4B5B75" opacity="0.75" letterSpacing="0.08em">
              <text x={vbX + 16} y={vbY + vbH - 12}>{elevationInfo}</text>
              <text x={vbX + vbW - 16} y={vbY + vbH - 12} textAnchor="end">{trackDistInfo}</text>
            </g>
          </g>
        )}

        {/* 2. Base Asphalt Track Foundation Layers */}
        <path
          d={pathD}
          stroke="#0D1118"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={pathD}
          stroke="#161D28"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={pathD}
          stroke="#202A3A"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. Outer Red Atmospheric Blur / Halo */}
        <path
          d={pathD}
          stroke="#E10600"
          strokeWidth="10"
          strokeOpacity="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#${glowId})`}
        />

        {/* 4. Authentic Telemetry Sectors (S1 Red, S2 Cyan, S3 Yellow) */}
        {showSectors && track.sector1Path && track.sector2Path && track.sector3Path ? (
          <g>
            <path
              d={track.sector1Path}
              stroke="#EF4444"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={track.sector2Path}
              stroke="#06B6D4"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={track.sector3Path}
              stroke="#FACC15"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        ) : (
          <path
            d={pathD}
            stroke="#EF4444"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* 5. Razor-Sharp Thinner Bright Core Racing Line */}
        <path
          d={pathD}
          stroke="#FFFFFF"
          strokeWidth="1.75"
          strokeOpacity="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 6. Neon Racing Laser Beam Traveling along Track */}
        <path
          d={pathD}
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeDasharray="80 720"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
          filter={`url(#${glowId})`}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="800"
            to="0"
            dur={`${animationDur}s`}
            repeatCount="indefinite"
          />
        </path>

        {/* 7. Start / Finish Line Marker with Chevrons & Badge */}
        {showStartFinish && sfData && (
          <g>
            <line
              x1={sfData.x}
              y1={sfData.y - 14}
              x2={sfData.x}
              y2={sfData.y + 14}
              stroke="#00F0FF"
              strokeWidth="3.5"
              strokeLinecap="square"
            />
            <line
              x1={sfData.x}
              y1={sfData.y - 14}
              x2={sfData.x}
              y2={sfData.y + 14}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />

            {sfData.chevronX && (
              <g
                transform={`translate(${sfData.chevronX}, ${sfData.chevronY + 1})`}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 0 -6 L 5 0 L 0 6" />
                <path d="M 6 -6 L 11 0 L 6 6" stroke="#FFFFFF" />
              </g>
            )}

            <g transform={`translate(${sfData.x - 44}, ${sfData.y - 32})`}>
              <rect width="88" height="18" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#00F0FF" strokeWidth="1" />
              <text x="44" y="12" fill="#00F0FF" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="900" letterSpacing="0.08em">
                START / FINISH
              </text>
            </g>
          </g>
        )}

        {/* 8. Sector Milestone Labels (S1 / S2 / S3) */}
        {showSectors && s1Pos && s2Pos && s3Pos && (
          <g fontFamily="monospace" fontSize="9" fontWeight="900" letterSpacing="0.06em">
            {/* Sector 1 */}
            <g transform={`translate(${s1Pos.x}, ${s1Pos.y})`}>
              <rect x="0" y="0" width="38" height="18" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#EF4444" strokeWidth="1.2" />
              <text x="19" y="12" fill="#EF4444" textAnchor="middle">S1</text>
            </g>

            {/* Sector 2 */}
            <g transform={`translate(${s2Pos.x}, ${s2Pos.y})`}>
              <rect x="0" y="0" width="38" height="18" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#06B6D4" strokeWidth="1.2" />
              <text x="19" y="12" fill="#06B6D4" textAnchor="middle">S2</text>
            </g>

            {/* Sector 3 */}
            <g transform={`translate(${s3Pos.x}, ${s3Pos.y})`}>
              <rect x="0" y="0" width="38" height="18" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#FACC15" strokeWidth="1.2" />
              <text x="19" y="12" fill="#FACC15" textAnchor="middle">S3</text>
            </g>
          </g>
        )}

        {/* 9. Live Racing Car with Directional Heading Chevron & Comet Tail */}
        <g filter={`url(#${glowId})`}>
          {/* Comet Streak 2 */}
          <circle r="3.5" fill="#EF4444" fillOpacity="0.3">
            <animateMotion
              path={pathD}
              dur={`${animationDur}s`}
              begin="-0.25s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Comet Streak 1 */}
          <circle r="5" fill="#E10600" fillOpacity="0.5">
            <animateMotion
              path={pathD}
              dur={`${animationDur}s`}
              begin="-0.12s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Pulsing Radar Ring */}
          <circle r="12" fill="#E10600" fillOpacity="0.3">
            <animateMotion
              path={pathD}
              dur={`${animationDur}s`}
              repeatCount="indefinite"
              rotate="auto"
            />
            <animate attributeName="r" values="6;16;6" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Car Core Beacon */}
          <circle r="6" fill="#E10600" stroke="#FFFFFF" strokeWidth="1.5">
            <animateMotion
              path={pathD}
              dur={`${animationDur}s`}
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>
          <circle r="2.5" fill="#FFFFFF">
            <animateMotion
              path={pathD}
              dur={`${animationDur}s`}
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Directional Aerodynamic Racing Car Chevron (Rotates with track heading!) */}
          <g>
            <animateMotion
              path={pathD}
              dur={`${animationDur}s`}
              repeatCount="indefinite"
              rotate="auto"
            />
            <polygon
              points="14,0 -2,-6 3,0 -2,6"
              fill="#FFFFFF"
              stroke="#E10600"
              strokeWidth="1.5"
              filter="drop-shadow(0 0 6px #E10600)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Fine Animated Scanning Line
 * Restrained vertical telemetry sweep over high-tech cards.
 */
export function TelemetryScanLine({ className = '', height = 'h-full' }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${height} ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-12 bg-linear-to-b from-transparent via-[#E10600]/15 to-transparent animate-scan-sweep">
        <div className="w-full h-[1px] bg-linear-to-r from-transparent via-[#E10600]/60 to-transparent" />
      </div>
    </div>
  );
}

/**
 * Restrained Technical Corner Brackets
 * Provides a clean, precision HUD aesthetic around featured race & telemetry modules.
 */
export function HeroWireframeBrackets({ className = '', color = 'border-[#E10600]/50' }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Top Left Bracket */}
      <div className={`absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 ${color}`} />
      <div className="absolute top-1.5 left-6 text-[8px] font-mono text-gray-500 tracking-wider">
        SYS.REC
      </div>

      {/* Top Right Bracket */}
      <div className={`absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 ${color}`} />
      
      {/* Bottom Left Bracket */}
      <div className={`absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 ${color}`} />
      
      {/* Bottom Right Bracket */}
      <div className={`absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 ${color}`} />
      <div className="absolute bottom-1.5 right-6 text-[8px] font-mono text-gray-500 tracking-wider">
        APEX // 2026
      </div>
    </div>
  );
}

/**
 * Geometric Wireframe Grid Backdrop
 * Very low-opacity subtle coordinate grid for dark hero & analytical canvases.
 */
export function TechnicalGridBackdrop({ className = '', opacity = 'opacity-20' }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${opacity} ${className}`}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="race-tech-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
            <circle cx="0" cy="0" r="1" fill="#E10600" fillOpacity="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#race-tech-grid)" />
      </svg>
    </div>
  );
}

/**
 * Standings Trajectory Wireframe
 * Authentic broadcast-grade F1 Championship Points & Trajectory Matrix.
 * Dynamically binds to actual Drivers or Constructors championship standings.
 * Features:
 * - Dynamic cumulative trajectory curves for Top 4 championship contenders
 * - Authentic team colors derived from live driver and constructor affiliations
 * - Luminous leader laser pulse and animated beacon tracking the championship summit
 * - Mid-season Summer Break (RD 12) milestone calculating real-time points gap
 * - Championship leader summit badge displaying live points & win count
 * - Synchronized bottom 4-way classification strip with positions, codes, points and live deltas
 */
export function StandingsTrajectoryWireframe({
  standings = [],
  type = 'drivers',
  className = ''
}) {
  const isDrivers = type === 'drivers' || Boolean(standings?.[0]?.driver_name || standings?.[0]?.driver_id);

  // Extract Top 4 competitors from real standings data
  const item1 = standings?.[0] || {};
  const item2 = standings?.[1] || {};
  const item3 = standings?.[2] || {};
  const item4 = standings?.[3] || {};

  // Formatter helpers
  const getShortName = (item) => {
    if (!item) return '';
    if (isDrivers) {
      if (item.driver_code) return item.driver_code;
      const parts = (item.driver_name || item.name || '').trim().split(' ');
      return (parts[parts.length - 1] || item.driver_id || 'P1').toUpperCase();
    }
    const name = (item.constructor_name || item.name || item.constructor_id || 'TEAM').toUpperCase();
    if (name.includes('RED BULL')) return 'RED BULL';
    if (name.includes('ASTON')) return 'ASTON';
    if (name.includes('MCLAREN')) return 'MCLAREN';
    if (name.includes('MERCEDES')) return 'MERCEDES';
    if (name.includes('FERRARI')) return 'FERRARI';
    if (name.includes('WILLIAMS')) return 'WILLIAMS';
    if (name.includes('ALPINE')) return 'ALPINE';
    if (name.includes('SAUBER') || name.includes('KICK')) return 'SAUBER';
    if (name.includes('HAAS')) return 'HAAS';
    if (name.includes('CADILLAC')) return 'CADILLAC';
    if (name.includes('RACING BULLS') || name === 'RB') return 'RB';
    return name.slice(0, 8);
  };

  const getFullName = (item) => {
    if (!item) return '';
    if (isDrivers) return item.driver_name || item.name || getShortName(item);
    return item.constructor_name || item.name || getShortName(item);
  };

  const p1Short = getShortName(item1) || (isDrivers ? 'ANT' : 'MERCEDES');
  const p1Full = getFullName(item1) || p1Short;
  const p1Points = Number(item1.points) || (isDrivers ? 365 : 607);
  const p1Wins = Number(item1.wins) || (isDrivers ? 9 : 12);
  const p1Color = isDrivers
    ? getDriverColor(item1.driver_id || item1.driver_name, item1.constructor_name)
    : getTeamColor(item1.constructor_name || item1.constructor_id);

  const p2Short = getShortName(item2) || (isDrivers ? 'RUS' : 'FERRARI');
  const p2Full = getFullName(item2) || p2Short;
  const p2Points = Number(item2.points) || (isDrivers ? 242 : 474);
  const p2Wins = Number(item2.wins) || (isDrivers ? 3 : 2);
  const p2Gap = Math.max(0, Math.round(p1Points - p2Points));
  const p2Color = isDrivers
    ? getDriverColor(item2.driver_id || item2.driver_name, item2.constructor_name)
    : getTeamColor(item2.constructor_name || item2.constructor_id);

  const p3Short = getShortName(item3) || (isDrivers ? 'HAM' : 'RED BULL');
  const p3Full = getFullName(item3) || p3Short;
  const p3Points = Number(item3.points) || (isDrivers ? 241 : 355);
  const p3Gap = Math.max(0, Math.round(p1Points - p3Points));
  const p3Color = isDrivers
    ? getDriverColor(item3.driver_id || item3.driver_name, item3.constructor_name)
    : getTeamColor(item3.constructor_name || item3.constructor_id);

  const p4Short = getShortName(item4) || (isDrivers ? 'VER' : 'MCLAREN');
  const p4Full = getFullName(item4) || p4Short;
  const p4Points = Number(item4.points) || (isDrivers ? 236 : 355);
  const p4Gap = Math.max(0, Math.round(p1Points - p4Points));
  const p4Color = isDrivers
    ? getDriverColor(item4.driver_id || item4.driver_name, item4.constructor_name)
    : getTeamColor(item4.constructor_name || item4.constructor_id);

  // Normalised trajectory curves across 24 championship rounds (540x310 canvas)
  const leaderPath = "M 40 255 C 110 230, 165 195, 220 155 C 285 110, 360 70, 430 46 C 465 35, 490 32, 510 30";
  const p2Path = "M 40 265 C 110 245, 165 218, 220 185 C 285 145, 360 110, 430 85 C 465 74, 490 68, 510 65";
  const p3Path = "M 40 274 C 110 258, 165 238, 220 212 C 285 178, 360 148, 430 122 C 465 112, 490 106, 510 102";
  const p4Path = "M 40 282 C 110 270, 165 254, 220 234 C 285 204, 360 176, 430 150 C 465 142, 490 136, 510 132";

  const glowIdP1 = `standings-glow-p1-${type}`;
  const glowIdP2 = `standings-glow-p2-${type}`;
  const meshId = `standings-mesh-${type}`;

  return (
    <div className={`relative pointer-events-none select-none overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 540 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Dynamic Team P1 Glow Filter */}
          <filter id={glowIdP1} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={p1Color} floodOpacity="0.7" />
          </filter>

          {/* Dynamic Team P2 Glow Filter */}
          <filter id={glowIdP2} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={p2Color} floodOpacity="0.6" />
          </filter>

          {/* Precision Technical Mesh Grid Pattern */}
          <pattern id={meshId} width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1D2534" strokeWidth="0.7" strokeOpacity="0.35" />
            <circle cx="36" cy="36" r="0.75" fill="#334155" opacity="0.4" />
          </pattern>
        </defs>

        {/* 1. Background Technical Grid */}
        <rect width="540" height="310" fill={`url(#${meshId})`} opacity="0.5" />

        {/* Horizontal Points / Delta Division Bands */}
        <g stroke="#1F2839" strokeWidth="1" strokeDasharray="3 4" opacity="0.6">
          <line x1="30" y1="50" x2="510" y2="50" />
          <line x1="30" y1="105" x2="510" y2="105" />
          <line x1="30" y1="160" x2="510" y2="160" />
          <line x1="30" y1="215" x2="510" y2="215" />
        </g>

        {/* Vertical Championship Rounds Milestone Gates */}
        <g stroke="#1A2230" strokeWidth="1" strokeDasharray="2 4" opacity="0.7">
          <line x1="120" y1="30" x2="120" y2="265" />
          <line x1="220" y1="30" x2="220" y2="265" />
          <line x1="330" y1="30" x2="330" y2="265" />
          <line x1="430" y1="30" x2="430" y2="265" />
        </g>

        {/* Round Gate Labels */}
        <g fontFamily="monospace" fontSize="7.5" fill="#4B5870" opacity="0.8">
          <text x="120" y="260" textAnchor="middle">RD 06</text>
          <text x="220" y="260" textAnchor="middle">RD 12</text>
          <text x="330" y="260" textAnchor="middle">RD 18</text>
          <text x="430" y="260" textAnchor="middle">RD 24</text>
        </g>

        {/* 2. P4 Contender Line */}
        <path
          d={p4Path}
          stroke={p4Color}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* 3. P3 Contender Line */}
        <path
          d={p3Path}
          stroke={p3Color}
          strokeWidth="1.75"
          strokeDasharray="4 4"
          strokeOpacity="0.65"
          fill="none"
        />

        {/* 4. P2 Contender Line (P2 Team Color) */}
        <path
          d={p2Path}
          stroke={p2Color}
          strokeWidth="2.2"
          strokeDasharray="6 4"
          strokeOpacity="0.85"
          fill="none"
          strokeLinecap="round"
          filter={`url(#${glowIdP2})`}
        />

        {/* 5. Championship P1 Leader Line (Luminous Team Color & White Core) */}
        <path
          d={leaderPath}
          stroke={p1Color}
          strokeWidth="6"
          strokeOpacity="0.35"
          strokeLinecap="round"
          fill="none"
          filter={`url(#${glowIdP1})`}
        />
        <path
          d={leaderPath}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.95"
          strokeLinecap="round"
          fill="none"
        />

        {/* Traveling Laser Pulse along P1 Leader Line */}
        <path
          d={leaderPath}
          stroke={p1Color}
          strokeWidth="2.5"
          strokeDasharray="50 450"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="500"
            to="0"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* 6. Live Animated P1 Leader Beacon */}
        <g>
          <circle r="4" fill={p1Color} fillOpacity="0.35">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              begin="-0.15s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="6" fill={p1Color} fillOpacity="0.5">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              begin="-0.08s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="12" fill={p1Color} fillOpacity="0.25">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              repeatCount="indefinite"
            />
            <animate attributeName="r" values="6;16;6" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle r="4.5" fill="#FFFFFF" stroke={p1Color} strokeWidth="1.5">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* 7. Milestone 1: Summer Break Crossover ($x=220, y=185$) */}
        <g>
          <line x1="220" y1="185" x2="220" y2="135" stroke={p2Color} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="220" cy="185" r="4" fill={p2Color} stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(155, 102)">
            <rect width="130" height="28" rx="4" fill="#0A0E17" fillOpacity="0.94" stroke={p2Color} strokeWidth="1" />
            <text x="65" y="12" fill={p2Color} textAnchor="middle" fontSize="7.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              RD 12 // SUMMER BREAK
            </text>
            <text x="65" y="22" fill="#E2E8F0" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              P2 {p2Short} // GAP: +{p2Gap} PTS
            </text>
          </g>
        </g>

        {/* 8. Milestone 2: Championship Push ($x=330, y=122$) */}
        <g>
          <line x1="330" y1="122" x2="330" y2="70" stroke={p3Color} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="330" cy="122" r="4" fill={p3Color} stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(265, 38)">
            <rect width="130" height="28" rx="4" fill="#0A0E17" fillOpacity="0.94" stroke={p3Color} strokeWidth="1" />
            <text x="65" y="12" fill={p3Color} textAnchor="middle" fontSize="7.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              RD 18 // TITLE CONTENDER
            </text>
            <text x="65" y="22" fill="#E2E8F0" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              P3 {p3Short} // {p3Points}P (+{p3Gap})
            </text>
          </g>
        </g>

        {/* 9. Milestone 3: P1 Championship Leader Summit ($x=505, y=30$) */}
        <g>
          <circle cx="505" cy="30" r="5" fill={p1Color} stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(378, 8)">
            <rect width="128" height="28" rx="4" fill="#0A0E17" fillOpacity="0.94" stroke={p1Color} strokeWidth="1" />
            <text x="64" y="12" fill={p1Color} textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              P1 {p1Short.toUpperCase()} // LEADER
            </text>
            <text x="64" y="22" fill="#F8FAFC" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              {p1Points} PTS &bull; {p1Wins} WINS
            </text>
          </g>
        </g>

        {/* 10. Bottom Synchronized Standings Matrix Strip */}
        <g transform="translate(25, 275)" fontFamily="monospace" fontSize="8" fontWeight="bold">
          <rect width="490" height="26" rx="6" fill="#0C1017" fillOpacity="0.92" stroke="#1F2839" strokeWidth="1" />

          {/* Col 1: P1 Leader */}
          <g transform="translate(12, 16)">
            <circle cx="0" cy="-3" r="3.5" fill={p1Color} />
            <text x="8" y="-1" fill={p1Color} fontSize="8" fontWeight="900">P1</text>
            <text x="24" y="-1" fill="#FFFFFF" fontSize="8">{p1Short}</text>
            <text x="62" y="-1" fill={p1Color} fontSize="8" fontWeight="900">{p1Points}P</text>
            <text x="96" y="-1" fill="#F59E0B" fontSize="7.5">{p1Wins}W</text>
          </g>

          {/* Col 2: P2 */}
          <g transform="translate(136, 16)">
            <circle cx="0" cy="-3" r="3.5" fill={p2Color} />
            <text x="8" y="-1" fill={p2Color} fontSize="8" fontWeight="900">P2</text>
            <text x="24" y="-1" fill="#FFFFFF" fontSize="8">{p2Short}</text>
            <text x="62" y="-1" fill="#E2E8F0" fontSize="8">{p2Points}P</text>
            <text x="96" y="-1" fill="#94A3B8" fontSize="7.5">+{p2Gap}</text>
          </g>

          {/* Col 3: P3 */}
          <g transform="translate(260, 16)">
            <circle cx="0" cy="-3" r="3.5" fill={p3Color} />
            <text x="8" y="-1" fill={p3Color} fontSize="8" fontWeight="900">P3</text>
            <text x="24" y="-1" fill="#FFFFFF" fontSize="8">{p3Short}</text>
            <text x="62" y="-1" fill="#E2E8F0" fontSize="8">{p3Points}P</text>
            <text x="96" y="-1" fill="#94A3B8" fontSize="7.5">+{p3Gap}</text>
          </g>

          {/* Col 4: P4 */}
          <g transform="translate(384, 16)">
            <circle cx="0" cy="-3" r="3.5" fill={p4Color} />
            <text x="8" y="-1" fill={p4Color} fontSize="8" fontWeight="900">P4</text>
            <text x="24" y="-1" fill="#FFFFFF" fontSize="8">{p4Short}</text>
            <text x="62" y="-1" fill="#E2E8F0" fontSize="8">{p4Points}P</text>
            <text x="96" y="-1" fill="#94A3B8" fontSize="7.5">+{p4Gap}</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Timing Grid Wireframe
 * Authentic broadcast-grade F1 Championship Timing & Standings Matrix.
 * Features:
 * - Multi-driver cumulative points & timing delta trajectory curves (P1 Leader vs P2 vs P3)
 * - Luminous red & gold leader beam with traveling laser pulse and animated beacon
 * - Vertical championship milestone gates (RD 01, RD 06, RD 12, RD 18, RD 24)
 * - Milestone tags (P1 Standings Leader, Summer Break Crossover, Purple Fastest Lap Sector)
 * - Synchronized live sector split status bar (S1 Green, S2 Purple, S3 Green, Delta Interval)
 */
export function TimingGridWireframe({ className = '', standings = null, type = 'drivers' }) {
  if (standings && standings.length > 0) {
    return <StandingsTrajectoryWireframe standings={standings} type={type} className={className} />;
  }
  const leaderPath = "M 40 255 C 110 235, 165 205, 220 165 C 285 125, 360 85, 430 58 C 465 45, 490 38, 510 34";
  const p2Path = "M 40 268 C 110 252, 165 228, 220 192 C 285 152, 360 115, 430 88 C 465 76, 490 68, 510 64";
  const p3Path = "M 40 280 C 110 268, 165 248, 220 220 C 285 185, 360 152, 430 125 C 465 115, 490 108, 510 104";

  return (
    <div className={`relative pointer-events-none select-none overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 540 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Multi-stage Glow Filters */}
          <filter id="timing-glow-red" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.88   0 0 0 0 0.02   0 0 0 0 0   0 0 0 0.7 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="timing-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00F0FF" floodOpacity="0.5" />
          </filter>

          <filter id="timing-glow-purple" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#A855F7" floodOpacity="0.6" />
          </filter>

          {/* Coordinate Mesh Grid Pattern */}
          <pattern id="timing-mesh-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1D2534" strokeWidth="0.7" strokeOpacity="0.35" />
            <circle cx="36" cy="36" r="0.75" fill="#334155" opacity="0.4" />
          </pattern>
        </defs>

        {/* 1. Background Technical Grid */}
        <rect width="540" height="310" fill="url(#timing-mesh-grid)" opacity="0.5" />

        {/* Horizontal Points / Delta Division Bands */}
        <g stroke="#1F2839" strokeWidth="1" strokeDasharray="3 4" opacity="0.6">
          <line x1="30" y1="50" x2="510" y2="50" />
          <line x1="30" y1="105" x2="510" y2="105" />
          <line x1="30" y1="160" x2="510" y2="160" />
          <line x1="30" y1="215" x2="510" y2="215" />
        </g>

        {/* Vertical Championship Rounds Milestone Gates */}
        <g stroke="#1A2230" strokeWidth="1" strokeDasharray="2 4" opacity="0.7">
          <line x1="120" y1="30" x2="120" y2="265" />
          <line x1="220" y1="30" x2="220" y2="265" />
          <line x1="330" y1="30" x2="330" y2="265" />
          <line x1="430" y1="30" x2="430" y2="265" />
        </g>

        {/* Round Gate Labels */}
        <g fontFamily="monospace" fontSize="7.5" fill="#4B5870" opacity="0.8">
          <text x="120" y="260" textAnchor="middle">RD 06</text>
          <text x="220" y="260" textAnchor="middle">RD 12</text>
          <text x="330" y="260" textAnchor="middle">RD 18</text>
          <text x="430" y="260" textAnchor="middle">RD 24</text>
        </g>

        {/* 2. P3 Contender Line (Muted Slate) */}
        <path
          d={p3Path}
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* 3. P2 Contender Line (Neon Cyan) */}
        <path
          d={p2Path}
          stroke="#00F0FF"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeOpacity="0.8"
          fill="none"
          strokeLinecap="round"
          filter="url(#timing-glow-cyan)"
        />

        {/* 4. Championship P1 Leader Line (Luminous Red & Gold) */}
        <path
          d={leaderPath}
          stroke="#E10600"
          strokeWidth="6"
          strokeOpacity="0.3"
          strokeLinecap="round"
          fill="none"
          filter="url(#timing-glow-red)"
        />
        <path
          d={leaderPath}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.95"
          strokeLinecap="round"
          fill="none"
        />

        {/* Traveling Laser Pulse along P1 Leader Line */}
        <path
          d={leaderPath}
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeDasharray="50 450"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="500"
            to="0"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* 5. Live Animated P1 Leader Beacon */}
        <g filter="url(#timing-glow-red)">
          <circle r="4" fill="#EF4444" fillOpacity="0.35">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              begin="-0.15s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="6" fill="#E10600" fillOpacity="0.5">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              begin="-0.08s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="12" fill="#E10600" fillOpacity="0.25">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              repeatCount="indefinite"
            />
            <animate attributeName="r" values="6;16;6" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle r="4.5" fill="#FFFFFF" stroke="#E10600" strokeWidth="1.5">
            <animateMotion
              path={leaderPath}
              dur="4.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* 6. Milestone 1: Summer Break Crossover ($x=220, y=165$) */}
        <g>
          <line x1="220" y1="165" x2="220" y2="120" stroke="#00F0FF" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="220" cy="165" r="4" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(165, 88)">
            <rect width="110" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#00F0FF" strokeWidth="1" />
            <text x="55" y="12" fill="#00F0FF" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              RD 12 // SUMMER BREAK
            </text>
            <text x="55" y="22" fill="#67E8F9" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              GAP: +24 PTS [P1 vs P2]
            </text>
          </g>
        </g>

        {/* 7. Milestone 2: Fastest Lap / Purple Sector ($x=330, y=95$) */}
        <g>
          <line x1="330" y1="95" x2="330" y2="40" stroke="#A855F7" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="330" cy="95" r="4" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(275, 8)">
            <rect width="110" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#A855F7" strokeWidth="1" />
            <text x="55" y="12" fill="#C084FC" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              PURPLE SECTOR 2 [OB]
            </text>
            <text x="55" y="22" fill="#E9D5FF" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              DELTA: -0.218s [FASTEST]
            </text>
          </g>
        </g>

        {/* 8. Milestone 3: P1 Championship Leader Summit ($x=485, y=40$) */}
        <g>
          <circle cx="505" cy="35" r="5" fill="#E10600" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(390, 8)">
            <rect width="105" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#E10600" strokeWidth="1" />
            <text x="52" y="12" fill="#EF4444" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              P1 STANDINGS LEADER
            </text>
            <text x="52" y="22" fill="#FCA5A5" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              393 PTS &bull; 8 WINS
            </text>
          </g>
        </g>

        {/* 9. Bottom Synchronized Timing & Split Matrix Strip */}
        <g transform="translate(25, 275)" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
          <rect width="490" height="26" rx="6" fill="#0C1017" fillOpacity="0.9" stroke="#1F2839" strokeWidth="1" />

          {/* S1 Split */}
          <g transform="translate(14, 16)">
            <text fill="#64748B" fontSize="8">S1</text>
            <rect x="18" y="-9" width="56" height="11" rx="3" fill="#064E3B" stroke="#059669" strokeWidth="0.8" />
            <text x="46" y="-1" fill="#34D399" fontSize="8" textAnchor="middle">24.180s [PB]</text>
          </g>

          {/* S2 Split (Purple Overall Best) */}
          <g transform="translate(100, 16)">
            <text fill="#64748B" fontSize="8">S2</text>
            <rect x="18" y="-9" width="56" height="11" rx="3" fill="#581C87" stroke="#9333EA" strokeWidth="0.8" />
            <text x="46" y="-1" fill="#C084FC" fontSize="8" textAnchor="middle">32.410s [OB]</text>
          </g>

          {/* S3 Split */}
          <g transform="translate(186, 16)">
            <text fill="#64748B" fontSize="8">S3</text>
            <rect x="18" y="-9" width="56" height="11" rx="3" fill="#064E3B" stroke="#059669" strokeWidth="0.8" />
            <text x="46" y="-1" fill="#34D399" fontSize="8" textAnchor="middle">21.090s [PB]</text>
          </g>

          {/* Delta Interval */}
          <g transform="translate(272, 16)">
            <text fill="#64748B" fontSize="8">DELTA</text>
            <text x="36" y="-1" fill="#38BDF8" fontSize="8.5" fontWeight="900">-0.342s</text>
          </g>

          {/* Line Legend */}
          <g transform="translate(365, 16)">
            <line x1="0" y1="-4" x2="14" y2="-4" stroke="#E10600" strokeWidth="2" />
            <text x="18" y="-1" fill="#F87171" fontSize="8">P1 LEADER</text>
            <line x1="68" y1="-4" x2="82" y2="-4" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 2" />
            <text x="86" y="-1" fill="#38BDF8" fontSize="8">P2 CHASE</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Constructor Aerodynamic Flow Wireframe
 * Authentic broadcast-grade F1 Wind Tunnel CFD & Aerodynamic Parity Console.
 * Features:
 * - Multi-layer CFD aerodynamic streamlines with velocity vectors (High/Low pressure channels)
 * - Animated rotating aerodynamic vortex cores (Front wing wake & Rear diffuser upwash)
 * - Live animated aerodynamic flow particles rushing across the aero chamber
 * - 3 CFD Telemetry milestone badges (Downforce 1,840kg, Ground-Effect Venturi Suction, Rear Wing DRS -38%)
 * - Bottom Constructor Parity comparison matrix (McLaren, Ferrari, Red Bull, Mercedes)
 */
export function ConstructorFlowWireframe({ className = '' }) {
  const stream1 = "M 30 75 C 130 65, 200 130, 310 115 C 390 105, 450 70, 510 60";
  const stream2 = "M 30 135 C 110 120, 180 195, 290 180 C 380 165, 440 125, 510 110";
  const stream3 = "M 30 195 C 120 185, 210 235, 320 220 C 400 205, 450 175, 510 165";
  const stream4 = "M 30 255 C 140 245, 230 275, 340 260 C 410 245, 460 225, 510 215";

  return (
    <div className={`relative pointer-events-none select-none overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 540 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Multi-stage Glow Filters */}
          <filter id="aero-glow-red" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.88   0 0 0 0 0.02   0 0 0 0 0   0 0 0 0.7 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="aero-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00F0FF" floodOpacity="0.5" />
          </filter>

          <filter id="aero-glow-amber" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.5" />
          </filter>

          {/* Wind Tunnel Coordinate Mesh */}
          <pattern id="aero-mesh-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1D2534" strokeWidth="0.7" strokeOpacity="0.35" />
            <circle cx="36" cy="36" r="0.75" fill="#334155" opacity="0.4" />
          </pattern>
        </defs>

        {/* 1. Background Technical Wind Tunnel Grid */}
        <rect width="540" height="310" fill="url(#aero-mesh-grid)" opacity="0.5" />

        {/* Pressure Isobar Contours */}
        <ellipse cx="270" cy="160" rx="180" ry="100" stroke="#1C2433" strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
        <ellipse cx="270" cy="160" rx="100" ry="55" stroke="#253044" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />

        {/* 2. Aerodynamic Streamlines */}
        {/* Stream 1: Front Wing to Upper Chassis (Cyan) */}
        <path
          d={stream1}
          stroke="#00F0FF"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeOpacity="0.8"
          fill="none"
          strokeLinecap="round"
          filter="url(#aero-glow-cyan)"
        />

        {/* Stream 2: Ground-Effect Venturi Tunnels (Luminous Red) */}
        <path
          d={stream2}
          stroke="#E10600"
          strokeWidth="6"
          strokeOpacity="0.25"
          strokeLinecap="round"
          fill="none"
          filter="url(#aero-glow-red)"
        />
        <path
          d={stream2}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stream 3: Sidepod & Engine Airbox (Amber) */}
        <path
          d={stream3}
          stroke="#F59E0B"
          strokeWidth="2"
          strokeDasharray="8 5"
          strokeOpacity="0.8"
          fill="none"
          strokeLinecap="round"
          filter="url(#aero-glow-amber)"
        />

        {/* Stream 4: Floor Diffuser Upwash (Deep Blue/Slate) */}
        <path
          d={stream4}
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.65"
          fill="none"
        />

        {/* Traveling Laser Pulses along Streams */}
        <path
          d={stream1}
          stroke="#00F0FF"
          strokeWidth="2.5"
          strokeDasharray="40 400"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="500"
            to="0"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d={stream2}
          stroke="#E10600"
          strokeWidth="2.5"
          strokeDasharray="50 400"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="500"
            to="0"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </path>

        {/* 3. Rotating Vortex Cores */}
        {/* Front Wing Wake Vortex */}
        <g transform="translate(195, 155)">
          <circle r="18" stroke="#00F0FF" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="10" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 3" opacity="0.5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill="#00F0FF" />
        </g>

        {/* Rear Diffuser Vortex */}
        <g transform="translate(425, 140)">
          <circle r="22" stroke="#E10600" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.65">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360"
              to="0"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="12" stroke="#F43F5E" strokeWidth="1" strokeDasharray="2 3" opacity="0.5">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="2.2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill="#E10600" />
        </g>

        {/* 4. Telemetry Milestone Badges */}
        {/* Badge 1: Downforce Efficiency ($x=115, y=35$) */}
        <g>
          <line x1="115" y1="72" x2="115" y2="40" stroke="#00F0FF" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="115" cy="72" r="4" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(60, 10)">
            <rect width="115" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#00F0FF" strokeWidth="1" />
            <text x="57" y="12" fill="#00F0FF" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              DOWNFORCE // 1,840 KG
            </text>
            <text x="57" y="22" fill="#67E8F9" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              EFFICIENCY: 3.42 L/D
            </text>
          </g>
        </g>

        {/* Badge 2: Ground-Effect Venturi Suction ($x=290, y=180$) */}
        <g>
          <line x1="290" y1="180" x2="290" y2="125" stroke="#E10600" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="290" cy="180" r="4" fill="#E10600" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(230, 95)">
            <rect width="120" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#E10600" strokeWidth="1" />
            <text x="60" y="12" fill="#EF4444" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              VENTURI SUCTION
            </text>
            <text x="60" y="22" fill="#FCA5A5" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              FLOOR DELTA: -28.4 KPA
            </text>
          </g>
        </g>

        {/* Badge 3: Rear Wing DRS Aerodynamics ($x=455, y=75$) */}
        <g>
          <line x1="455" y1="75" x2="455" y2="35" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="455" cy="75" r="4" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(395, 10)">
            <rect width="115" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#F59E0B" strokeWidth="1" />
            <text x="57" y="12" fill="#F59E0B" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              DRS AERO DYNAMICS
            </text>
            <text x="57" y="22" fill="#FDE68A" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              -38% DRAG REDUCTION
            </text>
          </g>
        </g>

        {/* 5. Bottom Constructor Championship Parity Strip */}
        <g transform="translate(25, 275)" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
          <rect width="490" height="26" rx="6" fill="#0C1017" fillOpacity="0.9" stroke="#1F2839" strokeWidth="1" />

          {/* McLaren */}
          <g transform="translate(14, 16)">
            <circle cx="0" cy="-3" r="3.5" fill="#FF8000" />
            <text x="8" y="-1" fill="#FF8000" fontSize="8">MCLAREN</text>
            <text x="58" y="-1" fill="#E2E8F0" fontSize="8">584P</text>
          </g>

          {/* Ferrari */}
          <g transform="translate(118, 16)">
            <circle cx="0" cy="-3" r="3.5" fill="#E80020" />
            <text x="8" y="-1" fill="#E80020" fontSize="8">FERRARI</text>
            <text x="54" y="-1" fill="#E2E8F0" fontSize="8">543P</text>
          </g>

          {/* Red Bull */}
          <g transform="translate(216, 16)">
            <circle cx="0" cy="-3" r="3.5" fill="#3671C6" />
            <text x="8" y="-1" fill="#3671C6" fontSize="8">RED BULL</text>
            <text x="58" y="-1" fill="#E2E8F0" fontSize="8">502P</text>
          </g>

          {/* Mercedes */}
          <g transform="translate(320, 16)">
            <circle cx="0" cy="-3" r="3.5" fill="#27F4D2" />
            <text x="8" y="-1" fill="#27F4D2" fontSize="8">MERCEDES</text>
            <text x="58" y="-1" fill="#E2E8F0" fontSize="8">382P</text>
          </g>

          {/* Telemetry Tag */}
          <g transform="translate(425, 16)">
            <rect x="0" y="-8" width="56" height="10" rx="2" fill="#042F2E" stroke="#0D9488" strokeWidth="0.8" />
            <text x="28" y="-1" fill="#2DD4BF" fontSize="7.5" textAnchor="middle">CFD VERIFIED</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Apex Track Wireframe
 * Authentic broadcast-grade F1 Driver Performance & Apex Telemetry Console.
 * Features:
 * - Sweeping Grand Prix corner geometry with asphalt ribbon and FIA red & white rumble kerbs
 * - Dual-line comparison: Optimal Geometric Line (Cyan) vs Driver Attack Trajectory (Luminous Red/White)
 * - Live animated F1 racing car heading chevron, comet trails & pulsing radar beacon
 * - 3 Telemetry milestone callout tags (100M Braking, Apex 1 Clipping Point, Full Throttle Exit)
 * - Synchronized driver input dashboard strip (Throttle meter, Brake meter, Lateral G-Force)
 */
export function ApexTrackWireframe({ className = '' }) {
  const trajectoryPath = "M 40 245 C 110 245, 170 205, 210 148 C 250 88, 310 68, 360 88 C 420 112, 450 178, 500 225";
  const geometricPath = "M 32 260 C 102 260, 155 220, 195 162 C 238 102, 292 82, 342 102 C 402 126, 438 190, 488 238";

  return (
    <div className={`relative pointer-events-none select-none overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 540 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-h-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Multi-stage Glow Filters */}
          <filter id="apex-glow-red" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.88   0 0 0 0 0.02   0 0 0 0 0   0 0 0 0.7 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="apex-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00F0FF" floodOpacity="0.5" />
          </filter>

          {/* Coordinate Mesh Grid Pattern */}
          <pattern id="apex-mesh-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1D2534" strokeWidth="0.7" strokeOpacity="0.35" />
            <circle cx="36" cy="36" r="0.75" fill="#334155" opacity="0.4" />
          </pattern>
        </defs>

        {/* 1. Technical Coordinate Grid Mesh */}
        <rect width="540" height="310" fill="url(#apex-mesh-grid)" opacity="0.5" />

        {/* Topographic Lateral G-Force Contours */}
        <ellipse cx="295" cy="115" rx="140" ry="85" stroke="#1C2433" strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
        <ellipse cx="295" cy="115" rx="85" ry="50" stroke="#253044" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />

        {/* 2. Base Asphalt Track Road Surface */}
        <path
          d={trajectoryPath}
          stroke="#0D1118"
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={trajectoryPath}
          stroke="#161D29"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d={trajectoryPath}
          stroke="#1F2838"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. Authentic FIA Apex Rumble Kerbs (Inside Apex Arc) */}
        <path
          d="M 220 132 C 255 76, 305 56, 355 76"
          stroke="#E10600"
          strokeWidth="7"
          strokeDasharray="10 10"
          strokeLinecap="butt"
          fill="none"
        />
        <path
          d="M 220 132 C 255 76, 305 56, 355 76"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeDasharray="10 10"
          strokeDashoffset="10"
          strokeLinecap="butt"
          fill="none"
        />

        {/* Outer Exit Kerb */}
        <path
          d="M 430 145 C 455 180, 480 215, 510 242"
          stroke="#E10600"
          strokeWidth="6"
          strokeDasharray="8 8"
          strokeLinecap="butt"
          fill="none"
        />
        <path
          d="M 430 145 C 455 180, 480 215, 510 242"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeDasharray="8 8"
          strokeDashoffset="8"
          strokeLinecap="butt"
          fill="none"
        />

        {/* 4. Telemetry Line 1: Optimal Geometric Qualifying Line (Cyan) */}
        <path
          d={geometricPath}
          stroke="#00F0FF"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeOpacity="0.75"
          fill="none"
          strokeLinecap="round"
          filter="url(#apex-glow-cyan)"
        />

        {/* 5. Telemetry Line 2: Driver Dynamic Attack Trajectory (Luminous Red & White) */}
        <path
          d={trajectoryPath}
          stroke="#E10600"
          strokeWidth="6"
          strokeOpacity="0.3"
          strokeLinecap="round"
          fill="none"
          filter="url(#apex-glow-red)"
        />
        <path
          d={trajectoryPath}
          stroke="#FFFFFF"
          strokeWidth="1.75"
          strokeOpacity="0.9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Traveling Laser Pulse along Driver Line */}
        <path
          d={trajectoryPath}
          stroke="#00F0FF"
          strokeWidth="2.5"
          strokeDasharray="50 450"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
          filter="url(#apex-glow-cyan)"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="500"
            to="0"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </path>

        {/* 6. Milestone 1: 100M Braking Zone Tag */}
        <g>
          <line x1="136" y1="222" x2="136" y2="175" stroke="#EC4899" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="136" cy="222" r="4.5" fill="#EC4899" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(86, 142)">
            <rect width="100" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#EC4899" strokeWidth="1" />
            <text x="50" y="12" fill="#EC4899" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              BRAKE // 100M
            </text>
            <text x="50" y="22" fill="#F472B6" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              318 → 124 KM/H
            </text>
          </g>
        </g>

        {/* 7. Milestone 2: Apex Clipping Point Tag */}
        <g>
          <line x1="281" y1="90" x2="281" y2="35" stroke="#00F0FF" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="281" cy="90" r="4.5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(226, 8)">
            <rect width="110" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#00F0FF" strokeWidth="1" />
            <text x="55" y="12" fill="#00F0FF" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              APEX 1 // 4.8G
            </text>
            <text x="55" y="22" fill="#67E8F9" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              124 KM/H &bull; GEAR 3
            </text>
          </g>
        </g>

        {/* 8. Milestone 3: Full Throttle Exit Tag */}
        <g>
          <line x1="434" y1="151" x2="434" y2="95" stroke="#10B981" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
          <circle cx="434" cy="151" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform="translate(379, 62)">
            <rect width="110" height="28" rx="4" fill="#0A0E17" fillOpacity="0.92" stroke="#10B981" strokeWidth="1" />
            <text x="55" y="12" fill="#10B981" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fontWeight="900" letterSpacing="0.06em">
              FULL THROTTLE EXIT
            </text>
            <text x="55" y="22" fill="#6EE7B7" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold">
              DELTA: -0.142s GAIN
            </text>
          </g>
        </g>

        {/* 9. Live Animated F1 Car on Track */}
        <g filter="url(#apex-glow-red)">
          {/* Trailing Comet Streak */}
          <circle r="4" fill="#EF4444" fillOpacity="0.3">
            <animateMotion
              path={trajectoryPath}
              dur="4.5s"
              begin="-0.15s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>
          <circle r="6" fill="#E10600" fillOpacity="0.45">
            <animateMotion
              path={trajectoryPath}
              dur="4.5s"
              begin="-0.08s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Pulsing Radar Ring */}
          <circle r="12" fill="#E10600" fillOpacity="0.25">
            <animateMotion
              path={trajectoryPath}
              dur="4.5s"
              repeatCount="indefinite"
              rotate="auto"
            />
            <animate attributeName="r" values="6;16;6" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1s" repeatCount="indefinite" />
          </circle>

          {/* Aerodynamic Heading Chevron */}
          <g>
            <animateMotion
              path={trajectoryPath}
              dur="4.5s"
              repeatCount="indefinite"
              rotate="auto"
            />
            <polygon
              points="14,0 -2,-6 3,0 -2,6"
              fill="#FFFFFF"
              stroke="#E10600"
              strokeWidth="1.5"
            />
          </g>
        </g>

        {/* 10. Bottom Real-Time Telemetry Dashboard Strip */}
        <g transform="translate(25, 275)" fontFamily="monospace" fontSize="8.5" fontWeight="bold">
          {/* Card Frame */}
          <rect width="490" height="26" rx="6" fill="#0C1017" fillOpacity="0.9" stroke="#1F2839" strokeWidth="1" />

          {/* Throttle Gauge */}
          <g transform="translate(14, 16)">
            <text fill="#64748B" fontSize="8">THROTTLE</text>
            <rect x="52" y="-9" width="46" height="7" rx="2" fill="#15231C" stroke="#059669" strokeWidth="0.8" />
            <rect x="53" y="-8" width="40" height="5" rx="1.5" fill="#10B981">
              <animate attributeName="width" values="10;42;38;10" dur="4.5s" repeatCount="indefinite" />
            </rect>
            <text x="104" y="-3" fill="#10B981" fontSize="8">92%</text>
          </g>

          {/* Brake Gauge */}
          <g transform="translate(148, 16)">
            <text fill="#64748B" fontSize="8">BRAKE</text>
            <rect x="36" y="-9" width="40" height="7" rx="2" fill="#241519" stroke="#E11D48" strokeWidth="0.8" />
            <rect x="37" y="-8" width="8" height="5" rx="1.5" fill="#F43F5E">
              <animate attributeName="width" values="36;4;0;36" dur="4.5s" repeatCount="indefinite" />
            </rect>
            <text x="82" y="-3" fill="#F43F5E" fontSize="8">PEAK</text>
          </g>

          {/* Lateral G */}
          <g transform="translate(262, 16)">
            <text fill="#64748B" fontSize="8">LAT G</text>
            <text x="35" y="-2" fill="#00F0FF" fontSize="9" fontWeight="900">4.8 G</text>
          </g>

          {/* Line Legend */}
          <g transform="translate(340, 16)">
            <line x1="0" y1="-4" x2="16" y2="-4" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 2" />
            <text x="22" y="-2" fill="#94A3B8" fontSize="8">OPTIMAL</text>
            <line x1="68" y1="-4" x2="84" y2="-4" stroke="#E10600" strokeWidth="2" />
            <text x="90" y="-2" fill="#F87171" fontSize="8">ATTACK</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Live Telemetry Waveform Wireframe
 * Animated throttle/speed/RPM telemetry signal for analytical pages.
 */
export function LiveTelemetryWaveform({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 380 90" fill="none" className="w-full h-full">
        <path
          d="M 10 50 L 50 50 L 70 20 L 90 70 L 110 35 L 130 50 L 170 50 L 190 15 L 210 75 L 230 40 L 250 50 L 300 50 L 320 25 L 340 60 L 370 50"
          stroke="#E10600"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-dash-trace"
        />
        <path
          d="M 10 50 L 50 50 L 70 30 L 90 60 L 110 40 L 130 50 L 170 50 L 190 25 L 210 65 L 230 45 L 250 50 L 300 50 L 320 35 L 340 55 L 370 50"
          stroke="#384252"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        />
        <circle cx="190" cy="15" r="3.5" fill="#E10600" className="animate-telemetry-pulse" />
        <circle cx="320" cy="25" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/**
 * Universal Page Header Hero Component
 * Gives every Racepective sub-page a high-impact, cohesive dark telemetry hero
 * with page-specific animated wireframe motifs and live metadata.
 */
export function PageHeaderHero({
  badge = 'TELEMETRY HUB',
  title,
  subtitle,
  icon: Icon,
  wireframeVariant = 'circuit', // 'circuit', 'timing', 'flow', 'apex', 'waveform', 'standings'
  circuit = 'spa',
  actions = null,
  stats = null,
  standingsData = null,
  standingsType = 'drivers',
  className = ''
}) {
  const norm = (circuit || '').toLowerCase().replace(/[-_\s]/g, '');
  let resolvedKey = 'spa';
  if (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[circuit]) resolvedKey = circuit;
  else if (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[norm]) resolvedKey = norm;
  else if (CIRCUIT_SECTOR_DATA) {
    for (const k of Object.keys(CIRCUIT_SECTOR_DATA)) {
      if (norm.includes(k) || k.includes(norm)) {
        resolvedKey = k;
        break;
      }
    }
  }
  const trackInfo = (CIRCUIT_SECTOR_DATA && CIRCUIT_SECTOR_DATA[resolvedKey]) || CIRCUIT_PATHS[resolvedKey] || {};
  const trackName = trackInfo.name || trackInfo.circuit_name || 'Circuit Model';
  const trackLocality = trackInfo.locality ? `${trackInfo.locality}, ${trackInfo.country || ''}` : trackInfo.country || 'FIA Formula One';
  const trackSpecs = trackInfo.lengthKm ? `${trackInfo.lengthKm} • ${trackInfo.turnsCount || 19} Turns` : 'Active GPS Telemetry';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-linear-to-b from-[#0F131C] via-[#131722] to-[#0D1016] border border-[#263143] text-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${className}`}
    >
      {/* Background Technical Grid */}
      <TechnicalGridBackdrop opacity="opacity-15" />

      {/* Sweeping Telemetry Scan Line */}
      <TelemetryScanLine />

      {/* Precision HUD Corner Wireframes */}
      <HeroWireframeBrackets color="border-[#E10600]/40" />

      {/* Ambient Red / Cyan Radial Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E10600]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#06B6D4]/8 rounded-full blur-3xl pointer-events-none" />

      {/* 2-Column Split: Narrative & Actions on LEFT, Wireframe on RIGHT */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Narrative, Headings & Action Controls */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-4">
          {/* Brand & Telemetry Badge */}
          <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-400 uppercase tracking-widest">
            <span className="text-[#E10600] font-bold">RACEPECTIVE // {badge}</span>
            <span>&bull;</span>
            <span className="text-gray-400">See racing differently.</span>
          </div>

          {/* Title & Icon */}
          <div className="flex items-start sm:items-center space-x-3.5 pt-0.5">
            {Icon && (
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#E10600]/15 border border-[#E10600]/30 text-[#E10600] shrink-0 shadow-inner">
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-heading font-black tracking-tight text-white leading-tight">
              {title}
            </h1>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 font-mono leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}

          {/* Controls & Actions Slot */}
          {actions && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}

          {/* Optional inline stats */}
          {stats && <div className="pt-1">{stats}</div>}
        </div>

        {/* Right Column: Hero Animated Wireframe Visual */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col justify-center min-h-[260px] sm:min-h-[320px]">
          {wireframeVariant === 'circuit' && (
            <div className="w-full flex flex-col justify-between relative group">
              {/* Telemetry Tag */}
              <div className="flex items-center justify-end text-[10px] font-mono text-gray-400 z-10 px-1 pb-1">
                <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 shrink-0">
                  GPS LIVE
                </span>
              </div>

              {/* Centered Track SVG with Full Live Animation */}
              <div className="relative w-full h-64 sm:h-72 lg:h-80 xl:h-88 flex items-center justify-center my-1">
                <HeroTrackStage
                  circuit={circuit}
                  className="w-full h-full"
                  accentColor="#E10600"
                  animationDur={8}
                  showElevation={true}
                  showStartFinish={true}
                  showSectors={true}
                  autoScale={true}
                />
              </div>

              {/* Sub-label */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pt-1 border-t border-white/[0.05]">
                <span className="truncate">{trackLocality}</span>
                <span className="text-gray-300 font-bold shrink-0">{trackSpecs}</span>
              </div>
            </div>
          )}
          {(wireframeVariant === 'standings' || (wireframeVariant === 'timing' && standingsData && standingsData.length > 0)) && (
            <div className="w-full flex flex-col justify-between relative group">
              {/* Telemetry Tag */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pb-1">
                <span className="flex items-center space-x-1.5 text-gray-200 font-bold uppercase tracking-wider truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse shrink-0" />
                  <span className="truncate">
                    {standingsType === 'constructors' ? 'CONSTRUCTOR' : 'DRIVER'} CHAMPIONSHIP // POINTS & GAP TRAJECTORY
                  </span>
                </span>
                <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 shrink-0">
                  STANDINGS LIVE
                </span>
              </div>

              {/* Centered Stage with Full Live Animation */}
              <div className="relative w-full h-64 sm:h-72 lg:h-80 xl:h-88 flex items-center justify-center my-1">
                <StandingsTrajectoryWireframe
                  standings={standingsData || []}
                  type={standingsType}
                  className="w-full h-full"
                />
              </div>

              {/* Sub-label */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pt-1 border-t border-white/[0.05]">
                <span className="truncate">
                  OFFICIAL FIA {standingsType === 'constructors' ? 'CONSTRUCTORS' : 'DRIVERS'} STANDINGS • CUMULATIVE TRAJECTORY
                </span>
                <span className="text-gray-300 font-bold shrink-0">
                  LEADER: {(standingsData?.[0]?.driver_name || standingsData?.[0]?.constructor_name || standingsData?.[0]?.name || (standingsType === 'constructors' ? 'MERCEDES' : 'ANTONELLI')).toUpperCase()} ({standingsData?.[0]?.points ?? (standingsType === 'constructors' ? 607 : 365)} PTS)
                </span>
              </div>
            </div>
          )}
          {wireframeVariant === 'timing' && (!standingsData || standingsData.length === 0) && (
            <div className="w-full flex flex-col justify-between relative group">
              {/* Telemetry Tag */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pb-1">
                <span className="flex items-center space-x-1.5 text-gray-200 font-bold uppercase tracking-wider truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse shrink-0" />
                  <span className="truncate">CHAMPIONSHIP TIMING & STANDINGS MATRIX</span>
                </span>
                <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 shrink-0">
                  TIMING LIVE
                </span>
              </div>

              {/* Centered Stage with Full Live Animation */}
              <div className="relative w-full h-64 sm:h-72 lg:h-80 xl:h-88 flex items-center justify-center my-1">
                <TimingGridWireframe className="w-full h-full" />
              </div>

              {/* Sub-label */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pt-1 border-t border-white/[0.05]">
                <span className="truncate">SECTOR SPLIT TELEMETRY & POINTS DELTA PROGRESSION</span>
                <span className="text-gray-300 font-bold shrink-0">OFFICIAL FIA TIMING &bull; LIVE DELTA</span>
              </div>
            </div>
          )}
          {wireframeVariant === 'flow' && (
            standingsData && standingsData.length > 0 ? (
              <div className="w-full flex flex-col justify-between relative group">
                {/* Telemetry Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pb-1">
                  <span className="flex items-center space-x-1.5 text-gray-200 font-bold uppercase tracking-wider truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse shrink-0" />
                    <span className="truncate">CONSTRUCTOR CHAMPIONSHIP // POINTS & GAP TRAJECTORY</span>
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 shrink-0">
                    STANDINGS LIVE
                  </span>
                </div>

                {/* Centered Stage with Full Live Animation */}
                <div className="relative w-full h-64 sm:h-72 lg:h-80 xl:h-88 flex items-center justify-center my-1">
                  <StandingsTrajectoryWireframe
                    standings={standingsData}
                    type="constructors"
                    className="w-full h-full"
                  />
                </div>

                {/* Sub-label */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pt-1 border-t border-white/[0.05]">
                  <span className="truncate">OFFICIAL FIA CONSTRUCTORS STANDINGS • CUMULATIVE TRAJECTORY</span>
                  <span className="text-gray-300 font-bold shrink-0">
                    LEADER: {(standingsData[0]?.constructor_name || standingsData[0]?.name || 'MERCEDES').toUpperCase()} ({standingsData[0]?.points || 607} PTS)
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-between relative group">
                {/* Telemetry Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pb-1">
                  <span className="flex items-center space-x-1.5 text-gray-200 font-bold uppercase tracking-wider truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse shrink-0" />
                    <span className="truncate">CONSTRUCTOR AERO CFD & PARITY MATRIX</span>
                  </span>
                  <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 shrink-0">
                    CFD AERO LIVE
                  </span>
                </div>

                {/* Centered Stage with Full Live Animation */}
                <div className="relative w-full h-64 sm:h-72 lg:h-80 xl:h-88 flex items-center justify-center my-1">
                  <ConstructorFlowWireframe className="w-full h-full" />
                </div>

                {/* Sub-label */}
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pt-1 border-t border-white/[0.05]">
                  <span className="truncate">WIND TUNNEL CFD DYNAMICS & DOWNFORCE EFFICIENCY</span>
                  <span className="text-gray-300 font-bold shrink-0">FIA PARITY &bull; 1,840 KG DF</span>
                </div>
              </div>
            )
          )}
          {wireframeVariant === 'apex' && (
            <div className="w-full flex flex-col justify-between relative group">
              {/* Telemetry Tag */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pb-1">
                <span className="flex items-center space-x-1.5 text-gray-200 font-bold uppercase tracking-wider truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse shrink-0" />
                  <span className="truncate">DRIVER APEX TELEMETRY DYNAMICS</span>
                </span>
                <span className="text-[9px] text-cyan-400 font-mono font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/60 shrink-0">
                  APEX LIVE
                </span>
              </div>

              {/* Centered Apex Stage with Full Live Animation */}
              <div className="relative w-full h-64 sm:h-72 lg:h-80 xl:h-88 flex items-center justify-center my-1">
                <ApexTrackWireframe className="w-full h-full" />
              </div>

              {/* Sub-label */}
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 z-10 px-1 pt-1 border-t border-white/[0.05]">
                <span className="truncate">OPTIMAL QUALIFYING LINE VS ATTACK TRAJECTORY</span>
                <span className="text-gray-300 font-bold shrink-0">PEAK 4.8G &bull; 318 KM/H</span>
              </div>
            </div>
          )}
          {wireframeVariant === 'waveform' && (
            <div className="w-full h-44 flex items-center justify-center">
              <LiveTelemetryWaveform className="w-full h-full opacity-90" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
