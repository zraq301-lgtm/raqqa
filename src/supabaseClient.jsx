import { createClient } from '@supabase/supabase-with-rc'; // أو المكتبة القياسية المعتمدة لديك

// قراءة متغيرات البيئة التي أضفناها في فيرسل
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("تنبيه: متغيرات البيئة الخاصة بـ Supabase غير مكتملة!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // للحفاظ على تسجيل دخول المستخدم حتى لو أغلق التطبيق
    autoRefreshToken: true,
  }
});
