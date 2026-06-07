// استدعاء العميل من الملف الخاص به
import { supabase } from './supabaseClient';

/**
 * 1. دالة تسجيل الدخول بالحساب الحالي
 */
export const loginToSupabase = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      user: data.user, 
      session: data.session 
    };

  } catch (err) {
    return { success: false, error: "حدث خطأ غير متوقع أثناء الاتصال بسيرفر تسجيل الدخول" };
  }
};

/**
 * 2. دالة إنشاء حساب جديد (Registration)
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

    return {
      success: true,
      user: data.user,
      session: data.session
    };

  } catch (err) {
    return { success: false, error: "حدث خطأ غير متوقع أثناء محاولة إنشاء الحساب" };
  }
};

/**
 * 3. دالة تسجيل الدخول السريع عبر Facebook OAuth
 */
export const loginWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin,
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
