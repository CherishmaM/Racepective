import React from 'react';

export function LoadingSpinner({ message = 'Loading Formula 1 telemetry...' }) {
  return (
    <div className="min-h-[340px] flex flex-col items-center justify-center p-8 text-center relative select-none">
      <div className="relative w-14 h-14 mb-4">
        {/* Technical Wireframe Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#2B3342] animate-radar-sweep"></div>
        <div className="absolute inset-1 rounded-full border-2 border-[#1E2432]"></div>
        <div className="absolute inset-1 rounded-full border-2 border-[#E10600] border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-heading font-black text-[#E10600]">RP</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-200 font-mono tracking-tight">{message}</p>
      <span className="text-xs text-gray-500 mt-1 font-mono">Racepective Telemetry &bull; See racing differently.</span>
    </div>
  );
}

export function ErrorMessage({ title = 'Telemetry Feed Error', message, onRetry }) {
  return (
    <div className="bg-[#1C1417] border border-red-900/60 rounded-2xl p-6 text-center max-w-lg mx-auto my-8 shadow-lg">
      <div className="w-10 h-10 rounded-full bg-red-950/80 text-[#E10600] border border-red-800/80 mx-auto flex items-center justify-center font-bold mb-3">
        !
      </div>
      <h3 className="text-base font-heading font-bold text-red-200">{title}</h3>
      <p className="text-xs text-red-400 mt-1 mb-4 leading-relaxed font-mono">
        {message || 'Unable to connect to the F1 data feed. Please verify the backend service is running.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#E10600] hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors font-mono"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}
