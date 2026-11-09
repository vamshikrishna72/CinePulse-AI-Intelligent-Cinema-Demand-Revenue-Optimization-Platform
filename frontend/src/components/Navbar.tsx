import React from 'react';
import { Film, ShieldCheck, Clock, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="sticky top-0 z-50 bg-[#17171D]/90 backdrop-blur-md border-b border-[#D8B46A]/20 px-6 py-3.5 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#241018] to-[#D8B46A] flex items-center justify-center shadow-lg shadow-[#D8B46A]/10 border border-[#D8B46A]/30">
          <Film className="w-5 h-5 text-[#F6F0E8]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-[#F6F0E8]">
              CinePulse <span className="text-[#D8B46A]">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#D8B46A]/15 text-[#D8B46A] border border-[#D8B46A]/30">
              Enterprise v2.4
            </span>
          </div>
          <p className="text-xs text-[#89858C]">
            Intelligent Cinema Demand & Revenue Optimization • Algions AI Labs
          </p>
        </div>
      </div>

      {/* Operational Indicators */}
      <div className="flex items-center space-x-4">
        {/* Forecast Horizon Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#241018]/80 border border-[#D8B46A]/20 text-xs text-[#F6F0E8]">
          <Clock className="w-3.5 h-3.5 text-[#D8B46A]" />
          <span>Horizon: <strong className="text-[#D8B46A]">T-24 Hours</strong></span>
        </div>

        {/* Champion Model Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#241018]/80 border border-[#B66B7B]/30 text-xs text-[#F6F0E8]">
          <Cpu className="w-3.5 h-3.5 text-[#B66B7B]" />
          <span>Model: <strong className="text-[#F6F0E8]">XGBoost Champion (WAPE 21.3%)</strong></span>
        </div>

        {/* Live System Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">Inference Ready</span>
        </div>
      </div>
    </header>
  );
};
