# ChatGPT ↔ SVL przez MCP

Serwer SVL obsługuje Streamable HTTP pod `/mcp`. Po podłączeniu ChatGPT może odczytywać stan SVL, listę eksportów i opcjonalnie ostatnie wiadomości. To kierunek ChatGPT → SVL: nie zastępuje modelu wewnętrznego czatu SVL i nie udostępnia mu automatycznie API subskrypcji ChatGPT.

## Konfiguracja hostingu

1. Wdróż gałąź z poprawkami, zainstaluj zależności (`npm ci`) i udostępnij aplikację pod własnym HTTPS. Repozytorium GitHub nie jest serwerem MCP.
2. Skonfiguruj dostawcę OAuth 2.1 obsługującego Authorization Code + PKCE S256 i discovery. Skonfiguruj klienta ChatGPT według aktualnych wymagań OpenAI (CIMD, dynamiczna rejestracja albo uprzednio zarejestrowany klient). Redirect URI skopiuj z konfiguracji ChatGPT.
3. Zarejestruj zasób/audience `https://TWOJA-DOMENA/mcp` i scope `svl:read`. Dostawca musi wystawiać JWT access tokeny z `iss`, `aud`, `exp`, `sub`, `scope` i podpisem RS256 lub ES256. Nie używaj ID tokenów. Przekazuj parametr `resource` w przepływie OAuth.
4. Ustaw na hostingu:

```dotenv
MCP_ENABLED=true
MCP_PUBLIC_URL=https://TWOJA-DOMENA/mcp
MCP_OAUTH_ISSUER=https://TWOJ-DOSTAWCA-OAUTH/
MCP_OAUTH_JWKS_URL=https://TWOJ-DOSTAWCA-OAUTH/.well-known/jwks.json
MCP_ALLOWED_SUBJECTS=IDENTYFIKATOR_SUB_WLASCICIELA
MCP_SHARE_CHAT=false
```

Issuer i JWKS muszą odpowiadać Twojemu dostawcy. Lista sub jest listą właścicieli jednej współdzielonej instancji SVL, nie izolacją danych wielu użytkowników. `MCP_SHARE_CHAT=true` włącza dostęp do ostatnich 30 wiadomości, bez załączników. Nie ustawiaj tej opcji bez zamiaru udostępnienia rozmów połączonemu klientowi.

5. Uruchom ponownie serwer. `GET /api/mcp/status` pokazuje konfigurację bez sekretów. Discovery: `/.well-known/oauth-protected-resource/mcp`. Niezalogowane żądanie do `/mcp` powinno zwracać 401 i nagłówek WWW-Authenticate.

## Dodanie do ChatGPT

W interfejsie ChatGPT otwórz Plugins/Aplikacje → dodanie własnego serwera MCP (jeżeli dostępne na koncie). Wprowadź `https://TWOJA-DOMENA/mcp`, wybierz OAuth i zaloguj się jako właściciel SVL. Dostępność tej opcji zależy od konta i ustawień administratora. Po instalacji wybierz integrację w nowym czacie i poproś: „Sprawdź stan SVL”. Po zmianach narzędzi odśwież połączenie.

Narzędzia:
- `svl_status`: wersja jądra, liczba wiadomości, konfiguracja AI bez kluczy.
- `svl_list_exports`: nazwy i rozmiary maksymalnie 100 plików; bez ich treści.
- `svl_recent_messages`: opcjonalny odczyt 1–30 wiadomości.

MCP nie udostępnia terminala, poleceń systemowych ani zapisu. Istniejące endpointy REST SVL mają własny model dostępu: ochrona OAuth `/mcp` nie zabezpiecza pozostałych endpointów aplikacji. Hosting całej aplikacji musi zachować własną kontrolę dostępu i umożliwić klientowi dotarcie do `/mcp` oraz endpointów discovery.

## Testy

`npm run lint`, `npm run build`, `node --test tests/mcp.test.ts` (Node 24).
Testy obejmują discovery i wywołania narzędzi przez SDK, ograniczenie danych, wyłączony czat, HTTP 503 przy wyłączeniu i HTTP 401 z discovery przy braku tokenu. Pełny OAuth i połączenie z kontem ChatGPT wymagają konfiguracji dostawcy oraz hostingu i nie są potwierdzone przez te testy.

Dokumentacja:
- https://developers.openai.com/plugins/build/app-quickstart
- https://developers.openai.com/plugins/build/auth
