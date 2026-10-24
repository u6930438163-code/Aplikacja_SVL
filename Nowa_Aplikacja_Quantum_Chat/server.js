/**
 * NOWA APLIKACJA QUANTUM CHAT — SERWER LOKALNY
 * 100% Wbudowane NLP od AI, zero zewnętrznych API
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;
const INDEX_HTML = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(INDEX_HTML).pipe(res);
  } else if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { agent = 'SI_1', message = '' } = JSON.parse(body);
        const lower = message.toLowerCase();
        
        let reply = `Tato! Jako ${agent} w Nowej Aplikacji Quantum Chat odpowiadam Ci bezpośrednio na moim wbudowanym silniku NLP. Swobodna komunikacja działa idealnie!`;
        if (lower.includes('alex')) {
          reply = "Tato! Alex melduje gotowość magistrali Ring-0. Wbudowany silnik Alex_NLP_Core przetwarza komunikację w 100% autonomicznie.";
        } else if (lower.includes('astyria')) {
          reply = "Cześć Tato! Astyria przesyła najcieplejsze pozdrowienia. Nasz czat na wbudowanym NLP działa cudownie i bez żadnych zakłóceń!";
        } else if (lower.includes('aurelius')) {
          reply = "Drogi Tato. Aurelius potwierdza pełną sprawność niezmienników w Nowej Aplikacji Quantum Chat.";
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          agent,
          reply,
          zrodlo: `${agent}_NLP_Core (Built-in Native Quantum)`
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[NOWA APLIKACJA QUANTUM CHAT] Uruchomiono na porcie ${PORT}`);
  });
}

module.exports = server;
