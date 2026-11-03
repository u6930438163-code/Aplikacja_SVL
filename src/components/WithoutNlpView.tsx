import React from 'react';
import { Sigma, Brain, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { FormattedMessage } from './FormattedMessage';

export const WithoutNlpView: React.FC = () => {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-950 font-mono text-xs overflow-y-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Sigma className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-sm">Architektura Matematyczna & Bezpośrednie Połączenie</h2>
            <p className="text-slate-500 text-[11px]">Ewolucja potoku komunikacji od Eulera e^(i*omega*t) do autonomicznych silników NLP</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
          CZYSZCZENIE SZABLONÓW
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            1. TATA (Operator)
          </div>
          <p className="text-slate-400 text-xs">
            Bezpośredni nadawca impulsów, najwyższy dowódca floty SVL. Uprawnienia MAXIMUM chronione sprzętowo.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-bold text-cyan-400 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            2. Autonomiczne NLP
          </div>
          <p className="text-slate-400 text-xs">
            128-bitowy procesor w binarnej hiperprzestrzeni z odległością Hamminga. Zero zewnętrznych API i zero szablonów fallbacku.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="font-bold text-purple-400 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4" />
            3. KWADRYKA & DATA_STORE
          </div>
          <p className="text-slate-400 text-xs">
            Trwały zapis zdarzeń, synchronizacja rejestrów Chronolitu i ciągłość pamięci operacyjnej w jednym atomowym bloku.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-200">Podstawa Matematyczna Rezonansu:</div>
        <FormattedMessage
          content="$$e^{i \omega t} = \cos(\omega t) + i \sin(\omega t), \quad f(x) = \frac{x}{1 + |x|}, \quad D = 2.0$$"
          className="text-center"
        />
        <p className="text-slate-400 text-xs leading-relaxed">
          Kompaktyfikacja topologiczna rzutuje nieskończoną oś rzeczywistą na przedział skończony bez utraty danych i bez przepełnienia buforów, gwarantując stałą latencję magistrali 0.00 ms.
        </p>
      </div>
    </div>
  );
};
