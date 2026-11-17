importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyCT2wRZgzPv1Xg3M41ZhN7-_RGze_HrZkk',
  authDomain: 'raqqa-43dc8.firebaseapp.com',
  projectId: 'raqqa-43dc8',
  storageBucket: 'raqqa-43dc8.firebasestorage.app',
  messagingSenderId: '162488255991',
  appId: '1:162488255991:web:74fe1680fc6cb5bbc61af2',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload?.notification || {};
  const data = payload?.data || {};
  // رسائل notification يعرضها FCM تلقائيًا في الخلفية؛ عدم عرضها مرة ثانية يدويًا.
  if (Object.keys(notification).length > 0) return;
  const title = notification.title || data.notification_title || 'إشعار من رقة';
  const body = notification.body || data.notification_body || '';
  const image = notification.image || data.image_url || '';
  const options = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.notification_id || payload?.messageId || 'raqqa-broadcast',
    renotify: false,
    ...( /^https:\/\//i.test(image) ? { image } : {}),
    data: { url: data.link || 'https://raqqa-ota.pages.dev/' },
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || 'https://raqqa-ota.pages.dev/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const existing = clients.find((client) => client.url.startsWith('https://raqqa-ota.pages.dev/'));
    if (existing) return existing.focus();
    return self.clients.openWindow(target);
  }));
});
