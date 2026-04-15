import React, { useState, useEffect } from 'react';

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  const CATEGORY_ID = "768006428";
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

  const cleanPostContent = (html) => {
    let clean = html;
    clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    clean = clean.replace(/<html[^>]*>|<body[^>]*>|<\/body>|<\/html>|<head[^>]*>|<\/head>|<meta[^>]*>/gi, "");
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

  // --- تحديث وظيفة المشاركة لحل مشكلة الأندرويد والـ APK ---
  const handleShare = async (title) => {
    // تنظيف العنوان من أي رموز HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = title;
    const cleanTitle = tempDiv.textContent || tempDiv.innerText || "";

    const shareData = {
      title: cleanTitle,
      text: `إليكِ هذا الموضوع المميز: ${cleanTitle}`,
      url: APP_LINK,
    };

    try {
      // محاولة استخدام مشاركة النظام الأصلية
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // البديل في حال عدم الدعم (مثل بعض متصفحات WebView في APK)
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanTitle + " " + APP_LINK)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // إذا فشل النظام تماماً، نفتح الواتساب كخيار أخير
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(cleanTitle + " " + APP_LINK)}`, '_blank');
      }
    }
  };

  if (loading) return <div className="loading-screen">لحظات من الأناقة...</div>;

  return (
    <div className="main-wrapper" dir="rtl">
      <div className="fixed-welcome">✨ مرحبا بك في عالم الأمومة ✨</div>

      <div className="container">
        {articles.map((post) => {
          const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

          return (
            <div key={post.id} className="article-container">
              <div className="card">
                <div className="card-header-title">
                  <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </div>

                {featuredImage && (
                  <div className="main-featured-image">
                    <img src={featuredImage} alt="Elegance" />
                  </div>
                )}
                
                <div className="content">
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
          );
        })}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;500;700&display=swap');
        body { font-family: 'Tajawal', sans-serif; background-color: #fdf8f5; margin: 0; padding: 0; }
        .fixed-welcome { position: fixed; top: 0; left: 0; right: 0; background: #b08968; color: white; text-align: center; padding: 12px 0; font-size: 1rem; font-weight: 700; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .container { display: flex; flex-direction: column; align-items: center; padding: 70px 10px 100px; }
        .card { background: #ffffff; max-width: 500px; width: 95%; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.06); margin-bottom: 30px; border: 1px solid #f0e6e0; }
        .card-header-title { padding: 20px 15px; text-align: center; }
        .card-header-title h2 { color: #8d6e63; margin: 0; font-size: 1.4rem; }
        .main-featured-image img { width: 100%; display: block; height: auto; }
        .content { padding: 20px; }
        .wp-html-content { text-align: right; color: #4a3f35; font-size: 1.1rem; }
        .wp-html-content img { max-width: 100% !important; height: auto !important; border-radius: 10px; margin: 10px 0; display: block; }
        .app-download-box { margin-top: 25px; padding: 15px; background: #fdfaf8; border: 1px dashed #b08968; border-radius: 15px; text-align: center; }
        .app-download-box a { color: #8d6e63; text-decoration: none; font-weight: 700; }
        .interaction-buttons { display: flex; justify-content: space-around; padding: 15px; border-top: 1px solid #fcf6f2; }
        .interaction-buttons button { background: none; border: none; cursor: pointer; font-family: 'Tajawal'; color: #8d6e63; }
        .comments-area { padding: 15px; border-top: 1px solid #eee; }
        .comment-input-wrap { display: flex; gap: 8px; }
        .comment-input-wrap input { flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #ddd; outline: none; }
        .comment-input-wrap button { background: #b08968; color: white; border: none; padding: 8px 15px; border-radius: 20px; }
        .single-comment { background: #fdf8f5; padding: 10px; border-radius: 12px; margin-bottom: 8px; border-right: 4px solid #b08968; }
        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; color: #b08968; }
      `}</style>
    </div>
  );
};

// --- السطر الأهم لحل مشكلة Vercel ---
export default EleganceSection;
