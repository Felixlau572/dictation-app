// service-worker.js - 讓小小默寫家可以離線使用

const CACHE_NAME = 'dictation-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 安裝時快取檔案
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('快取檔案中...');
      return cache.addAll(urlsToCache);
    })
  );
});

// 攔截網路請求，優先使用快取
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // 如果有快取，就回傳快取的版本
      if (response) {
        return response;
      }
      
      // 沒有快取，就從網路抓取
      return fetch(event.request).then(function(response) {
        // 檢查是否傳回有效的回應
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 複製回應，因為回應是串流，只能使用一次
        var responseToCache = response.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// 啟用時清除舊的快取
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取：', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
