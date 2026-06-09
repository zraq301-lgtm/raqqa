import { CapacitorHttp } from '@capacitor/core';

const FETCH_URL = 'https://nawah-ai-db.vercel.app/api/get-engine-data';

/**
 * دالة موحدة لجلب بيانات أي صفحة من السيرفر
 * @param {string} pageName - اسم الصفحة باللغة العربية
 */
export const fetchPageData = async (pageName) => {
  const options = {
    // استخدام encodeURIComponent للتعامل الآمن مع الحروف العربية والمسافات في الرابط
    url: `${FETCH_URL}?page=${encodeURIComponent(pageName)}`,
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    const response = await CapacitorHttp.get(options);
    return response.data; // البيانات القادمة من ملف الـ JSON في جيت هاب
  } catch (error) {
    console.error(`[Data Service] خطأ في جلب صفحة ${pageName}:`, error);
    throw error;
  }
};
