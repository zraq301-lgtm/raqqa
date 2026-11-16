import React, { useState } from 'react';
import { Bell, Images, Palette } from 'lucide-react';
import UploadManager from './pages/UploadManager';
import NotificationManager from './pages/NotificationManager';
import ThemeManager from './pages/ThemeManager';
import './App.css';

const pages = [
  { id: 'upload', label: 'إدارة المحتوى', Icon: Images },
  { id: 'theme', label: 'المظهر والاحتفالات', Icon: Palette },
  { id: 'notifications', label: 'الإشعارات', Icon: Bell },
];

export default function App() {
  const [activePage, setActivePage] = useState('upload');
  const page = activePage === 'theme'
    ? <ThemeManager />
    : activePage === 'notifications'
      ? <NotificationManager />
      : <UploadManager />;

  return (
    <div className="app-container" dir="rtl">
      <header className="admin-header">
        <div className="brand-mark"><span>ر</span></div>
        <div><p className="eyebrow">لوحة الإدارة</p><h1>رِقّة</h1></div>
        <span className="header-chip">إدارة التطبيق</span>
      </header>
      <main className="page-content">{page}</main>
      <nav className="bottom-nav" aria-label="التنقل في لوحة الإدارة">
        {pages.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => setActivePage(id)} className={`nav-item ${activePage === id ? 'active' : ''}`} aria-current={activePage === id ? 'page' : undefined}>
            <Icon size={21} strokeWidth={activePage === id ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
