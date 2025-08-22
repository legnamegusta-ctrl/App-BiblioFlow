
const CACHE = 'biblioflow-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/utils.js',
  './pages/dashboard.html','./pages/dashboard.js',
  './pages/acervo.html','./pages/acervo.js',
  './pages/leituras.html','./pages/leituras.js',
  './pages/metas.html','./pages/metas.js',
  './pages/calculadora.html','./pages/calculadora.js',
  './pages/temporizador.html','./pages/temporizador.js',
  './pages/comunidade.html','./pages/comunidade.js',
  './pages/streaks.html','./pages/streaks.js',
  './pages/perfil.html','./pages/perfil.js',
  './pages/configuracoes.html','./pages/configuracoes.js',
  './assets/logo.png','./assets/favicon.ico'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS.filter(Boolean))));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.map(k=> k!==CACHE && caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
