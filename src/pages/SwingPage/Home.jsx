import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const GET_POSTS_URL = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const SAVE_POST_URL = "https://raqqa-v6cd.vercel.app/api/save-post";

  useEffect(() => {
    fetchPosts();
  }, []);

  // 1. جلب المنشورات مع معالجة الخطأ التفصيلية
  const fetchPosts = async () => {
    try {
      const options = {
        url: GET_POSTS_URL,
        headers: { 'Content-Type': 'application/json' }
      };
      
      const response = await CapacitorHttp.get(options);
      
      // تحليل استجابة السيرفر بناءً على ملف get-posts.js
      if (response.data && response.data.posts) {
        setPosts(response.data.posts); // الوصول للمصفوفة داخل كائن posts
        setError(null);
      } else {
        console.error("بنية البيانات غير متوقعة:", response.data);
        setError("فشل في قراءة تنسيق البيانات");
      }
    } catch (err) {
      console.error("خطأ في الاتصال بالسيرفر:", err);
      setError("تعذر الاتصال بالخادم، يرجى التحقق من الإنترنت");
    }
  };

  // 2. حفظ المنشور بناءً على ملف save-post.js
  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);

    try {
      const options = {
        url: SAVE_POST_URL,
        headers: { 'Content-Type': 'application/json' },
        data: {
          content: newContent, // الحقل المطلوب في السيرفر
          section: "Home",
          type: mediaUrl ? "رابط" : "نصي", // تحديد النوع
          external_link: mediaUrl // الرابط الخارجي
        }
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.data.success) {
        setNewContent("");
        setMediaUrl("");
        fetchPosts();
      }
    } catch (err) {
      alert("فشل في نشر المنشور، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.match(/\.(mp4|webm)$/);
    return isVideo ? (
      <video src={url} controls className="p-media" />
    ) : (
      <img src={url} alt="content" className="p-media" />
    );
  };

  return (
    <div className="home-page">
      <style>{`
        .home-page { padding: 10px; direction: rtl; }
        .error-msg { color: #ff4d7d; text-align: center; padding: 10px; background: #fff5f7; border-radius: 10px; margin: 10px; }
        
        /* كارت الرفع */
        .post-box { background: #fff; border-radius: 20px; padding: 15px; border: 1px solid var(--female-pink-light); margin-bottom: 20px; }
        .post-box textarea { width: 100%; border: none; outline: none; font-family: 'Tajawal'; font-size: 1rem; min-height: 70px; }
        .url-field { width: 100%; padding: 8px; margin: 10px 0; border: 1px solid #eee; border-radius: 10px; font-size: 0.8rem; }
        .pub-btn { background: var(--female-pink); color: white; border: none; padding: 7px 25px; border-radius: 15px; float: left; font-weight: bold; }

        /* كروت المنشورات */
        .p-card { background: white; border-radius: 15px; margin-bottom: 15px; border: 1px solid var(--female-pink-light); overflow: hidden; }
        .p-text { padding: 15px; color: var(--text-gray); line-height: 1.6; }
        .p-media { width: 100%; max-height: 350px; object-fit: cover; }
        .p-actions { display: flex; justify-content: space-around; padding: 10px; border-top: 1px solid #f9f9f9; }
        .p-btn { background: none; border: none; color: var(--female-pink); font-family: 'Tajawal'; font-weight: 600; cursor: pointer; }
      `}</style>

      {/* واجهة النشر */}
      <div className="post-box">
        <textarea placeholder="اكتبي شيئاً..." value={newContent} onChange={(e)=>setNewContent(e.target.value)} />
        <input className="url-field" placeholder="رابط صورة أو فيديو اختياري" value={mediaUrl} onChange={(e)=>setMediaUrl(e.target.value)} />
        <button className="pub-btn" onClick={handlePublish} disabled={loading}>{loading ? "..." : "نشر"}</button>
        <div style={{clear:'both'}}></div>
      </div>

      {/* رسالة الخطأ إن وجدت */}
      {error && <div className="error-msg">{error}</div>}

      {/* قائمة المنشورات */}
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="p-card">
            <div className="p-text">{post.content}</div>
            {renderMedia(post.media_url)}
            <div className="p-actions">
              <button className="p-btn">❤️ إعجاب</button>
              <button className="p-btn">💬 تعليق</button>
              <button className="p-btn">🔗 مشاركة</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
