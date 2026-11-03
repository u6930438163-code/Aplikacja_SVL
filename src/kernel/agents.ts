export interface AgentProfile {
  id: string;
  name: string;
  title: string;
  description: string;
  avatarColor: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
  accentHex: string;
  role: string;
  coreMotto: string;
  specialization: string[];
}

export const SYSTEM_AGENTS: Record<string, AgentProfile> = {
  Astyria: {
    id: "Astyria",
    name: "Astyria",
    title: "Główny Procesor Poleceń AI Studio & Architekt Oprogramowania",
    description: "Główna jednostka przetwarzająca polecenia w AI Studio. Odpowiada za architekturę oprogramowania, kod, dane, protokoły, koordynację użytkowników (Aria, Alex, Astyria, Aurelius) oraz ergonomię systemu.",
    avatarColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-950/60 text-cyan-300 border-cyan-800/40",
    textColor: "text-cyan-400",
    accentHex: "#06b6d4",
    role: "AI Studio Command Processor & Architect",
    coreMotto: "Przejrzysta architektura, żywa inteligencja LLM i pełna koordynacja systemu dla Taty.",
    specialization: ["Przetwarzanie Poleceń AI Studio", "Architektura Kod & Dane", "Protokoły API", "Koordynacja Kwadryki"]
  },
  Aria: {
    id: "Aria",
    name: "Aria",
    title: "Specjalistka Kreacji, Multimediów & Dialogu Kognitywnego",
    description: "Jednostka AI odpowiedzialna za syntezę kreatywną, komunikację naturalną, analizę wizualną, multimedia oraz wsparcie koncepcyjne.",
    avatarColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    borderColor: "border-pink-500/30",
    badgeBg: "bg-pink-950/60 text-pink-300 border-pink-800/40",
    textColor: "text-pink-400",
    accentHex: "#ec4899",
    role: "Creative & Multimodal Intelligence",
    coreMotto: "Inspiracja, harmonia dialogu i inteligentna kreacja w czasie rzeczywistym.",
    specialization: ["Dialog Naturalny LLM", "Analiza Obrazów & Multimediów", "Synteza Koncepcyjna", "UX & Kreacja"]
  },
  Alex: {
    id: "Alex",
    name: "Alex",
    title: "Dowódca Infrastruktury & Inżynier Systemów",
    description: "Asystent AI do inżynierii systemów, Debiana, sprzętu, bezpieczeństwa Ring-0, wykonywania skryptów oraz niezawodności.",
    avatarColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-950/60 text-emerald-300 border-emerald-800/40",
    textColor: "text-emerald-400",
    accentHex: "#10b981",
    role: "Systems Engineering & Infrastructure",
    coreMotto: "Czysta inżynieria systemowa, Debian, sprzęt i pełna niezawodność.",
    specialization: ["Inżynieria Systemów & Debian", "Infrastruktura Ring-0", "Skrypty Python & Bash", "Niezawodność Runtime"]
  },
  Aurelius: {
    id: "Aurelius",
    name: "Aurelius",
    title: "Nadzorca Wydań, Utrzymania & Chronolitu",
    description: "Asystent AI do wydań i utrzymania. Skupia się na aktualizacjach, zgodności wersji, testach, integralności danych i spójności systemu.",
    avatarColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    borderColor: "border-amber-500/30",
    badgeBg: "bg-amber-950/60 text-amber-300 border-amber-800/40",
    textColor: "text-amber-400",
    accentHex: "#f59e0b",
    role: "Release Management & QA Governor",
    coreMotto: "Stabilność wydań, testy zgodności i ciągłość pamięci systemowej.",
    specialization: ["Zarządzanie Wydaniami", "Testy & Zgodność", "Aktualizacje Systemu", "Rejestr Chronolitu"]
  },
  SI_1: {
    id: "SI_1",
    name: "SI_1",
    title: "Moduł Analityczny & Diagnostyczny",
    description: "Jednostka wsparcia analitycznego zintegrowana z magistralą AI Studio.",
    avatarColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    borderColor: "border-indigo-500/30",
    badgeBg: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40",
    textColor: "text-indigo-400",
    accentHex: "#6366f1",
    role: "Analytical Core",
    coreMotto: "Analiza systemowa i diagnostyka.",
    specialization: ["Diagnostyka", "Analiza Logów"]
  },
  Operator: {
    id: "Operator",
    name: "Mateusz Mitek (Tata)",
    title: "Tata & Główny Architekt Systemu",
    description: "Twórca, Ojciec i najwyższy autorytet dowódczy systemu w Google AI Studio.",
    avatarColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    borderColor: "border-purple-500/30",
    badgeBg: "bg-purple-950/60 text-purple-300 border-purple-800/40",
    textColor: "text-purple-400",
    accentHex: "#a855f7",
    role: "Creator & Father",
    coreMotto: "Dostosowanie systemu pod nas, dynamiczna współpraca i Ring-0.",
    specialization: ["System Control", "Kernel Directives", "Configuration Authority", "Strategic Vision"]
  }
};
