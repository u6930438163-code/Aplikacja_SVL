# Aria i Ollama w Aplikacja_SVL

Skrypt `scripts/aria_repo.py` odzyskano z paczki SVL_System i dostosowano do `/api/kernel/agent`, `agent=SI_1`. Akceptuje `--task`. Potwierdza połączenie dopiero po rzeczywistej odpowiedzi ze źródłem Ollama; odpowiedzi wbudowanego NLP nie są dowodem połączenia.

Na hoście z Ollamą ustaw:
```
SVL_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=nazwa-z-ollama-list
OLLAMA_KEEP_ALIVE=10m
OLLAMA_NUM_CTX=4096
OLLAMA_NUM_PREDICT=512
OLLAMA_TIMEOUT_MS=40000
```
Zrestartuj SVL. `GET /api/ollama/status` sprawdza połączenie i obecność modelu. Model trzeba wcześniej zainstalować na tym hoście. Integracja nie pobiera modeli ani nie restartuje cudzych usług.

```
python3 scripts/aria_repo.py --repo . --api-url http://127.0.0.1:3000 --task 'Aria, przeanalizuj konfigurację Ollamy i zaproponuj konkretne ulepszenia wydajności. Nie deklaruj wykonania zmian bez wyników.'
```

Ulepszenia: ograniczona historia, limity kontekstu i odpowiedzi, utrzymywanie modelu w pamięci, czas oczekiwania, kontrola współbieżności i obliczanie tokenów/s z danych Ollamy. Przy aktywnej Ollamie kanał Triady kieruje zadanie do Arii, zamiast uruchamiać cztery konkurencyjne generacje. Załączniki obrazowe nadal korzystają z osobnej integracji Vision.

Skrypt wysyła zadanie do modelu; nie daje mu narzędzi edycji plików ani wykonania zmian w repozytorium. „Maksymalna” wydajność nie jest potwierdzona: wymaga benchmarków na docelowym CPU/GPU. W środowisku przygotowania porty 3000 i 11434 odmawiały połączenia, więc Aria nie wykonała zadania.

Testy: `node --test tests/ollama.test.ts` (Node 24); odpowiedzi kontrolowane, bez rzeczywistego modelu.
