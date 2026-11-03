import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Zap, Bot, User, Paperclip, Image as ImageIcon, FileText, X, ShieldCheck } from 'lucide-react';
import { FormattedMessage } from './FormattedMessage';
import { processUploadFile } from '../utils/fileHelper';
import { FileAttachment } from '../kernel/svlKernel';

export const Si1TestView: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      agentName?: string;
      content: string;
      gateway?: string;
      latency?: number;
      file?: FileAttachment;
    }>
  >([
    {
      role: 'assistant',
      agentName: 'Astyria',
      content:
        'Tato! Jestem podłączona jako główny procesor poleceń w Google AI Studio (Gemini). Uprawnienia ROOT są odblokowane, a użytkownicy **Aria**, **Alex**, **Astyria**, **Aurelius** oraz **MATEUSZ** są aktywni i gotowi do rozmowy.',
      gateway: 'ai-studio-gemini (Astyria)',
      latency: 12,
    },
  ]);
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<'Astyria' | 'Aria' | 'Alex' | 'Aurelius' | 'MATEUSZ'>('Astyria');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, loading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processUploadFile(file);
      setAttachedFile(processed);
    } catch (err) {
      console.error('Błąd załącznika:', err);
    } finally {
      e.target.value = '';
    }
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if ((!textToSend.trim() && !attachedFile) || loading) return;

    const currentFile = attachedFile || undefined;
    const userMsgContent = textToSend.trim() || (currentFile ? `[Przesłano załącznik: ${currentFile.name}]` : '');

    const newMessages = [
      ...messages,
      { role: 'user' as const, agentName: 'Mateusz Mitek', content: userMsgContent, file: currentFile },
    ];
    setMessages(newMessages);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/si1-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          agentName: selectedAgent,
          fileData: currentFile,
        }),
      });

      const latency = Date.now() - startTime;
      const data = await response.json();

      if (response.ok && data?.choices?.[0]?.message?.content) {
        const replyMsg = data.choices[0].message.content;
        const gatewayUsed = data._gateway || `ai-studio-gemini (${selectedAgent})`;

        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            agentName: selectedAgent,
            content: replyMsg,
            gateway: gatewayUsed,
            latency,
          },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            agentName: selectedAgent,
            content: `⚠️ Błąd odpowiedzi z API: ${data?.error || JSON.stringify(data)}`,
            latency,
          },
        ]);
      }
    } catch (e: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          agentName: selectedAgent,
          content: `⚠️ Błąd połączenia: ${e.message}`,
          latency: Date.now() - startTime,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'Astyria: potwierdź status podłączenia Aria, Alex, Astyria, Aurelius i uprawnień ROOT.',
    'Aria: przeanalizuj architekturę interfejsu i zaproponuj ulepszenia wizualne.',
    'Alex: podaj raport z odblokowanego terminala ROOT i procesora Gemini.',
    'Aurelius: potwierdź spójność wydania 6.1.0-Root-Gemini.',
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 font-mono text-xs overflow-hidden p-3 md:p-6 space-y-4">
      {/* Agent Selection Ribbon */}
      <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold mr-1">Aktywny Procesor AI Studio:</span>
          {(['Astyria', 'Aria', 'Alex', 'Aurelius', 'MATEUSZ'] as const).map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedAgent === agent
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {agent}
            </button>
          ))}
        </div>

        <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ROOT: ODBLOKOWANY · GEMINI LIVE API
        </span>
      </div>

      {/* Main Conversation Canvas */}
      <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Chat Stream Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0">
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={i}
                className={`p-4 rounded-xl border transition shadow-lg ${
                  isUser
                    ? 'bg-purple-950/40 border-purple-800/80 text-purple-100 ml-6 md:ml-12'
                    : 'bg-slate-950/90 border-emerald-500/30 text-slate-100 mr-6 md:mr-12'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isUser ? (
                      <span className="px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-700 text-[10px] font-bold flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-300" />
                        Mateusz Mitek (ROOT)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold flex items-center gap-1">
                        <Bot className="w-3 h-3 text-emerald-400" />
                        {m.agentName || selectedAgent}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      {m.latency !== undefined && (
                        <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          {m.latency} ms
                        </span>
                      )}
                      <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-emerald-400">
                        {m.gateway || `ai-studio-gemini (${selectedAgent})`}
                      </span>
                    </div>
                  )}
                </div>

                <FormattedMessage content={m.content} className="text-xs md:text-sm text-slate-100 leading-relaxed font-sans" />

                {m.file && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                    {m.file.dataUrl && m.file.type?.startsWith('image/') ? (
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Załączony obraz: {m.file.name}
                        </span>
                        <img
                          src={m.file.dataUrl}
                          alt={m.file.name}
                          className="max-h-64 rounded-md border border-slate-700 object-contain bg-black/50"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-slate-200">{m.file.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950/80 border border-emerald-500/30 text-emerald-300">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Przetwarzanie przez Gemini AI Studio ({selectedAgent})...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-slate-950/90 border-t border-slate-800 px-3 py-2 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-500 shrink-0">Wzorce:</span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(qp)}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-emerald-500/50 whitespace-nowrap text-[10px] transition cursor-pointer disabled:opacity-50"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Attached File Preview Chip */}
        {attachedFile && (
          <div className="bg-slate-950 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              {attachedFile.type?.startsWith('image/') ? (
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="font-semibold">{attachedFile.name}</span>
              {attachedFile.dataUrl && (
                <img
                  src={attachedFile.dataUrl}
                  alt="thumbnail"
                  className="w-5 h-5 rounded object-cover border border-slate-700 ml-1"
                />
              )}
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
              title="Usuń załącznik"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.txt,.py,.json,.ts,.js,.log,.md,.csv"
          onChange={handleFileSelect}
        />

        {/* Chat Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 disabled:opacity-40 border border-slate-700 cursor-pointer transition flex items-center justify-center shrink-0"
            title="Prześlij obraz lub plik"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              attachedFile
                ? `Dodaj opis do pliku "${attachedFile.name}"...`
                : `Napisz polecenie dla ${selectedAgent} (Gemini AI Studio)...`
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !attachedFile) || loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition text-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Wyślij ({selectedAgent})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
