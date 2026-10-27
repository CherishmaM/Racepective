import React, { useState } from 'react';

/**
 * Racepective Country & Nationality Flag Registry
 * Supports both country nouns ("Germany", "Italy") and demographic adjectives ("German", "Italian").
 * Verified ISO 3166-1 alpha-2 codes.
 */
export const COUNTRY_FLAG_MAP = {
  // Germany
  german: { code: 'de', name: 'Germany', emoji: '🇩🇪' },
  germany: { code: 'de', name: 'Germany', emoji: '🇩🇪' },
  de: { code: 'de', name: 'Germany', emoji: '🇩🇪' },

  // Italy
  italian: { code: 'it', name: 'Italy', emoji: '🇮🇹' },
  italy: { code: 'it', name: 'Italy', emoji: '🇮🇹' },
  it: { code: 'it', name: 'Italy', emoji: '🇮🇹' },

  // United Kingdom / Great Britain
  british: { code: 'gb', name: 'United Kingdom', emoji: '🇬🇧' },
  britain: { code: 'gb', name: 'United Kingdom', emoji: '🇬🇧' },
  'great britain': { code: 'gb', name: 'United Kingdom', emoji: '🇬🇧' },
  uk: { code: 'gb', name: 'United Kingdom', emoji: '🇬🇧' },
  'united kingdom': { code: 'gb', name: 'United Kingdom', emoji: '🇬🇧' },
  english: { code: 'gb-eng', altCode: 'gb', name: 'England', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  scottish: { code: 'gb-sct', altCode: 'gb', name: 'Scotland', emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  gb: { code: 'gb', name: 'United Kingdom', emoji: '🇬🇧' },

  // Austria
  austrian: { code: 'at', name: 'Austria', emoji: '🇦🇹' },
  austria: { code: 'at', name: 'Austria', emoji: '🇦🇹' },
  at: { code: 'at', name: 'Austria', emoji: '🇦🇹' },

  // United States
  american: { code: 'us', name: 'United States', emoji: '🇺🇸' },
  usa: { code: 'us', name: 'United States', emoji: '🇺🇸' },
  'united states': { code: 'us', name: 'United States', emoji: '🇺🇸' },
  miami: { code: 'us', name: 'United States', emoji: '🇺🇸' },
  austin: { code: 'us', name: 'United States', emoji: '🇺🇸' },
  'las vegas': { code: 'us', name: 'United States', emoji: '🇺🇸' },
  us: { code: 'us', name: 'United States', emoji: '🇺🇸' },

  // France
  french: { code: 'fr', name: 'France', emoji: '🇫🇷' },
  france: { code: 'fr', name: 'France', emoji: '🇫🇷' },
  fr: { code: 'fr', name: 'France', emoji: '🇫🇷' },

  // Netherlands
  dutch: { code: 'nl', name: 'Netherlands', emoji: '🇳🇱' },
  netherlands: { code: 'nl', name: 'Netherlands', emoji: '🇳🇱' },
  holland: { code: 'nl', name: 'Netherlands', emoji: '🇳🇱' },
  nl: { code: 'nl', name: 'Netherlands', emoji: '🇳🇱' },

  // Spain
  spanish: { code: 'es', name: 'Spain', emoji: '🇪🇸' },
  spain: { code: 'es', name: 'Spain', emoji: '🇪🇸' },
  es: { code: 'es', name: 'Spain', emoji: '🇪🇸' },

  // Monaco
  monegasque: { code: 'mc', name: 'Monaco', emoji: '🇲🇨' },
  monaco: { code: 'mc', name: 'Monaco', emoji: '🇲🇨' },
  mc: { code: 'mc', name: 'Monaco', emoji: '🇲🇨' },

  // Australia
  australian: { code: 'au', name: 'Australia', emoji: '🇦🇺' },
  australia: { code: 'au', name: 'Australia', emoji: '🇦🇺' },
  au: { code: 'au', name: 'Australia', emoji: '🇦🇺' },

  // Canada
  canadian: { code: 'ca', name: 'Canada', emoji: '🇨🇦' },
  canada: { code: 'ca', name: 'Canada', emoji: '🇨🇦' },
  ca: { code: 'ca', name: 'Canada', emoji: '🇨🇦' },

  // Japan
  japanese: { code: 'jp', name: 'Japan', emoji: '🇯🇵' },
  japan: { code: 'jp', name: 'Japan', emoji: '🇯🇵' },
  jp: { code: 'jp', name: 'Japan', emoji: '🇯🇵' },

  // Mexico
  mexican: { code: 'mx', name: 'Mexico', emoji: '🇲🇽' },
  mexico: { code: 'mx', name: 'Mexico', emoji: '🇲🇽' },
  mx: { code: 'mx', name: 'Mexico', emoji: '🇲🇽' },

  // Brazil
  brazilian: { code: 'br', name: 'Brazil', emoji: '🇧🇷' },
  brazil: { code: 'br', name: 'Brazil', emoji: '🇧🇷' },
  br: { code: 'br', name: 'Brazil', emoji: '🇧🇷' },

  // Argentina
  argentine: { code: 'ar', name: 'Argentina', emoji: '🇦🇷' },
  argentina: { code: 'ar', name: 'Argentina', emoji: '🇦🇷' },
  ar: { code: 'ar', name: 'Argentina', emoji: '🇦🇷' },

  // New Zealand
  'new zealander': { code: 'nz', name: 'New Zealand', emoji: '🇳🇿' },
  'new zealand': { code: 'nz', name: 'New Zealand', emoji: '🇳🇿' },
  kiwi: { code: 'nz', name: 'New Zealand', emoji: '🇳🇿' },
  nz: { code: 'nz', name: 'New Zealand', emoji: '🇳🇿' },

  // Finland
  finnish: { code: 'fi', name: 'Finland', emoji: '🇫🇮' },
  finland: { code: 'fi', name: 'Finland', emoji: '🇫🇮' },
  fi: { code: 'fi', name: 'Finland', emoji: '🇫🇮' },

  // Thailand
  thai: { code: 'th', name: 'Thailand', emoji: '🇹🇭' },
  thailand: { code: 'th', name: 'Thailand', emoji: '🇹🇭' },
  th: { code: 'th', name: 'Thailand', emoji: '🇹🇭' },

  // Switzerland
  swiss: { code: 'ch', name: 'Switzerland', emoji: '🇨🇭' },
  switzerland: { code: 'ch', name: 'Switzerland', emoji: '🇨🇭' },
  ch: { code: 'ch', name: 'Switzerland', emoji: '🇨🇭' },

  // Denmark
  danish: { code: 'dk', name: 'Denmark', emoji: '🇩🇰' },
  denmark: { code: 'dk', name: 'Denmark', emoji: '🇩🇰' },
  dk: { code: 'dk', name: 'Denmark', emoji: '🇩🇰' },

  // Belgium
  belgian: { code: 'be', name: 'Belgium', emoji: '🇧🇪' },
  belgium: { code: 'be', name: 'Belgium', emoji: '🇧🇪' },
  be: { code: 'be', name: 'Belgium', emoji: '🇧🇪' },

  // Hungary
  hungarian: { code: 'hu', name: 'Hungary', emoji: '🇭🇺' },
  hungary: { code: 'hu', name: 'Hungary', emoji: '🇭🇺' },
  hu: { code: 'hu', name: 'Hungary', emoji: '🇭🇺' },

  // China
  chinese: { code: 'cn', name: 'China', emoji: '🇨🇳' },
  china: { code: 'cn', name: 'China', emoji: '🇨🇳' },
  cn: { code: 'cn', name: 'China', emoji: '🇨🇳' },

  // Azerbaijan
  azerbaijani: { code: 'az', name: 'Azerbaijan', emoji: '🇦🇿' },
  azerbaijan: { code: 'az', name: 'Azerbaijan', emoji: '🇦🇿' },
  az: { code: 'az', name: 'Azerbaijan', emoji: '🇦🇿' },

  // Singapore
  singaporean: { code: 'sg', name: 'Singapore', emoji: '🇸🇬' },
  singapore: { code: 'sg', name: 'Singapore', emoji: '🇸🇬' },
  sg: { code: 'sg', name: 'Singapore', emoji: '🇸🇬' },

  // Bahrain
  bahraini: { code: 'bh', name: 'Bahrain', emoji: '🇧🇭' },
  bahrain: { code: 'bh', name: 'Bahrain', emoji: '🇧🇭' },
  bh: { code: 'bh', name: 'Bahrain', emoji: '🇧🇭' },

  // Saudi Arabia
  saudi: { code: 'sa', name: 'Saudi Arabia', emoji: '🇸🇦' },
  'saudi arabia': { code: 'sa', name: 'Saudi Arabia', emoji: '🇸🇦' },
  sa: { code: 'sa', name: 'Saudi Arabia', emoji: '🇸🇦' },

  // Qatar
  qatari: { code: 'qa', name: 'Qatar', emoji: '🇶🇦' },
  qatar: { code: 'qa', name: 'Qatar', emoji: '🇶🇦' },
  qa: { code: 'qa', name: 'Qatar', emoji: '🇶🇦' },

  // UAE / Abu Dhabi
  emirati: { code: 'ae', name: 'United Arab Emirates', emoji: '🇦🇪' },
  uae: { code: 'ae', name: 'United Arab Emirates', emoji: '🇦🇪' },
  'united arab emirates': { code: 'ae', name: 'United Arab Emirates', emoji: '🇦🇪' },
  'abu dhabi': { code: 'ae', name: 'Abu Dhabi', emoji: '🇦🇪' },
  ae: { code: 'ae', name: 'United Arab Emirates', emoji: '🇦🇪' },

  // Additional nations
  ireland: { code: 'ie', name: 'Ireland', emoji: '🇮🇪' },
  irish: { code: 'ie', name: 'Ireland', emoji: '🇮🇪' },
  sweden: { code: 'se', name: 'Sweden', emoji: '🇸🇪' },
  swedish: { code: 'se', name: 'Sweden', emoji: '🇸🇪' },
  poland: { code: 'pl', name: 'Poland', emoji: '🇵🇱' },
  polish: { code: 'pl', name: 'Poland', emoji: '🇵🇱' },
  portugal: { code: 'pt', name: 'Portugal', emoji: '🇵🇹' },
  portuguese: { code: 'pt', name: 'Portugal', emoji: '🇵🇹' },
  malaysia: { code: 'my', name: 'Malaysia', emoji: '🇲🇾' },
  malaysian: { code: 'my', name: 'Malaysia', emoji: '🇲🇾' },
  india: { code: 'in', name: 'India', emoji: '🇮🇳' },
  indian: { code: 'in', name: 'India', emoji: '🇮🇳' },
  colombia: { code: 'co', name: 'Colombia', emoji: '🇨🇴' },
  colombian: { code: 'co', name: 'Colombia', emoji: '🇨🇴' },
  venezuela: { code: 've', name: 'Venezuela', emoji: '🇻🇪' },
  venezuelan: { code: 've', name: 'Venezuela', emoji: '🇻🇪' },
  'south africa': { code: 'za', name: 'South Africa', emoji: '🇿🇦' },
  'south african': { code: 'za', name: 'South Africa', emoji: '🇿🇦' },
};

/**
 * Resolves country metadata from country name, nationality adjective, or race title.
 */
export function getCountryFlagData(countryOrNationality = '', raceName = '') {
  const cleanInput = (countryOrNationality || '').trim().toLowerCase();

  // Direct lookup
  if (COUNTRY_FLAG_MAP[cleanInput]) {
    return COUNTRY_FLAG_MAP[cleanInput];
  }

  // Substring match in keys
  for (const [key, val] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (cleanInput && (cleanInput === key || cleanInput.includes(key) || key.includes(cleanInput))) {
      return val;
    }
  }

  // Grand Prix name match
  const cleanRace = (raceName || '').trim().toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (cleanRace && cleanRace.includes(key)) {
      return val;
    }
  }

  return { code: 'xx', name: countryOrNationality || 'Grand Prix Venue', emoji: '🏁' };
}

/**
 * Built-in SVG Flag Renderers for Core Motorsport Nations
 * Provides instantaneous, zero-latency, offline-compatible SVG vectors
 */
function InlineSvgFlag({ code, className = '' }) {
  switch (code) {
    case 'de': // Germany
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="640" height="160" fill="#000000" />
          <rect y="160" width="640" height="160" fill="#DD0000" />
          <rect y="320" width="640" height="160" fill="#FFCE00" />
        </svg>
      );
    case 'it': // Italy
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="213.3" height="480" fill="#009246" />
          <rect x="213.3" width="213.3" height="480" fill="#FFFFFF" />
          <rect x="426.6" width="213.4" height="480" fill="#CE2B37" />
        </svg>
      );
    case 'at': // Austria
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="640" height="160" fill="#ED2939" />
          <rect y="160" width="640" height="160" fill="#FFFFFF" />
          <rect y="320" width="640" height="160" fill="#ED2939" />
        </svg>
      );
    case 'fr': // France
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="213.3" height="480" fill="#002395" />
          <rect x="213.3" width="213.3" height="480" fill="#FFFFFF" />
          <rect x="426.6" width="213.4" height="480" fill="#ED2939" />
        </svg>
      );
    case 'nl': // Netherlands
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="640" height="160" fill="#AE1C28" />
          <rect y="160" width="640" height="160" fill="#FFFFFF" />
          <rect y="320" width="640" height="160" fill="#21468B" />
        </svg>
      );
    case 'mc': // Monaco
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="640" height="240" fill="#CE1126" />
          <rect y="240" width="640" height="240" fill="#FFFFFF" />
        </svg>
      );
    case 'jp': // Japan
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="640" height="480" fill="#FFFFFF" />
          <circle cx="320" cy="240" r="144" fill="#BC002D" />
        </svg>
      );
    case 'ch': // Switzerland
      return (
        <svg viewBox="0 0 640 480" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="640" height="480" fill="#D52B1E" />
          <rect x="270" y="100" width="100" height="280" fill="#FFFFFF" />
          <rect x="180" y="190" width="280" height="100" fill="#FFFFFF" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * CountryFlag Component
 * Renders an accessible, crisp national flag with SVG prioritization and CDN fallback.
 */
export function CountryFlag({ country = '', raceName = '', size = 'sm', className = '' }) {
  const [loadError, setLoadError] = useState(false);
  const data = getCountryFlagData(country, raceName);

  const sizeClasses = {
    xs: 'w-4 h-2.5',
    sm: 'w-5 h-3.5',
    md: 'w-6 h-4',
    lg: 'w-8 h-5.5',
  };

  const resolvedSize = sizeClasses[size] || sizeClasses.sm;

  // 1. If we have a native inline SVG flag, render it directly (zero network latency!)
  if (data.code && data.code !== 'xx') {
    const inlineSvg = <InlineSvgFlag code={data.code} className="w-full h-full object-cover" />;
    if (inlineSvg && InlineSvgFlag({ code: data.code })) {
      return (
        <span
          className={`inline-flex items-center shrink-0 select-none overflow-hidden rounded-xs border border-[#2B3446] shadow-2xs ${resolvedSize} ${className}`}
          title={data.name || country}
          role="img"
          aria-label={`Flag of ${data.name || country}`}
        >
          {inlineSvg}
        </span>
      );
    }
  }

  // 2. Fallback to FlagCDN image for other countries (UK, US, Canada, Australia, Spain, etc.)
  if (data.code && data.code !== 'xx' && !loadError) {
    const flagCode = data.code.toLowerCase();
    return (
      <span
        className={`inline-flex items-center shrink-0 select-none overflow-hidden rounded-xs border border-[#2B3446] shadow-2xs bg-[#161B24] ${resolvedSize} ${className}`}
        title={data.name || country}
      >
        <img
          src={`https://flagcdn.com/w40/${flagCode}.png`}
          srcSet={`https://flagcdn.com/w80/${flagCode}.png 2x`}
          alt={`Flag of ${data.name || country}`}
          loading="lazy"
          onError={() => setLoadError(true)}
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

  // 3. Fallback emoji or placeholder
  return (
    <span
      className={`inline-flex items-center justify-center select-none font-sans shrink-0 ${resolvedSize} ${className}`}
      title={data.name || country}
      role="img"
      aria-label={`Flag of ${data.name || country}`}
    >
      {data.emoji || '🏁'}
    </span>
  );
}
