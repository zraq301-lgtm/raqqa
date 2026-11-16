import React, { useRef, useState } from 'react';
import { getAdminApiToken, setAdminApiToken } from '../services/adminService';

export default function AdminTokenField({ title = 'رمز صلاحية الإدارة' }) {
  const [token, setToken] = useState(() => getAdminApiToken());
  const [message, setMessage] = useState('');
  const [showToken, setShowToken] = useState(false);
  const fileInputRef = useRef(null);

  const save = (value = token) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      setAdminApiToken('');
      setMessage('اختاري ملف الرمز أو الصقيه في الحقل أولًا.');
      return false;
    }
    setToken(trimmed);
    setAdminApiToken(trimmed);
    window.dispatchEvent(new Event('raqqa-admin-token-saved'));
    setMessage('تم تفعيل الرمز وحفظه في جلسة هذا التبويب.');
    return true;
  };

  const importFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const value = (await file.text()).trim();
      if (!value) throw new Error('الملف فارغ.');
      if (!save(value)) return;
      setMessage('تم استيراد الرمز وتفعيله من الملف لهذه الجلسة.');
    } catch (error) {
      setMessage(error.message || 'تعذر قراءة ملف الرمز.');
    } finally {
      event.target.value = '';
    }
  };

  const copy = async () => {
    const value = getAdminApiToken() || token;
    if (!value) {
      setMessage('لا يوجد رمز محفوظ لنسخه.');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setMessage('تم نسخ الرمز إلى الحافظة.');
    } catch {
      setMessage('تعذر النسخ تلقائيًا؛ أظهري الرمز وحدديه لنسخه يدويًا.');
      setShowToken(true);
    }
  };

  return (
    <details className="advanced-tools admin-token-panel" open={!getAdminApiToken()}>
      <summary>{title}</summary>
      <p className="subtle">يمكنك استيراد ملف <code>.txt</code> أو لصق الرمز مباشرة. يُحمّل تلقائيًا من جلسة هذا التبويب ويُرسل إلى Worker عبر HTTPS؛ لا يُخزّن في المتصفح بشكل دائم.</p>
      <div className="admin-form">
        <div className="field">
          <label htmlFor="shared-admin-token">رمز الإدارة</label>
          <input
            id="shared-admin-token"
            type={showToken ? 'text' : 'password'}
            autoComplete="off"
            spellCheck="false"
            value={token}
            onChange={(event) => { setToken(event.target.value); setMessage(''); }}
            placeholder="استوردي ملف الرمز أو الصقيه هنا"
          />
        </div>
        <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={importFile} hidden />
        <div className="form-grid">
          <button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>استيراد ملف الرمز</button>
          <button className="secondary-button" type="button" onClick={() => save()}>حفظ وتفعيل</button>
          <button className="secondary-button" type="button" onClick={() => setShowToken((value) => !value)}>{showToken ? 'إخفاء الرمز' : 'إظهار الرمز'}</button>
          <button className="secondary-button" type="button" onClick={copy}>نسخ الرمز</button>
        </div>
        {message && <small className="subtle" role="status">{message}</small>}
      </div>
    </details>
  );
}
