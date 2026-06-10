import React, { useState } from 'react';
import { savePageData } from '../services/adminService'; 

function SwingManagement() {
  // قائمة الصفحات الرسمية للتطبيق لتحديد وجهة الحفظ السحابي
  const SECTIONS = [
    'أيقونة الأناقة',
    'شغف وحرف',
    'ملاذ الأمومة',
    'واحة العافية',
    'دروب التمكين',
    'رواق الأرواح',
    'الأرجوحة'
  ];

  // حالة تحديد الصفحة الحالية (الافتراضية: أيقونة الأناقة)
  const [currentPage, setCurrentPage] = useState(SECTIONS[0]);

  // حالات الإدخال الحالية للمحتوى (Form States)
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  
  // حالة المقال المدمج
  const [articleTitle, setArticleTitle] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleMediaType, setArticleMediaType] = useState('none'); 
  const [articleMediaUrl, setArticleMediaUrl] = useState('');

  // حالات الواجهة الاستجابية (UI States)
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // دالة معالجة الحفظ والنشر التلقائي لـ GitHub
  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ text: `جاري رفع البيانات وتحديث ملف [${currentPage}] في مستودع GitHub...`, type: 'info' });

    // تجميع مصفوفة البيانات في كائن منظم يطابق تماماً بنية السيرفر والواجهة
    const pagePayload = {
      pageName: currentPage,
      lastUpdated: new Date().toISOString(),
      media: {
        videoUrl: videoUrl,
        imageUrl: imageUrl,
        audioUrl: audioUrl
      },
      article: {
        title: articleTitle,
        body: articleBody,
        embeddedMedia: {
          type: articleMediaType,
          url: articleMediaUrl
        }
      }
    };

    try {
      // إرسال البيانات للسيرفر مع تمرير اسم الصفحة المحددة حالياً ديناميكياً
      await savePageData(currentPage, pagePayload);
      setStatusMessage({ text: `🎉 تم حفظ وتأمين بيانات صفحة [${currentPage}] وعمل سحب ناجح للمستودع السحابي!`, type: 'success' });
    } catch (error) {
      console.error(error);
      setStatusMessage({ text: '❌ فشلت عملية الحفظ السحابي. يرجى التحقق من متغيرات البيئة أو الاتصال.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-app">
      <header className="admin-header">
        <h1>لوحة تحكم رقة</h1>
        <p>إدارة محتوى ومصفوفة أقسام التطبيق الذكية</p>
      </header>

      {/* بطاقة التحكم الديناميكي واختيار الأقسام المستهدفة */}
      <div className="ui-card selection-card">
        <div className="input-group">
          <label className="main-select-label">🎯 اختر الصفحة المراد تعديل بياناتها ونشرها سحابياً:</label>
          <select 
            className="main-select-dropdown"
            value={currentPage}
            onChange={(e) => {
              setCurrentPage(e.target.value);
              setStatusMessage({ text: '', type: '' }); // تصفير الرسائل عند تغيير القسم
            }}
          >
            {SECTIONS.map((section) => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handlePublish} className="admin-form">
        
        {/* بطاقة الروابط المباشرة لوسائط القسم */}
        <div className="ui-card">
          <h2 className="card-title">🔗 الروابط والمرفقات المباشرة لقسم ({currentPage})</h2>
          
          <div className="input-group">
            <label>رابط الفيديو الاستعراضي (YouTube / Mp4):</label>
            <input 
              type="url" 
              placeholder="https://example.com/video.mp4" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>رابط الصورة الرئيسية:</label>
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>رابط الملف الصوتي الملحق بالقسم:</label>
            <input 
              type="url" 
              placeholder="https://example.com/audio.mp3" 
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />
          </div>
        </div>

        {/* بطاقة المقالات المدمجة وسائطها */}
        <div className="ui-card">
          <h2 className="card-title">📝 المقالات والتدوينات الموجهة لمتابعي ({currentPage})</h2>
          
          <div className="input-group">
            <label>عنوان المقال الأساسي:</label>
            <input 
              type="text" 
              placeholder="اكتب عنواناً جذاباً وملائماً لطبيعة القسم..." 
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>محتوى التدوينة بالكامل:</label>
            <textarea 
              rows="6" 
              placeholder="اكتب تفاصيل ومحتوى المقال التثقيفي هنا..." 
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>نوع الوسائط المدمجة داخل المقال:</label>
              <select 
                value={articleMediaType} 
                onChange={(e) => setArticleMediaType(e.target.value)}
              >
                <option value="none">بدون وسائط مدمجة</option>
                <option value="image">صورة مدمجة داخل المقال</option>
                <option value="video">فيديو مدمج داخل المقال</option>
              </select>
            </div>

            {articleMediaType !== 'none' && (
              <div className="input-group">
                <label>رابط ميديا المقال المدمجة ({articleMediaType === 'image' ? 'الصورة' : 'الفيديو'}):</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/media-link" 
                  value={articleMediaUrl}
                  onChange={(e) => setArticleMediaUrl(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* بنر استعراض الحالات الفورية */}
        {statusMessage.text && (
          <div className={`status-banner ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {/* زر النشر والتحديث السحابي */}
        <button type="submit" className="submit-btn" disabled={isSaving}>
          {isSaving ? 'جاري مزامنة وتحديث مستندات GitHub الآن...' : `🚀 نشر وتحديث ملف [${currentPage}]`}
        </button>

      </form>
    </div>
  );
}

export default SwingManagement;
