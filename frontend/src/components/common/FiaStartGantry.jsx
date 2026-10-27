import React, { useState, useEffect } from 'react';

/**
 * FiaStartGantry
 * Clean, authentic Formula 1 5-light starting sequence.
 * Sequentially illuminates 1 -> 2 -> 3 -> 4 -> 5 red lights,
 * holds for suspense, then all lights go out simultaneously!
 */
export default function FiaStartGantry({ className = '' }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timer;
    if (phase === 0) {
      // All lights off, pause before sequence starts
      timer = setTimeout(() => setPhase(1), 1000);
    } else if (phase >= 1 && phase <= 4) {
      // Step sequentially 1 to 5
      timer = setTimeout(() => setPhase((prev) => prev + 1), 750);
    } else if (phase === 5) {
      // All 5 red lights hold for suspense
      timer = setTimeout(() => setPhase(6), 1300);
    } else if (phase === 6) {
      // Lights Out! Hold extinguished before resetting
      timer = setTimeout(() => setPhase(0), 1600);
    }

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className={`flex items-center space-x-1.5 bg-[#070A0F] px-2.5 py-1.5 rounded-full border border-[#222A3A] shadow-inner select-none ${className}`}
      title="FIA Starting Gantry Sequence"
    >
      {[1, 2, 3, 4, 5].map((lightIndex) => {
        const isLit = phase >= 1 && phase <= 5 && lightIndex <= phase;

        return (
          <div key={lightIndex} className="relative flex items-center justify-center">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                isLit
                  ? 'bg-[#E10600] shadow-[0_0_10px_#E10600,0_0_3px_#FFAAAA] scale-110'
                  : 'bg-[#180A0A] border border-[#2B1010]'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
