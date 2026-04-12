import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // نظام التفاعل المحلي (LocalStorage)
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
    fetchEleganceArticles();
  }, []);

  const fetchEleganceArticles = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) setArticles(data);
    } catch (error) {
      console.error("Error:", error);
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

  // دالة معالجة الـ HTML ليكون مرآة حقيقية للمقال
  const renderStyledContent = (html) => {
    // تنظيف السمات المزعجة وإضافة رابط التحميل
    let cleanHtml = html.replace(/srcset=".*?"|sizes=".*?"/g, '');
    const downloadAppHtml = `
      <div class="app-promo-card">
        <p>استمتعي بتجربة أفضل على تطبيقنا</p>
        <a href="${APP_LINK}" class="download-btn">حملي التطبيق الآن</a>
      </div>
    `;
    return cleanHtml + downloadAppHtml;
  };

  if (loading) return <div className="loader">جاري تحضير الأناقة...</div>;

  return (
    <div className="app-container" dir="rtl">
      <header className="main-header">
        <h1>مجلة <span className="brand">رقة</span></h1>
        <div className="icon">🌸</div>
      </header>

      <div className="articles-grid">
        {articles.map((post) => (
          <article key={post.id} className="mirror-card">
            {/* عرض الصورة البارزة */}
            {post._embedded?.['wp:featuredmedia'] && (
              <div className="card-image-wrap">
                <img src={post._embedded['wp:featuredmedia'][0].source_url} alt="" />
              </div>
            )}

            <div className="card-content">
              <h2 className="post-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              
              {/* عرض الـ HTML الخاص بالمقال كمرآة */}
              <div 
                className="html-mirror-body" 
                dangerouslySetInnerHTML={{ __html: renderStyledContent(post.content.rendered) }} 
              />

              {/* أزرار التفاعل */}
              <div className="interaction-bar">
                <button onClick={() => handleLike(post.id)} className="btn-like">
                  ❤️ {likes[post.id] || 0}
                </button>
                <button onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)} className="btn-comm">
                  💬 {(comments[post.id] || []).length}
                </button>
                <button onClick={() => window.open(`https://wa.me/?text=${APP_LINK}`)} className="btn-share">
                  🔗 مشاركة
                </button>
              </div>

              {/* قسم التعليقات المتتالي */}
              {activeCommentId === post.id && (
                <div className="comments-section">
                  <div className="input-group">
                    <input 
                      type="text" 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="اكتبي تعليقكِ..." 
                    />
                    <button onClick={() => handleAddComment(post.id)}>نشر</button>
                  </div>
                  <div className="comments-list">
                    {(comments[post.id] || []).map((c, i) => (
                      <div key={i} className="comment-bubble">{c.text}</div>
                    )).reverse()}
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .app-container { background: #FFF9FA; min-height: 100vh; font-family: 'Cairo', sans-serif; padding-bottom: 50px; }
        .main-header { background: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ffe4e6; sticky; top: 0; z-index: 10; }
        .brand { color: #f43f5e; }
        
        .articles-grid { max-width: 500px; margin: 20px auto; padding: 0 15px; }
        
        /* تصميم الكارت المرآة */
        .mirror-card { background: white; border-radius: 30px; overflow: hidden; box-shadow: 0 15px 35px rgba(244, 63, 94, 0.1); margin-bottom: 30px; border: 1px solid #fff1f2; }
        .card-image-wrap img { width: 100%; height: 250px; object-fit: cover; }
        .card-content { padding: 20px; }
        .post-title { font-size: 1.4rem; color: #1f2937; margin-bottom: 15px; font-weight: 900; }

        /* تنسيق محتوى الـ HTML القادم من وردبريس */
        .html-mirror-body { color: #4b5563; line-height: 1.7; font-size: 1.05rem; }
        .html-mirror-body img { width: 100%; border-radius: 15px; margin: 10px 0; }
        
        /* صندوق حملي التطبيق */
        :global(.app-promo-card) { background: #fff1f2; padding: 20px; border-radius: 20px; text-align: center; margin-top: 20px; border: 2px dashed #fda4af; }
        :global(.download-btn) { display: inline-block; margin-top: 10px; background: #f43f5e; color: white; padding: 8px 20px; border-radius: 50px; text-decoration: none; font-weight: bold; }

        /* شريط التفاعل */
        .interaction-bar { display: flex; justify-content: space-around; border-top: 1px solid #f9fafb; padding-top: 15px; margin-top: 15px; }
        .interaction-bar button { background: none; border: none; font-weight: bold; cursor: pointer; font-size: 1rem; }
        .btn-like { color: #f43f5e; }
        .btn-comm { color: #3b82f6; }
        .btn-share { color: #10b981; }

        /* التعليقات */
        .comments-section { margin-top: 15px; background: #fafafa; padding: 15px; border-radius: 20px; }
        .input-group { display: flex; gap: 8px; margin-bottom: 15px; }
        .input-group input { flex: 1; border: 1px solid #eee; padding: 8px 15px; border-radius: 12px; font-family: 'Cairo'; }
        .input-group button { background: #f43f5e; color: white; border: none; padding: 8px 15px; border-radius: 12px; }
        .comment-bubble { background: white; padding: 10px 15px; border-radius: 15px; margin-bottom: 8px; font-size: 0.9rem; border-right: 4px solid #f43f5e; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        
        .loader { text-align: center; padding: 50px; color: #f43f5e; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default EleganceSection;
