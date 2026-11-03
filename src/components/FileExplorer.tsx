import React, { useState, useEffect } from 'react';
import { FolderOpen, Download, FileText, RefreshCw, Archive, FileCode } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/explorer/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.warn('Failed to fetch exported files:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Eksplorator Plików i Szyna Eksportowa</h2>
            <p className="text-slate-500 text-[11px]">Pliki wygenerowane, zrzuty jądra, archiwa i skrypty w katalogu /exports</p>
          </div>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Odśwież</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-300 pb-2 border-b border-slate-800">
          <span>Nazwa Zasobu</span>
          <span>Rozmiar / Pobieranie</span>
        </div>

        {files.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            Katalog /exports jest pusty. Zleć agentom eksport pliku lub wygeneruj zrzut z poziomu Terminala.
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {f.type === 'archive' ? (
                    <Archive className="w-4 h-4 text-amber-400" />
                  ) : (
                    <FileCode className="w-4 h-4 text-emerald-400" />
                  )}
                  <div>
                    <div className="font-bold text-slate-200 text-xs">{f.name}</div>
                    <div className="text-[10px] text-slate-500">Typ: {f.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">{f.size}</span>
                  <a
                    href={`/api/explorer/download/${encodeURIComponent(f.name)}`}
                    download
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 transition"
                    title="Pobierz plik"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
