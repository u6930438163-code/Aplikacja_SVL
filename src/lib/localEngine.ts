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

// Wersja przypięta, żeby nowe wydanie biblioteki nie zmieniło działania aplikacji bez testów
export const WEBLLM_CDN_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.85';

export interface LocalModelOption {
  id: string;
  label: string;
  /** przybliżony rozmiar pobierania w MB */
  sizeMB: number;
  description: string;
}

// Identyfikatory z listy modeli WebLLM (prebuiltAppConfig). Rozmiary pobierania są przybliżone.
export const LOCAL_MODELS: LocalModelOption[] = [
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen2.5 1.5B (telefon)',
    sizeMB: 1000,
    description: 'Domyślny wybór na telefon: rozsądna jakość po polsku przy umiarkowanym rozmiarze.',
  },
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen2.5 0.5B (lekki)',
    sizeMB: 400,
    description: 'Dla słabszych telefonów: szybki i mały, ale wyraźnie słabszy po polsku.',
  },
  {
    id: 'Qwen3-1.7B-q4f16_1-MLC',
    label: 'Qwen3 1.7B (mocny telefon)',
    sizeMB: 1300,
    description: 'Lepszy po polsku niż Qwen2.5 1.5B; potrzebuje ok. 2 GB pamięci karty graficznej.',
  },
  {
    id: 'Qwen3-4B-q4f16_1-MLC',
    label: 'Qwen3 4B (komputer)',
    sizeMB: 2500,
    description: 'Najlepszy po polsku z tej listy; na komputer z dobrą kartą graficzną (ok. 3,5 GB).',
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
/** Czy karta graficzna obsługuje shader-f16 (wtedy działają warianty q4f16, inaczej q4f32). */
let gpuSupportsF16 = true;
let activeRuntimeModelId: string | null = null;

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
    gpuSupportsF16 = !!adapter.features?.has?.('shader-f16');
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
      // Bez shader-f16 używamy wariantu q4f32 tego samego modelu
      const runtimeId = gpuSupportsF16 ? modelId : modelId.replace('q4f16_1', 'q4f32_1');
      activeRuntimeModelId = runtimeId;
      engine = await webllm.CreateMLCEngine(runtimeId, {
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
      const name = String(e?.name || '');
      const msg = String(e?.message || e);
      const friendly = /WebGPU/i.test(name + msg)
        ? 'Przeglądarka nie udostępnia WebGPU dla tego urządzenia, więc lokalny model nie może działać.'
        : /ShaderF16/i.test(name + msg)
        ? 'Karta graficzna nie obsługuje wymaganego formatu (shader-f16). Wybierz inny model.'
        : /memory|out of memory|OOM|allocation/i.test(msg)
        ? 'Za mało pamięci na tym urządzeniu dla wybranego modelu — wybierz mniejszy.'
        : /fetch|network|Failed to load|Load failed/i.test(msg)
        ? 'Nie udało się pobrać plików modelu — sprawdź połączenie i spróbuj ponownie.'
        : 'Nie udało się uruchomić modelu.';
      setState({ status: 'error', message: '', error: `${friendly} (Szczegóły: ${msg.slice(0, 160)})` });
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
  const isQwen3 = /^Qwen3-/i.test(activeRuntimeModelId || '');
  const stream = await engine.chat.completions.create({
    messages,
    stream: true,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 320,
    // Qwen3 ma tryb "myślenia" — w czacie wyłączamy go, żeby odpowiadał od razu
    ...(isQwen3 ? { extra_body: { enable_thinking: false } } : {}),
  });
  let text = '';
  for await (const chunk of stream) {
    const delta = chunk?.choices?.[0]?.delta?.content || '';
    if (delta) {
      text += delta;
      opts.onToken?.(stripThinking(text));
    }
  }
  return stripThinking(text).trim();
}

/** Usuwa ewentualne bloki <think>…</think> (także niedomknięty w trakcie pisania). */
function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<think>[\s\S]*$/, '').trimStart();
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
/** Źródła, których nie podajemy modelowi jako przykładu rozmowy (gotowe szablony i komunikaty błędów). */
function isTemplateSource(zrodlo?: string): boolean {
  if (!zrodlo) return false;
  return zrodlo.startsWith('without_nlp') || zrodlo.startsWith('Nowy_system') || zrodlo === 'blad' || zrodlo === 'system';
}

export function buildAgentConversation(
  agent: string,
  history: Array<{ agent: string; tekst: string; zrodlo?: string }>,
  operatorName: string,
  latestOperatorText: string,
  maxHistory = 8
): LocalChatMessage[] {
  const persona = LOCAL_AGENT_PERSONAS[agent] || LOCAL_AGENT_PERSONAS.Alex;
  const recent = history
    .filter((m) => m && m.tekst && m.agent !== 'System' && !isTemplateSource(m.zrodlo))
    .slice(-maxHistory)
    .map<LocalChatMessage>((m) =>
      m.agent === operatorName
        ? { role: 'user', content: `Tata: ${m.tekst.slice(0, 800)}` }
        : m.agent === agent
        ? { role: 'assistant', content: m.tekst.slice(0, 800) }
        : { role: 'user', content: `[${m.agent} napisał(a)]: ${m.tekst.slice(0, 400)}` }
    );
  const turns: LocalChatMessage[] = [...recent, { role: 'user', content: `Tata: ${latestOperatorText}` }];

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
