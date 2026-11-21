import React, { useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  AlertCircle,
  Cloud,
  Eye,
  EyeOff,
  Megaphone,
  Plus,
  RotateCw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getAdsAdminKey,
  getAdsApiBaseUrl,
  requestAdsAdmin,
  saveAdsAdminConnection,
} from '../services/adsAdminService';

const PLACEMENTS = [
  { id: 'app_header_banner', label: 'بانر رأس التطبيق', description: 'مساحة بانر في رأس واجهة التطبيق.' },
  { id: 'app_wide_promo', label: 'مساحة ترويجية عريضة', description: 'مساحة ترويجية عريضة داخل التطبيق.' },
  { id: 'assistant_after_help', label: 'بعد المساعدة في المساعد', description: 'موضع بعد اكتمال رد المساعد.' },
  { id: 'published_content_inline', label: 'داخل المحتوى المنشور', description: 'موضع مضمّن ضمن المحتوى المنشور.' },
  { id: 'rewarded_bonus', label: 'مكافأة مقابل المشاهدة', description: 'إعلان اختياري مرتبط بمكافأة للمستخدم.' },
  { id: 'video_between_items', label: 'بين عناصر الفيديو', description: 'موضع إعلاني بين عناصر قائمة الفيديو.' },
  { id: 'video_library_banner', label: 'بانر مكتبة الفيديو', description: 'مساحة بانر ضمن مكتبة الفيديو.' },
  { id: 'video_transition_interstitial', label: 'إعلان انتقالي للفيديو', description: 'إعلان بيني عند الانتقال بين مقاطع الفيديو.' },
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const prettyDate = (value) => {
  if (!value) return 'لم يُسجّل بعد';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function AdManagement() {
  const [apiBaseUrl, setApiBaseUrl] = useState(getAdsApiBaseUrl);
  const [adminKey, setAdminKey] = useState(getAdsAdminKey);
  const [showKey, setShowKey] = useState(false);
  const [config, setConfig] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editingProvider, setEditingProvider] = useState('admob');
  const [newProviderName, setNewProviderName] = useState('');
  const [fallbackItemsText, setFallbackItemsText] = useState('[]');
  const [targetingText, setTargetingText] = useState('[]');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null);

  const providers = draft?.defaults?.providers || {};
  const providerNames = useMemo(() => Object.keys(providers), [providers]);
  const currentProvider = providers[editingProvider] || { enabled: false, placements: {} };
  const placementDefinitions = useMemo(() => {
    const definitions = new Map(PLACEMENTS.map((placement) => [placement.id, placement]));
    Object.keys(currentProvider.placements || {}).forEach((id) => {
      if (!definitions.has(id)) {
        const label = id.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
        definitions.set(id, { id, label, description: 'مساحة إعلانية إضافية يعرّفها Worker.' });
      }
    });
    return [...definitions.values()];
  }, [currentProvider.placements]);
  const enabledPlacementCount = placementDefinitions.filter(({ id }) => currentProvider.placements?.[id]?.enabled).length;
  const adsEnabled = Boolean(draft?.defaults?.ads_enabled);

  const updateDefaults = (changes) => {
    setDraft((current) => ({
      ...current,
      defaults: { ...current.defaults, ...changes },
    }));
  };

  const updateProvider = (changes) => {
    setDraft((current) => ({
      ...current,
      defaults: {
        ...current.defaults,
        providers: {
          ...current.defaults.providers,
          [editingProvider]: {
            ...(current.defaults.providers?.[editingProvider] || { enabled: false, placements: {} }),
            ...changes,
          },
        },
      },
    }));
  };

  const updatePlacement = (placementId, changes) => {
    const placement = currentProvider.placements?.[placementId] || { enabled: false, ad_unit_id: '', cooldown_seconds: 0 };
    updateProvider({
      placements: {
        ...(currentProvider.placements || {}),
        [placementId]: { ...placement, ...changes },
      },
    });
  };

  const connectAndLoad = async () => {
    setBusy('load');
    setNotice(null);
    try {
      saveAdsAdminConnection({ apiBaseUrl, adminKey });
      const result = await requestAdsAdmin(apiBaseUrl, adminKey, '/api/v1/admin/ads/config');
      const loaded = result?.config || result;
      if (!loaded?.defaults || typeof loaded.defaults !== 'object') throw new Error('استجابة الإعدادات لا تطابق مخطط متحكم الإعلانات.');
      const safeConfig = clone(loaded);
      setConfig(safeConfig);
      setDraft(clone(safeConfig));
      setFallbackItemsText(JSON.stringify(safeConfig.defaults.fallback?.items || [], null, 2));
      setTargetingText(JSON.stringify(Array.isArray(safeConfig.targeting) ? safeConfig.targeting : [], null, 2));
      const firstProvider = Object.keys(safeConfig.defaults.providers || {})[0] || 'admob';
      setEditingProvider((current) => safeConfig.defaults.providers?.[current] ? current : firstProvider);
      setNotice({ type: 'success', text: 'تم الاتصال وتحميل إعدادات الإعلانات بنجاح.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'تعذر تحميل إعدادات الإعلانات.' });
    } finally {
      setBusy('');
    }
  };

  const saveAdsConfig = async () => {
    if (!draft) return;
    setBusy('save');
    setNotice(null);
    try {
      const fallbackItems = JSON.parse(fallbackItemsText);
      if (!Array.isArray(fallbackItems)) throw new Error('يجب أن تكون عناصر الإعلانات البديلة مصفوفة JSON.');
      const provider = providers[editingProvider];
      if (!provider) throw new Error('اختاري مزودًا موجودًا أو أضيفي مزودًا جديدًا.');
      const patch = {
        ads_enabled: Boolean(draft.defaults.ads_enabled),
        active_provider: String(draft.defaults.active_provider || 'none'),
        cache_ttl_seconds: Math.max(5, Number(draft.defaults.cache_ttl_seconds) || 60),
        fallback: {
          ...(draft.defaults.fallback || {}),
          enabled: Boolean(draft.defaults.fallback?.enabled),
          type: String(draft.defaults.fallback?.type || 'none'),
          items: fallbackItems,
        },
        providers: { [editingProvider]: clone(provider) },
      };
      const result = await requestAdsAdmin(apiBaseUrl, adminKey, '/api/v1/admin/ads/config', { method: 'PATCH', body: patch });
      const saved = result?.config || { ...draft, updated_at: result?.updated_at || new Date().toISOString() };
      setConfig(clone(saved));
      setDraft(clone(saved));
      setFallbackItemsText(JSON.stringify(saved.defaults?.fallback?.items || fallbackItems, null, 2));
      setNotice({ type: 'success', text: 'تم حفظ إعدادات الإعلانات.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof SyntaxError ? 'صيغة JSON لعناصر الإعلانات البديلة غير صحيحة.' : (error.message || 'تعذر حفظ الإعدادات.') });
    } finally {
      setBusy('');
    }
  };

  const saveTargeting = async () => {
    setBusy('targeting');
    setNotice(null);
    try {
      const rules = JSON.parse(targetingText);
      if (!Array.isArray(rules)) throw new Error('يجب أن تكون قواعد الاستهداف مصفوفة JSON.');
      const result = await requestAdsAdmin(apiBaseUrl, adminKey, '/api/v1/admin/ads/targeting', { method: 'PUT', body: rules });
      const next = { ...(config || draft), targeting: result.targeting || rules, updated_at: result.updated_at || new Date().toISOString() };
      setConfig(clone(next));
      setDraft(clone(next));
      setTargetingText(JSON.stringify(next.targeting, null, 2));
      setNotice({ type: 'success', text: 'تم حفظ قواعد الاستهداف.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof SyntaxError ? 'صيغة JSON لقواعد الاستهداف غير صحيحة.' : (error.message || 'تعذر حفظ قواعد الاستهداف.') });
    } finally {
      setBusy('');
    }
  };

  const addProvider = () => {
    const name = newProviderName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
    if (!name) {
      setNotice({ type: 'error', text: 'اكتبي اسم المزود بأحرف إنجليزية أو أرقام.' });
      return;
    }
    if (providers[name]) {
      setEditingProvider(name);
      setNotice({ type: 'error', text: 'هذا المزود موجود بالفعل؛ تم اختياره للتعديل.' });
      return;
    }
    const placements = Object.fromEntries(PLACEMENTS.map(({ id }) => [id, {
      enabled: false,
      ad_unit_id: '',
      cooldown_seconds: id === 'banner' ? 0 : 60,
    }]));
    setDraft((current) => ({
      ...current,
      defaults: {
        ...current.defaults,
        providers: { ...current.defaults.providers, [name]: { enabled: false, placements } },
      },
    }));
    setEditingProvider(name);
    setNewProviderName('');
      setNotice({ type: 'success', text: `أُضيف مزود ${name} إلى المسودة. احفظي الإعدادات لتطبيقه.` });
  };

  return (
    <section className="admin-page ads-page" dir="rtl">
      <div className="admin-intro ads-intro">
        <div>
          <p className="ads-kicker"><Megaphone size={16} /> مركز التحكم</p>
          <h2>إدارة الإعلانات</h2>
          <p>تحكّمي في حالة الإعلانات ومزوديها ومواضعها واستهدافها من مكان واحد.</p>
        </div>
        <div className={`ads-status-chip ${adsEnabled ? 'is-on' : 'is-off'}`}>
          <span className="ads-status-dot" />{adsEnabled ? 'الإعلانات مفعّلة' : 'الإعلانات متوقفة'}
        </div>
      </div>

      {notice && <div className={`notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</div>}

      <article className="admin-card ads-connection-card">
        <div className="ads-card-heading">
          <div className="ads-heading-icon"><Cloud size={19} /></div>
          <div><h3>الاتصال بخدمة الإعلانات</h3><p className="card-description">اتصال مباشر بـ raqqa-ad-controller عبر HTTPS.</p></div>
          {config && <span className="ads-connected-label"><BadgeCheck size={15} /> متصل</span>}
        </div>
        <div className="form-grid ads-connection-grid">
          <div className="field">
            <label htmlFor="ads-api-url">رابط خدمة الإعلانات</label>
            <input id="ads-api-url" type="url" dir="ltr" value={apiBaseUrl} onChange={(event) => setApiBaseUrl(event.target.value)} placeholder="https://your-worker.workers.dev" autoComplete="url" />
          </div>
          <div className="field">
            <label htmlFor="ads-admin-key">مفتاح إدارة الإعلانات (ADMIN_KEY)</label>
            <div className="ads-secret-input">
              <input id="ads-admin-key" type={showKey ? 'text' : 'password'} dir="ltr" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="أدخلي مفتاح Worker الإداري" autoComplete="new-password" spellCheck="false" />
              <button className="ads-icon-button" type="button" onClick={() => setShowKey((value) => !value)} aria-label={showKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}>{showKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
        </div>
        <div className="ads-connection-footer">
          <p><ShieldCheck size={15} /> المفتاح مستقل عن رمز إدارة التطبيق، ولا يُحفظ إلا في جلسة هذا التبويب.</p>
          <button className="primary-button ads-connect-button" type="button" onClick={connectAndLoad} disabled={Boolean(busy)}>
            <RotateCw size={17} className={busy === 'load' ? 'ads-spin' : ''} />{busy === 'load' ? 'جارٍ الاتصال…' : 'اتصال وتحميل الإعدادات'}
          </button>
        </div>
      </article>

      {!draft ? (
        <div className="admin-card ads-empty-card"><div className="ads-empty-icon"><Megaphone size={24} /></div><h3>ابدئي بالاتصال بالخدمة</h3><p>أدخلي رابط Worker ومفتاحه الإداري لتحميل الإعدادات الحالية، ثم يمكنك إدارتها وحفظ تغييراتك.</p></div>
      ) : (
        <>
          <div className="ads-metrics-grid">
            <div className="ads-metric-card"><span>الحالة العامة</span><strong>{draft.defaults.ads_enabled ? 'مفعّلة' : 'متوقفة'}</strong><small>{draft.defaults.active_provider === 'none' ? 'لم يُحدد مزود نشط' : `المزود النشط: ${draft.defaults.active_provider}`}</small></div>
            <div className="ads-metric-card"><span>مواضع {editingProvider}</span><strong>{enabledPlacementCount} / {placementDefinitions.length}</strong><small>الموضع النشط حسب المزود المحدد للتعديل</small></div>
            <div className="ads-metric-card"><span>آخر تحديث</span><strong className="ads-date-value">{prettyDate(config?.updated_at || draft.updated_at)}</strong><small>مدة التخزين المؤقت: {draft.defaults.cache_ttl_seconds || 60} ثانية</small></div>
          </div>

          <article className="admin-card">
            <div className="ads-card-heading"><div className="ads-heading-icon"><SlidersHorizontal size={19} /></div><div><h3>الإعدادات العامة</h3><p className="card-description">تسري هذه الخيارات على الإعدادات الافتراضية للتطبيق.</p></div></div>
            <div className="ads-general-grid">
              <label className={`ads-toggle-row ${draft.defaults.ads_enabled ? 'selected' : ''}`}>
                <span className="ads-toggle-copy"><strong>تشغيل الإعلانات</strong><small>تفعيل أو إيقاف عرض الإعلانات للتطبيق.</small></span>
                <input type="checkbox" checked={Boolean(draft.defaults.ads_enabled)} onChange={(event) => updateDefaults({ ads_enabled: event.target.checked })} />
              </label>
              <div className="field">
                <label htmlFor="ads-active-provider">المزود النشط</label>
                <select id="ads-active-provider" value={draft.defaults.active_provider || 'none'} onChange={(event) => updateDefaults({ active_provider: event.target.value })}>
                  <option value="none">بدون مزود</option>
                  {providerNames.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ads-cache-ttl">التخزين المؤقت (ثانية)</label>
                <input id="ads-cache-ttl" type="number" min="5" max="86400" value={draft.defaults.cache_ttl_seconds ?? 60} onChange={(event) => updateDefaults({ cache_ttl_seconds: event.target.value })} />
                <small className="subtle">الحد الأدنى لدى الخدمة 5 ثوانٍ.</small>
              </div>
            </div>
          </article>

          <article className="admin-card">
            <div className="ads-card-heading"><div className="ads-heading-icon"><Activity size={19} /></div><div><h3>المزود والوحدات الإعلانية</h3><p className="card-description">اختاري مزودًا لتعديل حالته ومعرّفات الوحدات الخاصة به.</p></div></div>
            <div className="ads-provider-toolbar">
              <div className="field ads-provider-select"><label htmlFor="ads-edit-provider">المزود الجاري تعديله</label><select id="ads-edit-provider" value={editingProvider} onChange={(event) => setEditingProvider(event.target.value)}>{providerNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
              <label className={`ads-toggle-row ads-provider-toggle ${currentProvider.enabled ? 'selected' : ''}`}><span className="ads-toggle-copy"><strong>تفعيل هذا المزود</strong><small>يجب أن يكون المزود نشطًا حتى تعمل وحداته.</small></span><input type="checkbox" checked={Boolean(currentProvider.enabled)} onChange={(event) => updateProvider({ enabled: event.target.checked })} /></label>
            </div>
            <div className="ads-placement-grid">
              {placementDefinitions.map(({ id, label, description }) => {
                const placement = currentProvider.placements?.[id] || { enabled: false, ad_unit_id: '', cooldown_seconds: 0 };
                return (
                  <section className="ads-placement-card" key={id}>
                    <div className="ads-placement-top"><div><h4>{label}</h4><p>{description}</p></div><label className="ads-switch" aria-label={`تفعيل ${label}`}><input type="checkbox" checked={Boolean(placement.enabled)} onChange={(event) => updatePlacement(id, { enabled: event.target.checked })} /><span /></label></div>
                    <div className="field"><label htmlFor={`ads-unit-${id}`}>معرّف الوحدة الإعلانية</label><input id={`ads-unit-${id}`} dir="ltr" value={placement.ad_unit_id || ''} onChange={(event) => updatePlacement(id, { ad_unit_id: event.target.value })} placeholder={`${editingProvider}/${id}`} /></div>
                    <div className="field"><label htmlFor={`ads-cooldown-${id}`}>فترة الانتظار (ثانية)</label><input id={`ads-cooldown-${id}`} type="number" min="0" max="86400" value={placement.cooldown_seconds ?? 0} onChange={(event) => updatePlacement(id, { cooldown_seconds: Number(event.target.value) || 0 })} /></div>
                  </section>
                );
              })}
            </div>
            <div className="ads-add-provider">
              <div className="field"><label htmlFor="ads-new-provider">إضافة مزود آخر</label><input id="ads-new-provider" dir="ltr" value={newProviderName} onChange={(event) => setNewProviderName(event.target.value)} placeholder="مثال: network_name" /></div>
              <button className="secondary-button" type="button" onClick={addProvider}><Plus size={17} />إضافة للمسودة</button>
            </div>
          </article>

          <article className="admin-card">
            <div className="ads-card-heading"><div className="ads-heading-icon"><Megaphone size={19} /></div><div><h3>الإعلانات البديلة</h3><p className="card-description">تُستخدم عند تفعيل fallback في إعدادات الخدمة.</p></div></div>
            <div className="ads-general-grid ads-fallback-grid">
              <label className={`ads-toggle-row ${draft.defaults.fallback?.enabled ? 'selected' : ''}`}><span className="ads-toggle-copy"><strong>تفعيل البدائل</strong><small>السماح بإرجاع عناصر بديلة عند الحاجة.</small></span><input type="checkbox" checked={Boolean(draft.defaults.fallback?.enabled)} onChange={(event) => updateDefaults({ fallback: { ...draft.defaults.fallback, enabled: event.target.checked } })} /></label>
              <div className="field"><label htmlFor="ads-fallback-type">نوع البديل</label><select id="ads-fallback-type" value={draft.defaults.fallback?.type || 'none'} onChange={(event) => updateDefaults({ fallback: { ...draft.defaults.fallback, type: event.target.value } })}><option value="none">بدون</option><option value="internal">داخلي</option></select></div>
            </div>
            <div className="field ads-json-field"><label htmlFor="ads-fallback-items">عناصر الإعلانات البديلة (JSON)</label><textarea id="ads-fallback-items" dir="ltr" rows="5" spellCheck="false" value={fallbackItemsText} onChange={(event) => setFallbackItemsText(event.target.value)} /></div>
          </article>

          <article className="admin-card">
            <div className="ads-card-heading"><div className="ads-heading-icon"><SlidersHorizontal size={19} /></div><div><h3>قواعد الاستهداف</h3><p className="card-description">تُطبّق القواعد بالترتيب على المنصة وإصدار التطبيق وحالة المستخدم.</p></div></div>
            <div className="ads-targeting-hint"><AlertCircle size={16} /><span>أدخلي مصفوفة JSON. مثال: <code dir="ltr">[{`{"match":{"platform":"android"},"overrides":{"ads_enabled":false}}`}]</code></span></div>
            <div className="field ads-json-field"><label htmlFor="ads-targeting-json">قواعد الاستهداف (JSON)</label><textarea id="ads-targeting-json" dir="ltr" rows="7" spellCheck="false" value={targetingText} onChange={(event) => setTargetingText(event.target.value)} /></div>
            <div className="ads-targeting-actions"><button className="secondary-button" type="button" onClick={() => setTargetingText(JSON.stringify(config?.targeting || [], null, 2))}>إلغاء تعديلات الاستهداف</button><button className="secondary-button" type="button" onClick={saveTargeting} disabled={Boolean(busy)}><Save size={16} />{busy === 'targeting' ? 'جارٍ الحفظ…' : 'حفظ قواعد الاستهداف'}</button></div>
          </article>

          <div className="ads-save-bar">
            <div><strong>تغييرات الإعدادات العامة والمزود</strong><small>لن تُطبّق حتى تحفظيها. يتطلب ذلك اتصالًا صالحًا بالخدمة.</small></div>
            <button className="primary-button" type="button" onClick={saveAdsConfig} disabled={Boolean(busy)}><Save size={17} />{busy === 'save' ? 'جارٍ الحفظ…' : 'حفظ إعدادات الإعلانات'}</button>
          </div>
        </>
      )}
    </section>
  );
}
