import React from 'react';
import ReactDOM from 'react-dom/client';
import AppSwitcher from './AppSwitcher'; // استدعاء المحول بدلاً من App
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppSwitcher />
  </React.StrictMode>
);
