import React, { useState, useEffect } from 'react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const GET_POSTS_API = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const SAVE_POST_API = "https://raqqa-v6cd.vercel.app/api/save-post";

  // 1. جلب المنشورات عند تحميل الصفحة
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(GET_POSTS_API);
      const data = await response.json();
      // الترتيب من الأحدث للأقدم
      setPosts(data.reverse());
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
  };

  // 2. معالجة رفع المنشور الجديد
  const handleUpload = async () => {
    if (!newPost && !imageFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("text", newPost);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await fetch(SAVE_POST_API, {
        method: 'POST',
        body: formData, // نرسل فورم داتا لدعم الصور والنصوص
      });

      if (response.ok) {
        setNewPost("");
        setImageFile(null);
        fetchPosts(); // تحديث القائمة بعد النشر
      }
    } catch (error) {
      alert("حدث خطأ أثناء النشر");
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحديد نوع المحتوى (فيديو أو صورة) بناءً على الرابط
  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.match(/\.(mp4|webm|ogg)$/) || url.includes('youtube.com') || url.includes('youtu.be');
    
    if (isVideo) {
      return (
        <video controls className="post-media">
          <source src={url} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      );
    }
    return <img src={url} alt="محتوى المنشور" className="post-media" />;
  };

  return (
    <div className="home-container">
      {/* دمج تنسيقات CSS الإضافية للبوستات */}
      <style>{`
        .home-container { max-width: 600px; margin: 0 auto; padding-bottom: 100px; }
        
        /* كارت كتابة منشور */
        .upload-card {
          background: white;
          padding: 15px;
          border-radius: 20px;
          box-shadow: 0 4px 15px var(--female-pink-light);
          margin-bottom: 25px;
          border: 1px solid var(--female-pink-light);
        }
        .upload-card textarea {
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          font-family: 'Tajawal';
          font-size: 1rem;
          min-height: 80px;
        }
        .upload-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        .btn-post {
          background: var(--female-pink);
          color: white;
          border: none;
          padding: 8px 25px;
          border-radius: 15px;
          font-weight: bold;
          cursor: pointer;
        }

        /* كارت المنشور */
        .post-card {
          background: white;
          border-radius: 20px;
          margin-bottom: 20px;
          overflow: hidden;
          border: 1px solid var(--female-pink-light);
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .post-header { padding: 15px; display: flex; align-items: center; gap: 10px; }
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #eee; }
        .post-content { padding: 0 15px 15px 15px; color: var(--text-gray); line-height: 1.6; }
        .post-media { width: 100%; max-height: 400px; object-fit: cover; }
        
        /* أزرار التفاعل */
        .post-interactions {
          display: flex;
          justify-content: space-around;
          padding: 10px;
          border-top: 1px solid #f9f9f9;
        }
        .interaction-btn {
          background: none;
          border: none;
          color: var(--text-gray);
          font-family: 'Tajawal';
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: 0.3s;
        }
        .interaction-btn:hover { color: var(--female-pink); }
        .interaction-btn.active { color: var(--female-pink); font-weight: bold; }
      `}</style>

      {/* 1. كارت إضافة منشور جديد */}
      <div className="upload-card">
        <textarea 
          placeholder="بماذا تشعرين اليوم يا جميلة؟..." 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <div className="upload-actions">
          <label style={{cursor: 'pointer', color: 'var(--accent-purple)'}}>
            📷 إضافة صورة/فيديو
            <input 
              type="file" 
              hidden 
              onChange={(e) => setImageFile(e.target.files[0])} 
              accept="image/*,video/*"
            />
          </label>
          <button className="btn-post" onClick={handleUpload} disabled={loading}>
            {loading ? "جاري النشر..." : "نشر"}
          </button>
        </div>
        {imageFile && <p style={{fontSize: '0.8rem', color: 'green'}}>تم اختيار: {imageFile.name}</p>}
      </div>

      {/* 2. عرض المنشورات */}
      <div className="feed">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="user-avatar" style={{background: `url('https://ui-avatars.com/api/?name=User&background=ff4d7d&color=fff')`, backgroundSize: 'cover'}}></div>
              <div>
                <div className="card-label">عضوة الأرجوحة</div>
                <small style={{color: '#999'}}>منذ قليل</small>
              </div>
            </div>

            <div className="post-content">
              {post.text}
            </div>

            {/* عرض الميديا سواء صورة أو فيديو أو رابط */}
            {renderMedia(post.image_url || post.video_url || post.url)}

            <div className="post-interactions">
              <button className="interaction-btn" onClick={() => alert('تم الإعجاب')}>
                ❤️ إعجاب
              </button>
              <button className="interaction-btn" onClick={() => alert('فتح التعليقات')}>
                💬 تعليق
              </button>
              <button className="interaction-btn" onClick={() => alert('تمت المشاركة')}>
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
