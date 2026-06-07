import { createClient } from '@supabase/supabase-js';

// قراءة المتغيرات من البيئة لو كنت على فيرسل (الويب)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// الروابط الصريحة والمستقرة لنسخة الـ APK (آمنة تماماً ومحونة ببياناتك الحقيقية)
const fallbackUrl = "https://nyqkojeogsmzggfgarwl.supabase.co"; 
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cWtvamVvZ3NtemdnZmdhcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Mzg2OTcsImV4cCI6MjA5NTMxNDY5N30.G-8A0UhI5Eov9Bg6yyD837YjHbIQZdQaNMovIZNk5zA";

// اختيار الرابط المتاح لمنع إرسال طلبات فارغة في الموبايل
const finalUrl = envUrl && envUrl !== 'undefined' ? envUrl : fallbackUrl;
const finalKey = envKey && envKey !== 'undefined' ? envKey : fallbackKey;

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage // إجبار الـ APK على حفظ جلسة المستخدم محلياً بأمان
  },
  global: {
    // إجبار النظام على استخدام الـ fetch القياسي وتجاوز حظر CapacitorHttp لضمان خروج الطلبات
    fetch: (...args) => fetch(...args),
  },
});
