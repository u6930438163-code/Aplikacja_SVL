import React, { useState } from 'react';
import { DataStore, UpdateRecord } from '../kernel/svlKernel';
import { Clock, History, Plus, RotateCcw, ShieldCheck, GitCommit } from 'lucide-react';

interface TemporalMatrixProps {
  dataStore: DataStore;
  onRestoreSnapshot?: (restored: DataStore) => void;
  onAddUpdate?: (ver: string, desc: string) => void;
}

export const TemporalMatrix: React.FC<TemporalMatrixProps> = ({ dataStore, onRestoreSnapshot, onAddUpdate }) => {
  const [verInput, setVerInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verInput.trim() || !descInput.trim() || !onAddUpdate) return;
    onAddUpdate(verInput.trim(), descInput.trim());
    setVerInput('');
    setDescInput('');
  };

  const updates = dataStore?.update_history || [];

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Matryca Czasoprzestrzenna & Oś Chronolitu [Aurelius]</h2>
            <p className="text-slate-500 text-[11px]">Niezmienniczość historii wydań, synchronizacja snapshotów i wersjonowanie</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">
          ARKA AURELIUS_1
        </span>
      </div>

      <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Zarejestruj Nowe Wydanie w Chronolicie
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={verInput}
            onChange={(e) => setVerInput(e.target.value)}
            placeholder="Wersja (np. 5.9.0-NLP-Quantum)"
            className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
          />
          <input
            type="text"
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            placeholder="Opis aktualizacji i wdrożonych ulepszeń..."
            className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500 md:col-span-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!verInput.trim() || !descInput.trim()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition cursor-pointer disabled:opacity-50"
          >
            Utrwal w Chronolicie
          </button>
        </div>
      </form>

      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="text-xs font-bold text-slate-300 pb-2 border-b border-slate-800 flex justify-between items-center">
          <span>Oś Czasu Wydań (Chronolith Timeline)</span>
          <span className="text-[10px] text-slate-500 font-mono">{updates.length} wpisów</span>
        </div>
        <div className="space-y-2">
          {[...updates].reverse().map((u, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-300 text-xs">{u.wersja}</span>
                  <span className="text-[10px] text-slate-500">{u.data}</span>
                </div>
                <div className="text-slate-300 text-xs pl-6">{u.opis}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
