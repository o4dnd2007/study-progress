// This is the service worker with the Cache-first network
// Add this below content to your HTML page, or add the js file to your page at the very top to register service worker

// URLS that we want to cache when the worker is installed
const PRE_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Include offline analytics
const OFFLINE_GA_CODE = `
  window.addEventListener('online', function(e) {
    // Send offline analytics when we get back online
    window.gtag && window.gtag('event', 'connectivity', {
      'event_category': 'Network',
      'event_label': 'Online'
    });
  });
  window.addEventListener('offline', function(e) {
    window.gtag && window.gtag('event', 'connectivity', {
      'event_category': 'Network',
      'event_label': 'Offline'
    });
  });
`;

// Add offline analytics to the page
const offlineAnalytics = document.createElement('script');
offlineAnalytics.innerHTML = OFFLINE_GA_CODE;
document.head.appendChild(offlineAnalytics);

self.addEventListener('install', function(event) {
  console.log('[PWA Builder] Install Event processing');

  console.log('[PWA Builder] Skip waiting on install');
  self.skipWaiting();

  event.waitUntil(
    caches.open('pwabuilder-offline').then(function(cache) {
      console.log('[PWA Builder] Caching pages during install');
      return cache.addAll(PRE_CACHE);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[PWA Builder] Claiming clients for current page');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(response) {
      console.log('[PWA Builder] Network request for ', event.request.url);
      return response || fetch(event.request);
    }).catch(function (error) {
      console.log('Fetch failed; returning offline page instead.', error);
      return caches.match('offline.html');
    })
  );
});
