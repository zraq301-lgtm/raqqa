import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // تحديد المجلد الرئيسي للمشروع
  root: './', 
  
  plugins: [react()],
  
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },

  resolve: {
    alias: {
      // إخبار Vite أن علامة @ تشير إلى مجلد public الجديد
      '@': resolve(__dirname, './public'),
    },
  },

  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      // تحديد ملف المدخل الرئيسي داخل مجلد public
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  base: '/',
})
