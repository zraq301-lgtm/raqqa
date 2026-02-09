import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

// إنشاء جذر التطبيق وربطه بالعنصر الذي يحمل id="root" في ملف index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
