const CACHE_NAME = 'raqqa-v1';
const assets = [
  '/',
  '/index.html', // أو اسم الصفحة الرئيسية لديكِ
  // أضيفي هنا روابط ملفات الـ CSS أو الصور الثابتة إذا أردتِ
];

// تثبيت عامل الخدمة
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// استدعاء البيانات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
