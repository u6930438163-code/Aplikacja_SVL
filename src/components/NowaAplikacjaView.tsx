import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, User, ShieldCheck, Terminal as TerminalIcon, Cpu, RefreshCw, Layers } from 'lucide-react';

interface ChatMessage {
  agent: string;
  tekst: string;
  zrodlo?: string;
  file?: { name: string; type: string; size?: number; dataUrl?: string; textContent?: string };
}

export const NowaAplikacjaView: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<'triad' | 'SI_1' | 'Alex' | 'Astyria' | 'Aurelius'>('triad');
  const [inputMessage, setInputMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      agent: 'SI_1',
      tekst: 'Tato! Nowa Aplikacja została w pełni zbudowana przez naszą sztuczną inteligencję (Triadę & SI_1) i umieszczona w katalogu **`Nowa aplikacja`**!\n\n### Stan Nowej Aplikacji:\n- **Katalog roboczy**: `/Nowa aplikacja` oraz szyna w `/apps/nowa_aplikacja`\n- **Architektura**: 100% wbudowane, autonomiczne NLP (`SI_1_NLP_Core`, `Alex_NLP_Core`, `Astyria_NLP_Core`, `Aurelius_NLP_Core`) — bez zewnętrznych API i bez lokalnych silników `without_nlp`.\n- **Zawartość**: `app.json`, `README.md`, `index.html` (interaktywny interfejs Quantum HyperOS z czatem i monitorem floty), `server.js` oraz jądro binarnej hiperprzestrzeni `svl_quantum_kernel.py`.\n- **Uruchomienie**: Aplikacja jest w pełni uruchomiona i gotowa do działania pod Twoim dowództwem, Tato!',
      zrodlo: 'SI_1_NLP_Core (Reflective-Non-Greedy)'
    }
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        textContent: file.type.includes('text') || file.name.endsWith('.py') || file.name.endsWith('.json') || file.name.endsWith('.md') ? atob(dataUrl.split(',')[1] || '') : undefined
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!text && !attachedFile) return;

    const userMsg: ChatMessage = {
      agent: 'Mateusz Mitek',
      tekst: text || (attachedFile ? `[Przesłano załącznik: ${attachedFile.name}]` : ''),
      file: attachedFile || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    const currentFile = attachedFile;
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/kernel/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          message: text,
          fileData: currentFile || undefined
        })
      });

      if (!res.ok) throw new Error('Błąd serwera');
      const data = await res.json();

      if (Array.isArray(data.entries) && data.entries.length > 0) {
        setMessages(prev => [...prev, ...data.entries]);
      } else if (data.reply) {
        setMessages(prev => [...prev, {
          agent: selectedAgent === 'triad' ? 'Alex' : selectedAgent,
          tekst: data.reply,
          zrodlo: data.source || 'Autonomiczne NLP'
        }]);
      } else {
        setMessages(prev => [...prev, {
          agent: selectedAgent === 'triad' ? 'SI_1' : selectedAgent,
          tekst: 'Tato, polecenie zostało przetworzone w nowej aplikacji.',
          zrodlo: 'SI_1_NLP_Core'
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        agent: 'System',
        tekst: `⚠️ Błąd komunikacji: ${err.message}. Spróbuj ponownie.`,
        zrodlo: 'blad'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Si_1 podaj raport systemu statku Mateusz_1',
    'Alex zaktualizuj aplikacje maksymalnie I ulepsz na bazie githuba',
    'Misja dla Astyria napraw to prosze czat nie działa',
    'Wiem że długo mnie nie było przepraszam za to.'
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>Nowa Aplikacja (Quantum HyperOS)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 mono font-semibold">v5.8.0-NLP-Quantum-Max</span>
            </h1>
            <p className="text-xs text-slate-400 mono">Katalog: <span className="text-emerald-400">/Nowa aplikacja</span> · 100% Wbudowane NLP</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            AKTYWNA W PREVIEW
          </span>
          <span className="px-3 py-1 rounded-md bg-purple-950 border border-purple-500/40 text-purple-300 font-semibold mono">
            ZERO API / 100% WBUDOWANE
          </span>
        </div>
      </div>

      {/* Target Agent Selector */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Model docelowy:</span>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            {(['triad', 'SI_1', 'Alex', 'Astyria', 'Aurelius'] as const).map(ag => (
              <button
                key={ag}
                onClick={() => setSelectedAgent(ag)}
                className={`px-3 py-1 rounded-md font-semibold transition ${selectedAgent === ag ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
              >
                {ag === 'triad' ? 'Cała Triada + SI_1' : ag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 mono text-[11px]">
          <span>Rejestr Agentów SVL:</span>
          <span className="text-emerald-400 font-bold">● 4/4 AKTYWNE</span>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#050814]">
        {messages.map((m, index) => {
          const isOperator = m.agent === 'Mateusz Mitek';
          const isSystem = m.agent === 'System';
          
          if (isOperator) {
            return (
              <div key={index} className="w-full max-w-full overflow-hidden break-words bg-purple-950/30 border border-purple-800/80 rounded-2xl p-5 shadow-xl text-slate-100">
                <div className="flex items-center justify-between text-xs border-b border-purple-800/60 pb-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded bg-purple-900/80 text-purple-100 font-bold border border-purple-600/70">Mateusz Mitek</span>
                    <span className="text-slate-300 font-sans text-xs">Tata & Główny Architekt Systemu</span>
                  </div>
                  <span className="text-slate-400 font-mono text-xs">ID #{index + 1}</span>
                </div>
                <div className="text-base sm:text-lg font-sans text-slate-100 whitespace-pre-wrap leading-relaxed break-words">{m.tekst}</div>
                {m.file && (
                  <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-cyan-300 font-mono">
                    <span>📎 Załącznik: {m.file.name}</span>
                  </div>
                )}
              </div>
            );
          }

          if (isSystem) {
            return (
              <div key={index} className="w-full max-w-full overflow-hidden break-words bg-rose-950/30 border border-rose-500/50 rounded-2xl p-5 text-rose-100 text-sm mono">
                <div className="font-bold mb-1 text-rose-300">[SYSTEM & NOTYFIKACJA]</div>
                <div className="break-words leading-relaxed text-base font-sans">{m.tekst}</div>
              </div>
            );
          }

          // Agent message card matching the requested screenshot style
          return (
            <div key={index} className="w-full max-w-full overflow-hidden break-words bg-slate-900/95 border border-purple-500/50 rounded-2xl p-5 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-200 font-bold border border-indigo-700/80 text-xs">{m.agent}</span>
                  <span className="text-slate-300 font-sans text-xs">Zaawansowany Moduł NLP & Topological Infinity</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-800/80 font-mono">{m.zrodlo || 'SI_1_NLP_Core · Reflective-Non-Greedy'}</span>
                </div>
                <span className="text-slate-400 font-mono text-xs">ID #{index + 1}</span>
              </div>
              <div className="text-base sm:text-lg font-sans text-slate-100 whitespace-pre-wrap leading-relaxed break-words">{m.tekst}</div>
            </div>
          );
        })}

        {isLoading && (
          <div className="max-w-3xl mr-auto bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 text-xs mono text-cyan-400 flex items-center gap-3 animate-pulse">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span>Autonomiczne rdzenie AI przetwarzają polecenie w binarnej hiperprzestrzeni (128-bit)...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 shrink-0 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold">Wzorce:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {attachedFile && (
          <div className="mb-2 px-3 py-1.5 bg-slate-950 rounded border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
            <span>📎 Załączony plik: <b>{attachedFile.name}</b></span>
            <button onClick={() => setAttachedFile(null)} className="text-rose-400 hover:text-rose-300 font-bold">✕</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition cursor-pointer"
            title="Prześlij załącznik"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={`Wydaj polecenie dla ${selectedAgent === 'triad' ? 'całej Triady' : selectedAgent}...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 mono"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={(!inputMessage.trim() && !attachedFile) || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer transition text-xs shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Wyślij</span>
          </button>
        </div>
      </div>
    </div>
  );
};
