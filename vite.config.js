import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // المجلد الرئيسي هو الجذر
  root: './', 
  
  plugins: [react()],
  
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },

  resolve: {
    alias: {
      // التعديل: جعل @ تشير إلى src بدلاً من public لضمان عمل الاستيرادات (Imports)
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    // التعديل: استخدام esbuild الافتراضي بدلاً من terser لسرعة البناء وتجنب أخطاء التثبيت
    minify: 'esbuild', 
    rollupOptions: {
      input: {
        // التأكد من أن المسار يشير إلى index.html في المجلد الرئيسي
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // تنظيم الملفات الناتجة لضمان عدم حدوث تضارب في المسارات على Vercel
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // التأكد من أن القاعدة تبدأ من الجذر
  base: './',
})
