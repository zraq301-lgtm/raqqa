import { createClient } from '@supabase/supabase-browser'; // أو @supabase/supabase-js حسب الحزمة المستعملة

// قراءة المتغيرات التي تبدأ بـ VITE_ طبقاً لإعدادات Vite و Vercel يدوياً
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("برجاء التأكد من إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في إعدادات Environment Variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
