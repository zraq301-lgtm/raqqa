import { CapacitorHttp } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
// 🔥 استيراد Preferences لقراءة التوكن والبيانات من SharedPreferences الحقيقية للأندرويد
import { Preferences } from '@capacitor/preferences';

const VERCEL_SYNC_URL = 'https://raqqa-v6cd.vercel.app/api/sync-data';

/**
 * دالة قراءة الإشعارات المجدولة من نظام الأندرويد وضخها في نيون
 */
export const syncPendingAndroidNotificationsToNeon = async () => {
  console.log("🔄 [خدمة المزامنة] جاري فحص الإشعارات المجدولة عبر مخازن الأندرويد الأصلية...");
  try {
    // 1. 🔑 القراءة الصحيحة والأصلية للتوكن والبيانات من Preferences (أندرويد Native)
    const { value: clerkId } = await Preferences.get({ key: 'user_clerk_id' }) || await Preferences.get({ key: 'user_id' });
    const { value: userEmail } = await Preferences.get({ key: 'user_email' }) || await Preferences.get({ key: 'savedEmail' });

    console.log("📋 فحص الحساب الملتقط من الـ Preferences:", { clerkId, userEmail });

    if (!clerkId || !userEmail) {
      console.warn("🔒 [توقف أمان] لم يتم التقاط التوكن أو الحساب من Preferences، تم إلغاء الرفع مؤقتاً.");
      return;
    }

    // 2. 🔥 السطر السحري الحقيقي: قراءة كافة الإشعارات المجدولة داخل نظام الأندرويد حالياً (Pending)
    const pendingRequests = await LocalNotifications.getPending();
    
    // تأكد من وجود إشعارات مجدولة قبل إرسال طلب شبكة بلا فائدة
    if (!pendingRequests || !pendingRequests.notifications || pendingRequests.notifications.length === 0) {
      console.log("➡️ لا توجد أي إشعارات مجدولة في نظام الأندرويد لإرسالها حالياً.");
      return;
    }

    console.log(`📡 تم العثور على (${pendingRequests.notifications.length}) إشعار مجدول في الأندرويد. جاري التحضير وضخها لـ نيون...`);

    // 3. إعداد خيارات الإرسال عبر محرك الموبايل CapacitorHttp
    const options = {
      url: VERCEL_SYNC_URL,
      headers: { 'Content-Type': 'application/json' },
      data: {
        clerkId: clerkId,
        email: userEmail,
        targetTable: 'scheduled_notifications', // اسم جدول التخزين المخصص في نيون
        localData: pendingRequests.notifications // البيانات والتواريخ المستخرجة بالكامل من قلب الأندرويد
      }
    };

    // 4. ضخ البيانات الحية داخل نيون
    const response = await CapacitorHttp.post(options);

    if (response.data && response.data.success) {
      console.log("✨ نجاح تام! تم التقاط إشعارات الأندرويد وضخها داخل نيون بنجاح وبأمان.");
    } else {
      console.error("⚠️ السيرفر استلم الإشعارات ولكنه رفض الحفظ في نيون:", response.data?.error);
    }

  } catch (error) {
    console.error("💥 خطأ أثناء قراءة إشعارات النظام المجدولة أو أثناء الرفع لـ نيون:", error.message);
  }
};

/**
 * دالة ربط الخدمة مع الأحداث لتفعيل المزامنة التلقائية فور صدور إشعار جديد
 */
export const initializeNotificationsSyncListener = () => {
  console.log("📡 [حارس الإشعارات] تم تفعيله وبانتظار الإشارات الحية من واجهات التطبيق...");
  
  // لقط الإشارة فور صدورها من واجهة المشاعر أو أي صفحة من الـ 9 صفحات
  window.addEventListener('trigger_sync_notifications', async () => {
    console.log("🔔 تم التقاط حدث تحديث الإشعارات! جاري سحب المجدول وضخه في نيون...");
    await syncPendingAndroidNotificationsToNeon();
  });
};
