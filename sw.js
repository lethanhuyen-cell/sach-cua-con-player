const CACHE_NAME = 'sach-cua-con-v8';

// Chiến lược Network-First: Ưu tiên tải mới từ máy chủ, chỉ fallback cache khi offline
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Bỏ qua cache cho các request audio để tránh lỗi range request và cache file lớn
  if (event.request.url.includes('/audio/') || event.request.url.endsWith('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-First cho HTML và JSON
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
