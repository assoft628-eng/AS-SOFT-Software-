// This service worker handles push notifications when the app is
// closed or in the background - similar to how WhatsApp notifies you.
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
  const title = (payload.notification && payload.notification.title) || 'AS Soft';
  const body = (payload.notification && payload.notification.body) || '';
  const options = {
    body: body,
    icon: 'https://assoft628-eng.github.io/AS-SOFT-Software-/icons/icon-192.png',
    badge: 'https://assoft628-eng.github.io/AS-SOFT-Software-/icons/icon-192.png',
    data: { url: (payload.fcmOptions && payload.fcmOptions.link) || '/' }
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
