const CACHE_NAME = 'school-assistant-v4';
const BASE_URL = self.location.pathname.replace(/[^\/]+$/, '');

const ASSETS_TO_CACHE = [
    BASE_URL,
    BASE_URL + 'index.html',
    BASE_URL + 'styles.css',
    BASE_URL + 'app.js',
    BASE_URL + 'db.js',
    BASE_URL + 'search.js',
    BASE_URL + 'dicts.json',
    BASE_URL + 'manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
