import React, { useState } from 'react';
import { Bell, Images, Palette, MessageSquare, Megaphone, GraduationCap } from 'lucide-react';
import AdManagement from './pages/AdManagement';
import UploadManager from './pages/UploadManager';
import NotificationManager from './pages/NotificationManager';
import ThemeManager from './pages/ThemeManager';
import CommunityModeration from './pages/CommunityModeration';
import TrainingManager from './pages/TrainingManager';
import './App.css';

const pages = [
  { id: 'upload', label: 'إدارة المحتوى', Icon: Images },
  { id: 'trainings', label: 'التدريبات', Icon: GraduationCap },
  { id: 'ads', label: 'الإعلانات', Icon: Megaphone },
  { id: 'theme', label: 'المظهر والاحتفالات', Icon: Palette },
  { id: 'notifications', label: 'الإشعارات', Icon: Bell },
  { id: 'community', label: 'إشراف المجتمع', Icon: MessageSquare },
];

export default function App() {
  const [activePage, setActivePage] = useState('upload');
  const page = activePage === 'ads'
    ? <AdManagement />
    : activePage === 'community'
    ? <CommunityModeration />
    : activePage === 'theme'
    ? <ThemeManager />
    : activePage === 'notifications'
      ? <NotificationManager />
      : activePage === 'trainings'
        ? <TrainingManager />
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
