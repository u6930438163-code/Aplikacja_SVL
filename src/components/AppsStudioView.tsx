import React, { useState, useEffect } from 'react';
import { LayoutGrid, Play, ExternalLink, Code2, Plus, Sparkles, RefreshCw } from 'lucide-react';

export const AppsStudioView: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps || []);
      }
    } catch (e) {
      console.warn('Failed to fetch apps:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Studio Aplikacji [Terminal Forge]</h2>
            <p className="text-slate-500 text-[11px]">Autonomiczne mikro-aplikacje tworzone przez Astyrię i Alex w katalogu /apps</p>
          </div>
        </div>
        <button
          onClick={fetchApps}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Odśwież</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
            <div className="font-bold text-slate-300 text-sm">Brak wygenerowanych aplikacji</div>
            <p className="text-xs text-slate-500 mt-1">Zleć Astyrii lub Alexowi utworzenie nowej aplikacji z poziomu Czatu lub Terminala.</p>
          </div>
        ) : (
          apps.map((app) => (
            <div key={app.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-100 text-sm">{app.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-sans">
                    {app.version || 'v1.0.0'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2">{app.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500">Twórca: {app.author}</span>
                <a
                  href={`/app/${app.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded text-xs transition flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Otwórz</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
