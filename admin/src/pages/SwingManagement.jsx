import React, { useState, useEffect, useRef } from 'react';
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

  // مرجع برمي (Ref) للتحكم في التمرير والتحريك السلس للمستند
  const statusBannerRef = useRef(null);

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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  
  // حالة إضافية للتحكم في إعادة تشغيل أنيميشن الكروت عند تبديل الأقسام
  const [animateTrigger, setAnimateTrigger] = useState(true);

  // دالة تحريك الصفحة بسلاسة (Smooth Scroll) تركّز على الرسائل التنبيهية
  const scrollToStatus = () => {
    setTimeout(() => {
      statusBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // دالة ذكية لإعادة تهيئة الحقول وتجهيزها للاستقبال الفوري عند تغيير القسم
  const loadSectionLiveContent = async (sectionName) => {
    setIsLoadingData(true);
    setAnimateTrigger(false); // إيقاف الأنيميشن مؤقتاً لإعادة تشغيلها
    
    // تفريغ المدخلات تلقائياً لتهيئة الواجهة لكتابة محتوى جديد للقسم المختار
    setVideoUrl(''); setImageUrl(''); setAudioUrl('');
    setArticleTitle(''); setArticleBody(''); setArticleMediaType('none'); setArticleMediaUrl('');
    
    setStatusMessage({ text: `💡 جاهز لتلقي بيانات قسم [${sectionName}] وتأمين الحفظ السحابي له.`, type: 'info' });
    setIsLoadingData(false);
    
    // إعادة تفعيل حركة الكروت بسلاسة بعد تفريغ البيانات
    setTimeout(() => {
      setAnimateTrigger(true);
    }, 50);
    
    scrollToStatus();
  };

  // تأثير المزامنة عند تغيير القسم المختار
  useEffect(() => {
    loadSectionLiveContent(currentPage);
  }, [currentPage]);

  // دالة معالجة الحفظ والنشر التلقائي لـ GitHub
  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ text: `جاري رفع البيانات وتحديث ملف [${currentPage}] في مستودع GitHub...`, type: 'info' });
    scrollToStatus();

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
      await savePageData(currentPage, pagePayload);
      setStatusMessage({ text: `🎉 تم حفظ وتأمين بيانات صفحة [${currentPage}] بنجاح داخل المستودع السحابي!`, type: 'success' });
    } catch (error) {
      console.error(error);
      setStatusMessage({ text: '❌ فشلت عملية الحفظ السحابي. يرجى التحقق من توكن الصلاحيات أو الشبكة.', type: 'error' });
    } finally {
      setIsSaving(false);
      scrollToStatus();
    }
  };

  return (
    <div className="admin-app" dir="rtl">
      <header className="admin-header">
        <div className="header-badge">لوحة الإشراف العليا</div>
        <h1>لوحة تحكم رقة</h1>
        <p>إدارة محتوى ومصفوفة أقسام التطبيق الذكية بنظام المزامنة الفورية</p>
      </header>

      {/* بطاقة التحكم الديناميكي واختيار الأقسام المستهدفة */}
      <div className="ui-card selection-card">
        <div className="input-group">
          <label className="main-select-label">🎯 اختر الصفحة المراد تعديل بياناتها ونشرها سحابياً:</label>
          <div className="select-wrapper">
            <select 
              className="main-select-dropdown"
              value={currentPage}
              disabled={isLoadingData || isSaving}
              onChange={(e) => setCurrentPage(e.target.value)}
            >
              {SECTIONS.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handlePublish} className="admin-form">
        
        {/* بطاقة الروابط المباشرة لوسائط القسم */}
        <div className={`ui-card ${animateTrigger ? 'animate-card' : 'hide-card'}`}>
          <h2 className="card-title">🔗 الروابط والمرفقات المباشرة لقسم <span className="highlight-text">({currentPage})</span></h2>
          <div className="card-divider"></div>
          
          <div className="input-group">
            <label>رابط الفيديو الاستعراضي العريض (YouTube / Mp4):</label>
            <input 
              type="url" 
              placeholder="https://example.com/video.mp4" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>رابط الصورة الرئيسية البارزة:</label>
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>رابط الملف الصوتي الملحق (بث صوتي / موسيقى):</label>
            <input 
              type="url" 
              placeholder="https://example.com/audio.mp3" 
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
            />
          </div>
        </div>

        {/* بطاقة المقالات المدمجة وسائطها */}
        <div className={`ui-card ${animateTrigger ? 'animate-card delay-1' : 'hide-card'}`}>
          <h2 className="card-title">📝 المقالات والتدوينات الموجهة لمتابعي <span className="highlight-text">({currentPage})</span></h2>
          <div className="card-divider"></div>
          
          <div className="input-group">
            <label>عنوان المقال الأساسي الداخلي:</label>
            <input 
              type="text" 
              placeholder="اكتب عنواناً جذاباً وملائماً لطبيعة القسم..." 
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>محتوى التدوينة والسطور التثقيفية بالكامل:</label>
            <textarea 
              rows="6" 
              placeholder="اكتب تفاصيل ومحتوى المقال التثقيفي هنا..." 
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>نوع الوسائط المدمجة داخل فقرات المقال:</label>
              <div className="select-wrapper">
                <select 
                  value={articleMediaType} 
                  onChange={(e) => setArticleMediaType(e.target.value)}
                >
                  <option value="none">بدون وسائط مدمجة</option>
                  <option value="image">صورة مدمجة داخل المقال</option>
                  <option value="video">فيديو مدمج داخل المقال</option>
                </select>
              </div>
            </div>

            {articleMediaType !== 'none' && (
              <div className="input-group highlight-input">
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

        {/* بنر استعراض الحالات الفورية ومحرك التحريك السلس */}
        <div ref={statusBannerRef} className="status-container">
          {statusMessage.text && (
            <div className={`status-banner ${statusMessage.type}`}>
              <div className="banner-icon">
                {statusMessage.type === 'success' ? '✨' : statusMessage.type === 'error' ? '❌' : '⏳'}
              </div>
              <div className="banner-text">{statusMessage.text}</div>
            </div>
          )}
        </div>

        {/* زر النشر والتحديث السحابي */}
        <button type="submit" className="submit-btn" disabled={isSaving || isLoadingData}>
          {isSaving ? (
            <span className="btn-loading-flex">
              <span className="spinner"></span> جاري تأمين ومزامنة السيرفر السحابي...
            </span>
          ) : `🚀 حفظ ونشر تحديثات [ ${currentPage} ]`}
        </button>

      </form>

      {/* تصفيفات الـ CSS الفاخرة المدمجة لدعم نمط الكروت الحديثة */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');

        :root {
          --bg-main: #fdfaf7;
          --accent-brown: #8d6e63;
          --primary-gold: #b08968;
          --dark-text: #4a3f35;
          --card-bg: #ffffff;
          --border-color: #f0e5dd;
          --shadow-premium: 0 10px 35px rgba(141, 110, 99, 0.05);
          --transition-smooth: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body {
          background-color: var(--bg-main);
          font-family: 'Tajawal', sans-serif;
          color: var(--dark-text);
          margin: 0; 
          padding: 0;
          overflow-y: auto !important; /* يضمن إتاحة التمرير العمودي للصفحة دائماً */
          min-height: 100vh;
        }

        .admin-app {
          max-width: 750px;
          margin: 0 auto;
          padding: 30px 15px 80px;
          height: auto; /* يسمح للتطبيق بالتمدد لأسفل حسب المحتوى */
        }

        /* تنسيق الهيدر والمقدمة علوياً */
        .admin-header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeIn 0.6s ease-out forwards;
        }
        .header-badge {
          display: inline-block;
          background: #efe5de;
          color: var(--accent-brown);
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .admin-header h1 {
          font-size: 2.3rem;
          font-weight: 900;
          color: var(--accent-brown);
          margin: 0 0 10px 0;
        }
        .admin-header p {
          color: #7c6e63;
          font-size: 1.05rem;
          margin: 0;
        }

        /* تنسيق الكروت الفاخرة */
        .ui-card {
          background: var(--card-bg);
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 25px;
          box-shadow: var(--shadow-premium);
          border: 1px solid var(--border-color);
          transition: var(--transition-smooth);
        }
        .ui-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(141, 110, 99, 0.08);
        }
        
        .selection-card {
          background: linear-gradient(135deg, #ffffff 0%, #fdfcfb 100%);
          border-right: 5px solid var(--primary-gold);
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-brown);
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-divider {
          height: 1px;
          background: linear-gradient(to left, var(--border-color), transparent);
          margin-bottom: 22px;
        }

        .highlight-text {
          color: var(--primary-gold);
        }

        /* عناصر المدخلات والقوائم */
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 18px;
          text-align: right;
        }
        .input-group:last-child {
          margin-bottom: 0;
        }
        .input-group label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--dark-text);
          padding-right: 4px;
        }
        .main-select-label {
          font-size: 1.05rem !important;
          color: var(--accent-brown) !important;
        }

        input[type="text"], input[type="url"], textarea, select {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background-color: #fbf9f6;
          font-family: 'Tajawal';
          font-size: 1rem;
          color: var(--dark-text);
          outline: none;
          transition: var(--transition-smooth);
        }
        input:focus, textarea:focus, select:focus {
          border-color: var(--primary-gold);
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(176, 137, 104, 0.1);
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .select-wrapper {
          position: relative;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr; gap: 0; }
        }

        .highlight-input input {
          border-color: #e2d2c5;
          background-color: #fffdfb;
        }

        /* بنر الحالات الفورية والتحذيرات */
        .status-container {
          min-height: 20px;
          margin-bottom: 25px;
        }
        .status-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 22px;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.5;
          animation: fadeIn 0.4s ease-out forwards;
          text-align: right;
        }
        .status-banner.info {
          background-color: #f4effa;
          color: #5c3b87;
          border: 1px solid #e5daf2;
        }
        .status-banner.success {
          background-color: #edf7ed;
          color: #1e4620;
          border: 1px solid #c8e6c9;
        }
        .status-banner.error {
          background-color: #fdeded;
          color: #5f2120;
          border: 1px solid #ffcdcd;
        }
        .banner-icon {
          font-size: 1.3rem;
        }

        /* أزرار الحفظ والنشر الدائرية الفخمة */
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--primary-gold) 0%, var(--accent-brown) 100%);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 16px;
          font-family: 'Tajawal';
          font-size: 1.15rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(141, 110, 99, 0.2);
          transition: var(--transition-smooth);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(141, 110, 99, 0.3);
          filter: brightness(1.05);
        }
        .submit-btn:disabled {
          background: #d7ccc8;
          color: #8d6e63;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-loading-flex {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }

        /* تأثيرات التحريك الاحترافية */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-card { 
          animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
        }
        
        .hide-card {
          opacity: 0;
          transform: translateY(12px);
        }
        
        .delay-1 { animation-delay: 0.1s; }

        /* الأنيميشن الدائرية للـ Spinner الخاص بالتحميل */
        .spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default SwingManagement;
