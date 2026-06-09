daimport { CapacitorHttp } from '@capacitor/core';

const SAVE_URL = 'https://nawah-ai-db.vercel.app/api/engine';

/**
 * دالة حفظ وتحديث بيانات صفحة معينة في مستودع GitHub
 * @param {string} pageName - اسم الصفحة المراد تعديلها
 * @param {Object} updatedContent - المحتوى الجديد بالكامل لملف الـ JSON
 */
export const savePageData = async (pageName, updatedContent) => {
  const options = {
    url: SAVE_URL,
    headers: { 'Content-Type': 'application/json' },
    data: {
      page: pageName,       // يحدد للسيرفر اسم الملف المستهدف في جيت هاب
      content: updatedContent // البيانات الجديدة بالكامل لتكتب داخل الملف
    },
  };

  try {
    const response = await CapacitorHttp.post(options);
    return response.data; // نتيجة التحديث (رسالة نجاح أو الـ Commit Object)
  } catch (error) {
    console.error(`[Admin Service] خطأ أثناء حفظ صفحة ${pageName}:`, error);
    throw error;
  }
};
