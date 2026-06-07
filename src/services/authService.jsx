import { supabase } from './supabaseClient';

/**
 * دالة تسجيل الدخول السريع عبر Facebook OAuth مخصصة للـ APK
 */
export const loginWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        // استخدام المعرّف الخاص بحزمتك كبروتوكول عودة لأندرويد
        redirectTo: 'com.raqqa.app://login-callback',
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (err) {
    return { success: false, error: "تعذر فتح بوابة تسجيل فيسبوك حالياً" };
  }
};

/**
 * دالة إنشاء حساب جديد (مستقرة ولا تسبب كراش)
 */
export const registerToSupabase = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };

  } catch (err) {
    return { success: false, error: "حدث خطأ غير متوقع أثناء محاولة إنشاء الحساب" };
  }
};
