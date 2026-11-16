import React, { useState } from 'react';
import { getAdminApiToken, setAdminApiToken } from '../services/adminService';

export default function AdminTokenField() {
  const [token, setToken] = useState(() => getAdminApiToken());
  const [message, setMessage] = useState('');

  const save = () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setAdminApiToken('');
      setMessage('أدخلي رمز الإدارة أولًا.');
      return;
    }
    setAdminApiToken(trimmed);
    window.dispatchEvent(new Event('raqqa-admin-token-saved'));
    setMessage('تم حفظ الرمز في جلسة هذا التبويب.');
  };

  return (
    <details className="advanced-tools admin-token-panel" open={!getAdminApiToken()}>
      <summary>صلاحية الإدارة للكتابة والرفع</summary>
      <p className="subtle">أدخلي قيمة <code>ADMIN_API_TOKEN</code> المضبوطة في Cloudflare Worker. تُحفظ في جلسة هذا التبويب فقط وتُرسل عبر HTTPS.</p>
      <div className="admin-form">
        <div className="field">
          <label htmlFor="shared-admin-token">رمز الإدارة</label>
          <input
            id="shared-admin-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => { setToken(event.target.value); setMessage(''); }}
            placeholder="أدخلي رمز الإدارة"
          />
        </div>
        <button className="secondary-button" type="button" onClick={save}>حفظ الرمز في الجلسة</button>
        {message && <small className="subtle" role="status">{message}</small>}
      </div>
    </details>
  );
}
