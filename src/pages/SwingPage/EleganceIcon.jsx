import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  const CATEGORY_ID = "347212703";
  const SITE_DOMAIN = "raqqastor3.wordpress.com";
  const API_URL = `https://public-api.wordpress.com/wp/v2/sites/${SITE_DOMAIN}/posts?categories=${CATEGORY_ID}&_embed`;
  const APP_LINK = "https://raqa-1zhm.vercel.app/";

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem('raqa_likes') || '{}');
    const savedComments = JSON.parse(localStorage.getItem('raqa_comments') || '{}');
    setLikes(savedLikes);
    setComments(savedComments);
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) setArticles(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // وظيفة سحرية لتنظيف المحتوى: تمنع ظهور أكواد الـ CSS أو الـ HTML البرمجية وتعرض المقال فقط
  const cleanPostContent = (html) => {
    let clean = html;
    // 1. إزالة أي كود محصور بين وسوم <style>
    clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    // 2. إزالة وسوم الهيكل التنظيمي التي قد تسبب فراغات أو مشاكل
    clean = clean.replace(/<html[^>]*>|<body[^>]*>|<\/body>|<\/html>|<head[^>]*>|<\/head>|<meta[^>]*>/gi, "");
    // 3. إزالة التعليقات البرمجية التي ظهرت في صورتك
    clean = clean.replace(/\/\*[\s\S]*?\*\//g, "");
    return clean;
  };

  const handleLike = (postId) => {
    const updated = { ...likes, [postId]: (likes[postId] || 0) + 1 };
    setLikes(updated);
    localStorage.setItem('raqa_likes', JSON.stringify(updated));
  };

  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;
    const updated = { 
      ...comments, 
      [postId]: [...(comments[postId] || []), { text: newComment, date: new Date() }] 
    };
    setComments(updated);
    localStorage.setItem('raqa_comments', JSON.stringify(updated));
    setNewComment("");
  };

  const handleShare = (title) => {
    if (navigator.share) {
      navigator.share({ title: title, url: APP_LINK });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + APP_LINK)}`);
    }
  };

  if (loading) {
    return <div className="loading-screen">لحظات من الأناقة...</div>;
  }

  return (
    <div className="main-wrapper" dir="rtl">
      
      {/* 1. الكلمة الترحيبية الثابتة في أول الشاشة */}
      <div className="fixed-welcome">
        ✨ أهلاً بكِ في عالم الأناقة والشياكة ✨
      </div>

      <div className="container">
        {articles.map((post) => (
          <div key={post.id} className="article-container">
            
            <div className="card">
              <div className="image-container">
                <img 
                   src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'fitness (1).png'} 
                   alt="Elegance" 
                />
              </div>
              
              <div className="content">
                {/* 2. عرض المقال فقط بعد التنظيف من الأكواد الغريبة */}
                <div 
                  className="wp-html-content"
                  dangerouslySetInnerHTML={{ __html: cleanPostContent(post.content.rendered) }} 
                />
                
                {/* رابط التحميل */}
                <div className="app-download-box">
                  <a href={APP_LINK} target="_blank" rel="noreferrer">
                    ✨ حملي التطبيق الآن من هنا ✨
                  </a>
                </div>
              </div>

              {/* أزرار التفاعل */}
              <div className="interaction-buttons">
                <button onClick={() => handleLike(post.id)} className="btn-like">
                  ❤️ <span>{likes[post.id] || 0}</span>
                </button>
                <button onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)} className="btn-comment">
                  💬 تعليق
                </button>
                <button onClick={() => handleShare(post.title.rendered)} className="btn-share">
                  🔗 مشاركة
                </button>
              </div>

              {/* قسم التعليقات */}
              {activeCommentId === post.id && (
                <div className="comments-area">
                  <div className="comment-input-wrap">
                    <input 
                      type="text" 
                      placeholder="أضيفي لمستكِ..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button onClick={() => handleAddComment(post.id)}>نشر</button>
                  </div>
                  <div className="comments-list">
                    {(comments[post.id] || []).map((c, i) => (
                      <div key={i} className="single-comment">{c.text}</div>
                    )).reverse()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;500;700&display=swap');

        body {
          font-family: 'Tajawal', sans-serif;
          background-color: #fdf8f5;
          margin: 0;
          padding: 0;
        }

        /* تنسيق الرسالة الترحيبية الثابتة */
        .fixed-welcome {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #b08968;
          color: white;
          text-align: center;
          padding: 10px 0;
          font-size: 0.95rem;
          font-weight: 700;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 10px 20px; /* الـ 60px لترك مساحة تحت شريط الترحيب */
        }

        .card {
          background: #ffffff;
          max-width: 450px;
          width: 100%;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 25px;
          border: 1px solid #f0e6e0;
        }

        .image-container {
          width: 100%;
          background-color: #ebe0d8;
          display: flex;
          justify-content: center;
          padding-top: 15px;
        }

        .card img {
          width: 90%;
          border-radius: 20px;
          height: 220px;
          object-fit: cover;
          margin-bottom: -10px;
        }

        .content { padding: 25px; text-align: center; }

        /* تنسيق نص المقال الصافي */
        .wp-html-content {
          text-align: right;
          color: #4a3f35;
          font-size: 1.05rem;
        }
        .wp-html-content p { line-height: 1.8; margin-bottom: 15px; }
        .wp-html-content h1 { color: #8d6e63; font-size: 1.4rem; margin-bottom: 10px; text-align: center; }
        
        /* إخفاء أي بقايا أكواد قد تهرب من التنظيف */
        .wp-html-content style, .wp-html-content script { display: none !important; }

        .app-download-box {
          margin-top: 20px;
          padding: 12px;
          background: #fff9f5;
          border: 1px dashed #b08968;
          border-radius: 15px;
        }
        .app-download-box a { color: #8d6e63; text-decoration: none; font-weight: 700; font-size: 0.9rem; }

        .interaction-buttons {
          display: flex;
          justify-content: space-around;
          padding: 15px;
          border-top: 1px solid #fcf6f2;
          background: #fffcfb;
        }
        .interaction-buttons button {
          background: none; border: none; cursor: pointer;
          font-family: 'Tajawal'; font-size: 0.95rem; color: #8d6e63; font-weight: 500;
        }

        .comments-area { padding: 15px; background: #fff; border-top: 1px solid #eee; }
        .comment-input-wrap { display: flex; gap: 8px; margin-bottom: 12px; }
        .comment-input-wrap input { flex: 1; padding: 8px 15px; border-radius: 20px; border: 1px solid #ddd; outline: none; }
        .comment-input-wrap button { background: #b08968; color: white; border: none; padding: 5px 15px; border-radius: 20px; cursor: pointer; }
        .single-comment { background: #fdf8f5; padding: 10px 12px; border-radius: 12px; margin-bottom: 8px; font-size: 0.85rem; border-right: 4px solid #b08968; text-align: right; }

        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; color: #b08968; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default EleganceSection;
