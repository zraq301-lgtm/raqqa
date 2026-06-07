import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ضبط عميل سوبابيز بإعدادات مخصصة تمنع تداخل CapacitorHttp وتمنع الشاشة البيضاء
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // الحفاظ على جلسة المستخدم داخل الموبايل
    autoRefreshToken: true, // تحديث التوكن تلقائياً
    detectSessionInUrl: false // إيقاف فحص الرابط في الموبايل لمنع الكراش
  },
  global: {
    // إجبار سوبابيز على استخدام الـ fetch الأصلي للنظام وتجنب تعليق CapacitorHttp
    fetch: (...args) => fetch(...args),
  },
});
