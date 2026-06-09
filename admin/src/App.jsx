import React, { useState } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import './App.css'; // تأكد من إضافة التنسيقات بالأسفل

// دالة الخدمة المدمجة كما أرسلتها تماماً
const SAVE_URL = 'https://nawah-ai-db.vercel.app/api/engine';
const savePageData = async (pageName, updatedContent) => {
  const options = {
    url: SAVE_URL,
    headers: { 'Content-Type': 'application/json' },
    data: {
      page: pageName,       
      content: updatedContent 
    },
  };

  try {
    const response = await CapacitorHttp.post(options);
    return response.data; 
  } catch (error) {
    console.error(`[Admin Service] خطأ أثناء حفظ صفحة ${pageName}:`, error);
    throw error;
  }
};

function App() {
  const PAGE_NAME = 'الأرجوحة';

  // حالات الإدخال (Form States)
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  
  // حالة المقال المدمج
  const [articleTitle, setArticleTitle] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleMediaType, setArticleMediaType] = useState('none'); // none, image, video
  const [articleMediaUrl, setArticleMediaUrl] = useState('');

  // حالات الواجهة (UI States)
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // دالة معالجة الحفظ والنشر لـ GitHub
  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ text: 'جاري رفع البيانات وتحديث مستودع GitHub...', type: 'info' });

    // تجميع البيانات في هيكل كائن منظّم ومتكامل
    const pagePayload = {
      pageName: PAGE_NAME,
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
      await savePageData(PAGE_NAME, pagePayload);
      setStatusMessage({ text: '🎉 تم حفظ بيانات صفحة الأرجوحة وعمل Commit بنجاح!', type: 'success' });
    } catch (error) {
      setStatusMessage({ text: '❌ فشلت عملية الحفظ. يرجى التحقق من اتصال السيرفر.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-app">
      <header className="admin-header">
        <h1>لوحة تحكم رقة</h1>
        <p>إدارة محتوى صفحة: <span className="highlight">[{PAGE_NAME}]</span></p>
      </header>

      <form onSubmit={handlePublish} className="admin-form">
        
        {/* بطاقة الروابط المباشرة */}
        <div className="ui-card">
          <h2 className="card-title">🔗 الروابط والمرفقات المباشرة</h2>
          
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
            <label>رابط الملف الصوتي (صوتيات الأرجوحة):</label>
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
          <h2 className="card-title">📝 قسم المقال والتدوينات المدمجة</h2>
          
          <div className="input-group">
            <label>عنوان المقال:</label>
            <input 
              type="text" 
              placeholder="اكتب عنواناً جذاباً للمقال..." 
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>نص ومحتوى المقال كاملاً:</label>
            <textarea 
              rows="6" 
              placeholder="اكتب تفاصيل ومحتوى المقال هنا..." 
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

        {/* رسائل التنبيه والاشعارات */}
        {statusMessage.text && (
          <div className={`status-banner ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {/* زر النشر والتحديث */}
        <button type="submit" className="submit-btn" disabled={isSaving}>
          {isSaving ? 'جاري تحديث المستودع الآن...' : '🚀 نشر وتحديث صفحة الأرجوحة'}
        </button>

      </form>
    </div>
  );
}

export default App;
