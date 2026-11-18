import { CapacitorHttp } from '@capacitor/core';
import { cacheOfflineMedia, hydrateOfflineMedia } from './offlineMediaCache';
import { readPageCache, readRecentCache, writePageCache, writeRecentCache } from './contentCache';

const API_BASE = import.meta.env.VITE_RAQQA_API_BASE_URL || 'https://raqqa-backend.raqqa-api.workers.dev';
const FETCH_URL = `${API_BASE}/api/content`;

export const fetchRecentContentFeed = async () => {
  const cached = await readRecentCache();
  try {
    const response = await CapacitorHttp.get({
      url: `${FETCH_URL}/feed?source=d1`,
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (response.status >= 400) throw new Error(`content_feed_http_${response.status}`);
    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    const items = Array.isArray(result?.items) ? result.items : [];
    await writeRecentCache(items);
    void cacheOfflineMedia('recent-feed', items).catch((error) => console.warn('[OfflineMediaCache] تعذر تجهيز الخلاصة دون إنترنت:', error?.message || error));
    return hydrateOfflineMedia(items);
  } catch (error) {
    if (cached) return cached.items;
    throw error;
  }
};

/**
 * دالة موحدة وجاهزة لجلب بيانات أي صفحة من السيرفر السحابي لـ رقة
 * @param {string} pageName - اسم الصفحة باللغة العربية (مثال: 'أيقونة الأناقة'، 'شغف وحرف')
 */
export const fetchPageData = async (pageName) => {
  // 1. تنظيف اسم الصفحة من أي علامات تنصيص قد تأتي بالخطأ من واجهة المستخدم
  const cleanPageName = pageName.replace(/['"]/g, '').trim();
  const cached = await readPageCache(cleanPageName);

  const options = {
    // 2. استخدام encodeURIComponent للتعامل الآمن مع الحروف العربية والمسافات في الرابط
    url: `${FETCH_URL}?section=${encodeURIComponent(cleanPageName)}`,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache' // منع الكاش على مستوى محرك كاباسيتور لضمان جلب بيانات حية دائماً
    },
  };

  try {
    const response = await CapacitorHttp.get(options);
    if (response.status >= 400) throw new Error(`page_content_http_${response.status}`);
    
    // 3. معالجة ذكية للاستجابة لضمان استرجاع كائن كود جافا سكريبت حقيقي (Object/Array)
    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    const items = Array.isArray(result) ? result : result && typeof result === 'object' ? [result] : [];
    await writePageCache(cleanPageName, items);
    void cacheOfflineMedia(cleanPageName, items).catch((error) => console.warn(`[OfflineMediaCache] تعذر تجهيز ${cleanPageName} دون إنترنت:`, error?.message || error));
    console.log(`[Data Service] تم جلب بيانات [${cleanPageName}] بنجاح:`, result);
    if (Array.isArray(result)) return hydrateOfflineMedia(result);
    if (result && typeof result === 'object') return (await hydrateOfflineMedia([result]))[0];
    return result;
  } catch (error) {
    console.error(`[Data Service] خطأ في جلب صفحة [${cleanPageName}]:`, error);
    if (cached) {
      console.warn(`[Data Service] استخدام النسخة المحفوظة محليًا لصفحة [${cleanPageName}].`);
      return cached.items;
    }
    throw error;
  }
};
