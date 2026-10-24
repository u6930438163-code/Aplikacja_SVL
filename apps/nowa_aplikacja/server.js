/**
 * NOWA APLIKACJA — SERWER LOKALNY
 * Zbudowana w katalogu "Nowa aplikacja" na bazie SVL Kernel OS
 * Obsługuje interfejs webowy oraz wbudowany silnik NLP
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const INDEX_HTML = path.join(__dirname, 'index.html');
const APP_JSON = path.join(__dirname, 'app.json');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(INDEX_HTML).pipe(res);
  } else if (req.url === '/app.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    fs.createReadStream(APP_JSON).pipe(res);
  } else if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      app: 'Nowa Aplikacja — SVL Quantum HyperOS',
      status: 'RUNNING',
      nlp_engine: 'BUILTIN_AUTONOMOUS_NLP (100% OFF-GRID, ZERO API)',
      directory: 'Nowa aplikacja',
      version: '5.8.0-NLP-Quantum-Max'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[NOWA APLIKACJA] Uruchomiono serwer na porcie ${PORT}`);
  });
}

module.exports = server;
