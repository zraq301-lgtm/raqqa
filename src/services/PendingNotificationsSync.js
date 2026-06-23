import { CapacitorHttp } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// الرابط الصحيح والمؤكد الخاص بك
const VERCEL_SYNC_URL = 'https://raqqa-v6cd.vercel.app/api/sync-data';

/**
 * دالة قراءة الإشعارات المجدولة من نظام الأندرويد وضخها في نيون
 */
export const syncPendingAndroidNotificationsToNeon = async () => {
  console.log("🔄 [خدمة المزامنة] جاري فحص الإشعارات المجدولة في الأندرويد...");
  try {
    // 1. جلب الحساب الحالي لضمان التوجيه الصحيح في نيون
    const clerkId = localStorage.getItem('user_clerk_id') || localStorage.getItem('user_id');
    const userEmail = localStorage.getItem('user_email') || localStorage.getItem('user_email');

    if (!clerkId || !userEmail) {
      console.warn("🔒 [توقف صامت] لا توجد بيانات مستخدم مسجل، لن يتم الرفع لنيون حالياً.");
      return;
    }

    // 2. 🔥 السطر السحري: قراءة كافة الإشعارات المجدولة داخل نظام الأندرويد حالياً
    const pendingRequests = await LocalNotifications.getPending();
    
    // تأكد من وجود إشعارات مجدولة قبل إرسال طلب شبكة بلا فائدة
    if (!pendingRequests || pendingRequests.notifications.length === 0) {
      console.log("➡️ لا توجد أي إشعارات مجدولة في الأندرويد لإرسالها.");
      return;
    }

    console.log(`📡 تم العثور على (${pendingRequests.notifications.length}) إشعار مجدول. جاري التجهيز للإرسال...`);

    // 3. إعداد خيارات الإرسال عبر محرك الموبايل CapacitorHttp
    const options = {
      url: VERCEL_SYNC_URL,
      headers: { 'Content-Type': 'application/json' },
      data: {
        clerkId: clerkId,
        email: userEmail,
        targetTable: 'scheduled_notifications', // اسم الجدول المخصص لهذه العملية في نيون
        localData: pendingRequests.notifications // المصفوفة الحية المجدولة المستخرجة من أندرويد
      }
    };

    // 4. ضخ البيانات الحية داخل نيون
    const response = await CapacitorHttp.post(options);

    if (response.data && response.data.success) {
      console.log("✨ نجاح تام! تم قراءة إشعارات الأندرويد المجدولة ونسخها داخل نيون بنجاح.");
    } else {
      console.error("⚠️ السيرفر استلم الإشعارات ولكنه رفض الحفظ:", response.data?.error);
    }

  } catch (error) {
    console.error("💥 خطأ أثناء قراءة إشعارات النظام المجدولة أو أثناء الرفع:", error.message);
  }
};

/**
 * دالة ربط الخدمة مع الأحداث لتفعيل المزامنة التلقائية فور صدور إشعار جديد
 */
export const initializeNotificationsSyncListener = () => {
  console.log("📡 [حارس الإشعارات] تم تفعيله وبانتظار الإشارات الحية من التطبيق...");
  
  // لقط الإشارة فور صدورها من واجهة المشاعر أو أي صفحة من الـ 9 صفحات
  window.addEventListener('trigger_sync_notifications', async () => {
    console.log("🔔 تم التقاط حدث تحديث الإشعارات! جاري سحب المجدول وضخه في نيون...");
    await syncPendingAndroidNotificationsToNeon();
  });
};
