import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Activity, Wrench, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const TaskProcessMatrix: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/kernel/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Failed to fetch system logs:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const id = setInterval(fetchLogs, 5000);
    return () => clearInterval(id);
  }, []);

  const triggerAutoHeal = async () => {
    setLoading(true);
    try {
      await fetch('/api/kernel/auto-repair', { method: 'POST' });
      await fetchLogs();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Infrastruktura & Naprawa z Logów [Alex Commander]</h2>
            <p className="text-slate-500 text-[11px]">Proaktywny nadzór Ring-0, inspekcja błędów i ciągłe samouzdrawianie</p>
          </div>
        </div>
        <button
          onClick={triggerAutoHeal}
          disabled={loading}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{loading ? 'Naprawianie...' : 'Uruchom Auto-Naprawę'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400">STATUS ZAPORY UFW</div>
          <div className="text-emerald-400 font-bold text-sm mt-1">RING-0 AKTYWNA</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Port 3200 i 3000 monitorowane</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400">LIMIT PAMIĘCI RAM</div>
          <div className="text-cyan-400 font-bold text-sm mt-1">&lt;70% W TRYBIE IDLE</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Alokacja 4 GiB Memory Guard</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400">ZAREJESTROWANE LOGI</div>
          <div className="text-amber-400 font-bold text-sm mt-1">{logs.length} ZDARZEŃ</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Automatyczna rotacja do 200 wpisów</div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
        <div className="text-xs font-bold text-slate-300 pb-1 border-b border-slate-800 flex justify-between">
          <span>Strumień Zdarzeń Systemowych</span>
          <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
        </div>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-slate-500 py-4 text-center">Brak ostrzeżeń w dzienniku. Wszystkie węzły pracują nominalnie.</div>
          ) : (
            logs.map((log: any, i: number) => (
              <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    log.level === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    log.level === 'healed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {log.level?.toUpperCase()}
                  </span>
                  <div>
                    <span className="text-slate-200">{log.message}</span>
                    {log.healingDetails && <div className="text-[10px] text-emerald-400 mt-0.5">{log.healingDetails}</div>}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp || ''}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
