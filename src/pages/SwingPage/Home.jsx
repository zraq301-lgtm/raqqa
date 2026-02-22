import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); // للروابط الخارجية
  const [loading, setLoading] = useState(false);

  const GET_POSTS_URL = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const SAVE_POST_URL = "https://raqqa-v6cd.vercel.app/api/save-post";

  useEffect(() => {
    fetchPosts();
  }, []);

  // 1. جلب المنشورات (GET)
  const fetchPosts = async () => {
    try {
      const options = {
        url: GET_POSTS_URL,
        headers: { 'Content-Type': 'application/json' }
      };
      const response = await CapacitorHttp.get(options);
      
      // السيرفر يعيد البيانات داخل كائن posts
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
  };

  // 2. حفظ منشور جديد (POST)
  const handlePublish = async () => {
    if (!newContent) {
      alert("الرجاء كتابة محتوى أولاً");
      return;
    }
    setLoading(true);

    try {
      // بناءً على كود save-post.js، الحقول المطلوبة هي content, section, type
      const options = {
        url: SAVE_POST_URL,
        headers: { 'Content-Type': 'application/json' },
        data: {
          content: newContent,
          type: mediaUrl ? "رابط" : "نصي", // تحديد النوع بناءً على وجود رابط
          external_link: mediaUrl, // الحقل الذي يتوقعه السيرفر للروابط
          section: "Home" 
        }
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200) {
        setNewContent("");
        setMediaUrl("");
        fetchPosts(); // تحديث القائمة فوراً
      }
    } catch (err) {
      console.error("فشل النشر:", err);
    } finally {
      setLoading(false);
    }
  };

  // وظيفة عرض الميديا (صورة أو فيديو) بناءً على الرابط المجلوب من media_url
  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.includes('youtube.com') || url.includes('youtu.be') || url.match(/\.(mp4|webm)$/);
    
    if (isVideo) {
      return (
        <div className="media-container">
          <video src={url} controls className="post-media-element" />
        </div>
      );
    }
    return <img src={url} alt="محتوى" className="post-media-element" />;
  };

  return (
    <div className="home-wrapper">
      <style>{`
        .home-wrapper { padding-bottom: 80px; direction: rtl; }
        
        /* كارت الرفع الجديد */
        .upload-section {
          background: #fff;
          margin: 15px;
          padding: 20px;
          border-radius: 25px;
          border: 1px solid var(--female-pink-light);
          box-shadow: 0 4px 15px rgba(255, 77, 125, 0.05);
        }
        .post-textarea {
          width: 100%;
          border: none;
          outline: none;
          font-family: 'Tajawal';
          font-size: 1.1rem;
          min-height: 80px;
          resize: none;
        }
        .url-input {
          width: 100%;
          border: 1px solid #f0f0f0;
          padding: 8px;
          border-radius: 10px;
          margin: 10px 0;
          font-size: 0.9rem;
        }
        .upload-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
        .publish-btn {
          background: var(--female-pink);
          color: white;
          border: none;
          padding: 8px 30px;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
        }

        /* كارت عرض المنشورات */
        .post-card-item {
          background: white;
          margin: 15px;
          border-radius: 20px;
          border: 1px solid var(--female-pink-light);
          overflow: hidden;
        }
        .post-body { padding: 15px; font-size: 1.05rem; color: var(--text-gray); line-height: 1.7; }
        .post-media-element { width: 100%; display: block; max-height: 400px; object-fit: cover; }
        
        .interaction-row {
          display: flex;
          justify-content: space-around;
          padding: 12px;
          background: #fff;
          border-top: 1px solid #f9f9f9;
        }
        .act-btn {
          background: none;
          border: none;
          color: var(--female-pink);
          font-family: 'Tajawal';
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      {/* واجهة إضافة منشور (POST) */}
      <div className="upload-section">
        <textarea 
          className="post-textarea"
          placeholder="اكتبي منشوراً جديداً..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <input 
          className="url-input"
          placeholder="أضيفي رابط صورة أو فيديو (اختياري)"
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
        <div className="upload-footer">
          <button className="publish-btn" onClick={handlePublish} disabled={loading}>
            {loading ? "جاري النشر..." : "نشر الآن"}
          </button>
        </div>
      </div>

      {/* واجهة عرض المنشورات (GET) */}
      <div className="posts-feed">
        {posts.map((post) => (
          <div key={post.id} className="post-card-item">
            <div className="post-body">
              {post.content}
            </div>
            
            {/* عرض الميديا من حقل media_url المجلوب */}
            {renderMedia(post.media_url)}

            <div className="interaction-row">
              <button className="act-btn">❤️ إعجاب</button>
              <button className="act-btn">💬 تعليق</button>
              <button className="act-btn">🔗 مشاركة</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
