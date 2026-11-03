import React from 'react';
import { DataStore } from '../kernel/svlKernel';
import { Database, HardDrive, Key, GitCommit, MessageSquare } from 'lucide-react';

interface MemorySchemaGraphProps {
  dataStore: DataStore;
}

export const MemorySchemaGraph: React.FC<MemorySchemaGraphProps> = ({ dataStore }) => {
  const configKeys = Object.keys(dataStore?.config || {});
  const updates = dataStore?.update_history || [];
  const chats = dataStore?.chat_history || [];

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Wizualizacja Schematów Pamięci DATA_STORE</h2>
            <p className="text-slate-500 text-[11px]">Struktura encji, klucze konfiguracyjne i rejestr relacji Ring-0</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Rozmiar: {JSON.stringify(dataStore).length} B
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Config node */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5"><Key className="w-4 h-4" /> config ({configKeys.length})</span>
            <span className="text-[10px] text-slate-500">Object</span>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto text-[11px]">
            {configKeys.map((k) => (
              <div key={k} className="p-1.5 rounded bg-slate-950 border border-slate-800/80 flex justify-between">
                <span className="text-slate-300">{k}:</span>
                <span className="text-emerald-400 truncate max-w-[120px]">{String(dataStore.config[k])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Updates node */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5"><GitCommit className="w-4 h-4" /> update_history ({updates.length})</span>
            <span className="text-[10px] text-slate-500">Array</span>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto text-[11px]">
            {updates.slice(-6).map((u, i) => (
              <div key={i} className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between text-amber-300 font-bold text-[10px]">
                  <span>{u.wersja}</span>
                  <span className="text-slate-500">{u.data}</span>
                </div>
                <div className="text-slate-400 text-[10px] truncate mt-0.5">{u.opis}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat node */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> chat_history ({chats.length})</span>
            <span className="text-[10px] text-slate-500">Array</span>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto text-[11px]">
            {chats.slice(-6).map((c, i) => (
              <div key={i} className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                <div className="flex justify-between text-emerald-300 font-bold text-[10px]">
                  <span>{c.agent}</span>
                  <span className="text-slate-500">{c.zrodlo || 'NLP'}</span>
                </div>
                <div className="text-slate-300 text-[10px] truncate mt-0.5">{c.tekst}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
