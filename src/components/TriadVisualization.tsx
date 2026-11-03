import React, { useEffect, useRef, useState } from 'react';
import { SVL_FLEET_REGISTRY } from '../lib/svlAiCoresEngine';
import { ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

export const TriadVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedShip, setSelectedShip] = useState<string>('mateusz_1');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.015;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Starfield
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 37 + t * 20) % w);
        const sy = ((i * 83) % h);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      const cx = w / 2;
      const cy = h / 2;

      // Draw Orbitals
      [120, 190, 260].forEach((rad, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? 'rgba(16, 185, 129, 0.15)' : idx === 1 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(168, 85, 247, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Flagship Mateusz_1 in center
      ctx.beginPath();
      ctx.arc(cx, cy, 18 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#10b981';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Mateusz_1 [FLAGOWY]', cx - 55, cy + 32);

      // Orbiting fleet vessels
      const fleet = [
        { id: 'alex_1', name: 'Alex_1 (320m)', color: '#38bdf8', r: 120, speed: 0.8 },
        { id: 'astyria_1', name: 'Astyria_1 (245m)', color: '#ec4899', r: 190, speed: -0.6 },
        { id: 'aurelius_1', name: 'Aurelius_1 (390m)', color: '#a855f7', r: 260, speed: 0.4 },
      ];

      fleet.forEach((ship) => {
        const angle = t * ship.speed;
        const px = cx + Math.cos(angle) * ship.r;
        const py = cy + Math.sin(angle) * (ship.r * 0.7);

        // Beam to flagship
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `${ship.color}33`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ship blip
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fillStyle = ship.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = ship.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(ship.name, px + 12, py + 4);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const currentShip = SVL_FLEET_REGISTRY[selectedShip] || SVL_FLEET_REGISTRY.mateusz_1;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Wizualizacja Taktyczna Floty & Triady</h2>
            <p className="text-slate-500 text-[11px]">Koherencja napędów kwantowych, tarcze sferyczne i łączność podprzestrzenna</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.keys(SVL_FLEET_REGISTRY).map((k) => (
            <button
              key={k}
              onClick={() => setSelectedShip(k)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                selectedShip === k
                  ? 'bg-emerald-600 text-slate-950'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {SVL_FLEET_REGISTRY[k].name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <canvas ref={canvasRef} width={800} height={380} className="w-full block" />
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="text-xs font-bold text-emerald-400 flex justify-between">
          <span>Telemetria Jednostki: {currentShip.name} ({currentShip.className})</span>
          <span className="text-slate-500">Długość: {currentShip.lengthM} m · {currentShip.decks} pokładów</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
          <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Rola w Szyku:</span>
            <span className="text-slate-200 font-semibold">{currentShip.role}</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Dowódca Nadrzędny:</span>
            <span className="text-cyan-400 font-semibold">{currentShip.commander}</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Układ Ciągu:</span>
            <span className="text-amber-300 font-semibold">{currentShip.propulsion}</span>
          </div>
          <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Pole Sferyczne:</span>
            <span className="text-emerald-300 font-semibold">{currentShip.shield}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
