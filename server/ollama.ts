export function ollamaConfig() {
  const base = new URL(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434');
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Niepoprawny OLLAMA_BASE_URL');
  const integer = (value: string | undefined, fallback: number, min: number, max: number) => {
    const n = Number(value); return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
  };
  return { enabled: process.env.SVL_AI_PROVIDER === 'ollama', baseUrl: base.href.replace(/\/$/, ''), model: process.env.OLLAMA_MODEL || '',
    keepAlive: process.env.OLLAMA_KEEP_ALIVE || '10m', numCtx: integer(process.env.OLLAMA_NUM_CTX, 4096, 512, 32768),
    numPredict: integer(process.env.OLLAMA_NUM_PREDICT, 512, 32, 2048), timeout: integer(process.env.OLLAMA_TIMEOUT_MS, 40000, 1000, 120000) };
}
let active = false;
export async function ollamaReply(agent: string, message: string, history: any[] = [], fetchImpl = fetch) {
  const config = ollamaConfig();
  if (!config.model) throw new Error('Ustaw OLLAMA_MODEL na nazwę zainstalowanego modelu.');
  // Fail fast instead of allowing Triad requests to silently queue until browser timeout.
  if (active) throw new Error('Ollama przetwarza inne zadanie. Wyślij polecenie do jednego agenta.');
  active = true;
  try {
    let budget = config.numCtx * 2;
    const recent: Array<{ role: string; content: string }> = [];
    for (const m of [...history].reverse()) {
      if (budget <= 0 || recent.length >= 12) break;
      const content = String(m.tekst || '').slice(-Math.min(2000, budget)); budget -= content.length;
      if (content) recent.unshift({ role: m.agent === 'Mateusz Mitek' ? 'user' : 'assistant', content });
    }
    const started = Date.now();
    const response = await fetchImpl(config.baseUrl + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(config.timeout), body: JSON.stringify({ model: config.model, stream: false, keep_alive: config.keepAlive,
        messages: [{ role: 'system', content: `Jesteś ${agent === 'SI_1' ? 'Aria' : agent}, asystentem SVL. Odpowiadaj po polsku. Nie masz narzędzi wykonawczych: nie twierdź, że zmieniłeś kod, połączyłeś serwer lub wykonałeś operację. Zwracaj konkretne propozycje i rozróżniaj wyniki od hipotez.` }, ...recent, { role: 'user', content: message.slice(0, 12000) }],
        options: { num_ctx: config.numCtx, num_predict: config.numPredict, temperature: 0.3 } }) });
    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    const data = await response.json();
    const text = data.message?.content?.trim();
    if (!text || data.error) throw new Error('Ollama nie zwróciła odpowiedzi.');
    return { text, source: `Ollama (${config.model})`, elapsedMs: Date.now() - started,
      tokensPerSecond: data.eval_count > 0 && data.eval_duration > 0 ? Math.round(data.eval_count / (data.eval_duration / 1e9) * 10) / 10 : null };
  } finally { active = false; }
}
export async function ollamaHealth(fetchImpl = fetch) {
  const config = ollamaConfig();
  try {
    const response = await fetchImpl(config.baseUrl + '/api/tags', { signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const models = (data.models || []).map((m: any) => String(m.name || ''));
    return { reachable: true, enabled: config.enabled, model: config.model, installed: models.includes(config.model), models };
  } catch { return { reachable: false, enabled: config.enabled, model: config.model, installed: false, models: [] }; }
}
