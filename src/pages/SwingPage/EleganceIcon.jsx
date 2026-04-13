import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // حالات التفاعل (حفظ محلي)
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
      {/* Header */}
      <header className="app-header">
        <h1>مجلة <span className="highlight-text">رقة</span></h1>
        <div className="icon-flower">🌸</div>
      </header>

      <div className="container">
        {articles.map((post) => (
          <div key={post.id} className="article-container">
            
            {/* الكارت الذي يعرض محتوى الـ HTML من وردبريس */}
            <div className="card">
              <div className="image-container">
                {/* استخدام الصورة البارزة من وردبريس كصورة للكارت */}
                <img 
                   src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'fitness (1).png'} 
                   alt="Elegance" 
                />
              </div>
              
              <div className="content">
                {/* حقن محتوى الـ HTML القادم من وردبريس مباشرة */}
                <div 
                  className="wp-html-content"
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                />
                
                {/* رابط تحميل التطبيق المدمج داخل الكارت */}
                <div className="app-download-box">
                  <a href={APP_LINK} target="_blank" rel="noreferrer">
                    ✨ حملي التطبيق الآن من هنا ✨
                  </a>
                </div>
              </div>

              {/* أزرار التفاعل أسفل الكارت */}
              <div className="interaction-buttons">
                <button onClick={() => handleLike(post.id)} className="btn-like">
                  ❤️ <span>{likes[post.id] || 0}</span> إعجاب
                </button>
                
                <button onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)} className="btn-comment">
                  💬 تعليق
                </button>

                <button onClick={() => handleShare(post.title.rendered)} className="btn-share">
                  🔗 مشاركة
                </button>
              </div>

              {/* قسم التعليقات المنسدل */}
              {activeCommentId === post.id && (
                <div className="comments-area">
                  <div className="comment-input-wrap">
                    <input 
                      type="text" 
                      placeholder="أضيفي لمستكِ بتعليق..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button onClick={() => handleAddComment(post.id)}>نشر</button>
                  </div>
                  <div className="comments-list">
                    {(comments[post.id] || []).map((c, i) => (
                      <div key={i} className="single-comment">
                        {c.text}
                      </div>
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
          color: #4a3f35;
        }

        .app-header {
          background: white;
          padding: 15px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .highlight-text { color: #b08968; }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 10px;
        }

        /* تنسيق الكارت كما في طلبك */
        .card {
          background: #ffffff;
          max-width: 450px;
          width: 100%;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.05);
          margin-bottom: 30px;
        }

        .image-container {
          width: 100%;
          background-color: #ebe0d8;
          display: flex;
          justify-content: center;
          padding-top: 20px;
        }

        .card img {
          width: 90%;
          border-radius: 20px 20px 0 0;
          display: block;
          height: 250px;
          object-fit: cover;
        }

        .content { padding: 25px; text-align: center; }

        /* تنسيق محتوى وردبريس ليطابق ذوقك */
        .wp-html-content h1, .wp-html-content h2 { color: #8d6e63; font-size: 1.4rem; }
        .wp-html-content p { line-height: 1.8; font-size: 1rem; margin-bottom: 15px; }
        .wp-html-content .highlight { color: #b08968; font-weight: bold; }

        .app-download-box {
          margin-top: 20px;
          padding: 12px;
          background: #fdf8f5;
          border: 1px dashed #b08968;
          border-radius: 15px;
        }
        .app-download-box a {
          color: #8d6e63;
          text-decoration: none;
          font-weight: bold;
          font-size: 0.9rem;
        }

        /* أزرار التفاعل */
        .interaction-buttons {
          display: flex;
          justify-content: space-around;
          padding: 15px;
          border-top: 1px solid #f5f5f5;
          background: #fafafa;
        }
        .interaction-buttons button {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Tajawal';
          font-weight: 500;
          font-size: 0.9rem;
          color: #777;
        }
        .btn-like { color: #e63946 !important; }

        /* قسم التعليقات */
        .comments-area {
          padding: 15px;
          background: #fff;
          border-top: 1px solid #eee;
        }
        .comment-input-wrap {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .comment-input-wrap input {
          flex: 1;
          padding: 8px 15px;
          border-radius: 20px;
          border: 1px solid #ddd;
          outline: none;
        }
        .comment-input-wrap button {
          background: #b08968;
          color: white;
          border: none;
          padding: 5px 15px;
          border-radius: 20px;
        }
        .single-comment {
          background: #fdf8f5;
          padding: 10px 15px;
          border-radius: 15px;
          margin-bottom: 8px;
          font-size: 0.85rem;
          border-right: 3px solid #b08968;
        }

        .loading-screen {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #b08968;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default EleganceSection;
