// Guarda os arquivos do aplicativo no aparelho para funcionar sem internet.
// Ao mudar qualquer arquivo abaixo, aumentar a VERSAO para os aparelhos baixarem de novo.
const PREFIXO = 'vitalpat-patrimonio-';
const VERSAO = PREFIXO + 'v4';
const ARQUIVOS = [
  './',
  './index.html',
  './estilo.css',
  './app.js',
  './dados-exemplo.js',
  './manifest.webmanifest',
  './icones/icone-192.png',
  './icones/icone-512.png',
  './icones/logo-vitalpat.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // Só apaga versões antigas DESTE sistema; o outro sistema pode estar no mesmo endereço
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith(PREFIXO) && n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Primeiro tenta o que está guardado no aparelho; se não tiver, busca na internet.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request))
  );
});
