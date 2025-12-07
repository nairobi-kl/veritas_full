// public/service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
  })
);

// Кешуємо статичні ресурси
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' || 
                  request.destination === 'script' || 
                  request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets',
  })
);

// Кешуємо шрифти
workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || 
              url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts',
  })
);

console.log('Service Worker завантажено — PWA працює!');