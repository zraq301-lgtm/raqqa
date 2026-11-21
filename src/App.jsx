import { cloudflarePost } from './services/apiClient';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { CapacitorHttp } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { apiUrl } from './config/apiConfig';

// استيراد مكون الإعلان الجديد
import AdBanner from './components/AdBanner';

// استيراد خاصية فيربيس
import { applyRemoteSettings } from "./firebase-config";

// استيراد الصفحات
import Health from './pages/Health';
import Feelings from './pages/Feelings';
import Intimacy from './pages/Intimacy';
import Swing from './pages/Swing';
import Insight from './pages/Insight';
import QueenPage from './pages/QueenPage';
import Videos from './pages/Videos';
import VirtualWorld from './pages/VirtualWorld';
import ProfileEditor from './components/ProfileEditor';
import TopPageCarousel from './components/TopPageCarousel';
import { useAppTheme } from './components/AppThemeProvider';
import { pageImages } from './config/assetUrls';

import './App.css';

/**
 * وظيفة لضمان صعود التمرير للأعلى عند تغيير الصفحة
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function DatePickerEnhancer() {
  useEffect(() => {
    const openDatePicker = (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== 'date' || input.disabled) return;
      input.focus({ preventScroll: true });
      if (typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch { /* بعض المتصفحات لا تسمح بالفتح البرمجي */ }
      }
    };
    document.addEventListener('click', openDatePicker, true);
    return () => document.removeEventListener('click', openDatePicker, true);
  }, []);
  return null;
}

/**
 * مكون النصيحة الذكية (TipOverlay)
 */
function TipOverlay() {
  const [tip, setTip] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const checkAndShowTip = async () => {
      const today = new Date().toLocaleDateString();
      const tipData = JSON.parse(localStorage.getItem('raqqa_tip_tracker') || '{"date":"","count":0}');

      if (tipData.date !== today) {
        tipData.date = today;
        tipData.count = 0;
      }

      if (tipData.count < 2) {
        try {
          const response = await fetch(apiUrl('api/tips'));
          const data = await response.json();
          if (data.content) {
            setTip(data.content);
            setIsVisible(true);
            tipData.count += 1;
            localStorage.setItem('raqqa_tip_tracker', JSON.stringify(tipData));
            setTimeout(() => setIsVisible(false), 20000);
          }
        } catch (err) {
          console.error("Tip Fetch Error:", err);
        }
      }
    };
    checkAndShowTip();
  }, [pathname]);

  if (!isVisible || !tip) return null;

  const renderContent = () => {
    const content = tip.trim();
    if (content.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return <img src={content} alt="رقة نصيحة" className="tip-media-content" />;
    }
    if (content.includes('youtube.com') || content.includes('youtu.be')) {
      let videoId = content.split('v=')[1] || content.split('/').pop();
      if (videoId.includes('&')) videoId = videoId.split('&')[0];
      return (
        <div className="tip-video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
            title="فيديو رقة"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    return <p className="tip-text-content">{tip}</p>;
  };

  return (
    <div className="tip-card-overlay" onClick={() => setIsVisible(false)}>
      <div className="tip-card-content" onClick={(e) => e.stopPropagation()}>
        <div className="tip-header">
          <span className="tip-icon">💡 كوني ملكة</span>
          <button className="tip-close-btn" onClick={() => setIsVisible(false)}>×</button>
        </div>
        <div className="tip-body">{renderContent()}</div>
        <div className="tip-timer-bar"></div>
      </div>
    </div>
  );
}

function App({ user, onUserUpdated }) {
  const location = useLocation();
  const appTheme = useAppTheme();
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const profileName = user?.display_name || user?.displayName || user?.firebaseUser?.displayName || 'حسابي';
  const profilePhoto = user?.photo_url || user?.photoURL || user?.firebaseUser?.photoURL;
  const pageLabel = (key, fallback) => appTheme.pages?.[key]?.label?.trim() || fallback;
  const healthSection = new URLSearchParams(location.search).get('section');
  const activePageKey = location.pathname === '/health' && healthSection ? `health.${healthSection}` : ({ '/health': 'health', '/feelings': 'feelings', '/intimacy': 'intimacy', '/swing-forum': 'swing', '/insight': 'insight', '/videos': 'videos', '/virtual-world': 'virtualWorld' }[location.pathname] || 'health');
  const activePageTheme = appTheme.pages?.[activePageKey] || {};
  const isSwingPage = location.pathname === '/swing-forum';
  const isHealthSubpage = location.pathname === '/health' && Boolean(healthSection);
  const activeBackground = activePageTheme.backgroundColor || appTheme.backgroundColor;
  const activeFont = activePageTheme.fontFamily || appTheme.fontFamily;
  useEffect(() => {
    document.title = profileName && profileName !== 'حسابي' ? `رقة — ${profileName}` : 'رقة';
  }, [profileName]);

  // --- إنشاء قناة الإشعارات للصوت والأولوية القصوى ---
  useEffect(() => {
    const initNotifications = async () => {
      applyRemoteSettings();
      try {
        await LocalNotifications.createChannel({
          id: 'raqqa_main_channel',
          name: 'إشعارات رقة الذكية',
          description: 'تنبيهات الصحة، المشاعر، والمواعيد الخاصة بكِ',
          importance: 5, // أقصى أهمية للصوت والظهور المنبثق
          visibility: 1,
          sound: 'default', // تفعيل الصوت الافتراضي
          vibration: true,
        });
        console.log("✅ تم إنشاء قناة إشعارات رقة بنجاح");
      } catch (e) {
        console.error("Channel creation error", e);
      }
    };
    initNotifications();
  }, []);

  // --- نظام المزامنة والجدولة المحلية المتطور ---
  const syncNotifications = useCallback(async () => {
    try {
      const localData = localStorage.getItem('raqqa_local_reminders');
      if (!localData) return;

      const reminders = JSON.parse(localData);
      const now = new Date();

      // 1. تنظيف تلقائي: الاحتفاظ فقط بالإشعارات المستقبلية في الـ localStorage وحذف القديمة
      const activeReminders = reminders.filter(rem => new Date(rem.scheduled_for) > now);
      localStorage.setItem('raqqa_local_reminders', JSON.stringify(activeReminders));

      // --- إرسال البيانات ومزامنتها مع قاعدة بيانات نيون (Neon DB) عبر الـ API الجديد ---

      if (activeReminders.length > 0) {
        const syncOptions = {
          url: apiUrl('api/sync/notifications'),
          headers: { 'Content-Type': 'application/json' },
          data: {
            target: 'notifications',
            targetTable: 'offline_events', // أو الجدول المخصص للإشعارات التذكيرية في سكيما المستخدم
            localData: activeReminders
          }
        };

        cloudflarePost(syncOptions)
          .then(res => console.log("🌐 تمت مزامنة إشعارات الأندرويد مع الخادم الحتّي ونبون بنجاح:", res.data))
          .catch(err => console.error("❌ فشل إرسال بيانات المزامنة إلى الخادم:", err));
      }

      const perms = await LocalNotifications.checkPermissions();
      if (perms.display !== 'granted') {
        const requested = await LocalNotifications.requestPermissions();
        if (requested.display !== 'granted') {
          console.warn('⚠️ تم رفض إذن الإشعارات المحلية');
          return;
        }
      }

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      // 2. جدولة الإشعارات النشطة والمستقبلية فقط في نظام الأندرويد
      const notificationsToSchedule = activeReminders.map(rem => {
        // --- استخدام المسار الداخلي من مجلد public لضمان العمل بدون نت ---
        let iconName = 'default.png';
        const title = rem.title || "";

        if (title.includes('صحة') || title.includes('دورة') || title.includes('تحليل')) {
          iconName = 'health.png';
        } else if (title.includes('مشاعر') || title.includes('قلق') || title.includes('مزاج')) {
          iconName = 'feelings.png';
        } else if (title.includes('حميمية')) {
          iconName = 'intimacy.png';
        } else if (title.includes('أرجوحة') || title.includes('منتدى')) {
          iconName = 'swing.png';
        } else if (title.includes('إشراقة') || title.includes('نصيحة')) {
          iconName = 'insight.png';
        }

        const finalPath = `res://public/notifications/${iconName}`;

        const stableId = [...String(rem.id || rem.scheduled_for || rem.title)].reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7) || 7;
        return {
          id: stableId,
          title: rem.title,
          body: rem.body,
          schedule: { at: new Date(rem.scheduled_for) },
          channelId: 'raqqa_main_channel',
          sound: 'default',
          smallIcon: 'ic_stat_name',
          largeIcon: finalPath,
          extra: { report: rem.body }
        };
      });

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        console.log("✅ تمت جدولة التقارير المحلية النشطة بنجاح وحذف المنتهية.");
      }
    } catch (err) {
      console.error("Local Notification Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    syncNotifications();

    const handleTrigger = () => {
      console.log("🔔 استقبال طلب مزامنة فوري للتقرير...");
      syncNotifications();
    };
    window.addEventListener('trigger_sync_notifications', handleTrigger);

    const setupBackButton = async () => {
      return await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    };
    const listener = setupBackButton();

    return () => {
      window.removeEventListener('trigger_sync_notifications', handleTrigger);
      listener.then(l => l.remove());
    };
  }, [syncNotifications, location.pathname]);

  return (
    <div className="app-container main-page-theme" style={{ '--main-theme-color': activeBackground, '--page-accent-color': activePageTheme.accentColor || appTheme.accentColor, '--page-text-color': activePageTheme.textColor || '#352d31', '--page-font-family': `'${activeFont}', sans-serif`, '--page-background-image': activePageTheme.backgroundImageUrl ? `url("${activePageTheme.backgroundImageUrl}")` : 'none' }}>
      <ScrollToTop />
      <DatePickerEnhancer />
      <TipOverlay />
      {profileEditorOpen && <ProfileEditor user={user} onUpdated={onUserUpdated} onClose={() => setProfileEditorOpen(false)} />}

      <header className="main-app-header">
        <button className="profile-summary" onClick={() => setProfileEditorOpen(true)} aria-label="تعديل ملفك الشخصي">
          {profilePhoto ? <img src={profilePhoto} alt={profileName} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} /> : <span style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#fce7f3' }}>♡</span>}
          <span>{profileName}</span>
        </button>
        <Link to="/videos" className="header-library-button" aria-label="فتح مكتبة الفيديوهات">
          <img src={appTheme.pages?.videos?.iconImageUrl || pageImages.videos} alt="" />
          <span>{pageLabel('videos', 'مكتبة الفيديوهات')}</span>
        </Link>
        <Link to="/virtual-world" className="header-library-button" aria-label="فتح عالم رقة">
          <img src={appTheme.pages?.virtualWorld?.iconImageUrl || pageImages.virtual} alt="" />
          <span>{pageLabel('virtualWorld', 'عالم رقة')}</span>
        </Link>
      </header>

      <div className="global-ad-container" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
          <AdBanner />
      </div>
      {!isSwingPage && !isHealthSubpage && <TopPageCarousel />}

      <main className={`main-content${isSwingPage ? ' main-content--swing' : ''}`} style={{ backgroundColor: activeBackground, backgroundImage: activePageTheme.backgroundImageUrl ? `linear-gradient(rgba(255,255,255,.86),rgba(255,255,255,.86)),url("${activePageTheme.backgroundImageUrl}")` : undefined, backgroundSize: 'cover', color: activePageTheme.textColor || undefined, fontFamily: `'${activeFont}', sans-serif` }}>
        <Routes>
          <Route path="/" element={<Navigate to="/health" />} />
          <Route path="/health" element={<Health />} />
          <Route path="/feelings" element={<Feelings />} />
          <Route path="/intimacy" element={<Intimacy />} />
          <Route path="/swing-forum" element={<Swing user={user} />} />
          <Route path="/insight" element={<Insight />} />
          <Route path="/queen/adhkar" element={<QueenPage mode="adhkar" />} />
          <Route path="/queen/quran" element={<QueenPage mode="quran" />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/virtual-world" element={<VirtualWorld />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
