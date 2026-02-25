import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppSwitcher from './AppSwitcher'; 
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppSwitcher />
    </BrowserRouter>
  </React.StrictMode>
);
