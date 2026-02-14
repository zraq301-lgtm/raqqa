import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // 'base' لضمان عمل المسارات بشكل صحيح في الأندرويد والرابط السحابي
  base: './', 
  
  plugins: [react()],
  
  build: {
    // تحديد مجلد المخرجات المطلوب
    outDir: 'dist_web',
    
    // تصغير الكود لسرعة التحميل
    minify: 'terser',
    
    // تنظيف المجلد قبل كل بناء جديد
    emptyOutDir: true,
    
    rollupOptions: {
      output: {
        // الحفاظ على تنسيق الملفات كما هو في كودك الأصلي
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});
