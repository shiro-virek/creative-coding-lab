const CACHE_NAME = 'creative-coding-lab';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/scripts/utils.js',
                    '/scripts/quadtree.js',
                    '/scripts/main.js',
                    '/scripts/manage-scripts.js',
                    '/icon512_rounded.png',
                    '/icon512_maskable.png', 
                    '/scripts/art-3d-rotation-ligths.js',
                    '/scripts/art-3d-rotation.js',
                    '/scripts/art-balls-bouncing.js',
                    '/scripts/art-bokeh.js',
                    '/scripts/art-cellular-automata.js',
                    '/scripts/art-chaos.js',
                    '/scripts/art-confetti.js',
                    '/scripts/art-conway.js',
                    '/scripts/art-crt.js',
                    '/scripts/art-cthulhu.js',
                    '/scripts/art-distortion.js',
                    '/scripts/art-fire.js',
                    '/scripts/art-ledscreen-tones.js',
                    '/scripts/art-ledscreen.js',
                    '/scripts/art-metro.js',
                    '/scripts/art-motion-matrix.js',
                    '/scripts/art-rotators-solid.js',
                    '/scripts/art-rotators.js',
                    '/scripts/art-skyscrapers.js',
                ]);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(e.request)
                    .then((networkResponse) => {
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(e.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        return caches.match('/index.html');
                    });
            })
    );
});
self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME];
    e.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});
