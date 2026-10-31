# SVL — zdjęcia i generowanie obrazów

1. Skopiuj `.env.example` do `.env` na serwerze i ustaw `OPENAI_API_KEY`. Nie wpisuj klucza na czacie ani w kodzie przeglądarki.
2. Konto API musi mieć dostęp do wybranych modeli i aktywne rozliczenia. ChatGPT Plus/Pro nie finansuje wywołań API SVL.
3. Uruchom aplikację przez `npm ci` i `npm start`. Status konfiguracji: `GET /api/ai/status` (bez ujawniania klucza).
4. Na czacie załącz PNG, JPEG lub WebP i zadaj pytanie. Piksele obrazu są wysyłane do modelu Vision. Każdy agent wybranej Triady wykonuje osobne wywołanie.
5. Wpisz `/obraz opis sceny`, aby wygenerować jedną grafikę, także w kanale Triady. Obraz zostaje w katalogu `exports` i historii czatu. Zachowaj `exports` na trwałym dysku hostingu.

Modele można zmienić przez `OPENAI_VISION_MODEL` i `OPENAI_IMAGE_MODEL`. Generowanie korzysta z GPT Image; nie nazywa go DALL·E. Błędy nie są zastępowane atrapami SVG.

Weryfikacja bez płatnych wywołań: `node --test tests/openai-media.test.mjs` (Node 24). Testy używają kontrolowanych odpowiedzi API. Rzeczywiste wywołania wymagają klucza i osobnego testu na hostingu.

Naprawy obejmują usunięcie klucza Pollinations z kodu, poprawny zapis własnych skrótów czatu, brak wymuszonego push oraz uruchamianie bez opcjonalnego klucza Gemini. Klucz wcześniej opublikowany w historii Git należy unieważnić u dostawcy.
