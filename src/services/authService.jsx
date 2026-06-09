import { supabase } from './supabaseClient';

/**
 * 1. دالة إنشاء حساب جديد يدوياً (Sign Up API) مع تمرير توكن الإشعارات
 */
export const registerToSupabase = async (email, password, fullName, fcmToken) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim(),
          fcm_token: fcmToken // تمرير التوكن المخزن محلياً إلى ميتاداتا المستخدم في سوبابيز
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
    console.error("Critical Register Error:", err);
    return { success: false, error: "فشل الاتصال بالباك إند، يرجى التحقق من الإنترنت." };
  }
};

/**
 * 2. دالة تسجيل الدخول السريع عبر فيسبوك (Facebook Auth API)
 */
export const loginWithFacebook = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        // توجيه الأندرويد المباشر لحزمتك com.raqqa.app
        redirectTo: 'com.raqqa.app://login-callback',
        scopes: 'email,public_profile'
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
