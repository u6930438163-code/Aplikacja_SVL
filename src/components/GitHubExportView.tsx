import React, { useState, useEffect } from 'react';
import { Github, Upload, Download, RefreshCw, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

export const GitHubExportView: React.FC = () => {
  const [username, setUsername] = useState('u6930438163-code');
  const [repoName, setRepoName] = useState('SVL_Kernel');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/github/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.username) setUsername(data.username);
        if (data.repoName) setRepoName(data.repoName);
      }
    } catch (e) {
      console.warn('Failed to fetch github status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePush = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, repoName, token })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ ${data.message || 'Pomyślnie wyeksportowano na GitHub!'}`);
        fetchStatus();
      } else {
        setMsg(`❌ ${data.error || 'Błąd eksportu'}`);
      }
    } catch (err: any) {
      setMsg(`❌ Błąd połączenia: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/github/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, repoName, token })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✅ ${data.message || 'Pomyślnie zsynchronizowano z GitHubem!'}`);
        fetchStatus();
      } else {
        setMsg(`❌ ${data.error || 'Błąd synchronizacji'}`);
      }
    } catch (err: any) {
      setMsg(`❌ Błąd połączenia: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Github className="w-5 h-5 text-slate-100" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Dwukierunkowa Synchronizacja GitHub [Astyria Sync]</h2>
            <p className="text-slate-500 text-[11px]">Eksport i import modułów z repozytorium GitHub ({username}/{repoName})</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono">
          GAŁĄŹ: main
        </span>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100">
          {msg}
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 max-w-xl">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          Konfiguracja Repozytorium
        </h3>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Użytkownik / Organizacja:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Nazwa Repozytorium:</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Personal Access Token (opcjonalny dla publicznych, wymagany dla push):</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={status?.hasToken ? `Zachowany token (${status.maskedToken})` : 'ghp_...'}
              className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePush}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Wypchnij (Git Push)</span>
          </button>
          <button
            onClick={handlePull}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Pobierz (Git Pull)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
