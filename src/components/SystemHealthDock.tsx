import React, { useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { ShieldCheck, Cpu, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

export const SystemHealthDock: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState({ system: 'NOMINAL', repairs: 0 });

  // Lekki endpoint zdrowia (bez odczytu jądra Python); pauzuje w ukrytej karcie
  usePolling(async () => {
    const res = await fetch('/api/infrastructure/health', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const repairs = Number(data.healedCount) || 0;
    setStatus((prev) => {
      const system = repairs > 5 ? 'STABILNY' : 'NOMINALNY';
      return prev.system === system && prev.repairs === repairs ? prev : { system, repairs };
    });
  }, 15000);

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all ${isExpanded ? 'w-64' : 'w-auto'}`}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-2 bg-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${status.system === 'NOMINALNY' ? 'text-emerald-400' : 'text-amber-400'}`} />
            {isExpanded && <span className="text-xs font-bold text-slate-200">System SVL Health</span>}
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 cursor-pointer">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        
        {isExpanded && (
          <div className="p-3 space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Status jądra:</span>
              <span className="text-emerald-300 font-bold">{status.system}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">Wyleczone incydenty:</span>
              <span className="text-cyan-300 font-bold">{status.repairs}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
