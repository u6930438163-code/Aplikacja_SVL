import { useEffect, useRef } from 'react';

/**
 * Responsywne odpytywanie serwera.
 *
 * - Nigdy nie nakłada żądań na siebie (kolejny cykl startuje dopiero po zakończeniu poprzedniego).
 * - Wstrzymuje się, gdy karta przeglądarki jest ukryta (oszczędza baterię, CPU i serwer).
 * - Po powrocie do karty odświeża dane natychmiast.
 * - Zawsze wywołuje najnowszą wersję `task` (bez restartu timera przy każdym renderze).
 */
export function usePolling(
  task: () => void | Promise<unknown>,
  intervalMs: number,
  options: { enabled?: boolean; immediate?: boolean; deps?: ReadonlyArray<unknown> } = {}
) {
  const { enabled = true, immediate = true, deps = [] } = options;
  const taskRef = useRef(task);
  taskRef.current = task;

  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const isHidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden';

    const schedule = () => {
      if (stopped) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, intervalMs);
    };

    const tick = async () => {
      timer = null;
      if (stopped) return;
      if (isHidden()) return; // wznowione przez visibilitychange
      if (running) return schedule();
      running = true;
      try {
        await taskRef.current();
      } catch {
        // ciche błędy odpytywania w tle
      } finally {
        running = false;
        schedule();
      }
    };

    const onVisibility = () => {
      if (stopped) return;
      if (!isHidden() && !timer && !running) tick();
    };

    document.addEventListener('visibilitychange', onVisibility);
    if (immediate) tick();
    else schedule();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, ...deps]);
}

/**
 * Lekki interwał UI (animacje, zegary), który zatrzymuje się w ukrytej karcie.
 */
export function useVisibleInterval(callback: () => void, intervalMs: number, enabled = true) {
  usePolling(callback, intervalMs, { enabled, immediate: false });
}
