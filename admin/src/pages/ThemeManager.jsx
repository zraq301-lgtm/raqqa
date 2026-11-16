import React, { useEffect, useState } from 'react';
import { getAdminApiToken, getAppTheme, saveAppTheme } from '../services/adminService';
import AdminTokenField from '../components/AdminTokenField';

const defaults = {
  primaryColor: '#e94d7b',
  accentColor: '#c93764',
  backgroundColor: '#fff8fa',
  fontFamily: 'Tajawal',
  pages: {
    health: { label: 'صحتك', icon: '🩺' },
    feelings: { label: 'المشاعر', icon: '🌸' },
    intimacy: { label: 'الحميمية', icon: '💗' },
    swing: { label: 'الأرجوحة', icon: '🌿' },
    insight: { label: 'الإشراقة', icon: '💡' },
    videos: { label: 'مكتبة الفيديوهات', icon: '🎬' },
    virtualWorld: { label: 'عالم رقة', icon: '🌌' },
    'health.menstrual': { label: 'الحيض', icon: '🌙' },
    'health.advice': { label: 'نصيحة طبيب', icon: '🩺' },
    'health.pregnancy': { label: 'الحمل', icon: '💗' },
    'health.motherhood': { label: 'الأمومة', icon: '🌸' },
    'health.doctor': { label: 'الطبيب', icon: '🩺' },
    'health.fitness': { label: 'الرشاقة', icon: '🌿' },
    'health.lactation': { label: 'الرضاعة', icon: '🍼' },
    'swing.Home': { label: 'الرئيسية', icon: '🏠' },
    'swing.EleganceIcon': { label: 'أيقونة الأناقة', icon: '✨' },
    'swing.PassionsCrafts': { label: 'شغف وحرف', icon: '🎨' },
    'swing.MotherhoodHaven': { label: 'ملاذ الأمومة', icon: '🍼' },
    'swing.WellnessOasis': { label: 'واحة العافية', icon: '🌿' },
    'swing.CulinaryArts': { label: 'فنون الطهي', icon: '🍳' },
    'swing.EmpowermentPaths': { label: 'دروب التمكين', icon: '🚀' },
    'swing.HomeCorners': { label: 'زوايا المنزل', icon: '🏡' },
    'swing.SoulsLounge': { label: 'رواق الأرواح', icon: '🌙' },
    'swing.LittleOnesAcademy': { label: 'أكاديمية الصغار', icon: '🧸' },
  },
  celebration: { type: 'none', endAt: null },
};

const mainPages = [
  ['health', 'الصحة'], ['feelings', 'المشاعر'], ['intimacy', 'الحميمية'], ['swing', 'الأرجوحة'],
  ['insight', 'الإشراقة'], ['videos', 'مكتبة الفيديوهات'], ['virtualWorld', 'عالم رقة'],
];
const healthPages = [
  ['health.menstrual', 'الحيض'], ['health.advice', 'نصيحة طبيب'], ['health.pregnancy', 'الحمل'],
  ['health.motherhood', 'الأمومة'], ['health.doctor', 'الطبيب'], ['health.fitness', 'الرشاقة'], ['health.lactation', 'الرضاعة'],
];
const swingPages = [
  ['swing.Home', 'الرئيسية'], ['swing.EleganceIcon', 'أيقونة الأناقة'], ['swing.PassionsCrafts', 'شغف وحرف'],
  ['swing.MotherhoodHaven', 'ملاذ الأمومة'], ['swing.WellnessOasis', 'واحة العافية'], ['swing.CulinaryArts', 'فنون الطهي'],
  ['swing.EmpowermentPaths', 'دروب التمكين'], ['swing.HomeCorners', 'زوايا المنزل'], ['swing.SoulsLounge', 'رواق الأرواح'],
  ['swing.LittleOnesAcademy', 'أكاديمية الصغار'],
];
const fontOptions = ['Tajawal', 'Cairo', 'Almarai', 'Noto Naskh Arabic', 'Changa'];
const iconOptions = ['🌷', '♡', '♥', '🌸', '✨', '⭐', '🌙', '🌿', '🍼', '🎨', '🚀', '🧸', '🍳', '🏡', '🏠', '🎬', '🌌', '💡', '💗', '🪷', '📚', '🩺', '💬', '🧘'];
const celebrationOptions = [
  ['none', 'بدون مؤثرات'], ['hearts', 'قلوب متطايرة'], ['stars', 'نجوم لامعة'],
  ['hearts-stars', 'قلوب ونجوم'], ['confetti', 'قصاصات احتفال'],
];

function mergeSettings(remote) {
  return {
    ...defaults,
    ...(remote || {}),
    pages: Object.fromEntries(Object.entries(defaults.pages).map(([key, page]) => [key, { ...page, ...(remote?.pages?.[key] || {}) }])),
    celebration: { ...defaults.celebration, ...(remote?.celebration || {}) },
  };
}

function todayEndIso() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

export default function ThemeManager() {
  const [settings, setSettings] = useState(defaults);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAppTheme()
      .then((remote) => { if (active) setSettings(mergeSettings(remote)); })
      .catch(() => { if (active) setMessage({ type: 'error', text: 'تعذر تحميل المظهر الحالي؛ يمكنكِ ضبطه ثم حفظه.' }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updatePage = (key, field, value) => {
    setSettings((current) => ({
      ...current,
      pages: { ...current.pages, [key]: { ...current.pages[key], [field]: value } },
    }));
  };

  const persist = async (next, successText) => {
    if (!getAdminApiToken()) {
      setMessage({ type: 'error', text: 'أدخلي رمز الإدارة واحفظيه أولًا.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const saved = await saveAppTheme(next);
      setSettings(mergeSettings(saved));
      setMessage({ type: 'success', text: successText });
    } catch (error) {
      const reason = error.message === 'admin_authorization_required' ? 'رمز الإدارة غير صحيح.' : error.message;
      setMessage({ type: 'error', text: reason || 'تعذر حفظ الإعدادات.' });
    } finally {
      setSaving(false);
    }
  };

  const saveDesign = () => persist(settings, 'تم حفظ ألوان التطبيق وخلفيته وخطه وأسماء وأيقونات الصفحات.');
  const startCelebration = () => {
    if (settings.celebration.type === 'none') {
      setMessage({ type: 'error', text: 'اختاري نوع المؤثرات أولًا.' });
      return;
    }
    const next = { ...settings, celebration: { type: settings.celebration.type, endAt: todayEndIso() } };
    setSettings(next);
    persist(next, 'بدأ احتفال اليوم وسيُوقف تلقائيًا عند منتصف الليل حسب توقيت الجهاز.');
  };
  const stopCelebration = () => {
    const next = { ...settings, celebration: { type: 'none', endAt: null } };
    setSettings(next);
    persist(next, 'تم إيقاف المؤثرات.');
  };

  const renderPageRows = (pages, group) => (
    <div className="theme-page-grid">
      {pages.map(([key, fallbackLabel]) => (
        <div className="theme-page-row" key={key}>
          <strong>{fallbackLabel}</strong>
          <label className="field">
            <span>اسم العرض</span>
            <input maxLength={32} value={settings.pages[key]?.label || ''} onChange={(event) => updatePage(key, 'label', event.target.value)} aria-label={`اسم ${fallbackLabel}`} />
          </label>
          <label className="field theme-icon-field">
            <span>الأيقونة</span>
            <select value={settings.pages[key]?.icon || ''} onChange={(event) => updatePage(key, 'icon', event.target.value)} aria-label={`أيقونة ${fallbackLabel}`}>
              {iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h2>المظهر والاحتفالات</h2>
        <p>إدارة الألوان والخلفية والخط وأيقونات وأسماء صفحات التطبيق. تختفي مؤثرات الاحتفال تلقائيًا في نهاية اليوم.</p>
      </div>
      {message && <div className={`notice ${message.type}`} role="status">{message.text}</div>}
      <AdminTokenField />
      {loading ? <div className="empty-state">جارٍ تحميل إعدادات التطبيق…</div> : (
        <>
          <section className="admin-card">
            <h3>ألوان التطبيق والخط</h3>
            <p className="card-description">تُطبّق التغييرات على التطبيق العام بعد الحفظ ومزامنة OTA أو إعادة فتح التطبيق.</p>
            <div className="form-grid theme-color-grid">
              <label className="field"><span>اللون الأساسي</span><input type="color" value={settings.primaryColor} onChange={(event) => setSettings((current) => ({ ...current, primaryColor: event.target.value }))} /></label>
              <label className="field"><span>لون التمييز</span><input type="color" value={settings.accentColor} onChange={(event) => setSettings((current) => ({ ...current, accentColor: event.target.value }))} /></label>
              <label className="field"><span>لون الخلفية</span><input type="color" value={settings.backgroundColor} onChange={(event) => setSettings((current) => ({ ...current, backgroundColor: event.target.value }))} /></label>
              <label className="field"><span>نوع الخط</span><select value={settings.fontFamily} onChange={(event) => setSettings((current) => ({ ...current, fontFamily: event.target.value }))}>{fontOptions.map((font) => <option key={font} value={font}>{font}</option>)}</select></label>
            </div>
          </section>
          <section className="admin-card">
            <h3>أسماء وأيقونات الصفحات الرئيسية</h3>
            <p className="card-description">عدّلي التسمية التي تظهر في التنقل، واكتبي رمزًا تعبيريًا للأيقونة مثل 🌷 أو ⭐.</p>
            {renderPageRows(mainPages, 'main')}
          </section>
          <section className="admin-card">
            <h3>أقسام الصحة الفرعية</h3>
            <p className="card-description">تُضبط هذه المسميات والأيقونات على بطاقات أقسام الصحة.</p>
            {renderPageRows(healthPages, 'health')}
          </section>
          <section className="admin-card">
            <h3>تبويبات الأرجوحة</h3>
            <p className="card-description">تغيير الأسماء والأيقونات هنا يخص واجهة التطبيق، أما نشر المقالات والفيديوهات فيكون من تبويب إدارة المحتوى.</p>
            {renderPageRows(swingPages, 'swing')}
          </section>
          <section className="admin-card">
            <h3>احتفال اليوم</h3>
            <p className="card-description">اختاري قلوبًا أو نجومًا أو مؤثرات احتفال؛ تنتهي تلقائيًا عند نهاية اليوم المحلي.</p>
            <div className="field">
              <label htmlFor="celebration-type">المؤثرات</label>
              <select id="celebration-type" value={settings.celebration.type} onChange={(event) => setSettings((current) => ({ ...current, celebration: { type: event.target.value, endAt: null } }))}>
                {celebrationOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className="theme-actions">
              <button className="primary-button" type="button" disabled={saving} onClick={startCelebration}>{saving ? 'جارٍ الحفظ…' : 'بدء احتفال اليوم'}</button>
              <button className="secondary-button" type="button" disabled={saving} onClick={stopCelebration}>إيقاف المؤثرات</button>
            </div>
          </section>
          <button className="primary-button theme-save-button" type="button" disabled={saving} onClick={saveDesign}>{saving ? 'جارٍ الحفظ…' : 'حفظ إعدادات المظهر'}</button>
        </>
      )}
    </div>
  );
}
