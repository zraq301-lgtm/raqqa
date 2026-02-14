import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // 'base' هو أهم سطر لحل مشكلة الصفحة البيضاء في الأندرويد
  // يجعل التطبيق يبحث عن الملفات بجانبه وليس في جذر النظام
  base: './', 
  
  plugins: [react()],
  
  build: {
    // تم التغيير إلى dist بناءً على طلبك للتوافق مع منصة فيرسل
    outDir: 'dist',
    
    // تصغير الكود لضمان سرعة التحميل داخل الموبايل
    minify: 'terser',
    
    // لضمان عدم حدوث مشاكل في المسارات عند التحديث
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        // تنسيق أسماء الملفات لضمان عدم التداخل كما في كودك الأصلي
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});
