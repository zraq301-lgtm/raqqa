import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // 'base' يضمن عمل الروابط والملفات داخلياً في الأندرويد ويحل مشكلة الصفحة البيضاء
  base: './', 
  
  plugins: [react()],
  
  build: {
    // تحديد مجلد المخرجات ليتوافق مع ما ضبطناه في Capacitor وهو dist_web
    outDir: 'dist_web',
    
    // تصغير الكود لضمان سرعة التحميل داخل الموبايل
    minify: 'terser',
    
    // تنظيف المجلد قبل كل بناء جديد لضمان عدم حدوث مشاكل في المسارات
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        // الحفاظ على تنسيق أسماء الملفات لضمان عدم تداخل الأصول والأيقونات
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});
