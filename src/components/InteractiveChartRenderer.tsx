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


// Shared schematic chart renderer used by FormattedMessage and the diagnostics.
// These animations are illustrations, not live hardware/agent telemetry.
type SignalKind = 'power' | 'heartbeat' | 'orbits';
const chartLabels: Record<SignalKind, string> = {
  power: 'Przebieg mocy (schemat)',
  heartbeat: 'Puls sygnału (schemat)',
  orbits: 'Orbity agentów (schemat)',
};
const SignalCanvas: React.FC<{ kind: SignalKind }> = ({ kind }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let active = true;
    const startedAt = performance.now();
    const draw = (now: number) => {
      if (!active) return;
      const w = canvas.width;
      const h = canvas.height;
      const t = (now - startedAt) / 1000;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.7;
      for (let x = 0; x < w; x += 26) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 26) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      if (kind === 'orbits') {
        const cx = w / 2, cy = h / 2;
        const nodes = [
          { name: 'Aria', color: '#818cf8' },
          { name: 'Alex', color: '#34d399' },
          { name: 'Astyria', color: '#22d3ee' },
          { name: 'Aurelius', color: '#fbbf24' },
        ];
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
        nodes.forEach((node, i) => {
          const angle = t * (0.32 + i * 0.06) + i * Math.PI / 2;
          const nx = cx + 75 * Math.cos(angle), ny = cy + 49 * Math.sin(angle);
          ctx.strokeStyle = node.color;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
          ctx.fillStyle = node.color;
          ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2); ctx.fill();
          ctx.font = '10px sans-serif';
          ctx.fillText(node.name, Math.min(nx + 7, w - 43), Math.max(12, ny - 6));
        });
      } else {
        const gaussian = (x: number, center: number, width: number) =>
          Math.exp(-Math.pow((x - center) / width, 2));
        const trace = (line: number) => {
          ctx.beginPath();
          ctx.lineWidth = line === 0 ? 2 : 1.3;
          ctx.strokeStyle = kind === 'heartbeat' ? '#34d399' : line === 0 ? '#38bdf8' : '#a78bfa';
          for (let x = 0; x < w; x += 2) {
            let y: number;
            if (kind === 'heartbeat') {
              const phase = (((x / w) * 2.5 - t * 0.55) % 1 + 1) % 1;
              const pulse = 12 * gaussian(phase, 0.18, 0.045)
                - 20 * gaussian(phase, 0.35, 0.014)
                + 63 * gaussian(phase, 0.385, 0.012)
                - 26 * gaussian(phase, 0.42, 0.016)
                + 13 * gaussian(phase, 0.65, 0.08);
              y = h * 0.56 - pulse;
            } else {
              y = h * (line === 0 ? 0.42 : 0.62)
                + (line === 0 ? 26 : 18) * Math.sin(x * 0.037 - t * (line === 0 ? 2 : 1.4))
                + 6 * Math.sin(x * 0.11 + t * 0.7);
            }
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        };
        trace(0);
        if (kind === 'power') trace(1);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [kind]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center">
      <div className="w-full flex flex-wrap justify-between gap-2 text-[11px] font-semibold text-cyan-300 mb-2">
        <span>{chartLabels[kind]}</span>
        <span className="text-slate-500 font-mono">Wizualizacja poglądowa</span>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={160}
        aria-label={chartLabels[kind]}
        role="img"
        className="rounded border border-slate-900 bg-slate-950 w-full max-w-full"
      />
    </div>
  );
};

export const LivePowerWaveChart: React.FC = () => <SignalCanvas kind="power" />;
export const HeartbeatWaveChart: React.FC = () => <SignalCanvas kind="heartbeat" />;
export const TriadCoreOrbitsChart: React.FC = () => <SignalCanvas kind="orbits" />;

export type InteractiveChartType = 'phase' | 'heatmap' | 'entropy' | '3d' | 'triad' | 'power' | 'heartbeat' | 'orbits';
export const InteractiveChartRenderer: React.FC<{ type?: InteractiveChartType }> = ({ type = 'phase' }) => {
  switch (type) {
    case 'heatmap':
    case 'entropy': return <EntropyHeatmapChart />;
    case '3d':
    case 'triad': return <Triad3DOscillatorChart />;
    case 'power': return <LivePowerWaveChart />;
    case 'heartbeat': return <HeartbeatWaveChart />;
    case 'orbits': return <TriadCoreOrbitsChart />;
    default: return <PhaseSpaceChart />;
  }
};
