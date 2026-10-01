import {
    CacheFirst,
    ExpirationPlugin,
    NetworkFirst,
    RangeRequestsPlugin,
    Serwist,
    StaleWhileRevalidate
} from 'serwist';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        // Arquivos de public/ e do build, listados pelo @serwist/next
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const PAGES_CACHE = 'pages';

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    precacheOptions: {
        cleanupOutdatedCaches: true,
        // O Safari pede o áudio em partes e não toca uma resposta inteira vinda do cache
        plugins: [new RangeRequestsPlugin()]
    },
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            // A página é renderizada no servidor a cada acesso: o cache só entra sem conexão
            matcher: ({ request }) => request.mode === 'navigate',
            handler: new NetworkFirst({ cacheName: PAGES_CACHE, networkTimeoutSeconds: 3 })
        },
        {
            matcher: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
        },
        {
            matcher: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: new CacheFirst({
                cacheName: 'google-fonts-webfonts',
                plugins: [new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 })]
            })
        }
    ]
});

// Guarda a página já na instalação, para o app abrir offline mesmo depois de uma única visita
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PAGES_CACHE).then((cache) => cache.add('/')).catch(() => {})
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(([client]) => {
            return client ? client.focus() : self.clients.openWindow('/');
        })
    );
});

serwist.addEventListeners();
