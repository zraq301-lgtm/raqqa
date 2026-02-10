import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // استيراد المكون الأساسي الذي أنشأناه سابقاً 
import './index.css' // إذا كان لديك ملف تنسيق عام

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
