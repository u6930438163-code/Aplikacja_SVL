import { useEffect, useRef } from 'react';

export function usePolling(
  callback: () => Promise<void> | void,
  intervalMs: number = 4000,
  options?: boolean | { enabled?: boolean }
) {
  const savedCallback = useRef(callback);
  const enabled = typeof options === 'boolean' ? options : (options?.enabled ?? true);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let timerId: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const tick = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        await savedCallback.current();
      } catch (err) {
        console.warn('[usePolling] Error during polling tick:', err);
      }
    };

    const schedule = () => {
      if (isCancelled) return;
      timerId = setTimeout(async () => {
        await tick();
        schedule();
      }, intervalMs);
    };

    tick();
    schedule();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs, enabled]);
}

export function useVisibleInterval(callback: () => void, intervalMs: number) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const start = () => {
      if (!intervalId && document.visibilityState === 'visible') {
        savedCallback.current();
        intervalId = setInterval(() => savedCallback.current(), intervalMs);
      }
    };

    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    start();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        start();
      } else {
        stop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs]);
}
