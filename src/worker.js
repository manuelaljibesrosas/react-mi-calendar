/* eslint-disable no-restricted-globals */
const cacheName = 'react-mi-calendar';
const urlsToCache = [
  '/',
  '/main.js',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap',
  'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
  '/icons/48x48.png',
  '/icons/72x72.png',
  '/icons/96x96.png',
  '/icons/144x144.png',
  '/icons/168x168.png',
  '/icons/192x192.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil((
    caches.open(cacheName)
      .then((cache) => (
        cache.addAll(urlsToCache)
      ))
  ));
});

self.addEventListener('fetch', (event) => {
  event.respondWith((
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  ));
});
