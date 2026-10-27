import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Countdown({ targetIsoString }) {
  const [timeLeft, setTimeLeft] = useState(calculateTime(targetIsoString));

  function calculateTime(iso) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - new Date().getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime(targetIsoString));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetIsoString]);

  if (!timeLeft) {
    return (
      <div className="flex items-center space-x-2 text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
        <Clock className="w-3.5 h-3.5" />
        <span>RACE WEEKEND ACTIVE</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3 text-center">
      <div className="bg-[#121417] text-white px-3 py-2 rounded-lg border border-[#2B303A] shadow-sm min-w-[54px]">
        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">{timeLeft.days}</div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Days</div>
      </div>
      <div className="text-gray-400 font-bold">:</div>
      <div className="bg-[#121417] text-white px-3 py-2 rounded-lg border border-[#2B303A] shadow-sm min-w-[54px]">
        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Hrs</div>
      </div>
      <div className="text-gray-400 font-bold">:</div>
      <div className="bg-[#121417] text-white px-3 py-2 rounded-lg border border-[#2B303A] shadow-sm min-w-[54px]">
        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Min</div>
      </div>
      <div className="text-gray-400 font-bold">:</div>
      <div className="bg-[#121417] text-white px-3 py-2 rounded-lg border border-[#2B303A] shadow-sm min-w-[54px]">
        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#E10600]">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Sec</div>
      </div>
    </div>
  );
}
