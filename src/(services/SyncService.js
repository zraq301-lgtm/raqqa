import { CapacitorHttp } from '@capacitor/core';

// الرابط الخاص بـ Vercel المربوط بقاعدة بيانات نيون
const VERCEL_SYNC_URL = 'https://raqqa-v6cd.vercel.app/api/sync-data';

/**
 * دالة المزامنة الحقيقية التي تقرأ الهاتف وتصب في نيون
 */
export const syncAndroidDataToNeon = async () => {
  try {
    // 1. جلب البيانات المحلية التي خزنتها واجهة رقة
    const localReminders = localStorage.getItem('raqqa_local_reminders');
    
    if (!localReminders) {
      console.log("➡️ لا توجد بيانات جديدة في الموبايل للمزامنة حالياً.");
      return;
    }

    // تحويل البيانات المكتوبة بنص إلى مصفوفة جافاسكريبت
    const parsedData = JSON.parse(localReminders);

    // 2. جلب بيانات المستخدم (الإيميل والـ ID) المخزنة أثناء تسجيل الدخول
    // ملاحظة: تأكد من حفظهم في الـ localStorage عند نجاح الـ Auth
    const userEmail = localStorage.getItem('user_email') || 'test_user@raqqa.com';
    const clerkId = localStorage.getItem('user_clerk_id') || 'user_3'; // مثال مطابق للسكيما الحالية

    console.log(`⏳ جاري بدء ضخ البيانات لـ نيون للمستخدم: ${userEmail}`);

    // 3. إعداد الخيارات وإرسال الطلب عبر محرك الموبايل CapacitorHttp
    const options = {
      url: VERCEL_SYNC_URL,
      headers: { 'Content-Type': 'application/json' },
      data: {
        clerkId: clerkId,
        email: userEmail,
        targetTable: 'offline_events', // الجدول المسؤول عن التقاط الأحداث والمزامنة
        localData: parsedData // البيانات الكاملة القادمة من الأندرويد
      }
    };

    const response = await CapacitorHttp.post(options);

    if (response.data && response.data.success) {
      console.log("✨ تم التقاط البيانات وصبها داخل نيون بنجاح تام!");
      
      // اختياري: بعد المزامنة الناجحة يمكنك تنظيف الـ localStorage أو تعليمها كمرفوعة
      // localStorage.removeItem('raqqa_local_reminders'); 
    } else {
      console.error("⚠️ السيرفر استلم الطلب ولكنه رفض الحفظ:", response.data.error);
    }

  } catch (error) {
    console.error("❌ فشلت خدمة المزامنة المستقلة في الوصول للسيرفر:", error.message);
  }
};

/**
 * دالة التفعيل والربط مع أحداث الواجهة (Event Listener)
 * يتم استدعاؤها مرة واحدة في App.jsx لتشغيل نظام المراقبة
 */
export const initializeSyncListener = () => {
  console.log("📡 تم تشغيل خادم المزامنة التلقائي بانتظار إشارات الأندرويد...");
  
  // لقط الإشارة فور صدورها من واجهة المشاعر
  window.addEventListener('trigger_sync_notifications', async () => {
    console.log("🔔 تم التقاط إشارة المزامنة من الواجهة! جاري النقل...");
    await syncAndroidDataToNeon();
  });
};
