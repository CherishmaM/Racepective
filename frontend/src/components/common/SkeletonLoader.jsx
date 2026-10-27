import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#131720] rounded-2xl p-5 border border-[#232936] space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-[#1E2432] rounded"></div>
            <div className="h-4 w-4 bg-[#1E2432] rounded"></div>
          </div>
          <div className="h-7 w-32 bg-[#252C3D] rounded"></div>
          <div className="h-3 w-40 bg-[#1E2432] rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-[#131720] rounded-2xl border border-[#232936] p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-[#181D28] rounded-xl w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center space-x-4 py-2 border-b border-[#1E2432]">
          <div className="h-4 w-6 bg-[#1E2432] rounded"></div>
          <div className="h-4 w-36 bg-[#252C3D] rounded flex-1"></div>
          <div className="h-4 w-24 bg-[#1E2432] rounded hidden sm:block"></div>
          <div className="h-4 w-16 bg-[#1E2432] rounded"></div>
          <div className="h-4 w-12 bg-[#252C3D] rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-72' }) {
  return (
    <div className={`bg-[#131720] rounded-2xl border border-[#232936] p-6 space-y-4 animate-pulse ${height} flex flex-col justify-between`}>
      <div className="space-y-2">
        <div className="h-4 w-48 bg-[#252C3D] rounded"></div>
        <div className="h-3 w-32 bg-[#1E2432] rounded"></div>
      </div>
      <div className="flex items-end space-x-3 h-40 pt-4">
        <div className="w-1/6 bg-[#1A202C] rounded-t h-20"></div>
        <div className="w-1/6 bg-[#252C3D] rounded-t h-32"></div>
        <div className="w-1/6 bg-[#1A202C] rounded-t h-28"></div>
        <div className="w-1/6 bg-[#252C3D] rounded-t h-36"></div>
        <div className="w-1/6 bg-[#1A202C] rounded-t h-24"></div>
        <div className="w-1/6 bg-[#252C3D] rounded-t h-40"></div>
      </div>
    </div>
  );
}
