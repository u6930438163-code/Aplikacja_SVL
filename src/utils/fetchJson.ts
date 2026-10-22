/**
 * Pobieranie JSON z obsługą ETag.
 *
 * Gdy dane na serwerze się nie zmieniły, serwer odpowiada 304 bez treści,
 * a my pomijamy parsowanie i przebudowę stanu — to główna oszczędność przy
 * częstym odpytywaniu dużego DATA_STORE.
 */
const etags = new Map<string, string>();

export type ConditionalResult<T> = { changed: true; data: T } | { changed: false; data: null };

export async function fetchJsonIfChanged<T = any>(url: string, init?: RequestInit): Promise<ConditionalResult<T>> {
  const headers = new Headers(init?.headers);
  const known = etags.get(url);
  if (known) headers.set('If-None-Match', known);

  const res = await fetch(url, { ...init, headers, cache: 'no-store' });
  if (res.status === 304) return { changed: false, data: null };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const etag = res.headers.get('ETag');
  if (etag) etags.set(url, etag);
  else etags.delete(url);

  return { changed: true, data: (await res.json()) as T };
}

/** Zapomina zapamiętany ETag (np. po zapisie, by wymusić pełne pobranie). */
export function invalidateEtag(url: string) {
  etags.delete(url);
}
