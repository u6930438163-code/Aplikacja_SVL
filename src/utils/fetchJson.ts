const etagCache = new Map<string, string>();
const lastDataCache = new Map<string, any>();

export async function fetchJsonIfChanged<T = any>(url: string): Promise<{ changed: boolean; data?: T }> {
  try {
    const headers: Record<string, string> = {};
    const cachedEtag = etagCache.get(url);
    if (cachedEtag) {
      headers['If-None-Match'] = cachedEtag;
    }

    const res = await fetch(url, {
      headers,
      cache: 'no-cache',
    });

    if (res.status === 304) {
      return { changed: false, data: lastDataCache.get(url) };
    }

    if (!res.ok) {
      return { changed: false };
    }

    const newEtag = res.headers.get('ETag');
    if (newEtag) {
      etagCache.set(url, newEtag);
    }

    const data = await res.json();
    lastDataCache.set(url, data);
    return { changed: true, data };
  } catch (e) {
    console.warn('[fetchJsonIfChanged] fetch error for', url, e);
    return { changed: false };
  }
}

export function invalidateEtag(url: string) {
  etagCache.delete(url);
  lastDataCache.delete(url);
}
