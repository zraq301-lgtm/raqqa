/**
 * 2. دالة تسجيل الدخول السريع عبر فيسبوك (Facebook Auth API المحدث والمستقر)
 */
export const loginWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        // توجيه الأندرويد المباشر لحزمتك com.raqqa.app
        redirectTo: 'com.raqqa.app://login-callback',
        // قمنا بحذف السطر القديم وترك الصلاحيات الافتراضية الآمنة لفيسبوك وسوبابيز
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (err) {
    console.error("Critical Facebook Error:", err);
    return { success: false, error: "تعذر فتح بوابة فيسبوك في نسخة الـ APK الحالية." };
  }
};
