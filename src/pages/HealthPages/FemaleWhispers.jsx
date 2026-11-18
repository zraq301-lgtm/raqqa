import React, { useEffect, useRef, useState } from 'react';
import {
  deleteFemaleWhisper,
  listFemaleWhispers,
  saveFemaleWhisper,
  uploadFemaleWhisperMedia,
} from '../../services/femaleWhispersApi';
import '../../styles/female-whispers.css';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
};

export default function FemaleWhispers() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  const loadEntries = async () => {
    try {
      const result = await listFemaleWhispers();
      setEntries(Array.isArray(result?.entries) ? result.entries : []);
    } catch (error) {
      setMessage(error.message || 'تعذر تحميل مفكرتك الخاصة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, []);

  const chooseMedia = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) { setMessage('اختاري صورة أو فيديو فقط.'); return; }
    const limit = isImage ? 10 * 1024 * 1024 : 80 * 1024 * 1024;
    if (file.size > limit) { setMessage(isImage ? 'حجم الصورة يجب ألا يتجاوز 10 ميجابايت.' : 'حجم الفيديو يجب ألا يتجاوز 80 ميجابايت.'); return; }
    setBusy(true); setMessage('جاري رفع الملف إلى Cloudinary…');
    try {
      const result = await uploadFemaleWhisperMedia(file);
      if (!result?.url) throw new Error('لم يتم استلام رابط الملف.');
      setMedia({ url: result.url, type: result.media_type || (isVideo ? 'video' : 'image'), name: file.name });
      setMessage('تم رفع الملف. اضغطي حفظ لإضافته إلى مفكرتك.');
    } catch (error) {
      setMessage(error.message || 'تعذر رفع الملف.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!title.trim() && !body.trim() && !media) { setMessage('اكتبي ملاحظة أو أضيفي صورة/فيديو أولًا.'); return; }
    setBusy(true); setMessage('جاري حفظ المذكرة…');
    try {
      const result = await saveFemaleWhisper({
        entryType: media?.type || 'note',
        title: title.trim(),
        body: body.trim(),
        mediaUrl: media?.url || '',
      });
      if (result?.entry) setEntries((current) => [result.entry, ...current]);
      setTitle(''); setBody(''); setMedia(null); setMessage('تم حفظ مذكرتك الخاصة.');
    } catch (error) {
      setMessage(error.message || 'تعذر حفظ المذكرة.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (entry) => {
    if (!window.confirm('هل تريدين حذف هذه المذكرة؟')) return;
    try {
      await deleteFemaleWhisper(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (error) { setMessage(error.message || 'تعذر حذف المذكرة.'); }
  };

  return (
    <section className="female-whispers-page" dir="rtl">
      <header className="female-whispers-hero">
        <span className="female-whispers-kicker">مساحتك الخاصة</span>
        <h1>همسات أنثى</h1>
        <p>مفكرة هادئة لكِ وحدكِ… اكتبي ما تشعرين به واحتفظي بصورك وفيديوهاتك بأمان.</p>
      </header>

      <section className="female-whispers-notebook" aria-label="مفكرة همسات أنثى">
        <div className="female-whispers-notebook-title"><span>✦</span><strong>مذكرة جديدة</strong></div>
        <input className="female-whispers-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="عنوان صغير لمذكرتك" maxLength={300} />
        <textarea className="female-whispers-textarea" value={body} onChange={(event) => setBody(event.target.value)} placeholder="اكتبي هنا ما تريدين الاحتفاظ به…" maxLength={100000} rows={7} />
        {media && (
          <div className="female-whispers-uploaded">
            {media.type === 'video' ? <video src={media.url} controls preload="metadata" /> : <img src={media.url} alt="المرفق الجديد" />}
            <button type="button" onClick={() => setMedia(null)} disabled={busy}>إزالة المرفق</button>
          </div>
        )}
        <div className="female-whispers-actions">
          <button type="button" className="female-whispers-media-button" onClick={() => fileRef.current?.click()} disabled={busy}>إضافة صورة أو فيديو</button>
          <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={chooseMedia} />
          <button type="button" className="female-whispers-save" onClick={save} disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ في مفكرتي'}</button>
        </div>
        {message && <p className="female-whispers-message" role="status">{message}</p>}
      </section>

      <section className="female-whispers-list" aria-label="مذكراتي المحفوظة">
        <div className="female-whispers-list-heading"><h2>مذكراتي</h2><span>{entries.length} محفوظة</span></div>
        {loading && <p className="female-whispers-empty">جاري تحميل مفكرتك…</p>}
        {!loading && !entries.length && <p className="female-whispers-empty">لم تحفظي شيئًا بعد. ابدئي بأول همسة.</p>}
        {entries.map((entry) => (
          <article className="female-whispers-entry" key={entry.id}>
            <div className="female-whispers-entry-top"><time>{formatDate(entry.created_at)}</time><button type="button" onClick={() => remove(entry)} aria-label="حذف المذكرة">حذف</button></div>
            {entry.title && <h3>{entry.title}</h3>}
            {entry.body && <p>{entry.body}</p>}
            {entry.media_url && (entry.media_type === 'video' ? <video src={entry.media_url} controls preload="metadata" /> : <img src={entry.media_url} alt={entry.title || 'صورة من مفكرتي'} loading="lazy" />)}
          </article>
        ))}
      </section>
    </section>
  );
}
