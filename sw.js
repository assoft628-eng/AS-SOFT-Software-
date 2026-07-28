const CACHE_NAME = "as-soft-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(() => cached)
      );
    })
  );
});

/* ---------- FIREBASE PUSH NOTIFICATIONS ----------
   This used to live in a separate firebase-messaging-sw.js file, but having
   two service workers registered on the same scope means only one of them
   actually stays in control - which was silently breaking background push
   notifications. Merged into this single service worker so caching and push
   both always work together, no matter which one activates last. */
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA39kIy9nU2JX45gjmhcoG1hWxaWipyQvo",
  authDomain: "as-laptop.firebaseapp.com",
  databaseURL: "https://as-laptop-default-rtdb.firebaseio.com",
  projectId: "as-laptop",
  storageBucket: "as-laptop.firebasestorage.app",
  messagingSenderId: "563705968757",
  appId: "1:563705968757:web:4c391d3e76eab79d9a603c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'AS Soft';
  const body = data.body || '';
  const options = {
    body: body,
    icon: 'https://assoft628-eng.github.io/AS-SOFT-Software-/icons/icon-192.png',
    badge: 'https://assoft628-eng.github.io/AS-SOFT-Software-/icons/icon-192.png',
    data: { url: data.url || '/' }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
