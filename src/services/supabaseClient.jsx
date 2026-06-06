import { createClient } from '@supabase/supabase-js';

// استبدل هذه القيم بالقيم الحقيقية من لوحة تحكم سوبابيز (Settings > API)
// أو تأكد من إضافتها في إعدادات فيرسل (Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
