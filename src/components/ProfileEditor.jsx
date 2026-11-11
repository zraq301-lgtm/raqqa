import React, { useEffect, useRef, useState } from 'react';
import { getProfile, updateProfile, uploadAvatar } from '../services/profileApi';

export default function ProfileEditor({ user, onUpdated, onClose }) {
  const [name, setName] = useState(user?.display_name || user?.displayName || user?.firebaseUser?.displayName || '');
  const [photo, setPhoto] = useState(user?.photo_url || user?.photoURL || user?.firebaseUser?.photoURL || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getProfile().then((result) => {
      if (cancelled || !result?.profile) return;
      setName(result.profile.display_name || '');
      setPhoto(result.profile.photo_url || '');
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const choosePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('اختاري صورة JPG أو PNG أو WEBP.'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.'); return;
    }
    setBusy(true); setMessage('جاري رفع الصورة…');
    try {
      const result = await uploadAvatar(file);
      const nextPhoto = result?.profile?.photo_url || result?.photo_url;
      if (nextPhoto) { setPhoto(nextPhoto); onUpdated?.({ ...user, ...result.profile, photo_url: nextPhoto }); }
      setMessage('تم حفظ صورة البروفايل.');
    } catch (error) { setMessage(error.message || 'تعذر رفع الصورة.'); }
    finally { setBusy(false); }
  };

  const save = async () => {
    if (!name.trim()) { setMessage('اكتبي اسم البروفايل أولاً.'); return; }
    setBusy(true); setMessage('جاري الحفظ…');
    try {
      const result = await updateProfile({ display_name: name.trim() });
      const next = { ...user, ...result.profile, display_name: result.profile?.display_name || name.trim(), photo_url: result.profile?.photo_url || photo };
      onUpdated?.(next); setMessage('تم تحديث البروفايل.');
    } catch (error) { setMessage(error.message || 'تعذر تحديث الاسم.'); }
    finally { setBusy(false); }
  };

  return <div className="profile-editor-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
    <section className="profile-editor" onClick={(event) => event.stopPropagation()} dir="rtl">
      <button className="profile-editor-close" onClick={onClose} aria-label="إغلاق">×</button>
      <h2>ملفك الشخصي</h2>
      <button className="profile-photo-picker" onClick={() => fileRef.current?.click()} disabled={busy} aria-label="رفع صورة البروفايل">
        {photo ? <img src={photo} alt="صورة البروفايل" /> : <span>♡</span>}
        <b>تغيير الصورة</b>
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={choosePhoto} />
      <label className="profile-field">اسم البروفايل<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} /></label>
      {message && <p className="profile-editor-message">{message}</p>}
      <button className="profile-save-button" onClick={save} disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}</button>
    </section>
  </div>;
}
