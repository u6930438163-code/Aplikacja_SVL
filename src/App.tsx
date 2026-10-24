import React, { useState, useEffect, useCallback, useRef, Suspense, lazy, memo } from 'react';
import {
  DataStore,
  INITIAL_DATA_STORE,
  OPERATOR_NAME,
  SYS_VERSION,
  normalizeDataStore,
} from './kernel/svlKernel';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SystemHealthDock } from './components/SystemHealthDock';
import { usePolling } from './hooks/usePolling';
import { fetchJsonIfChanged, invalidateEtag } from './utils/fetchJson';

const LOCAL_STORAGE_KEY = 'svl_kernel_datastore_v8_6_3_si1_nlp_conversational';
const STATE_URL = '/api/kernel/state';

// ---------------------------------------------------------------------------
// Leniwe ładowanie widoków: każda zakładka to osobny fragment paczki.
// Startowa paczka nie zawiera już three.js, KaTeX-a ani ciężkich widoków.
// ---------------------------------------------------------------------------
const AgentCommsView = lazy(() => import('./components/AgentCommsView').then((m) => ({ default: m.AgentCommsView })));
const TaskProcessMatrix = lazy(() => import('./components/TaskProcessMatrix').then((m) => ({ default: m.TaskProcessMatrix })));
const AstyriaMissionView = lazy(() => import('./components/AstyriaMissionView').then((m) => ({ default: m.AstyriaMissionView })));
const MemorySchemaGraph = lazy(() => import('./components/MemorySchemaGraph').then((m) => ({ default: m.MemorySchemaGraph })));
const TemporalMatrix = lazy(() => import('./components/TemporalMatrix').then((m) => ({ default: m.TemporalMatrix })));
const TerminalView = lazy(() => import('./components/TerminalView').then((m) => ({ default: m.TerminalView })));
const MonolithView = lazy(() => import('./components/MonolithView').then((m) => ({ default: m.MonolithView })));
const DataStoreView = lazy(() => import('./components/DataStoreView').then((m) => ({ default: m.DataStoreView })));
const DiagnosticsView = lazy(() => import('./components/DiagnosticsView').then((m) => ({ default: m.DiagnosticsView })));
const TriadVisualization = lazy(() => import('./components/TriadVisualization').then((m) => ({ default: m.TriadVisualization })));
const FileExplorer = lazy(() => import('./components/FileExplorer').then((m) => ({ default: m.FileExplorer })));
const AppsStudioView = lazy(() => import('./components/AppsStudioView').then((m) => ({ default: m.AppsStudioView })));
const WithoutNlpView = lazy(() => import('./components/WithoutNlpView').then((m) => ({ default: m.WithoutNlpView })));
const GitHubExportView = lazy(() => import('./components/GitHubExportView').then((m) => ({ default: m.GitHubExportView })));
const NowaAplikacjaView = lazy(() => import('./components/NowaAplikacjaView').then((m) => ({ default: m.NowaAplikacjaView })));
const ReportModal = lazy(() => import('./components/ReportModal').then((m) => ({ default: m.ReportModal })));

const viewLoaders: Record<TabId, () => Promise<unknown>> = {
  nowa_aplikacja: () => import('./components/NowaAplikacjaView'),
  comms: () => import('./components/AgentCommsView'),
  process_matrix: () => import('./components/TaskProcessMatrix'),
  astyria_mission: () => import('./components/AstyriaMissionView'),
  schema_graph: () => import('./components/MemorySchemaGraph'),
  temporal: () => import('./components/TemporalMatrix'),
  terminal: () => import('./components/TerminalView'),
  monolith: () => import('./components/MonolithView'),
  datastore: () => import('./components/DataStoreView'),
  diagnostics: () => import('./components/DiagnosticsView'),
  visualizer: () => import('./components/TriadVisualization'),
  file_explorer: () => import('./components/FileExplorer'),
  apps: () => import('./components/AppsStudioView'),
  without_nlp: () => import('./components/WithoutNlpView'),
  github: () => import('./components/GitHubExportView'),
};

const prefetched = new Set<TabId>();
function prefetchView(tab: TabId) {
  if (prefetched.has(tab)) return;
  prefetched.add(tab);
  viewLoaders[tab]?.().catch(() => prefetched.delete(tab));
}

const MemoHeader = memo(Header);
const MemoNavigation = memo(Navigation);
const MemoHealthDock = memo(SystemHealthDock);

// Lekkie widoki, które warto mieć gotowe zaraz po starcie (w czasie bezczynności przeglądarki)
const IDLE_PREFETCH: TabId[] = ['terminal', 'process_matrix', 'astyria_mission', 'datastore', 'temporal', 'diagnostics'];

const runWhenIdle = (cb: () => void, timeout = 2000) => {
  const w = window as any;
  if (typeof w.requestIdleCallback === 'function') return w.requestIdleCallback(cb, { timeout });
  return setTimeout(cb, 300);
};

const ViewFallback = () => (
  <div className="flex-1 flex items-center justify-center p-8 font-mono text-xs text-slate-500" role="status" aria-live="polite">
    <span className="inline-block w-3 h-3 mr-2 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
    Ładowanie modułu…
  </div>
);

const loadInitialStore = (): DataStore => {
  try {
    localStorage.removeItem('svl_kernel_datastore_v8_5_1_desktop_ready');
    localStorage.removeItem('svl_kernel_datastore_v8_6_0_without_nlp');
    localStorage.removeItem('svl_kernel_datastore_v8_6_5_without_nlp_hyperos');
    localStorage.removeItem('svl_kernel_datastore_v8_5_5_pure_hyperos');
    localStorage.removeItem('svl_kernel_datastore_v8_6_2_si1_autonomous_nlp');
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) return normalizeDataStore(JSON.parse(stored));
  } catch (e) {
    console.warn('Failed to parse cached DATA_STORE from localStorage:', e);
  }
  return normalizeDataStore(INITIAL_DATA_STORE);
};

const persistStore = (store: DataStore) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
};

const chatSignatureChanged = (prev: DataStore, next: DataStore) => {
  const prevChat = prev.chat_history || [];
  const nextChat = next.chat_history || [];
  const lastPrev = prevChat[prevChat.length - 1];
  const lastNext = nextChat[nextChat.length - 1];
  return (
    nextChat.length !== prevChat.length ||
    lastPrev?.tekst !== lastNext?.tekst ||
    lastPrev?.agent !== lastNext?.agent ||
    lastPrev?.zrodlo !== lastNext?.zrodlo ||
    (next.update_history || []).length !== (prev.update_history || []).length ||
    next.config?.sys_version !== prev.config?.sys_version
  );
};

export default function App() {
  // Stan jest zawsze znormalizowany w momencie zapisu — render go nie przelicza
  const [dataStore, setRawDataStore] = useState<DataStore>(loadInitialStore);

  const setDataStore: React.Dispatch<React.SetStateAction<DataStore>> = useCallback((updater) => {
    setRawDataStore((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: DataStore) => DataStore)(prev) : updater;
      return next === prev ? prev : normalizeDataStore(next);
    });
  }, []);

  const [activeTab, setActiveTab] = useState<TabId>('nowa_aplikacja');
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const isAgentLoadingRef = useRef(false);
  isAgentLoadingRef.current = isAgentLoading;
  const [showReportModal, setShowReportModal] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Expose navigation to window for internal component linking
  useEffect(() => {
    (window as any).setActiveTab = setActiveTab;
  }, []);

  // Wstępne pobranie pozostałych widoków, gdy przeglądarka nie ma nic do roboty
  useEffect(() => {
    runWhenIdle(() => IDLE_PREFETCH.forEach(prefetchView), 3000);
  }, []);

  // ---------------------------------------------------------------------------
  // Synchronizacja z jądrem Python: ETag + wstrzymanie w ukrytej karcie.
  // Gdy nic się nie zmieniło, serwer zwraca 304 i nie parsujemy ~100 KB JSON.
  // ---------------------------------------------------------------------------
  usePolling(async () => {
    if (isAgentLoadingRef.current) return;
    const result = await fetchJsonIfChanged<any>(STATE_URL);
    if (!result.changed || !result.data?.store) return;
    const incoming = normalizeDataStore(result.data.store);
    setRawDataStore((prev) => (chatSignatureChanged(prev, incoming) ? incoming : prev));
  }, 4000);

  // ---------------------------------------------------------------------------
  // Zapis do localStorage z opóźnieniem i w czasie bezczynności,
  // zamiast synchronicznego JSON.stringify przy każdym renderze.
  // ---------------------------------------------------------------------------
  const pendingPersist = useRef<DataStore | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPersist = useCallback(() => {
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
      persistTimer.current = null;
    }
    if (pendingPersist.current) {
      persistStore(pendingPersist.current);
      pendingPersist.current = null;
    }
  }, []);

  useEffect(() => {
    pendingPersist.current = dataStore;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => runWhenIdle(flushPersist, 1500), 600);
  }, [dataStore, flushPersist]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushPersist();
    };
    window.addEventListener('pagehide', flushPersist);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', flushPersist);
      document.removeEventListener('visibilitychange', onHide);
      flushPersist();
    };
  }, [flushPersist]);

  const fetchServerStore = useCallback(async (): Promise<DataStore | null> => {
    invalidateEtag(STATE_URL);
    const res = await fetch(STATE_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.store ? normalizeDataStore(data.store) : null;
  }, []);

  // Execute terminal command directly on Python SVL Kernel
  const handleExecutePythonCommand = useCallback(async (command: string) => {
    const res = await fetch('/api/kernel/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    if (!res.ok) {
      throw new Error(`Błąd polecenia jądra: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.state?.store) {
      setDataStore(normalizeDataStore(data.state.store));
    }
    return data;
  }, [setDataStore]);

  // Full system & version synchronization via Astyria mission endpoint + kernel state
  const handleSyncSystem = useCallback(async () => {
    try {
      const res = await fetch('/api/astyria/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_versions', silentChat: true }),
      });
      if (res.ok) {
        const data = await res.json();
        const rawStore = data.state?.store || data.state;
        if (rawStore) {
          setDataStore(normalizeDataStore(rawStore));
          return;
        }
      }
      // Fallback direct state fetch if mission endpoint didn't return store
      const store = await fetchServerStore();
      if (store) setDataStore(store);
    } catch (e) {
      console.error(e);
    }
  }, [setDataStore, fetchServerStore]);

  // Immediate manual force sync (used by AgentCommsView Synchronizuj button)
  const handleForceSync = useCallback(async () => {
    try {
      await handleSyncSystem();
    } finally {
      setIsAgentLoading(false);
    }
  }, [handleSyncSystem]);

  const appendReplies = useCallback((replies: Array<{ agent: string; tekst: string; zrodlo?: string }>) => {
    setDataStore((prev) => ({
      ...prev,
      chat_history: [...(prev.chat_history || []), ...replies],
    }));
  }, [setDataStore]);

  // Handle sending message from Tata to Agent, with optional file attachment
  const handleSendMessage = useCallback(async (agentName: string, messageText: string, fileData?: any) => {
    if (!messageText.trim() && !fileData) return;

    const fileRecord = fileData
      ? {
          name: fileData.name,
          type: fileData.type,
          size: fileData.size,
          dataUrl: fileData.dataUrl,
          textContent: fileData.textContent,
        }
      : undefined;

    // Wiadomość Taty pojawia się natychmiast (optymistycznie)
    const operatorMsg: any = {
      agent: OPERATOR_NAME,
      tekst: messageText.trim() || (fileData ? `[Przesłano załącznik: ${fileData.name}]` : ''),
      file: fileRecord,
    };
    setDataStore((prev) => ({
      ...prev,
      chat_history: [...(prev.chat_history || []), operatorMsg],
    }));

    setIsAgentLoading(true);
    isAgentLoadingRef.current = true;
    setSendError(null);

    const controller = new AbortController();
    // Serwer ma łączny limit 35 s na odpowiedź; 50 s tutaj to zapas na zapis do jądra
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    try {
      const res = await fetch('/api/kernel/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentName,
          message: messageText.trim(),
          fileData: fileData || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errMsg = `Serwer zwrócił błąd HTTP ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();

      if (data.state?.store) {
        const serverStore = normalizeDataStore(data.state.store);
        if (fileRecord && serverStore.chat_history?.length > 0) {
          for (let i = serverStore.chat_history.length - 1; i >= 0; i--) {
            if (serverStore.chat_history[i].agent === OPERATOR_NAME && !serverStore.chat_history[i].file) {
              serverStore.chat_history[i].file = fileRecord;
              break;
            }
          }
        }
        setDataStore(serverStore);
      } else if (Array.isArray(data.entries)) {
        appendReplies(data.entries);
      }
    } catch (err: any) {
      console.warn('API call error or timeout, recovering state from server:', err);

      // Serwer mógł zdążyć zapisać odpowiedź — pobieramy aktualny stan
      try {
        const store = await fetchServerStore();
        if (store) setDataStore(store);
      } catch (syncErr) {
        console.error('Recovery failed:', syncErr);
      }

      // Bez gotowych formułek: mówimy wprost, że odpowiedź nie dotarła
      const reason = err?.name === 'AbortError' ? 'serwer nie odpowiedział w ciągu 50 s' : err?.message || 'błąd połączenia';
      setSendError(`Nie udało się uzyskać odpowiedzi od ${agentName === 'triad' ? 'Triady' : agentName} (${reason}). Spróbuj ponownie.`);
    } finally {
      clearTimeout(timeoutId);
      setIsAgentLoading(false);
      isAgentLoadingRef.current = false;
    }
  }, [setDataStore, appendReplies, fetchServerStore]);

  const handleClearHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/kernel/factory-reset', { method: 'POST' });
      const json = await res.json();
      if (json?.state?.store) {
        setDataStore(json.state.store);
      }
    } catch (e) {
      console.warn('Backend factory-reset failed:', e);
    }
  }, [setDataStore]);

  const handleResetToDefault = useCallback(async () => {
    if (confirm(`Czy na pewno chcesz przywrócić stan fabryczny jądra SVL v${SYS_VERSION}?`)) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
      try {
        const res = await fetch('/api/kernel/factory-reset', { method: 'POST' });
        const json = await res.json();
        if (json?.state?.store) {
          setDataStore(json.state.store);
        }
      } catch (e) {
        console.warn('Backend factory-reset failed:', e);
      }
    }
  }, [setDataStore]);

  const handleShowReport = useCallback(() => setShowReportModal(true), []);
  const handleCloseReport = useCallback(() => setShowReportModal(false), []);
  const handleRestoreSnapshot = useCallback((restored: DataStore) => setDataStore(restored), [setDataStore]);
  const handleAddUpdate = useCallback(
    (ver: string, desc: string) => {
      handleExecutePythonCommand(`bump ${ver} ${desc}`).catch((e) => console.warn(e));
    },
    [handleExecutePythonCommand]
  );

  const renderView = () => {
    switch (activeTab) {
      case 'nowa_aplikacja':
        return <NowaAplikacjaView />;
      case 'comms':
        return (
          <AgentCommsView
            dataStore={dataStore}
            onSendMessage={handleSendMessage}
            isLoading={isAgentLoading}
            onClearHistory={handleClearHistory}
            onForceSync={handleForceSync}
          />
        );
      case 'process_matrix':
        return <TaskProcessMatrix />;
      case 'astyria_mission':
        return (
          <AstyriaMissionView dataStore={dataStore} onUpdateDataStore={setDataStore} onSendMessage={handleSendMessage} />
        );
      case 'schema_graph':
        return <MemorySchemaGraph dataStore={dataStore} />;
      case 'temporal':
        return (
          <TemporalMatrix dataStore={dataStore} onRestoreSnapshot={handleRestoreSnapshot} onAddUpdate={handleAddUpdate} />
        );
      case 'terminal':
        return (
          <TerminalView
            dataStore={dataStore}
            onUpdateDataStore={setDataStore}
            onSendMessage={handleSendMessage}
            onExecutePythonCommand={handleExecutePythonCommand}
          />
        );
      case 'monolith':
        return <MonolithView dataStore={dataStore} onSetDataStore={setDataStore} />;
      case 'datastore':
        return <DataStoreView dataStore={dataStore} onUpdateDataStore={setDataStore} />;
      case 'diagnostics':
        return <DiagnosticsView dataStore={dataStore} />;
      case 'visualizer':
        return <TriadVisualization />;
      case 'file_explorer':
        return <FileExplorer />;
      case 'apps':
        return <AppsStudioView />;
      case 'without_nlp':
        return <WithoutNlpView />;
      case 'github':
        return <GitHubExportView />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <MemoHeader
          dataStore={dataStore}
          onReset={handleResetToDefault}
          onShowReport={handleShowReport}
          onSyncSystem={handleSyncSystem}
        />

        <MemoNavigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onPrefetchTab={prefetchView}
          messageCount={dataStore?.chat_history?.length || 0}
          versionCount={dataStore?.update_history?.length || 0}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {sendError && (
            <div
              role="alert"
              className="mx-3 mt-2 flex items-start justify-between gap-3 rounded-lg border border-rose-800/60 bg-rose-950/60 px-3 py-2 font-mono text-[11px] text-rose-200"
            >
              <span>⚠️ {sendError}</span>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="shrink-0 cursor-pointer text-rose-300 hover:text-rose-100"
                aria-label="Zamknij komunikat"
              >
                ✕
              </button>
            </div>
          )}
          <ErrorBoundary key={activeTab}>
            <Suspense fallback={<ViewFallback />}>{renderView()}</Suspense>
          </ErrorBoundary>
        </main>

        {showReportModal && (
          <Suspense fallback={null}>
            <ReportModal isOpen={showReportModal} onClose={handleCloseReport} dataStore={dataStore} />
          </Suspense>
        )}

        <MemoHealthDock />
      </div>
    </ErrorBoundary>
  );
}
