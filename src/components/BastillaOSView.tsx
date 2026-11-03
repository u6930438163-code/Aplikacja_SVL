import React, { useState, useRef } from 'react';
import { DataStore, OPERATOR_NAME } from '../kernel/svlKernel';

interface BastillaOSViewProps {
  dataStore: DataStore;
  onSendMessage: (agent: string, tekst: string) => Promise<void>;
  isLoading: boolean;
}

export const BastillaOSView: React.FC<BastillaOSViewProps> = ({ dataStore, onSendMessage, isLoading }) => {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'BastillaOS v9.0.0-Debian-KDE [Kernel 9.0.0-Lumos-Lambda-Vision]',
    'System operacyjny Debian 13 (Trixie) gotowy. Środowisko graficzne Plasma (Deep Blue Edition).',
    'Wpisz komendę (np. "uname -a", "status", "python3 -c print(\'Lumos OS v9.0 active\')"):',
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Astyria');
  const [activeWindow, setActiveWindow] = useState<'terminal' | 'chat' | 'telemetry'>('terminal');

  const termEndRef = useRef<HTMLDivElement>(null);

  const handleRunTerminal = async () => {
    const cmd = terminalInput.trim();
    if (!cmd) return;
    setTerminalLogs((prev) => [...prev, `root@bastillaos:~# ${cmd}`]);
    setTerminalInput('');

    try {
      const res = await fetch('/api/kernel/root-exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, mode: 'auto' })
      });
      const data = await res.json();
      const output = data.stdout || data.stderr || '[Wykonano]';
      setTerminalLogs((prev) => [...prev, output]);
      if (data.geminiAnalysis) {
        setTerminalLogs((prev) => [...prev, `[Analiza AI Studio]: ${data.geminiAnalysis}`]);
      }
    } catch (err: any) {
      setTerminalLogs((prev) => [...prev, `Błąd wykonania: ${err.message}`]);
    }
  };

  const handleSendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || isLoading) return;
    setChatInput('');
    await onSendMessage(selectedAgent, msg);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950 font-mono text-xs select-none h-full overflow-hidden relative">
      
      {/* KDE Top Panel (Deep Blue Theme) */}
      <header className="h-10 bg-slate-950/95 border-b border-blue-500/40 px-4 flex items-center justify-between z-40 backdrop-blur shadow-lg">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-slate-950 font-extrabold flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <i className="fa-solid fa-compact-disc text-sm animate-spin" style={{ animationDuration: '8s' }}></i>
            <span className="tracking-wider">BastillaOS v9.0</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-blue-900/60">
            <button
              onClick={() => setActiveWindow('terminal')}
              className={`px-3 py-1 rounded transition font-bold flex items-center gap-1.5 cursor-pointer ${
                activeWindow === 'terminal' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <i className="fa-solid fa-terminal"></i>
              <span>Konsola ROOT</span>
            </button>
            <button
              onClick={() => setActiveWindow('chat')}
              className={`px-3 py-1 rounded transition font-bold flex items-center gap-1.5 cursor-pointer ${
                activeWindow === 'chat' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <i className="fa-solid fa-brain"></i>
              <span>Kwadryka SVL</span>
            </button>
            <button
              onClick={() => setActiveWindow('telemetry')}
              className={`px-3 py-1 rounded transition font-bold flex items-center gap-1.5 cursor-pointer ${
                activeWindow === 'telemetry' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <i className="fa-solid fa-wave-square"></i>
              <span>Telemetria</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <span className="px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-700/60 font-bold text-[10px] shadow-[0_0_8px_rgba(56,189,248,0.3)]">
            DEBIAN 13 TRIXIE · DEEP BLUE KDE
          </span>
          <span className="font-bold text-cyan-400">{new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      {/* Desktop Workspace */}
      <div className="flex-1 relative p-6 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Glowing Background Elements */}
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none right-10 bottom-10"></div>

        {/* Window Container */}
        <div className="w-full max-w-4xl h-[580px] bg-slate-900/90 border border-blue-500/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(14,165,233,0.3)] backdrop-blur-xl flex flex-col overflow-hidden z-20">
          
          {/* Window Title Bar */}
          <div className="h-9 bg-slate-950 px-4 flex items-center justify-between border-b border-blue-900/50">
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <i className={activeWindow === 'terminal' ? 'fa-solid fa-terminal text-emerald-400' : activeWindow === 'chat' ? 'fa-solid fa-brain text-cyan-400' : 'fa-solid fa-wave-square text-purple-400'}></i>
              <span>BastillaOS v9.0.0 // {activeWindow === 'terminal' ? 'Konsola ROOT' : activeWindow === 'chat' ? 'Kwadryka SVL Comms' : 'Matryca Telemetrii'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            </div>
          </div>

          {/* Window Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/80 p-4">
            
            {activeWindow === 'terminal' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-slate-950 rounded-xl border border-blue-900/40 text-emerald-400 font-mono text-xs">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className={log.startsWith('root@') ? 'text-blue-300 font-bold mt-2' : 'whitespace-pre-wrap'}>
                      {log}
                    </div>
                  ))}
                  <div ref={termEndRef} />
                </div>
                <div className="mt-3 flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-blue-900/50">
                  <span className="text-blue-400 font-bold">root@bastillaos:~#</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunTerminal()}
                    placeholder="Wpisz polecenie bash lub python3..."
                    className="flex-1 bg-transparent text-slate-100 outline-none text-xs font-mono"
                  />
                  <button
                    onClick={handleRunTerminal}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-slate-950 font-bold rounded-lg cursor-pointer transition"
                  >
                    Wykonaj
                  </button>
                </div>
              </div>
            )}

            {activeWindow === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950 rounded-xl border border-blue-900/40 text-slate-200">
                  {dataStore.chat_history.slice(-15).map((msg, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${msg.agent === OPERATOR_NAME ? 'bg-blue-950/40 border-blue-800' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyan-300">{msg.agent}</span>
                        <span className="text-[10px] text-slate-500">{msg.zrodlo || 'Ollama / API'}</span>
                      </div>
                      <div className="text-xs leading-relaxed text-slate-100">{msg.tekst}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-blue-900/50">
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="bg-slate-950 border border-blue-900 text-cyan-300 rounded px-2 py-1.5 text-xs outline-none"
                  >
                    <option value="Astyria">Astyria</option>
                    <option value="Aria">Aria</option>
                    <option value="Alex">Alex</option>
                    <option value="Aurelius">Aurelius</option>
                    <option value="triad">Wszyscy (Kwadryka)</option>
                  </select>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Rozmawiaj z agentami w BastillaOS v9.0..."
                    className="flex-1 bg-slate-950 border border-blue-900/60 rounded px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg cursor-pointer transition"
                  >
                    Wyślij
                  </button>
                </div>
              </div>
            )}

            {activeWindow === 'telemetry' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-cyan-300">BASTILLAOS v9.0.0 // KERNEL LAMBDA-VISION</h3>
                  <p className="text-slate-400 text-xs mt-1">Debian 13 Trixie · Blue KDE Plasma GUI · Ring-0 Secured</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <div className="p-4 bg-slate-900 rounded-xl border border-blue-900/60 text-center">
                    <div className="text-slate-500 text-[10px]">ENTROPIA JĄDRA</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">0.0384 Q-bit</div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-blue-900/60 text-center">
                    <div className="text-slate-500 text-[10px]">KOHERENCJA FAZOWA</div>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">99.99%</div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
