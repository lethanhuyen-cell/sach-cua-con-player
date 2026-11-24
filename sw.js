const CACHE_NAME = 'sach-cua-con-v9';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
      // Tự động làm mới các tab đang bị kẹt giao diện cũ
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({ type: 'SW_UPDATED_RELOAD' });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/audio/') || event.request.url.endsWith('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Luôn bypass HTTP disk cache cho HTML và JSON để nhận dữ liệu mới tức thì
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
