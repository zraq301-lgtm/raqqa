import React, { useState } from 'react';
import {
  broadcastNotification,
  getAdminApiToken,
  setAdminApiToken,
  uploadImage,
} from '../services/adminService';

const notificationErrors = {
  admin_api_token_not_configured: 'رمز الإدارة غير مضبوط في Worker. لا يمكن إرسال الإشعار الآن.',
  admin_authorization_required: 'رمز الإدارة غير صحيح. راجعي الرمز المحفوظ وحاولي مجددًا.',
  fcm_not_configured: 'اعتماد Firebase للإرسال غير مضبوط بعد في Worker.',
  fcm_credentials_invalid: 'اعتماد Firebase في Worker غير صالح أو غير مكتمل.',
  fcm_project_id_mismatch: 'معرّف مشروع Firebase لا يطابق اعتماد الإرسال.',
  notification_fields_required: 'أدخلي عنوان الإشعار ونص الرسالة.',
  notification_image_url_invalid: 'رابط صورة الإشعار يجب أن يبدأ بـ HTTPS.',
  fcm_send_failed: 'تعذر إرسال الإشعار إلى Firebase. حاولي لاحقًا.',
};

export default function NotificationManager() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [adminToken, setAdminToken] = useState(() => getAdminApiToken());
  const [tokenSaved, setTokenSaved] = useState(() => Boolean(getAdminApiToken()));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const saveToken = () => {
    const token = adminToken.trim();
    if (!token) {
      setAdminApiToken('');
      setTokenSaved(false);
      setMessage({ type: 'error', text: 'أدخلي رمز الإدارة أولًا.' });
      return;
    }
    setAdminApiToken(token);
    setTokenSaved(true);
    setMessage({ type: 'success', text: 'تم حفظ الرمز لهذا التبويب فقط.' });
  };

  const uploadSelectedImage = async (file) => {
    setImageFile(file || null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'يرجى اختيار ملف صورة صالح.' });
      return;
    }
    if (file.size > 1_000_000) {
      setMessage({ type: 'error', text: 'حجم صورة الإشعار يجب ألا يتجاوز 1 ميجابايت حتى تظهر على أجهزة Android.' });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const result = await uploadImage(file, 'all_users');
      const url = result.url || result.publicUrl || result.data?.url || '';
      if (!url) throw new Error('تعذر الحصول على رابط الصورة.');
      setImageUrl(url);
      setMessage({ type: 'success', text: 'تم رفع الصورة وتجهيزها للإشعار.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'تعذر رفع الصورة.' });
    } finally {
      setUploading(false);
    }
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) {
      setMessage({ type: 'error', text: 'أدخلي عنوان الإشعار ونص الرسالة.' });
      return;
    }
    if (!getAdminApiToken()) {
      setMessage({ type: 'error', text: 'أدخلي رمز الإدارة واحفظيه قبل الإرسال.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await broadcastNotification({
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim(),
      });
      setMessage({ type: 'success', text: result?.message || 'تم إرسال الإشعار إلى الأجهزة.' });
      setTitle('');
      setBody('');
      setImageUrl('');
      setImageFile(null);
      const fileInput = document.getElementById('notification-image-file');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      const text = notificationErrors[error.message] || error.message || 'تعذر إرسال الإشعار.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h2>إرسال إشعار</h2>
        <p>أرسلي رسالة إلى جميع الأجهزة المشتركة في التطبيق، مع صورة اختيارية.</p>
      </div>
      {message && <div className={`notice ${message.type}`} role="status">{message.text}</div>}

      <details className="advanced-tools" open={!tokenSaved}>
        <summary>رمز الإدارة للإرسال الآمن</summary>
        <p className="subtle">أدخلي القيمة المسجلة في Cloudflare Worker باسم <code>ADMIN_API_TOKEN</code>. يُحفظ الرمز في جلسة هذا التبويب فقط، ويُرسل إلى Worker عبر HTTPS.</p>
        <div className="admin-form">
          <div className="field">
            <label htmlFor="admin-api-token">رمز الإدارة</label>
            <input
              id="admin-api-token"
              type="password"
              autoComplete="off"
              value={adminToken}
              onChange={(event) => { setAdminToken(event.target.value); setTokenSaved(false); }}
              placeholder="أدخلي رمز الإدارة"
            />
          </div>
          <button className="secondary-button" type="button" onClick={saveToken}>حفظ الرمز في هذه الجلسة</button>
        </div>
      </details>

      <section className="admin-card">
        <h3>إشعار لجميع المستخدمين</h3>
        <p className="card-description">اكتبي عنوانًا واضحًا ورسالة مختصرة. الصورة اختيارية.</p>
        <form className="admin-form" onSubmit={sendNotification}>
          <div className="field">
            <label htmlFor="notification-title">عنوان الإشعار</label>
            <input id="notification-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="مثال: محتوى جديد في رِقّة" required />
          </div>
          <div className="field">
            <label htmlFor="notification-body">نص الرسالة</label>
            <textarea id="notification-body" rows="5" value={body} onChange={(event) => setBody(event.target.value)} placeholder="اكتبي الرسالة التي ستصل للمستخدمين" required />
          </div>
          <div className="field">
            <label htmlFor="notification-image-file">صورة من الجهاز (اختياري)</label>
            <input id="notification-image-file" type="file" accept="image/*" onChange={(event) => uploadSelectedImage(event.target.files?.[0] || null)} />
            {uploading && <small className="subtle">جارٍ رفع الصورة…</small>}
            {imageFile && <small className="subtle">{imageFile.name}</small>}
          </div>
          <div className="field">
            <label htmlFor="notification-image-url">أو رابط الصورة</label>
            <input id="notification-image-url" type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…" />
          </div>
          {imageUrl.trim() && (
            <div className="field">
              <span className="subtle">معاينة الصورة</span>
              <img className="preview-image" src={imageUrl} alt="معاينة صورة الإشعار" onError={(event) => { event.currentTarget.style.display = 'none'; }} onLoad={(event) => { event.currentTarget.style.display = 'block'; }} />
            </div>
          )}
          <button className="primary-button" type="submit" disabled={loading || uploading}>
            {loading ? 'جارٍ الإرسال…' : 'إرسال إلى جميع الأجهزة'}
          </button>
        </form>
      </section>
    </div>
  );
}
