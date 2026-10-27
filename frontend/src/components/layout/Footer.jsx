import React from 'react';
import { ShieldCheck, MapPin, Camera, Database, Info } from 'lucide-react';
import RacepectiveLogo from '../common/RacepectiveLogo';

export default function Footer() {
  return (
    <footer className="bg-[#121417] border-t border-[#22252B] text-gray-400 text-xs py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Row: Brand & Provenance Badges */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#22252B]">
          <div className="flex items-center space-x-4 min-w-0">
            <RacepectiveLogo variant="horizontal" size="sm" showTagline={true} />
            <div className="hidden xl:block border-l border-[#2B303A] pl-4 text-gray-400 font-mono text-[11px] truncate">
              Independent Formula 1 Analytics Platform
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-[11px] flex-nowrap shrink-0 overflow-x-auto max-w-full">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1C1F26] border border-[#2B303A] text-gray-300 whitespace-nowrap">
              <Database className="w-3 h-3 text-[#E10600] shrink-0" />
              <span>Jolpica-F1 Live API</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1C1F26] border border-[#2B303A] text-gray-300 whitespace-nowrap">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>OpenStreetMap GPS</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#1C1F26] border border-[#2B303A] text-gray-300 whitespace-nowrap">
              <Camera className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Wikimedia Commons CC BY-SA</span>
            </span>
          </div>
        </div>

        {/* Middle Row: Attribution & Licensing Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] font-mono text-gray-400">
          <div className="space-y-1.5">
            <h4 className="text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              Asset Provenance & Licensing
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Driver portraits and circuit layout outlines are sourced from Wikimedia Commons contributors under Creative Commons (CC BY-SA 4.0, CC BY 2.0, CC0) and the Open Government Licence v3.0. Individual photographer credits and source URLs are linked on profile and circuit inspector cards.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              Geographic Cartography
            </h4>
            <p className="text-gray-500 leading-relaxed">
              World circuit coordinates are verified WGS84 latitude and longitude coordinates. Map tiles and geographic features are provided by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white underline underline-offset-2">OpenStreetMap contributors</a> (&copy; OSM ODbL).
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-gray-300 font-bold uppercase tracking-wider text-[10px]">
              Data Integrity & Truth
            </h4>
            <p className="text-gray-500 leading-relaxed">
              Results, schedules, and points progression are calculated deterministically from official session classifications. Uncompleted events are never counted as finished races. Racepective does not scrape protected media or generate AI portraits.
            </p>
          </div>
        </div>

        {/* Bottom Row: Legal Non-Affiliation Disclaimer */}
        <div className="pt-4 border-t border-[#22252B] flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 font-mono gap-3 text-center sm:text-left">
          <p className="max-w-3xl leading-normal">
            <strong>Legal Disclaimer:</strong> Racepective is an independent, non-commercial software engineering portfolio showcase. It is not affiliated with, endorsed by, or sponsored by Formula One Licensing B.V., Formula One Management (FOM), the FIA, or any Formula 1 team. F1, FORMULA ONE, FORMULA 1, GRAND PRIX, and related trademarks are the property of Formula One Licensing B.V.
          </p>
          <div className="shrink-0 text-gray-600">
            Racepective v2.5 &bull; 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
