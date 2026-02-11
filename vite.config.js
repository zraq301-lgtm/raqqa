import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // تحديد المجلد الرئيسي للمشروع
  root: './',

  // تفعيل إضافات React
  plugins: [react()],

  // المسار الأساسي: تم تغييره من './' إلى '/' لإصلاح مشكلة الصفحة البيضاء على Vercel
  base: '/',

  resolve: {
    alias: {
      // إعداد الاختصار @ ليشير إلى مجلد src لسهولة الاستيراد
      '@': resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    strictPort: true,
    host: true, // للسماح بالوصول من الشبكة المحلية
    open: true, // لفتح المتصفح تلقائياً عند التشغيل
  },

  build: {
    // تحديد مجلد المخرجات
    outDir: 'dist',
    
    // استخدام esbuild للضغط لضمان السرعة والتوافق
    minify: 'esbuild',
    
    // تحسين استهلاك الذاكرة وسرعة البناء
    sourcemap: false, 
    chunkSizeWarningLimit: 1600,

    rollupOptions: {
      input: {
        // المسار المطلق لملف المدخل الرئيسي
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // تنظيم مخرجات البناء في مجلدات فرعية واضحة (assets) لمنع تضارب الملفات
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  // تحسين أداء المعالجة المسبقة للمكتبات
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
})
