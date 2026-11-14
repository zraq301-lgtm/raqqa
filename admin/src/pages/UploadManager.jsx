import React, { useCallback, useEffect, useState } from 'react';
// ✅ استيراد دوال الحفظ والحذف الصحيحة والموجودة بالفعل في ملف الخدمات
import { savePageData, deletePageDataById, uploadVideo, uploadImage, listRecentContentFeed } from '../services/adminService';

const UploadManager = () => {
  const [targetPage, setTargetPage] = useState('مملكة الاسترخاء'); // القسم المستهدف
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('all'); // خاصة بمكتبة رقة فقط
  const [bgColor, setBgColor] = useState('#F5F5F5'); // خاصة بالـ 360 درجة فقط
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // حالات التحكم الخاصة بواجهة الحذف الذكي المطور (تقبل ID أو رابط ميديا أو بصمة زمنية)
  const [deleteId, setDeleteId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState('');
  const [recentDeleteId, setRecentDeleteId] = useState('');

  const refreshRecentContent = useCallback(async () => {
    try {
      const items = await listRecentContentFeed();
      setRecentItems(items);
      setRecentError('');
    } catch (error) {
      console.error('Recent content load error:', error);
      setRecentError('تعذر تحميل المنشورات النشطة. تحققي من اتصال الخدمة.');
    } finally {
      setRecentLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecentContent();
  }, [refreshRecentContent]);

  const targetPages = [
    'أيقونة الأناقة', 'شغف وحرف', 'ملاذ الأمومة', 'واحة العافية', 'دروب التمكين',
    'رواق الأرواح', 'الأرجوحة', 'أكاديمية الصغار', 'مملكة الاسترخاء', 'مكتبة رقة',
    'bouh-display-1', 'bouh-display'
  ];

  const categories = [
    { id: 'all', label: '🏠 الكل / عام' },
    { id: 'health', label: '🍎 جسدك أمانة' },
    { id: 'religion', label: '📖 نور وبصيرة' },
    { id: 'mental', label: '🌱 ملاذ الروح' },
    { id: 'intimacy', label: '🕯️ أسرار الفراش' }
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || (!videoFile && !videoUrl.trim() && !imageFile)) {
      setMessage({ type: 'error', text: 'رجاءً أدخلي العنوان واختاري فيديو أو صورة أو ضعي رابط فيديو خارجيًا!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    // تجهيز بنية البيانات الموحدة لتطابق ما ينتظره التطبيق الأساسي
    const newContentItem = {
      id: `item_${Date.now()}`,
      article: {
        title: title.trim(),
        body: description.trim(),
        category: targetPage === 'مكتبة رقة' ? category : undefined
      },
      media: {
        videoUrl: videoUrl.trim(),
        imageUrl: ""
      },
      design: {
        backgroundColor: targetPage === 'مملكة الاسترخاء' ? bgColor : undefined
      },
      lastUpdated: new Date().toISOString()
    };

    try {
      let cloudflareVideoUrl = videoUrl.trim();
      if (videoFile) {
        if (!videoFile.type.startsWith('video/')) throw new Error('الملف المختار ليس فيديو');
        if (videoFile.size > 100 * 1024 * 1024) throw new Error('حجم الفيديو يتجاوز 100 ميجابايت');
        setMessage({ type: '', text: 'جاري رفع الفيديو إلى التخزين المجاني...' });
        const uploaded = await uploadVideo(videoFile, targetPage);
        cloudflareVideoUrl = uploaded.url || uploaded.publicUrl || uploaded.data?.url;
        if (!cloudflareVideoUrl) throw new Error('media_url_missing');
      }
      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) throw new Error('الملف المختار ليس صورة');
        if (imageFile.size > 10 * 1024 * 1024) throw new Error('حجم الصورة يتجاوز 10 ميجابايت');
        setMessage({ type: '', text: 'جاري رفع الصورة إلى التخزين المجاني...' });
        const uploadedImage = await uploadImage(imageFile, targetPage);
        newContentItem.media.imageUrl = uploadedImage.url || uploadedImage.publicUrl || uploadedImage.data?.url || '';
        if (!newContentItem.media.imageUrl) throw new Error('media_url_missing');
      }
      newContentItem.media.videoUrl = cloudflareVideoUrl;
      const result = await savePageData(targetPage, newContentItem);

      if (result) {
        setMessage({ type: 'success', text: `✨ تم رفع ونشر المحتوى بنجاح إلى قسم (${targetPage})! 🚀` });
        await refreshRecentContent();
        setTitle('');
        setVideoUrl('');
        setVideoFile(null);
        setImageFile(null);
        setDescription('');
      } else {
        setMessage({ type: 'error', text: 'فشل الرفع، يرجى التحقق من استجابة السيرفر الوسيط.' });
      }
    } catch (error) {
      console.error("Upload handler error:", error);
      const errorText = error.message === 'admin_not_authorized'
        ? 'هذا الحساب مسجّل الدخول لكنه غير مصرح له بإدارة المحتوى.'
        : error.message === 'admin_auth_required'
          ? 'انتهت جلسة الدخول. سجّلي الدخول مجدداً للمتابعة.'
          : 'حدث خطأ غير متوقع أثناء عملية الاتصال بالخدمة.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  // دالة الحذف المحدثة لتتوافق مع آلية عمل الـ API الذكي (المصفوفات)
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteId.trim()) {
      setMessage({ type: 'error', text: '⚠️ رجاءً ادخلي (رابط فيديو) أو بصمة (lastUpdated) للحذف!' });
      return;
    }

    setDeleteLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await deletePageDataById(targetPage, deleteId.trim());

      // التحقق من حالة النجاح الفعلية القادمة من معالجة المصفوفة بالسيرفر
      if (response && response.success) {
        setMessage({ type: 'success', text: `🗑️ ${response.message || 'تم حذف العنصر وتحديث قاعدة البيانات السحابية بنجاح!'}` });
        setDeleteId('');
        await refreshRecentContent();
      } else {
        setMessage({ type: 'error', text: `⚠️ ${response.message || 'لم يتم العثور على عنصر يطابق هذا الرابط أو المعرف في هذا القسم.'}` });
      }
    } catch (error) {
      console.error("Delete handler error:", error);
      setMessage({ type: 'error', text: '❌ فشلت عملية الحذف السحابية، يرجى مراجعة اتصال السيرفر.' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRecentDelete = async (item) => {
    const titleText = item.article?.title?.trim() || 'هذا المحتوى';
    if (!window.confirm(`هل تريدين حذف «${titleText}» نهائيًا من قسم ${item.pageName}؟`)) return;
    setRecentDeleteId(item.id);
    setMessage({ type: '', text: '' });
    try {
      const result = await deletePageDataById(item.pageName, item.id);
      if (!result?.success) throw new Error(result?.message || 'content_delete_failed');
      setRecentItems((items) => items.filter((candidate) => candidate.id !== item.id || candidate.pageName !== item.pageName));
      setMessage({ type: 'success', text: `🗑️ تم حذف «${titleText}» من قسم ${item.pageName}.` });
      await refreshRecentContent();
    } catch (error) {
      console.error('Recent content delete error:', error);
      setMessage({ type: 'error', text: 'فشل حذف المحتوى. تحققي من صلاحيات الإدارة واتصال الخدمة.' });
    } finally {
      setRecentDeleteId('');
    }
  };

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.wrapper}>

        {/* بطاقة الإدخال والرفع الأساسية اللطيفة */}
        <div style={styles.card}>
          <div style={styles.headerBadge}>لوحة الإشراف والمزامنة السحابية</div>
          <h2 style={styles.cardTitle}>إدارة ورفع ميديا تطبيق رقة 🌸</h2>
          <p style={styles.cardSubtitle}>إرسال وتحديث الفيديوهات ديناميكياً إلى مستودع السيرفر</p>

          {message.text && (
            <div style={{
              ...styles.alert,
              backgroundColor: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
              color: message.type === 'success' ? '#2E7D32' : '#C62828',
              border: message.type === 'success' ? '1px solid #C8E6C9' : '1px solid #FFCDCD'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpload} style={styles.form}>
            {/* اختيار القسم المستهدف */}
            <div style={styles.formGroup}>
              <label style={styles.label}>🎯 القسم المستهدف في التطبيق:</label>
              <select
                value={targetPage}
                onChange={(e) => setTargetPage(e.target.value)}
                style={styles.select}
              >
                {targetPages.map((page) => <option key={page} value={page}>{page}</option>)}
              </select>
            </div>

            {/* عنوان المادة */}
            <div style={styles.formGroup}>
              <label style={styles.label}>📝 عنوان الفيديو الرئيسي:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: جولة استرخاء في طبيعة صامتة"
                style={styles.input}
              />
            </div>

            {/* رفع الفيديو إلى Cloudflare أو استخدام رابط خارجي */}
            <div style={styles.formGroup}>
              <label style={styles.label}>🎬 ملف فيديو عادي (يحفظ كرابط GitHub):</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                style={styles.input}
              />
              {videoFile && <small style={styles.colorText}>{videoFile.name} — {(videoFile.size / 1024 / 1024).toFixed(1)} MB</small>}
              <label style={styles.label}>أو رابط فيديو خارجي:</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🖼️ صورة الغلاف (اختيارية):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={styles.input}
              />
              {imageFile && <small style={styles.colorText}>{imageFile.name} — {(imageFile.size / 1024 / 1024).toFixed(1)} MB</small>}
            </div>

            {/* الحقول الديناميكية بناءً على اختيار القسم */}
            {targetPage === 'مكتبة رقة' ? (
              <div style={styles.formGroup}>
                <label style={styles.label}>🗂️ تصنيف مكتبة رقة المخصص:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.select}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={styles.formGroup}>
                <label style={styles.label}>🎨 لون خلفية القسم (مظهر الكارت العائم):</label>
                <div style={styles.colorPickerContainer}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={styles.colorPicker}
                  />
                  <span style={styles.colorText}>{bgColor}</span>
                </div>
              </div>
            )}

            {/* الوصف أو النص المصاحب */}
            <div style={styles.formGroup}>
              <label style={styles.label}>📖 وصف أو نص تعريفي مصاحب للمشاهدة:</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتبي تفاصيل أو نصائح تظهر تحت الفيديو للمستخدمات..."
                style={styles.textarea}
              />
            </div>

            {/* زر الرفع الحاسم */}
            <button
              type="submit"
              disabled={loading || deleteLoading}
              style={{
                ...styles.submitBtn,
                background: loading ? '#D7CCC8' : 'linear-gradient(135deg, #A87C66 0%, #8D5B4C 100%)'
              }}
            >
              {loading ? 'جاري تأمين ورفع البيانات سحابياً... ✨' : `🚀 نشر المحتوى فوراً في [ ${targetPage} ]`}
            </button>
          </form>
        </div>

        {/* 🗑️ كارت إدارة الحذف السريع والتحكم المطور المضاف حديثاً مظهر فخم خطير */}
        <div style={styles.deleteCard}>
          <h3 style={styles.deleteTitle}>🗑️ نظام الحذف الذكي الفوري</h3>
          <p style={styles.deleteSubtitle}>
            يمكنكِ سحب وإلغاء أي كارت من قسم <span style={{fontWeight:'bold', color:'#A87C66'}}>({targetPage})</span> مباشرة عن طريق لصق <b>رابط اليوتيوب الخاص به</b> أو كود <b>lastUpdated</b>.
          </p>

          <div style={styles.deleteFlexContainer}>
            <input
              type="text"
              placeholder="لصق رابط الفيديو أو كود lastUpdated هنا..."
              value={deleteId}
              disabled={deleteLoading || loading}
              onChange={(e) => setDeleteId(e.target.value)}
              style={styles.deleteInput}
            />
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading || loading || !deleteId.trim()}
              style={{
                ...styles.deleteBtn,
                background: deleteLoading ? '#E0E0E0' : 'linear-gradient(135deg, #D32F2F 0%, #9A1B1B 100%)'
              }}
            >
              {deleteLoading ? 'جاري الحذف...' : 'إزالة الميديا ⚠️'}
            </button>
          </div>
        </div>

        <section style={{ ...styles.deleteCard, borderColor: '#f0e5dd', boxShadow: '0 12px 35px rgba(141, 110, 99, 0.04)' }} aria-label="المنشورات النشطة">
          <h3 style={{ ...styles.deleteTitle, color: '#8d6e63' }}>🗂️ المنشورات النشطة في التطبيق</h3>
          <p style={styles.deleteSubtitle}>تظهر هنا الفيديوهات والمقالات المنشورة خلال آخر 72 ساعة. استخدمي زر الحذف لإزالة العنصر مباشرة من القسم والتطبيق.</p>
          {recentLoading ? (
            <p style={styles.recentEmpty}>جاري تحميل المحتوى المنشور...</p>
          ) : recentError ? (
            <p style={{ ...styles.recentEmpty, color: '#C62828' }}>{recentError}</p>
          ) : recentItems.length === 0 ? (
            <p style={styles.recentEmpty}>لا توجد عناصر منشورة خلال آخر 72 ساعة.</p>
          ) : (
            <div style={styles.recentList}>
              {recentItems.map((item) => (
                <article key={`${item.pageName}-${item.id}`} style={styles.recentItem}>
                  <div style={styles.recentItemInfo}>
                    <strong style={styles.recentItemTitle}>{item.article?.title?.trim() || 'محتوى بدون عنوان'}</strong>
                    <span style={styles.recentItemMeta}>{item.pageName} · {item.media?.videoUrl || item.article?.embeddedMedia?.type === 'video' ? 'فيديو' : item.media?.imageUrl || item.article?.embeddedMedia?.type === 'image' ? 'صورة' : 'مقال'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRecentDelete(item)}
                    disabled={loading || deleteLoading || Boolean(recentDeleteId)}
                    style={{ ...styles.recentDeleteButton, opacity: recentDeleteId === item.id ? 0.65 : 1 }}
                  >
                    {recentDeleteId === item.id ? 'جارٍ الحذف...' : 'حذف'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

/* --- التنسيقات الاحترافية الفاخرة للوحة التحكم الجمالية تتبع نمط Nude & Rose Premium --- */
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FCF8F5 0%, #F6EFEA 100%)',
    padding: '50px 20px',
    fontFamily: '"Tajawal", sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    maxWidth: '650px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px 35px',
    boxShadow: '0 15px 45px rgba(141, 110, 99, 0.06)',
    border: '1px solid #F0E5DD',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  headerBadge: {
    display: 'table',
    margin: '0 auto 15px auto',
    background: '#FDF6F0',
    color: '#A87C66',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.3px'
  },
  cardTitle: { margin: '0 0 8px 0', color: '#4A3F35', fontSize: '1.8rem', fontWeight: '900', textAlign: 'center' },
  cardSubtitle: { margin: '0 0 35px 0', color: '#8D8276', fontSize: '0.95rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '0.95rem', fontWeight: '700', color: '#4A3F35', paddingRight: '4px' },
  input: {
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid #EADBCE',
    backgroundColor: '#FDFDFD',
    fontSize: '1rem',
    color: '#4A3F35',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)'
  },
  select: {
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid #EADBCE',
    fontSize: '1rem',
    color: '#4A3F35',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  textarea: {
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid #EADBCE',
    fontSize: '1rem',
    color: '#4A3F35',
    outline: 'none',
    resize: 'vertical',
    lineHeight: '1.6',
    transition: 'all 0.3s ease'
  },
  colorPickerContainer: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    background: '#FAF6F2',
    padding: '10px 16px',
    borderRadius: '14px',
    border: '1px solid #EADBCE',
    width: 'fit-content'
  },
  colorPicker: { border: 'none', width: '45px', height: '35px', padding: '0', cursor: 'pointer', borderRadius: '6px', backgroundColor: 'transparent' },
  colorText: { fontSize: '0.9rem', color: '#7E7265', fontWeight: 'bold' },
  alert: { padding: '16px 20px', borderRadius: '16px', fontSize: '0.95rem', fontWeight: '700', textAlign: 'center', lineHeight: '1.5' },
  submitBtn: {
    color: '#FFFFFF',
    border: 'none',
    padding: '16px 20px',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(168, 124, 102, 0.25)'
  },

  /* استايلات كارت الحذف الفاخرة الإضافية */
  deleteCard: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px 35px',
    boxShadow: '0 12px 35px rgba(211, 47, 47, 0.03)',
    border: '1px solid #FFEBEE',
  },
  deleteTitle: { margin: '0 0 6px 0', color: '#9A1B1B', fontSize: '1.25rem', fontWeight: '800' },
  deleteSubtitle: { margin: '0 0 20px 0', color: '#7E7265', fontSize: '0.9rem', lineHeight: '1.5' },
  deleteFlexContainer: {
    display: 'flex',
    gap: '12px'
  },
  deleteInput: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '14px',
    border: '1px solid #FFCDCD',
    backgroundColor: '#FFFDFD',
    fontSize: '1rem',
    outline: 'none',
    color: '#4A3F35'
  },
  deleteBtn: {
    color: '#FFFFFF',
    border: 'none',
    padding: '0 24px',
    borderRadius: '14px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(213, 47, 47, 0.15)'
  },
  recentEmpty: { margin: '12px 0 0', padding: '14px', textAlign: 'center', borderRadius: '14px', background: '#FAF6F2', color: '#7E7265', fontSize: '0.9rem' },
  recentList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recentItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', border: '1px solid #F0E5DD', background: '#fffdfb' },
  recentItemInfo: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' },
  recentItemTitle: { color: '#4A3F35', fontSize: '0.95rem', overflowWrap: 'anywhere' },
  recentItemMeta: { color: '#8D8276', fontSize: '0.78rem' },
  recentDeleteButton: { flex: '0 0 auto', border: 'none', borderRadius: '10px', padding: '9px 15px', color: '#fff', background: 'linear-gradient(135deg,#D32F2F 0%,#9A1B1B 100%)', fontWeight: 700, cursor: 'pointer' }
};

export default UploadManager;
