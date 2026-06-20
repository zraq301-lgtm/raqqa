import { CapacitorHttp } from '@capacitor/core';

const SAVE_URL = 'https://nawah-ai-db.vercel.app/api/engine';
const DELETE_URL = 'https://nawah-ai-db.vercel.app/api/delete-engine-data'; // الرابط المثالي المحدث بناءً على اسم ملف الـ API

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

/**
 * دالة حذف عنصر معين من قسم محدد عن طريق الـ ID (مثيلة لدالة الحفظ تماماً)
 * @param {string} pageName - اسم القسم (مثال: 'مملكة الاسترخاء'، 'مكتبة رقة')
 * @param {string} itemId - المعرف الفريد للعنصر المراد حذفه
 */
export const deletePageDataById = async (pageName, itemId) => {
  // 1. تنظيف اسم القسم والمعرف من الفراغات وعلامات التنصيص
  const cleanPageName = pageName.replace(/['"]/g, '').trim();
  const cleanItemId = itemId.trim();

  // 2. تجهيز الخيارات بنفس هيكلة الطلب السحابي المعتمدة لديكِ
  const options = {
    url: DELETE_URL,
    headers: { 
      'Content-Type': 'application/json'
    },
    data: {
      page: cleanPageName,  // يرسل اسم القسم المستهدف بالحذف
      id: cleanItemId       // يرسل الـ ID الفريد للعنصر المراد مسحه
    },
  };

  try {
    // إرسال الطلب عبر CapacitorHttp بوست لمطابقة معايير السيرفر لديكِ
    const response = await CapacitorHttp.post(options);
    
    // فك استجابة السيرفر بشكل مرن وآمن
    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    
    console.log(`[Admin Service] تم معالجة طلب الحذف بنجاح من ${cleanPageName} للعنصر ${cleanItemId}:`, result);
    return result; 
  } catch (error) {
    console.error(`[Admin Service] خطأ أثناء حذف عنصر من صفحة ${cleanPageName}:`, error);
    throw error;
  }
};
