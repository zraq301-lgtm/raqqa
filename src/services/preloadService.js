import { apiUrl } from '../config/apiConfig';
import { healthImages, pageImages } from '../config/assetUrls';

const preloadImage = (url) => new Promise((resolve) => {
  if (!url) return resolve();
  const image = new Image();
  image.onload = () => resolve();
  image.onerror = () => resolve();
  image.src = url;
});

const preloadVideo = (url) => new Promise((resolve) => {
  if (!url) return resolve();
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.oncanplaythrough = () => resolve();
  video.onerror = () => resolve();
  video.src = url;
  video.load();
});

let preloadPromise;

/**
 * يبدأ تحميل موارد التطبيق الأساسية دون تعطيل شاشة تسجيل الدخول أو الواجهة.
 * الصفحات الثقيلة تظل تُحمّل عند الحاجة، بينما تُجهّز هنا الصور العامة وإعدادات المظهر.
 */
export const preloadAppResources = () => {
  if (preloadPromise) return preloadPromise;

  const imageUrls = [
    ...Object.entries(pageImages)
      .filter(([key]) => !['videos', 'virtual'].includes(key))
      .map(([, url]) => url),
    ...Object.values(healthImages),
  ];
  preloadPromise = Promise.allSettled([
    preloadVideo('/splash_video.mp4'),
    ...imageUrls.map(preloadImage),
    fetch(apiUrl('api/settings/theme'), { cache: 'no-store' }).then((response) => {
      if (!response.ok) throw new Error(`Theme preload failed: ${response.status}`);
      return response.json();
    }),
  ]).then(() => undefined);

  return preloadPromise;
};
