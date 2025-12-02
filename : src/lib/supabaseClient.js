// استيراد دالة إنشاء العميل من مكتبة Supabase
import { createClient } from '@supabase/supabase-js'

// 1. قراءة المفاتيح من متغيرات البيئة الخاصة بـ Vite
// Vite يستخدم import.meta.env للوصول إلى المتغيرات التي تبدأ بـ VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. التحقق من وجود المفاتيح
if (!supabaseUrl || !supabaseAnonKey) {
  // هذا الخطأ سيظهر في Console المتصفح إذا فشل قراءة المفاتيح
  console.error("خطأ حرج: متغيرات بيئة Supabase مفقودة. يرجى التأكد من إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في إعدادات Vercel.")
  
  // لضمان عدم تعطل التطبيق في حال عدم توفر المفاتيح
  // يمكنك هنا إعادة توجيه المستخدم أو إظهار رسالة خطأ مناسبة
  // for production environment, it's better to throw an error 
  // throw new Error("Supabase keys are not configured.")
}

// 3. إنشاء عميل Supabase وتصديره
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// يمكنك إضافة أمثلة لدوال استعلام هنا، أو استخدام كائن supabase مباشرة في مكوناتك
/*
// مثال لدالة جلب البيانات:
export async function fetchAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false }); // جلب الأحدث أولاً

  if (error) {
    console.error('فشل جلب المنشورات:', error.message);
    return [];
  }
  return data;
}
*/
