import { CapacitorHttp } from '@capacitor/core';

// 🎯 تحديث الرابط ليتطابق تماماً مع اسم ملف الـ API الذي تم بناؤه بالسيرفر (engine-get أو get-engine-data)
// تأكد من مطابقة اسم الملف في مجلد api لديك مع هذا المسار
const FETCH_URL = 'https://nawah-ai-db.vercel.app/api/engine-get'; 

/**
 * دالة موحدة وجاهزة لجلب بيانات أي صفحة من السيرفر السحابي لـ رقة
 * @param {string} pageName - اسم الصفحة باللغة العربية (مثال: 'أيقونة الأناقة'، 'شغف وحرف')
 */
export const fetchPageData = async (pageName) => {
  // 1. تنظيف اسم الصفحة من أي علامات تنصيص قد تأتي بالخطأ من واجهة المستخدم
  const cleanPageName = pageName.replace(/['"]/g, '').trim();

  const options = {
    // 2. استخدام encodeURIComponent للتعامل الآمن مع الحروف العربية والمسافات في الرابط
    url: `${FETCH_URL}?page=${encodeURIComponent(cleanPageName)}`,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache' // منع الكاش على مستوى محرك كاباسيتور لضمان جلب بيانات حية دائماً
    },
  };

  try {
    const response = await CapacitorHttp.get(options);
    
    // 3. معالجة ذكية للاستجابة لضمان استرجاع كائن كود جافا سكريبت حقيقي (Object/Array)
    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    console.log(`[Data Service] تم جلب بيانات [${cleanPageName}] بنجاح:`, result);
    return result; 
  } catch (error) {
    console.error(`[Data Service] خطأ في جلب صفحة [${cleanPageName}]:`, error);
    throw error;
  }
};
