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
 * 2. دالة تسجيل الدخول للحساب القديم يدوياً (Sign In API) مع تحديث توكن الإشعارات
 */
export const loginToSupabase = async (email, password, fcmToken) => {
  try {
    // استدعاء سوبابيز للتحقق من البريد وكلمة المرور الفعليين
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // تحديث توكن الإشعارات (FCM Token) في ميتاداتا المستخدم وجدول البروفايل لضمان استمرار وصول الإشعارات
    if (data.user) {
      const updatedMetadata = {
        ...data.user.user_metadata,
        fcm_token: fcmToken
      };

      // تحديث الميتاداتا في السوبابيز أوث
      await supabase.auth.updateUser({
        data: updatedMetadata
      });

      // إذا كنت تستخدم جدول بروفايلات خارجي لربطه بنيون، نحدث التوكن هناك أيضاً
      if (fcmToken) {
        await supabase
          .from('profiles') 
          .update({ fcm_token: fcmToken })
          .eq('id', data.user.id);
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };

  } catch (err) {
    console.error("Critical Login Error:", err);
    return { success: false, error: "فشل الاتصال بالباك إند، يرجى التحقق من الإنترنت." };
  }
};

/**
 * 3. دالة تسجيل الدخول السريع عبر فيسبوك (Facebook Auth API)
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
