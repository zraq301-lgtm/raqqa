import { CapacitorHttp } from '@capacitor/core';

const SAVE_URL = 'https://nawah-ai-db.vercel.app/api/engine';

/**
 * دالة حفظ وتحديث بيانات صفحة معينة في مستودع GitHub للأقسام العربية
 * @param {string} pageName - اسم القسم (مثال: 'أيقونة الأناقة'، 'شغف وحرف')
 * @param {Object|Array|string} updatedContent - المحتوى الجديد بالكامل المراد حفظه
 */
export const savePageData = async (pageName, updatedContent) => {
  // 1. تنظيف اسم القسم من أي علامات تنصيص زائدة أو مسافات في البداية والنهاية
  const cleanPageName = pageName.replace(/['"]/g, '').trim();

  // 2. تأمين تحويل المحتوى إلى نص إذا كان كائناً أو مصفوفة ليطابق توقعات السيرفر
  let formattedContent = updatedContent;
  if (typeof updatedContent === 'object') {
    formattedContent = JSON.stringify(updatedContent);
  }

  const options = {
    url: SAVE_URL,
    headers: { 
      'Content-Type': 'application/json'
    },
    data: {
      page: cleanPageName,       // يرسل الاسم العربي النظيف (مثال: أيقونة الأناقة)
      content: formattedContent   // يرسل البيانات النصية الجاهزة للتخزين
    },
  };

  try {
    const response = await CapacitorHttp.post(options);
    
    // التوافق مع بنية استجابة CapacitorHttp للوصول للبيانات الفعلية
    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    console.log(`[Admin Service] تم تحديث الأقسام بنجاح لـ ${cleanPageName}:`, result);
    return result; 
  } catch (error) {
    console.error(`[Admin Service] خطأ أثناء حفظ صفحة ${cleanPageName}:`, error);
    throw error;
  }
};
