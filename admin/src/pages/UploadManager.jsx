import React, { useCallback, useEffect, useState } from 'react';
import { deletePageDataById, listAllAdminContent, savePageData, uploadImage, uploadVideo } from '../services/adminService';
import AdminTokenField from '../components/AdminTokenField';

const contentPageGroups = [
  { label: 'صفحات رقة الرئيسية', options: [
    { value: 'صحتك', label: 'صحتك' }, { value: 'المشاعر', label: 'المشاعر' },
    { value: 'الحميمية', label: 'الحميمية' }, { value: 'الإشراقة', label: 'الإشراقة' },
    { value: 'مكتبة رقة', label: 'مكتبة الفيديوهات — مكتبة رقة' },
    { value: 'مملكة الاسترخاء', label: 'عالم رقة — مملكة الاسترخاء' },
  ] },
  { label: 'صفحات الأرجوحة — كل التبويبات', options: [
    { value: 'الأرجوحة', label: 'الأرجوحة — الرئيسية' },
    { value: 'أيقونة الأناقة', label: 'أيقونة الأناقة' }, { value: 'شغف وحرف', label: 'شغف وحرف' },
    { value: 'ملاذ الأمومة', label: 'ملاذ الأمومة' }, { value: 'واحة العافية', label: 'واحة العافية' },
    { value: 'فنون الطهي', label: 'فنون الطهي' }, { value: 'دروب التمكين', label: 'دروب التمكين' },
    { value: 'زوايا المنزل', label: 'زوايا المنزل' }, { value: 'رواق الأرواح', label: 'رواق الأرواح' },
    { value: 'أكاديمية الصغار', label: 'أكاديمية الصغار' },
  ] },
  { label: 'أقسام الصحة الداخلية', options: [
    { value: 'الحيض', label: 'الصحة — الحيض' }, { value: 'نصيحة طبيب', label: 'الصحة — نصيحة طبيب' },
    { value: 'الحمل', label: 'الصحة — الحمل' }, { value: 'الأمومة', label: 'الصحة — الأمومة' },
    { value: 'الطبيب', label: 'الصحة — الطبيب' }, { value: 'الرشاقة', label: 'الصحة — الرشاقة' },
    { value: 'الرضاعة', label: 'الصحة — الرضاعة' },
  ] },
  { label: 'محتوى الإشراقة', options: [{ value: 'نصيحة اليوم', label: 'نصيحة اليوم' }] },
  { label: 'مساحات البوح القديمة', options: [
    { value: 'bouh-display-1', label: 'البوح — المنشورات العامة' },
    { value: 'bouh-display', label: 'البوح — المنشورات القديمة' },
  ] },
];
const defaultTargetPage = contentPageGroups[0].options[0].value;
const pageLabelByName = Object.fromEntries(contentPageGroups.flatMap((group) => group.options.map((option) => [option.value, option.label])));
const videoCategories = [
  { value: 'all', label: 'عام — كل التخصصات' }, { value: 'health', label: 'جسدك أمانة' },
  { value: 'religion', label: 'نور وبصيرة' }, { value: 'mental', label: 'ملاذ الروح' },
  { value: 'intimacy', label: 'أسرار الفراش' },
];

export default function UploadManager() {
  const [targetPage, setTargetPage] = useState(defaultTargetPage);
  const [contentType, setContentType] = useState('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [category, setCategory] = useState('all');
  const [bgColor, setBgColor] = useState('#F5F5F5');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [manualId, setManualId] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const refresh = useCallback(async () => {
    try { setItems(await listAllAdminContent()); setListError(''); }
    catch (error) { console.error('Content list error:', error); setListError(error.message === 'admin_authorization_required' ? 'أدخلي رمز الإدارة واحفظيه لعرض المحتوى وإدارته.' : 'تعذر تحميل المحتوى المنشور.'); }
    finally { setListLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const reload = () => refresh();
    window.addEventListener('raqqa-admin-token-saved', reload);
    return () => window.removeEventListener('raqqa-admin-token-saved', reload);
  }, [refresh]);

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!title.trim()) return setMessage({ type: 'error', text: 'يرجى إدخال عنوان للمحتوى.' });
    if (contentType === 'video' && !mediaFile && !videoUrl.trim()) return setMessage({ type: 'error', text: 'اختاري ملف فيديو أو أدخلي رابطًا.' });
    if (contentType === 'image' && !mediaFile) return setMessage({ type: 'error', text: 'اختاري ملف الصورة.' });
    setLoading(true); setMessage(null);
    try {
      const item = { id: `item_${Date.now()}`, article: { title: title.trim(), body: description.trim(), category: targetPage === 'مكتبة رقة' ? category : undefined }, media: { videoUrl: '', imageUrl: '' }, design: { backgroundColor: targetPage === 'مملكة الاسترخاء' ? bgColor : undefined }, lastUpdated: new Date().toISOString() };
      if (contentType === 'video') {
        item.media.videoUrl = videoUrl.trim();
        if (mediaFile) {
          if (!mediaFile.type.startsWith('video/')) throw new Error('الملف المختار ليس فيديو.');
          if (mediaFile.size > 100 * 1024 * 1024) throw new Error('حجم الفيديو يتجاوز 100 ميجابايت.');
          const result = await uploadVideo(mediaFile, targetPage);
          item.media.videoUrl = result.url || result.publicUrl || result.data?.url || '';
          if (!item.media.videoUrl) throw new Error('تعذر الحصول على رابط الفيديو بعد رفعه.');
        }
        if (coverImageFile) {
          if (!coverImageFile.type.startsWith('image/')) throw new Error('الملف المختار ليس صورة.');
          if (coverImageFile.size > 10 * 1024 * 1024) throw new Error('حجم صورة الغلاف يتجاوز 10 ميجابايت.');
          const result = await uploadImage(coverImageFile, targetPage);
          item.media.imageUrl = result.url || result.publicUrl || result.data?.url || '';
          if (!item.media.imageUrl) throw new Error('تعذر الحصول على رابط صورة الغلاف بعد رفعها.');
        }
      } else if (contentType === 'image') {
        if (!mediaFile.type.startsWith('image/')) throw new Error('الملف المختار ليس صورة.');
        if (mediaFile.size > 10 * 1024 * 1024) throw new Error('حجم الصورة يتجاوز 10 ميجابايت.');
        const result = await uploadImage(mediaFile, targetPage);
        item.media.imageUrl = result.url || result.publicUrl || result.data?.url || '';
        if (!item.media.imageUrl) throw new Error('تعذر الحصول على رابط الصورة بعد رفعها.');
      }
      const result = await savePageData(targetPage, item);
      if (!result) throw new Error('لم يتم نشر المحتوى.');
      const notificationMessage = result.notification?.sent
        ? ' وتم إرسال الإشعار إلى الأجهزة المشتركة.'
        : result.notification?.reason === 'admin_token_required'
          ? ' لكن لم يُرسل الإشعار: استوردي رمز الإدارة واحفظيه في الحقل المشترك أولًا.'
          : result.notification?.reason === 'fcm_not_configured'
            ? ' لكن لم يُرسل الإشعار: اعتماد Firebase غير مضبوط في Worker بعد.'
        : result.notification?.reason === 'fcm_credentials_invalid'
          ? ' لكن لم يُرسل الإشعار: اعتماد Firebase في Worker غير صالح.'
          : result.notification?.reason === 'notification_image_rejected'
            ? ' لكن رفض Firebase صورة الإشعار؛ تأكدي من أن الرابط عام وصورة الإشعار أقل من 1 ميغابايت.'
          : ' لكن لم يتم تأكيد إرسال الإشعار.';
      setMessage({ type: 'success', text: `تم نشر المحتوى بنجاح في «${pageLabelByName[targetPage] || targetPage}».${notificationMessage}` });
      setTitle(''); setDescription(''); setMediaFile(null); setCoverImageFile(null); setVideoUrl('');
      const fileInput = document.getElementById('content-media-file'); if (fileInput) fileInput.value = '';
      const coverInput = document.getElementById('content-cover-file'); if (coverInput) coverInput.value = '';
      await refresh();
    } catch (error) { console.error('Publish error:', error); setMessage({ type: 'error', text: error.message || 'تعذر نشر المحتوى. تحققي من الخدمة وحاولي مجددًا.' }); }
    finally { setLoading(false); }
  };

  const deleteItem = async (item) => {
    const name = item.article?.title?.trim() || 'هذا المحتوى';
    if (!window.confirm(`هل تريد حذف «${name}» من قسم ${pageLabelByName[item.pageName] || item.pageName}؟`)) return;
    setDeletingId(item.id); setMessage(null);
    try {
      const result = await deletePageDataById(item.pageName, item.id);
      if (!result?.success) throw new Error(result?.message || 'تعذر حذف المحتوى.');
      setMessage({ type: 'success', text: `تم حذف «${name}».` }); await refresh();
    } catch (error) { setMessage({ type: 'error', text: error.message || 'فشل حذف المحتوى.' }); }
    finally { setDeletingId(''); }
  };

  const deleteManual = async (event) => {
    event.preventDefault(); if (!manualId.trim()) return;
    setManualLoading(true); setMessage(null);
    try {
      const result = await deletePageDataById(targetPage, manualId.trim());
      if (!result?.success) throw new Error(result?.message || 'لم يُعثر على محتوى مطابق.');
      setManualId(''); setMessage({ type: 'success', text: result.message || 'تم الحذف بنجاح.' }); await refresh();
    } catch (error) { setMessage({ type: 'error', text: error.message || 'تعذر حذف المحتوى.' }); }
    finally { setManualLoading(false); }
  };

  const mediaType = (item) => item.media?.videoUrl || item.article?.embeddedMedia?.type === 'video' ? 'فيديو' : item.media?.imageUrl || item.article?.embeddedMedia?.type === 'image' ? 'صورة' : 'مقال';
  const itemCategory = (item) => item.pageName === 'مكتبة رقة' ? ` · ${videoCategories.find((categoryOption) => categoryOption.value === (item.article?.category || item.category || 'all'))?.label || 'عام — كل التخصصات'}` : '';
  return <div className="admin-page">
      <div className="admin-intro"><h2>إدارة المحتوى</h2><p>انشري محتوى جديدًا وتابعي المنشورات النشطة من مكان واحد.</p></div>
    <AdminTokenField />
    {message && <div className={`notice ${message.type}`} role="status">{message.text}</div>}
    <section className="admin-card">
      <h3>نشر محتوى جديد</h3><p className="card-description">اختاري أي صفحة أو قسم من التطبيق. المحتوى الحديث يظهر في خلاصة رقة لمدة 72 ساعة، ثم يختفي تلقائيًا.</p>
      <form className="admin-form" onSubmit={handlePublish}>
        <div className="form-grid">
          <div className="field"><label htmlFor="content-section">الصفحة أو القسم</label><select id="content-section" value={targetPage} onChange={(e) => { setTargetPage(e.target.value); setCategory('all'); }}>{contentPageGroups.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</optgroup>)}</select></div>
          <div className="field"><label htmlFor="content-type">نوع المحتوى</label><select id="content-type" value={contentType} onChange={(e) => { setContentType(e.target.value); setMediaFile(null); setCoverImageFile(null); setVideoUrl(''); }}><option value="video">فيديو</option><option value="image">صورة</option><option value="article">مقال</option></select></div>
        </div>
        <div className="field"><label htmlFor="content-title">العنوان</label><input id="content-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المحتوى" required /></div>
        <div className="field"><label htmlFor="content-description">الوصف أو نص المقال</label><textarea id="content-description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اكتبي وصفًا أو نص المقال هنا" /></div>
        {contentType === 'video' && <><div className="field"><label htmlFor="content-media-file">ملف الفيديو (اختياري)</label><input id="content-media-file" type="file" accept="video/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />{mediaFile && <small className="subtle">{mediaFile.name}</small>}</div><div className="field"><label htmlFor="video-url">أو رابط فيديو</label><input id="video-url" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" /></div><div className="field"><label htmlFor="content-cover-file">صورة مصغّرة للفيديو (اختياري)</label><input id="content-cover-file" type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)} />{coverImageFile && <small className="subtle">{coverImageFile.name}</small>}</div></>}
        {contentType === 'image' && <div className="field"><label htmlFor="content-media-file">ملف الصورة</label><input id="content-media-file" type="file" accept="image/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />{mediaFile && <small className="subtle">{mediaFile.name}</small>}</div>}
        {targetPage === 'مكتبة رقة' && <div className="field"><label htmlFor="content-category">تخصص مكتبة الفيديوهات</label><select id="content-category" value={category} onChange={(e) => setCategory(e.target.value)}>{videoCategories.map((videoCategory) => <option key={videoCategory.value} value={videoCategory.value}>{videoCategory.label}</option>)}</select><small className="subtle">يُحفظ التخصص كتصنيف متوافق مع فلاتر مكتبة الفيديوهات داخل التطبيق.</small></div>}
        {targetPage === 'مملكة الاسترخاء' && <div className="field"><label htmlFor="bg-color">لون خلفية القسم</label><input id="bg-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} /></div>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? 'جارٍ النشر…' : 'نشر المحتوى'}</button>
      </form>
    </section>
    <section className="admin-card"><h3>كل المحتوى المنشور</h3><p className="card-description">تظهر هنا المنشورات من جميع الصفحات، بما فيها القديمة، ويمكن حذف أي عنصر مباشرة.</p>
      {listLoading ? <div className="empty-state">جارٍ تحميل المحتوى…</div> : listError ? <div className="notice error">{listError}</div> : items.length === 0 ? <div className="empty-state">لا يوجد محتوى نشط حاليًا.</div> : <div className="active-list">{items.map((item) => <article className="active-item" key={`${item.pageName}-${item.id}`}><div className="active-item-main"><strong>{item.article?.title?.trim() || 'محتوى بدون عنوان'}</strong><small>{pageLabelByName[item.pageName] || item.pageName} · {mediaType(item)}{itemCategory(item)}</small></div><button className="danger-button" type="button" onClick={() => deleteItem(item)} disabled={Boolean(deletingId)}>{deletingId === item.id ? 'جارٍ الحذف…' : 'حذف'}</button></article>)}</div>}
    </section>
    <details className="advanced-tools"><summary>خيارات متقدمة: الحذف بمعرّف أو رابط</summary><p className="subtle">يُحذف العنصر من القسم المحدد أعلاه باستخدام المعرّف أو الرابط.</p><form className="admin-form" onSubmit={deleteManual}><div className="field"><label htmlFor="manual-delete-id">المعرّف أو الرابط</label><input id="manual-delete-id" value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="معرّف المحتوى أو رابطه" /></div><button className="danger-button" type="submit" disabled={manualLoading || !manualId.trim()}>{manualLoading ? 'جارٍ الحذف…' : 'حذف يدوي'}</button></form></details>
  </div>;
}
