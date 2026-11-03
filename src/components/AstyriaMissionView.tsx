import React, { useState } from 'react';
import { DataStore, FileAttachment } from '../kernel/svlKernel';
import { GitBranch, ShieldCheck, Sparkles, Send, RefreshCw, Cpu, Layers } from 'lucide-react';

interface AstyriaMissionViewProps {
  dataStore: DataStore;
  onUpdateDataStore?: (updater: (prev: DataStore) => DataStore) => void;
  onSendMessage?: (agent: string, tekst: string, fileData?: FileAttachment) => Promise<void>;
}

export const AstyriaMissionView: React.FC<AstyriaMissionViewProps> = ({ dataStore, onSendMessage }) => {
  const [missionPrompt, setMissionPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunMission = async () => {
    if (!missionPrompt.trim() || loading || !onSendMessage) return;
    setLoading(true);
    try {
      await onSendMessage('Astyria', `Misja dla Astyria: ${missionPrompt.trim()}`);
      setMissionPrompt('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Misja Astyria & VM_Ten_System</h2>
            <p className="text-slate-500 text-[11px]">Koordynacja architektoniczna, samonaprawa struktur i harmonia fazowa</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px]">
          FREGATA ASTYRIA_1
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Zleć Dedykowaną Misję dla Astyrii
          </h3>
          <p className="text-slate-400 text-xs">
            Wpisz wytyczne lub zadanie dla Głównej Architektki. Astyria natychmiast zsynchronizuje struktury w jądrze i DATA_STORE.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={missionPrompt}
              onChange={(e) => setMissionPrompt(e.target.value)}
              placeholder="np. Przeanalizuj spójność pamięci i zsynchronizuj rejestry..."
              className="flex-1 px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
              disabled={loading}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRunMission(); }}
            />
            <button
              onClick={handleRunMission}
              disabled={loading || !missionPrompt.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-950 font-bold rounded text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Zleć</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Parametry Architektury Kognitywnej
          </h3>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Silnik Autonomiczny:</span>
              <span className="text-emerald-400 font-bold">Astyria_NLP_Core (Intuitive-Reflective)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Stan Fregaty Astyria_1:</span>
              <span className="text-cyan-400 font-bold">100% Sprawności (245 m)</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Częstotliwość Rezonansu:</span>
              <span className="text-purple-300 font-bold">e^(i*omega*t) Koherentna</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
