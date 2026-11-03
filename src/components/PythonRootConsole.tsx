import React, { useState } from 'react';
import { ShieldCheck, Terminal, Sparkles, Play, Unlock, Cpu } from 'lucide-react';

export const PythonRootConsole: React.FC = () => {
  const [command, setCommand] = useState('import os, platform; print("ROOT UNLOCKED | Operator: Mateusz Mitek | System:", platform.system(), "| CWD:", os.getcwd())');
  const [mode, setMode] = useState<'auto' | 'python' | 'bash'>('auto');
  const [processWithGemini, setProcessWithGemini] = useState(true);
  const [output, setOutput] = useState<{
    stdout: string;
    stderr: string;
    geminiAnalysis?: string;
    model?: string;
    executionMode?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const executeCommand = async (customCmd?: string, customMode?: 'auto' | 'python' | 'bash') => {
    const cmdToRun = customCmd ?? command;
    if (!cmdToRun.trim()) return;
    setLoading(true);
    setOutput(null);
    try {
      const response = await fetch('/api/kernel/root-exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmdToRun,
          mode: customMode ?? mode,
          processWithGemini,
        }),
      });
      const data = await response.json();
      if (!response.ok && !data.stdout && !data.geminiAnalysis) {
        throw new Error(data.error || 'Błąd wykonania ROOT');
      }
      setOutput({
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        geminiAnalysis: data.geminiAnalysis || '',
        model: data.model,
        executionMode: data.executionMode,
      });
    } catch (e: any) {
      setOutput({ stdout: '', stderr: '', error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const QUICK_ROOT_ACTIONS = [
    {
      label: 'Test Python ROOT (364)',
      mode: 'python' as const,
      cmd: 'import os, sys; print("ROOT RING-0 AKTYWNY | Operator: Mateusz Mitek | Python:", sys.version.split()[0], "| UID:", os.getuid())',
    },
    {
      label: 'Bash Root: System & Dysk',
      mode: 'bash' as const,
      cmd: 'whoami && id && uname -a && df -h | head -n 5',
    },
    {
      label: 'Raport SVL Kernel (JSON)',
      mode: 'bash' as const,
      cmd: 'python3 svl_kernel.py --action state',
    },
    {
      label: 'Lista Plików Projektu',
      mode: 'bash' as const,
      cmd: 'ls -la',
    },
  ];

  return (
    <div className="p-3 sm:p-4 bg-slate-950 border border-emerald-500/50 rounded-xl font-mono text-xs shadow-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <Unlock className="w-4 h-4 text-emerald-400" />
          <h2 className="text-emerald-300 font-bold tracking-wide flex items-center gap-2">
            <span>ODBLOKOWANA KONSOLA ROOT RING-0 (PYTHON 3 + BASH + GEMINI)</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500/60 text-rose-200 font-bold text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-400" />
            ROOT: MATEUSZ MITEK (ODBLOKOWANY)
          </span>
          <button
            type="button"
            onClick={() => setProcessWithGemini(!processWithGemini)}
            className={`px-2.5 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition ${
              processWithGemini
                ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>GEMINI DLA KAŻDEGO POLECENIA: {processWithGemini ? 'WŁĄCZONE' : 'WYŁĄCZONE'}</span>
          </button>
        </div>
      </div>

      {/* Mode & Quick Commands */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['auto', 'bash', 'python'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition ${
                mode === m
                  ? 'bg-emerald-600 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'auto' ? 'Auto (Root)' : m === 'bash' ? 'Bash Shell' : 'Python 3 Root'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_ROOT_ACTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setMode(item.mode);
                setCommand(item.cmd);
                executeCommand(item.cmd, item.mode);
              }}
              disabled={loading}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-[10px] cursor-pointer transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input & Execute */}
      <div className="flex flex-col sm:flex-row gap-2">
        <textarea
          className="flex-1 h-20 bg-slate-900 text-emerald-300 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono text-xs"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Wpisz kod Python lub komendę powłoki Bash z uprawnieniami ROOT..."
        />
        <button
          type="button"
          onClick={() => executeCommand()}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-emerald-950/50"
        >
          <Play className="w-4 h-4" />
          <span>{loading ? 'PRZETWARZANIE ROOT + GEMINI...' : 'WYKONAJ ROOT + GEMINI'}</span>
        </button>
      </div>

      {output && (
        <div className="space-y-2 pt-1">
          {(output.stdout || output.stderr || output.error) && (
            <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
              <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1.5 border-b border-slate-800 pb-1">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>WYNIK WYKONANIA ROOT ({output.executionMode || 'ring-0'}):</span>
              </div>
              {output.error && <div className="text-rose-400">ERROR: {output.error}</div>}
              {output.stdout && <div className="text-emerald-400">{output.stdout}</div>}
              {output.stderr && <div className="text-amber-400">STDERR: {output.stderr}</div>}
            </pre>
          )}

          {output.geminiAnalysis && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg text-slate-100 space-y-1.5">
              <div className="text-[10px] text-cyan-300 font-bold flex items-center gap-1.5 border-b border-cyan-800/50 pb-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>PRZETWARZANIE POLECENIA PRZEZ GEMINI ({output.model || 'gemini-3.8-flash'}) · ASTYRIA ROOT:</span>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {output.geminiAnalysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
