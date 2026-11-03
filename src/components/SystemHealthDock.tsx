import React from 'react';
import { Cpu, ShieldCheck, Zap, Server } from 'lucide-react';

export const SystemHealthDock: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/95 px-3 py-1.5 font-mono text-[11px] text-slate-400 select-none shrink-0 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          RING-0: AKTYWNY
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="flex items-center gap-1 text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          RDZENIE AI: 4/4 (Alex, Astyria, Aurelius, SI_1)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400 hidden md:inline">
          LATENCJA MAGISTRALI: <span className="text-emerald-300 font-bold">0.00 ms</span>
        </span>
        <span className="text-slate-600 hidden md:inline">|</span>
        <span className="flex items-center gap-1 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          MAXIMUM
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="flex items-center gap-1 text-amber-300">
          <Zap className="w-3.5 h-3.5" />
          AUTONOMICZNE NLP
        </span>
      </div>
    </footer>
  );
};
