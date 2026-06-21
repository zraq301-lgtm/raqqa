import React, { useState } from 'react';
// ✅ استيراد دوال الحفظ والحذف الصحيحة والموجودة بالفعل في ملف الخدمات
import { savePageData, deletePageDataById } from '../services/adminService'; 

const UploadManager = () => {
  const [targetPage, setTargetPage] = useState('مملكة الاسترخاء'); // القسم المستهدف
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('all'); // خاصة بمكتبة رقة فقط
  const [bgColor, setBgColor] = useState('#F5F5F5'); // خاصة بالـ 360 درجة فقط
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // حالات التحكم الخاصة بواجهة الحذف الذكي المطور (تقبل ID أو رابط ميديا أو بصمة زمنية)
  const [deleteId, setDeleteId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categories = [
    { id: 'all', label: '🏠 الكل / عام' },
    { id: 'health', label: '🍎 جسدك أمانة' },
    { id: 'religion', label: '📖 نور وبصيرة' },
    { id: 'mental', label: '🌱 ملاذ الروح' },
    { id: 'intimacy', label: '🕯️ أسرار الفراش' }
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setMessage({ type: 'error', text: 'رجاءً املئي خانة العنوان ورابط الفيديو!' });
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
      const result = await savePageData(targetPage, newContentItem);
      
      if (result) {
        setMessage({ type: 'success', text: `✨ تم رفع ونشر المحتوى بنجاح إلى قسم (${targetPage})! 🚀` });
        setTitle('');
        setVideoUrl('');
        setDescription('');
      } else {
        setMessage({ type: 'error', text: 'فشل الرفع، يرجى التحقق من استجابة السيرفر الوسيط.' });
      }
    } catch (error) {
      console.error("Upload handler error:", error);
      setMessage({ type: 'error', text: 'حدث خطأ غير متوقع أثناء عملية الاتصال بالخدمة.' });
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
                <option value="مملكة الاسترخاء">مملكة الاسترخاء (فيديوهات 360° VR)</option>
                <option value="مكتبة رقة">مكتبة رقة النسائية (فيديوهات التبويبات)</option>
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

            {/* رابط الفيديو */}
            <div style={styles.formGroup}>
              <label style={styles.label}>🔗 رابط فيديو يوتيوب المباشر:</label>
              <input 
                type="text" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="https://www.youtube.com/watch?v=..." 
                style={styles.input}
              />
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
  }
};

export default UploadManager;
