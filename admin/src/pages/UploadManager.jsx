import React, { useState } from 'react';
// ✅ استيراد الدالة الصحيحة والموجودة بالفعل في ملف الخدمات الخاص بكِ
import { savePageData } from '../services/adminService'; 

const UploadManager = () => {
  const [targetPage, setTargetPage] = useState('مملكة الاسترخاء'); // القسم المستهدف
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('all'); // خاصة بمكتبة رقة فقط
  const [bgColor, setBgColor] = useState('#F5F5F5'); // خاصة بالـ 360 درجة فقط
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      // ✅ استدعاء الدالة الصحيحة وتمرير البيانات المجهزة لها مباشرة
      const result = await savePageData(targetPage, newContentItem);
      
      // التحقق من نجاح العملية بناءً على استجابة السيرفر المتوقعة
      if (result) {
        setMessage({ type: 'success', text: ` تم رفع المحتوى بنجاح إلى قسم (${targetPage})! 🚀` });
        // إعادة تهيئة الحقول بعد الرفع الناجح
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

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>إدارة ورفع ميديا تطبيق رقة 🌸</h2>
        <p style={styles.cardSubtitle}>إرسال وتحديث الفيديوهات ديناميكياً إلى مستودع GitHub</p>

        {message.text && (
          <div style={{
            ...styles.alert, 
            backgroundColor: message.type === 'success' ? '#E8F5E9' : '#FFEBEE',
            color: message.type === 'success' ? '#2E7D32' : '#C62828'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpload} style={styles.form}>
          {/* اختيار القسم المستهدف */}
          <div style={styles.formGroup}>
            <label style={styles.label}>القسم المستهدف في التطبيق:</label>
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
            <label style={styles.label}>عنوان الفيديو:</label>
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
            <label style={styles.label}>رابط فيديو يوتيوب:</label>
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
              <label style={styles.label}>تصنيف مكتبة رقة المخصص:</label>
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
              <label style={styles.label}>لون خلفية القسم (مظهر الكارت):</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)} 
                  style={styles.colorPicker}
                />
                <span style={{ fontSize: '0.85rem', color: '#666' }}>{bgColor}</span>
              </div>
            </div>
          )}

          {/* الوصف أو النص المصاحب */}
          <div style={styles.formGroup}>
            <label style={styles.label}>وصف أو نص تعريفي (اختياري):</label>
            <textarea 
              rows="4" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="اكتبي تفاصيل أو نصائح تظهر تحت الفيديو..." 
              style={styles.textarea}
            />
          </div>

          {/* زر الرفع الحاسم */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{...styles.submitBtn, backgroundColor: loading ? '#BDBDBD' : '#FF4D7D'}}
          >
            {loading ? 'جاري التحديث والرفع لـ GitHub... ⏳' : 'نشر المحتوى فوراً 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* --- التنسيقات الاحترافية للوحة التحكم (لوحة المشرف) --- */
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#FAFAFA', padding: '40px 20px', fontFamily: 'Tajawal, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  card: { background: '#FFFFFF', maxWidth: '600px', width: '100%', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #EEEEEE' },
  cardTitle: { margin: '0 0 5px 0', color: '#333333', fontSize: '1.6rem', fontWeight: 'bold', textAlign: 'center' },
  cardSubtitle: { margin: '0 0 25px 0', color: '#777777', fontSize: '0.9rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.95rem', fontWeight: 'bold', color: '#444444' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #CCCCCC', fontSize: '0.95rem', outline: 'none', transition: 'border 0.3s' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #CCCCCC', fontSize: '0.95rem', backgroundColor: '#FFFFFF', outline: 'none' },
  textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #CCCCCC', fontSize: '0.95rem', outline: 'none', resize: 'vertical' },
  colorPicker: { border: 'none', width: '45px', height: '40px', padding: '0', cursor: 'pointer', borderRadius: '4px', backgroundColor: 'transparent' },
  alert: { padding: '12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' },
  submitBtn: { color: '#FFFFFF', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.3s', boxShadow: '0 4px 12px rgba(255, 77, 125, 0.2)' }
};

export default UploadManager;
