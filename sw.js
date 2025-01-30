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

// التعامل مع الإشعارات
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: './icons/icon_x192.png',
    badge: './icons/icon_x48.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'فتح التطبيق',
        icon: './icons/icon_x48.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Study Progress', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// المزامنة في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncData().catch(err => {
        // إعادة المحاولة لاحقاً
        return registration.sync.register('sync-data');
      })
    );
  }
});

// المزامنة الدورية
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      syncData().catch(err => {
        console.error('Periodic sync failed:', err);
      })
    );
  }
});

// دالة المزامنة
async function syncData() {
  try {
    const data = await getAllData();
    await saveToLocalStorage(data);
    
    // إرسال إشعار بنجاح المزامنة
    await self.registration.showNotification('Study Progress', {
      body: 'تمت مزامنة البيانات بنجاح',
      icon: './icons/icon_x192.png',
      badge: './icons/icon_x48.png'
    });
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

// الحصول على جميع البيانات
async function getAllData() {
  const data = {
    subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
    chapters: JSON.parse(localStorage.getItem('chapters') || '[]'),
    topics: JSON.parse(localStorage.getItem('topics') || '[]')
  };
  return data;
}

// حفظ البيانات في التخزين المحلي
async function saveToLocalStorage(data) {
  localStorage.setItem('subjects', JSON.stringify(data.subjects));
  localStorage.setItem('chapters', JSON.stringify(data.chapters));
  localStorage.setItem('topics', JSON.stringify(data.topics));
}
