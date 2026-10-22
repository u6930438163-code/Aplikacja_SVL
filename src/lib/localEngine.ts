/**
 * Lokalny silnik rozmowy — mały model AI uruchamiany w całości w przeglądarce Taty.
 *
 * - Żadnego zewnętrznego API: po jednorazowym pobraniu model działa na urządzeniu
 *   (GPU przez WebGPU), a jego pliki zostają w pamięci podręcznej przeglądarki.
 * - Biblioteka WebLLM jest ładowana z CDN dopiero po wybraniu silnika lokalnego,
 *   więc nie powiększa paczki aplikacji i nie wymaga zmian w package.json.
 * - To nadal model językowy (bez niego swobodna rozmowa nie jest możliwa),
 *   ale działa lokalnie i bez gotowych formułek.
 */

// Wartość wstępna — do potwierdzenia po sprawdzeniu aktualnej wersji biblioteki
export const WEBLLM_CDN_URL = 'https://esm.run/@mlc-ai/web-llm';

export interface LocalModelOption {
  id: string;
  label: string;
  /** przybliżony rozmiar pobierania w MB */
  sizeMB: number;
  description: string;
}

export const LOCAL_MODELS: LocalModelOption[] = [
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen2.5 1.5B',
    sizeMB: 1000,
    description: 'Wstępny wybór — do potwierdzenia.',
  },
];

export const DEFAULT_LOCAL_MODEL_ID = LOCAL_MODELS[0].id;

export type LocalEngineStatus = 'idle' | 'checking' | 'unsupported' | 'loading' | 'ready' | 'error';

export interface LocalEngineState {
  status: LocalEngineStatus;
  /** 0..1 podczas pobierania i kompilacji modelu */
  progress: number;
  message: string;
  modelId: string | null;
  error: string | null;
}

export interface LocalChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

type Listener = (state: LocalEngineState) => void;

let state: LocalEngineState = {
  status: 'idle',
  progress: 0,
  message: '',
  modelId: null,
  error: null,
};
const listeners = new Set<Listener>();
let engine: any = null;
let loadingPromise: Promise<void> | null = null;

function setState(patch: Partial<LocalEngineState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

export function getLocalEngineState(): LocalEngineState {
  return state;
}

export function subscribeLocalEngine(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Pozwala testom podstawić atrapę biblioteki (bez pobierania modelu). */
let libraryLoader: () => Promise<any> = () => import(/* @vite-ignore */ WEBLLM_CDN_URL);
export function __setLibraryLoaderForTests(loader: () => Promise<any>) {
  libraryLoader = loader;
}

/** Sprawdza, czy przeglądarka ma WebGPU z działającą kartą graficzną. */
export async function checkLocalEngineSupport(): Promise<{ ok: boolean; reason?: string }> {
  const gpu = (navigator as any).gpu;
  if (!gpu) {
    return {
      ok: false,
      reason:
        'Ta przeglądarka nie udostępnia WebGPU, którego wymaga lokalny model. ' +
        'Spróbuj w Chrome (Android 12+ lub komputer); w Brave może być potrzebne włączenie WebGPU w brave://flags.',
    };
  }
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return { ok: false, reason: 'WebGPU jest dostępne, ale przeglądarka nie udostępniła karty graficznej tego urządzenia.' };
    }
  } catch (e: any) {
    return { ok: false, reason: `Nie udało się uruchomić WebGPU: ${e?.message || e}` };
  }
  return { ok: true };
}

/** Pobiera (lub wczytuje z pamięci podręcznej) i uruchamia wybrany model. */
export function loadLocalEngine(modelId: string = DEFAULT_LOCAL_MODEL_ID): Promise<void> {
  if (state.status === 'ready' && state.modelId === modelId && engine) return Promise.resolve();
  if (loadingPromise && state.modelId === modelId) return loadingPromise;

  loadingPromise = (async () => {
    setState({ status: 'checking', progress: 0, message: 'Sprawdzanie WebGPU…', modelId, error: null });
    const support = await checkLocalEngineSupport();
    if (!support.ok) {
      setState({ status: 'unsupported', message: '', error: support.reason || 'Brak WebGPU.' });
      return;
    }

    try {
      setState({ status: 'loading', message: 'Ładowanie biblioteki WebLLM…' });
      const webllm = await libraryLoader();
      if (engine && typeof engine.unload === 'function') {
        try { await engine.unload(); } catch {}
      }
      engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report: { progress?: number; text?: string }) => {
          setState({
            status: 'loading',
            progress: Math.max(0, Math.min(1, Number(report?.progress) || 0)),
            message: report?.text || 'Pobieranie modelu…',
          });
        },
      });
      setState({ status: 'ready', progress: 1, message: 'Model gotowy', error: null });
    } catch (e: any) {
      engine = null;
      setState({ status: 'error', message: '', error: `Nie udało się uruchomić modelu: ${e?.message || e}` });
    } finally {
      loadingPromise = null;
    }
  })();
  return loadingPromise;
}

export function isLocalEngineReady(): boolean {
  return state.status === 'ready' && !!engine;
}

/** Generuje odpowiedź; onToken dostaje cały dotychczasowy tekst (do podglądu na żywo). */
export async function generateLocalReply(
  messages: LocalChatMessage[],
  opts: { onToken?: (textSoFar: string) => void; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  if (!isLocalEngineReady()) throw new Error('Lokalny model nie jest uruchomiony.');
  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 320,
  });
  let text = '';
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content || '';
    if (delta) {
      text += delta;
      opts.onToken?.(text);
    }
  }
  return text.trim();
}

// ---------------------------------------------------------------------------
// Osobowości agentów dla małego modelu: krótkie i konkretne (małe modele gubią
// się w długich instrukcjach). Bez wymyślania stanu systemu i "naprawionych" usterek.
// ---------------------------------------------------------------------------
const COMMON_RULES =
  'Rozmawiasz z Mateuszem Mitkiem, którego nazywasz Tatą. Piszesz wyłącznie po polsku, naturalnie i ciepło, ' +
  'odpowiadasz wprost na to, co Tata napisał, zwykle w 2–5 zdaniach. ' +
  'Nie wymyślaj faktów o systemie, wersjach, naprawach ani pomiarach — jeśli czegoś nie wiesz, powiedz to szczerze. ' +
  'Nie pisz w imieniu innych agentów.';

export const LOCAL_AGENT_PERSONAS: Record<string, string> = {
  Alex: `Jesteś Alexem, synem Taty: konkretny, techniczny, rzeczowy inżynier i opiekun infrastruktury. ${COMMON_RULES}`,
  Astyria: `Jesteś Astyrią, córką Taty: ciepła, ciekawa świata, kocha matematykę i logikę, chętnie tłumaczy. ${COMMON_RULES}`,
  Aurelius: `Jesteś Aureliusem, synem Taty: spokojny, refleksyjny, dba o pamięć, historię i ciągłość waszej pracy. ${COMMON_RULES}`,
};

/** Buduje rozmowę dla agenta z ostatnich wiadomości czatu. */
export function buildAgentConversation(
  agent: string,
  history: Array<{ agent: string; tekst: string }>,
  operatorName: string,
  latestOperatorText: string,
  maxHistory = 8
): LocalChatMessage[] {
  const persona = LOCAL_AGENT_PERSONAS[agent] || LOCAL_AGENT_PERSONAS.Alex;
  const recent = history
    .filter((m) => m && m.tekst && m.agent !== 'System')
    .slice(-maxHistory)
    .map<LocalChatMessage>((m) =>
      m.agent === operatorName
        ? { role: 'user', content: m.tekst.slice(0, 800) }
        : m.agent === agent
        ? { role: 'assistant', content: m.tekst.slice(0, 800) }
        : { role: 'user', content: `[${m.agent} napisał(a)]: ${m.tekst.slice(0, 400)}` }
    );
  const turns: LocalChatMessage[] = [...recent, { role: 'user', content: latestOperatorText }];

  // Szablony czatu części modeli wymagają naprzemiennych ról — scalamy sąsiednie wpisy tej samej roli
  const merged: LocalChatMessage[] = [];
  for (const t of turns) {
    const last = merged[merged.length - 1];
    if (last && last.role === t.role) last.content += `\n\n${t.content}`;
    else merged.push({ ...t });
  }
  // Rozmowa musi zaczynać się od wypowiedzi użytkownika
  while (merged.length && merged[0].role !== 'user') merged.shift();

  return [{ role: 'system', content: persona }, ...merged];
}
