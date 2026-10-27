import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  accent = 'neutral', 
  badge = null,
  symbol = null,
  accentColor = null,
  valueClassName = '',
  size = null
}) {
  const accentBorders = {
    red: 'border-l-4 border-l-[#E10600]',
    green: 'border-l-4 border-l-emerald-500',
    blue: 'border-l-4 border-l-blue-500',
    amber: 'border-l-4 border-l-amber-500',
    mercedes: 'border-l-4 border-l-[#00D2BE]',
    ferrari: 'border-l-4 border-l-[#E8002D]',
    mclaren: 'border-l-4 border-l-[#FF8000]',
    redbull: 'border-l-4 border-l-[#1E41FF]',
    neutral: 'border-l-4 border-l-[#2E3646]'
  };

  const borderStyle = accentColor 
    ? { borderLeftWidth: '4px', borderLeftColor: accentColor } 
    : undefined;

  const borderClass = accentBorders[accent] || accentBorders.neutral;

  const renderIcon = () => {
    if (badge) return badge;
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    return <Icon className="w-4 h-4 text-gray-500" />;
  };

  // Adaptive font size so long driver/team names never get cut off
  const valStr = typeof value === 'string' ? value : String(value ?? '');
  const isLong = valStr.length > 15;
  const isMedium = valStr.length > 8;

  let computedSize = 'text-xl sm:text-2xl';
  if (size === 'sm' || isLong) {
    // For long driver names like "Andrea Kimi Antonelli" - fits completely without ellipsis
    computedSize = 'text-base sm:text-lg lg:text-base xl:text-lg leading-snug';
  } else if (size === 'md' || isMedium) {
    // For medium strings like "Mercedes"
    computedSize = 'text-lg sm:text-xl lg:text-lg xl:text-xl leading-snug';
  } else {
    // For short numbers
    computedSize = 'text-xl sm:text-2xl';
  }

  return (
    <div 
      className={`bg-[#131720] rounded-2xl p-5 border border-[#232936] hover:border-[#333C4E] shadow-xs transition-all flex flex-col justify-between ${!accentColor ? borderClass : ''}`}
      style={borderStyle}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
            {title}
          </span>
          {renderIcon()}
        </div>
        <div className="flex items-center space-x-2 min-w-0">
          {symbol && <div className="shrink-0">{symbol}</div>}
          <div 
            className={`font-heading font-black tracking-tight text-white leading-tight min-w-0 break-words line-clamp-2 ${valueClassName || computedSize}`}
            title={valStr}
          >
            {value}
          </div>
        </div>
      </div>
      {subtitle && (
        <div className="mt-2.5 text-xs text-gray-400 flex items-center space-x-1 font-mono">
          {subtitle}
        </div>
      )}
    </div>
  );
}
