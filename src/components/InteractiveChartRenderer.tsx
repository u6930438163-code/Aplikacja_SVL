import React, { useEffect, useRef } from 'react';

export const PhaseSpaceChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Lissajous Phase Trajectory
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < 200; i++) {
        const angle = i * 0.05 + t;
        const r = 50 + 20 * Math.sin(t * 1.5);
        const px = cx + Math.sin(angle * 2) * r;
        const py = cy + Math.cos(angle * 3) * (r * 0.7);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center">
      <div className="text-[11px] font-bold text-emerald-400 mb-2 w-full flex justify-between">
        <span>Przestrzeń Fazowa (Phase Space)</span>
        <span className="text-slate-500 font-mono">2D Euler</span>
      </div>
      <canvas ref={canvasRef} width={260} height={160} className="rounded border border-slate-900 bg-slate-950 w-full" />
    </div>
  );
};

export const EntropyHeatmapChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      const cols = 12;
      const rows = 8;
      const cellW = w / cols;
      const cellH = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = (Math.sin(c * 0.6 + t) + Math.cos(r * 0.5 + t * 0.8) + 2) / 4;
          const green = Math.floor(val * 200 + 40);
          ctx.fillStyle = `rgb(6, ${green}, 160)`;
          ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center">
      <div className="text-[11px] font-bold text-cyan-400 mb-2 w-full flex justify-between">
        <span>Gęstość Entropii (Entropy Matrix)</span>
        <span className="text-slate-500 font-mono">128-bit</span>
      </div>
      <canvas ref={canvasRef} width={260} height={160} className="rounded border border-slate-900 bg-slate-950 w-full" />
    </div>
  );
};

export const Triad3DOscillatorChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw 3 orbiting nodes (Alex, Astyria, Aurelius)
      const nodes = [
        { label: 'Alex', color: '#10b981', r: 48, speed: 1.0, offset: 0 },
        { label: 'Astyria', color: '#06b6d4', r: 60, speed: -0.8, offset: (2 * Math.PI) / 3 },
        { label: 'Aurelius', color: '#a855f7', r: 54, speed: 0.6, offset: (4 * Math.PI) / 3 },
      ];

      // Central core
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      nodes.forEach((node) => {
        const angle = t * node.speed + node.offset;
        const nx = cx + Math.cos(angle) * node.r;
        const ny = cy + Math.sin(angle) * (node.r * 0.6);

        // Link to core
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `${node.color}44`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node circle
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px monospace';
        ctx.fillText(node.label, nx + 7, ny + 3);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center">
      <div className="text-[11px] font-bold text-purple-400 mb-2 w-full flex justify-between">
        <span>Harmonia Triady (Triad Resonance)</span>
        <span className="text-slate-500 font-mono">Q-Oscillator</span>
      </div>
      <canvas ref={canvasRef} width={260} height={160} className="rounded border border-slate-900 bg-slate-950 w-full" />
    </div>
  );
};
