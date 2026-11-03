import React, { useState, useEffect } from 'react';
import { DataStore, OPERATOR_NAME, SYS_VERSION, generatePythonMonolith } from '../kernel/svlKernel';
import { Terminal, Copy, Download, RefreshCw, ShieldCheck, Cpu, Clock, Check, RotateCcw } from 'lucide-react';

interface HeaderProps {
  dataStore: DataStore;
  onReset: () => void;
  onRevertToFirstCheckpoint?: () => void;
  onShowReport: () => void;
  onSyncSystem?: () => Promise<void> | void;
}

export const Header: React.FC<HeaderProps> = ({
  dataStore,
  onReset,
  onRevertToFirstCheckpoint,
  onShowReport,
  onSyncSystem,
}) => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const liveVersion = dataStore.config?.sys_version || SYS_VERSION;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pl-PL', { hour12: false }) + ' CEST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyMonolith = () => {
    const py = generatePythonMonolith(dataStore, OPERATOR_NAME, liveVersion);
    navigator.clipboard.writeText(py);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMonolith = () => {
    const py = generatePythonMonolith(dataStore, OPERATOR_NAME, liveVersion);
    const blob = new Blob([py], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svl_kernel_${liveVersion.toLowerCase().replace(/[^a-z0-9]/g, '_')}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLiveSyncClick = async () => {
    if (!onSyncSystem || syncing) return;
    setSyncing(true);
    try {
      await onSyncSystem();
    } finally {
      setTimeout(() => setSyncing(false), 400);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand & Kernel identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="font-mono font-bold tracking-wider text-slate-100 text-sm">
              SVL KERNEL
            </span>
            <span className="font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded text-[11px] font-bold">
              v{liveVersion}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              LIVE SYNC: NA BIEŻĄCO
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>

          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 font-mono">OPERATOR:</span>
            <span className="font-semibold text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40 font-mono">
              {OPERATOR_NAME} (ROOT)
            </span>
          </div>
        </div>

        {/* Runtime State Indicators */}
        <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500">SILNIK:</span>
            <span className="text-emerald-300 font-medium">{dataStore.config?.chat_engine || 'Ollama-Pro-Ultra (11434)'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500">ROOT:</span>
            <span className="text-emerald-400 font-medium">ODBLOKOWANY</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300">{currentTime || 'CZAS SYNCHR.'}</span>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1 ml-1">
            {onSyncSystem && (
              <button
                onClick={handleLiveSyncClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/60 transition cursor-pointer font-bold"
                title="Wymuś natychmiastową synchronizację stanu i wersji w całej aplikacji"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${syncing ? 'animate-spin' : ''}`} />
                <span>Synchronizuj</span>
              </button>
            )}

            {onRevertToFirstCheckpoint && (
              <button
                onClick={onRevertToFirstCheckpoint}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-700/60 transition cursor-pointer font-semibold"
                title="Cofnij stan aplikacji do pierwszego checkpointa"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span className="hidden lg:inline">Checkpoint 1</span>
              </button>
            )}

            <button
              onClick={handleCopyMonolith}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Kopiuj zrzut kodu Pythona z tagami DATA_STORE"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
              <span>{copied ? 'Skopiowano!' : 'Kopiuj .py'}</span>
            </button>

            <button
              onClick={handleDownloadMonolith}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Pobierz plik SVL Kernel .py"
            >
              <Download className="w-3 h-3 text-slate-300" />
              <span className="hidden md:inline">Zrzut</span>
            </button>

            <button
              onClick={onShowReport}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-800/40 transition cursor-pointer"
              title="Wyświetl raport tekstowy ASCII"
            >
              <Terminal className="w-3 h-3" />
              <span>Raport</span>
            </button>

            <button
              onClick={onReset}
              className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/40 transition cursor-pointer"
              title="Przywróć pierwszy checkpoint Monolitu"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
