import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const GET_POSTS_URL = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const SAVE_POST_URL = "https://raqqa-v6cd.vercel.app/api/save-post";

  // 1. جلب المنشورات عند تحميل الصفحة باستخدام CapacitorHttp
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const options = {
        url: GET_POSTS_URL,
        headers: { 'Content-Type': 'application/json' }
      };
      
      const response = await CapacitorHttp.get(options);
      
      // في CapacitorHttp البيانات تكون داخل response.data
      if (response.data && Array.isArray(response.data)) {
        setPosts(response.data.reverse()); // الأحدث أولاً
      }
    } catch (error) {
      console.error("فشل جلب المنشورات:", error);
    }
  };

  // 2. منطق النشر باستخدام CapacitorHttp
  const handleUpload = async () => {
    if (!newPost && !imageFile) return;
    setLoading(true);

    try {
      // ملاحظة: لرفع الصور عبر CapacitorHttp يفضل إرسالها كـ Base64 أو استخدام FormData 
      // هنا سنعتمد إرسال البيانات كنص وصورة (إذا توفرت)
      const options = {
        url: SAVE_POST_URL,
        headers: { 'Content-Type': 'application/json' },
        data: {
          text: newPost,
          image: imageFile ? imageFile : null, // تأكد من معالجة الصورة قبل الإرسال
          date: new Date().toISOString()
        }
      };

      const response = await CapacitorHttp.post(options);

      if (response.status === 200 || response.status === 201) {
        setNewPost("");
        setImageFile(null);
        fetchPosts(); // تحديث القائمة
      }
    } catch (err) {
      console.error("فشل النشر:", err);
      alert("عذراً، تعذر نشر المنشور الآن.");
    } finally {
      setLoading(false);
    }
  };

  // دالة عرض الوسائط (فيديو أو صور)
  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.match(/\.(mp4|webm|ogg)$/) || url.includes('youtube.com');
    
    return isVideo ? (
      <video controls className="post-media-content">
        <source src={url} type="video/mp4" />
      </video>
    ) : (
      <img src={url} alt="Post Content" className="post-media-content" />
    );
  };

  return (
    <div className="home-feed-container">
      <style>{`
        .home-feed-container { max-width: 100%; padding-bottom: 100px; }
        
        /* كارت النشر العلوي */
        .publish-card {
          background: white;
          margin: 10px;
          padding: 15px;
          border-radius: 25px;
          border: 1px solid var(--female-pink-light);
          box-shadow: 0 4px 12px rgba(255, 77, 125, 0.08);
        }
        .publish-input {
          width: 100%;
          border: none;
          outline: none;
          font-family: 'Tajawal';
          font-size: 1.1rem;
          min-height: 60px;
          color: var(--text-gray);
        }
        .publish-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          border-top: 1px solid #f5f5f5;
          padding-top: 10px;
        }

        /* تنسيق المنشورات */
        .post-item {
          background: white;
          margin: 15px 10px;
          border-radius: 20px;
          border: 1px solid var(--female-pink-light);
          overflow: hidden;
        }
        .post-text-body {
          padding: 15px;
          font-size: 1rem;
          color: #444;
          line-height: 1.6;
          text-align: right;
        }
        .post-media-content {
          width: 100%;
          display: block;
          max-height: 350px;
          object-fit: cover;
        }

        /* أزرار التفاعل */
        .post-actions-bar {
          display: flex;
          justify-content: space-around;
          padding: 12px;
          background: #fffafb;
          border-top: 1px solid var(--female-pink-light);
        }
        .action-btn {
          background: none;
          border: none;
          font-family: 'Tajawal';
          color: var(--female-pink);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-send {
          background: var(--female-pink);
          color: white;
          border: none;
          padding: 6px 20px;
          border-radius: 20px;
          font-weight: bold;
        }
      `}</style>

      {/* منطقة كتابة منشور جديد */}
      <div className="publish-card">
        <textarea 
          className="publish-input"
          placeholder="ماذا يدور في خاطركِ يا رقيقة؟"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="publish-footer">
          <label style={{color: 'var(--accent-purple)', fontSize: '0.9rem', cursor: 'pointer'}}>
            🖼️ إضافة صورة
            <input type="file" hidden onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          <button className="btn-send" onClick={handleUpload} disabled={loading}>
            {loading ? "جاري..." : "نشر"}
          </button>
        </div>
      </div>

      {/* عرض المنشورات المجلوبة */}
      <div className="posts-list">
        {posts.map((post, index) => (
          <div key={post.id || index} className="post-item">
            <div className="post-text-body">
              {post.text}
            </div>
            
            {renderMedia(post.image_url || post.url)}

            <div className="post-actions-bar">
              <button className="action-btn" onClick={() => alert('أعجبني')}>❤️ إعجاب</button>
              <button className="action-btn" onClick={() => alert('تعليق')}>💬 تعليق</button>
              <button className="action-btn" onClick={() => alert('مشاركة')}>🔗 مشاركة</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
