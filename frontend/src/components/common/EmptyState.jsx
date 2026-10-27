import React from 'react';
import { Flag } from 'lucide-react';

export default function EmptyState({ title = 'No Data Found', message = 'No matching Formula 1 events or entries were found for your query.', onReset }) {
  return (
    <div className="relative bg-[#131720] rounded-2xl border border-[#232936] p-8 text-center max-w-md mx-auto my-6 space-y-3 overflow-hidden shadow-lg">
      {/* Precision corner wireframes */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-gray-600" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-gray-600" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-gray-600" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-gray-600" />

      <div className="w-12 h-12 rounded-full bg-[#181D28] border border-[#2B3342] text-gray-400 mx-auto flex items-center justify-center">
        <Flag className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="font-heading font-black text-base text-white">{title}</h3>
      <p className="text-xs text-gray-400 font-mono leading-relaxed">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="px-3.5 py-1.5 bg-[#1E2432] hover:bg-[#283142] border border-[#2E374A] text-white text-xs font-mono font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>Reset Filter</span>
        </button>
      )}
    </div>
  );
}
