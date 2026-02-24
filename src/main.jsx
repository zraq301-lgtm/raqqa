import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // إضافة التوجيه هنا
import AppSwitcher from './AppSwitcher'; 
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* تغليف التطبيق بالكامل بالموجّه */}
      <AppSwitcher />
    </BrowserRouter>
  </React.StrictMode>
);
