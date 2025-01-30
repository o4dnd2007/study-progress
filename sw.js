const CACHE_NAME = 'study-progress-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './icons/icon_x192.png',
  './icons/icon_x512.png'
];

// التثبيت - تخزين الملفات في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// التنشيط - حذف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية Network First ثم Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // نسخ الاستجابة لأن الاستجابة يمكن استخدامها مرة واحدة فقط
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// المزامنة في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// المزامنة الدورية
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// دالة المزامنة
async function syncData() {
  const data = await getAllData();
  // حفظ البيانات محلياً
  await saveToLocalStorage(data);
}
