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

  // وظيفة لتنظيف المحتوى من وسوم html/body الزائدة وعرض المقال فقط
  const cleanPostContent = (html) => {
    let clean = html;
    // إزالة وسوم head, body, html إذا وجدت داخل المقال
    clean = clean.replace(/<html[^>]*>|<body[^>]*>|<\/body>|<\/html>|<head[^>]*>|<\/head>|<meta[^>]*>|<title[^>]*>|<\/title>/gi, "");
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
    return <div className="loading-screen">تحميل الأناقة...</div>;
  }

  return (
    <div className="main-wrapper" dir="rtl">
      {/* الرسالة الترحيبية الثابتة */}
      <div className="welcome-bar">
        ✨ أهلاً بكِ في عالم الأناقة والشياكة ✨
      </div>

      <header className="app-header">
        <h1>مجلة <span className="highlight-text">رقة</span></h1>
        <div className="icon-flower">🌸</div>
      </header>

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
                {/* عرض المحتوى المنظف فقط بدون أكواد HTML لغوية */}
                <div 
                  className="wp-html-content"
                  dangerouslySetInnerHTML={{ __html: cleanPostContent(post.content.rendered) }} 
                />
                
                <div className="app-download-box">
                  <a href={APP_LINK} target="_blank" rel="noreferrer">
                    ✨ حملي التطبيق الآن من هنا ✨
                  </a>
                </div>
              </div>

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

        /* شريط الترحيب الثابت */
        .welcome-bar {
          background: #b08968;
          color: white;
          text-align: center;
          padding: 8px 0;
          font-size: 0.9rem;
          font-weight: 500;
          position: sticky;
          top: 0;
          z-index: 101;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .app-header {
          background: white;
          padding: 10px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 35px; /* يظهر تحت شريط الترحيب */
          z-index: 100;
          border-bottom: 1px solid #f0e6e0;
        }

        .highlight-text { color: #b08968; }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 10px;
        }

        .card {
          background: #ffffff;
          max-width: 450px;
          width: 100%;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 25px;
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
          border-radius: 20px 20px 0 0;
          height: 220px;
          object-fit: cover;
        }

        .content { padding: 20px; text-align: center; }

        /* تجميل المحتوى ومنع تداخل الأكواد */
        .wp-html-content {
          text-align: right;
          color: #4a3f35;
        }
        .wp-html-content p { line-height: 1.7; margin-bottom: 12px; }
        .wp-html-content img { max-width: 100%; border-radius: 10px; }

        .app-download-box {
          margin-top: 15px;
          padding: 10px;
          background: #fff9f5;
          border: 1px dashed #b08968;
          border-radius: 12px;
        }
        .app-download-box a { color: #8d6e63; text-decoration: none; font-weight: 700; font-size: 0.85rem; }

        .interaction-buttons {
          display: flex;
          justify-content: space-around;
          padding: 12px;
          border-top: 1px solid #fcf6f2;
          background: #fffcfb;
        }
        .interaction-buttons button {
          background: none; border: none; cursor: pointer;
          font-family: 'Tajawal'; font-size: 0.9rem; color: #8d6e63;
        }

        .comments-area { padding: 15px; background: #fff; border-top: 1px solid #eee; }
        .comment-input-wrap { display: flex; gap: 8px; margin-bottom: 12px; }
        .comment-input-wrap input { flex: 1; padding: 6px 15px; border-radius: 20px; border: 1px solid #ddd; font-family: 'Tajawal'; outline: none; }
        .comment-input-wrap button { background: #b08968; color: white; border: none; padding: 5px 12px; border-radius: 20px; }
        .single-comment { background: #fdf8f5; padding: 8px 12px; border-radius: 12px; margin-bottom: 6px; font-size: 0.8rem; border-right: 3px solid #b08968; }

        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; color: #b08968; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default EleganceSection;
