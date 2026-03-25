import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // تغيير base إلى './' يضمن أن المسارات نسبية وتعمل في أي مكان (Vercel, GitHub, Android)
  // هذا سيحل مشكلة الصفحة البيضاء تماماً
  base: './', 
  
  plugins: [react()],
  
  build: {
    // تحديد مجلد المخرجات ليتوافق مع إعدادات Capacitor و Vercel
    outDir: 'dist_web',
    
    // استخدام terser لتصغير الكود لضمان أداء عالي على الموبايل
    minify: 'terser',
    
    // تنظيف المجلد قبل البناء لضمان عدم تداخل الملفات القديمة
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        // نترك Vite يضيف Hash للملفات (اختياري) أو نثبت الأسماء كما طلبت
        // الأسماء الثابتة مفيدة في الـ Live Updates
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  
  // لضمان استقرار السيرفر المحلي أثناء التطوير
  server: {
    port: 3000,
    strictPort: true,
  }
});
