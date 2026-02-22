import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const GET_POSTS_URL = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const SAVE_POST_URL = "https://raqqa-v6cd.vercel.app/api/save-post";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const options = { url: GET_POSTS_URL };
      const response = await CapacitorHttp.get(options);
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      const options = {
        url: SAVE_POST_URL,
        headers: { 'Content-Type': 'application/json' },
        data: {
          content: newContent,
          section: "Home",
          type: mediaUrl ? "رابط" : "نصي",
          external_link: mediaUrl
        }
      };
      await CapacitorHttp.post(options);
      setNewContent("");
      setMediaUrl("");
      fetchPosts();
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setLoading(false);
    }
  };

  // دالة معالجة عرض الفيديو والروابط الخارجية
  const renderMedia = (url) => {
    if (!url) return null;
    
    // تنظيف الرابط من أي مسافات
    const cleanUrl = url.trim();
    
    // التحقق مما إذا كان الرابط فيديو (mp4, webm, أو روابط خارجية مثل youtube)
    const isVideo = cleanUrl.toLowerCase().endsWith('.mp4') || 
                    cleanUrl.toLowerCase().endsWith('.webm') || 
                    cleanUrl.includes('youtube.com') || 
                    cleanUrl.includes('youtu.be');

    if (isVideo) {
      return (
        <div className="video-wrapper">
          <video 
            key={cleanUrl} 
            controls 
            className="media-item"
            playsInline
            preload="metadata"
          >
            <source src={cleanUrl} type="video/mp4" />
            عذراً، متصفحك لا يدعم تشغيل هذا الفيديو.
          </video>
        </div>
      );
    }

    // إذا لم يكن فيديو، نفترض أنها صورة
    return <img src={cleanUrl} alt="Post media" className="media-item" />;
  };

  const toggleLike = (id) => {
    const newLikes = new Set(likedPosts);
    if (newLikes.has(id)) newLikes.delete(id);
    else newLikes.add(id);
    setLikedPosts(newLikes);
  };

  return (
    <div className="home-content">
      <style>{`
        .home-content { max-width: 100%; direction: rtl; font-family: 'Tajawal', sans-serif; }
        
        /* كارت الكتابة */
        .write-card {
          background: #fff;
          margin: 12px;
          padding: 15px;
          border-radius: 25px;
          border: 1px solid var(--female-pink-light);
          box-shadow: 0 4px 12px rgba(255, 77, 125, 0.1);
        }
        .write-card textarea {
          width: 100%; border: none; outline: none; font-size: 1rem;
          min-height: 80px; resize: none; color: var(--text-gray);
        }
        .write-card input {
          width: 100%; border: 1px solid #f0f0f0; padding: 8px;
          border-radius: 12px; margin: 10px 0; font-size: 0.85rem;
        }
        .btn-row { display: flex; justify-content: flex-end; }
        .btn-publish {
          background: var(--female-pink); color: #fff; border: none;
          padding: 8px 25px; border-radius: 20px; font-weight: bold;
        }

        /* كارت المنشور */
        .post-card {
          background: #fff; margin: 15px 12px; border-radius: 20px;
          border: 1px solid var(--female-pink-light); overflow: hidden;
        }
        .post-text { padding: 15px; font-size: 1rem; line-height: 1.6; color: #444; }
        .media-item { width: 100%; display: block; max-height: 450px; object-fit: contain; background: #000; }
        
        /* شريط التفاعل */
        .action-bar {
          display: flex; justify-content: space-around; padding: 10px;
          border-top: 1px solid #f9f9f9; background: #fff;
        }
        .action-btn {
          background: none; border: none; display: flex; align-items: center;
          gap: 5px; cursor: pointer; color: var(--text-gray);
          font-weight: 600; font-family: 'Tajawal';
        }
        .action-btn.active { color: var(--female-pink); }
      `}</style>

      {/* منطقة كتابة منشور */}
      <div className="write-card">
        <textarea 
          placeholder="ماذا يدور في خاطركِ يا رقيقة؟" 
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <input 
          placeholder="ضعِ رابط الفيديو (mp4) أو الصورة هنا..." 
          value={mediaUrl}
          onChange={(e) => setMediaUrl(e.target.value)}
        />
        <div className="btn-row">
          <button className="btn-publish" onClick={handlePublish} disabled={loading}>
            {loading ? "جاري النشر..." : "نشر في الأرجوحة"}
          </button>
        </div>
      </div>

      {/* عرض المنشورات */}
      <div className="feed-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-text">{post.content}</div>
            
            {renderMedia(post.media_url)}

            <div className="action-bar">
              <button 
                className={`action-btn ${likedPosts.has(post.id) ? 'active' : ''}`}
                onClick={() => toggleLike(post.id)}
              >
                {likedPosts.has(post.id) ? '❤️' : '🤍'} إعجاب
              </button>
              <button className="action-btn" onClick={() => alert('قريباً: ميزة التعليقات')}>
                💬 تعليق
              </button>
              <button className="action-btn" onClick={() => alert('تم نسخ رابط المنشور')}>
                🔗 مشاركة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
