import React, { useState, useEffect } from 'react';
import { Share } from '@capacitor/share'; 
import { fetchPageData } from '../../services/adminService'; 

const EleganceSection = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  const PAGE_NAME = "ملاذ الأمومة"; 
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
      const rawData = await fetchPageData(PAGE_NAME);
      
      if (rawData) {
        // فحص لضمان استخراج الكائن الأساسي سواء رجع مباشرة أو مغلفاً داخل data أو result
        const data = rawData.data ? rawData.data : (rawData.result ? rawData.result : rawData);

        // تنظيف التحقق من الروابط والميديا الأساسية القادمة من السيرفر
        const videoUrl = data.media?.videoUrl && data.media.videoUrl.trim() !== "" ? data.media.videoUrl : null;
        const imageUrl = data.media?.imageUrl && data.media.imageUrl.trim() !== "" ? data.media.imageUrl : null;
        const audioUrl = data.media?.audioUrl && data.media.audioUrl.trim() !== "" ? data.media.audioUrl : null;
        
        // الميديا والمقالات المدمجة داخلياً
        const embeddedType = data.article?.embeddedMedia?.type;
        const embeddedUrl = data.article?.embeddedMedia?.url && data.article.embeddedMedia.url.trim() !== "" ? data.article.embeddedMedia.url : null;
        const bodyContent = data.article?.body && data.article.body.trim() !== "" ? data.article.body : "";

        const formattedPost = {
          id: data.pageName || PAGE_NAME,
          title: { rendered: data.article?.title && data.article.title.trim() !== "" ? data.article.title : PAGE_NAME },
          featuredImage: imageUrl, // الصورة البارزة الأساسية
          featuredVideo: videoUrl, // إضافة دعم حقيقي للفيديو البارز الأساسي بالواجهة
          content: { 
            rendered: `
              <p>${bodyContent.replace(/\n/g, '<br />')}</p>
              ${embeddedType === 'video' && embeddedUrl ? `<p><video src="${embeddedUrl}" controls style="width:100%; border-radius:10px; margin-top:10px;"></video></p>` : ''}
              ${embeddedType === 'image' && embeddedUrl ? `<p><img src="${embeddedUrl}" alt="Embedded Media" style="width:100%; border-radius:10px; margin-top:10px;" /></p>` : ''}
              ${audioUrl ? `<p style="text-align:center; margin-top:15px;"><audio src="${audioUrl}" controls style="width:100%; max-width:400px;"></audio></p>` : ''}
            `
          }
        };
        setArticles([formattedPost]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanPostContent = (html) => {
    if (!html) return "";
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

  const handleShare = async (title) => {
    const cleanTitle = title.replace(/<\/?[^>]+(>|$)/g, ""); 
    try {
      await Share.share({
        title: cleanTitle,
        text: 'مرحبا بك في عالم الأمومة',
        url: APP_LINK,
        dialogTitle: 'مشاركة الموضوع',
      });
    } catch (error) {
      window.open(`https://wa.me/?text=${encodeURIComponent(cleanTitle + " " + APP_LINK)}`);
    }
  };

  if (loading) return <div className="loading-screen">لحظات من الأناقة...</div>;

  return (
    <div className="main-wrapper" dir="rtl">
      
      {/* الترحيب الثابت */}
      <div className="fixed-welcome">
        ✨ مرحبا بك في عالم الأمومة ✨
      </div>

      <div className="container">
        {articles.map((post) => {
          const featuredImage = post.featuredImage;
          const featuredVideo = post.featuredVideo;

          return (
            <div key={post.id} className="article-container">
              <div className="card">
                
                {/* العنوان */}
                <div className="card-header-title">
                  <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </div>

                {/* 🎯 ميديا الواجهة الذكية: عرض الفيديو البارز الأساسي إذا وجد أولاً */}
                {featuredVideo && (
                  <div className="main-featured-video" style={{ width: '100%', padding: '0' }}>
                    <video src={featuredVideo} controls style={{ width: '100%', display: 'block', height: 'auto' }} />
                  </div>
                )}

                {/* عرض الصورة البارزة كخيار بديل إذا لم يكن هناك فيديو ووجدت الصورة */}
                {!featuredVideo && featuredImage && (
                  <div className="main-featured-image">
                    <img src={featuredImage} alt="Elegance" />
                  </div>
                )}
                
                <div className="content">
                  {/* محتوى الصفحة النصي والميديا المدمجة */}
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

        body {
          font-family: 'Tajawal', sans-serif;
          background-color: #fdf8f5;
          margin: 0; padding: 0;
        }

        .fixed-welcome {
          position: fixed; top: 0; left: 0; right: 0;
          background: #b08968; color: white;
          text-align: center; padding: 12px 0;
          font-size: 1rem; font-weight: 700;
          z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .container {
          display: flex; flex-direction: column; align-items: center;
          padding: 70px 10px 100px;
        }

        .card {
          background: #ffffff;
          max-width: 500px; 
          width: 95%;
          border-radius: 20px; 
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.06);
          margin-bottom: 30px; 
          border: 1px solid #f0e6e0;
        }

        .card-header-title {
          padding: 20px 15px;
          text-align: center;
          background-color: #fff;
        }
        .card-header-title h2 {
          color: #8d6e63;
          margin: 0;
          font-size: 1.4rem;
        }

        .main-featured-image {
          width: 100%;
        }
        .main-featured-image img {
          width: 100%;
          display: block;
          height: auto; 
        }

        .content { 
          padding: 20px; 
          text-align: center; 
        }

        .wp-html-content { 
          text-align: right; 
          color: #4a3f35; 
          font-size: 1.1rem; 
        }
        
        .wp-html-content img, .wp-html-content video {
          max-width: 100% !important; 
          height: auto !important;
          border-radius: 10px;
          margin: 10px 0;
          display: block;
        }

        .wp-html-content p { line-height: 1.8; margin-bottom: 15px; }

        .app-download-box {
          margin-top: 25px; padding: 15px;
          background: #fdfaf8; border: 1px dashed #b08968; border-radius: 15px;
        }
        .app-download-box a { color: #8d6e63; text-decoration: none; font-weight: 700; font-size: 1rem; }

        .interaction-buttons {
          display: flex; justify-content: space-around;
          padding: 15px; border-top: 1px solid #fcf6f2; background: #fffcfb;
        }
        .interaction-buttons button {
          background: none; border: none; cursor: pointer;
          font-family: 'Tajawal'; font-size: 1rem; color: #8d6e63; font-weight: 500;
        }

        .comments-area { padding: 15px; background: #fff; border-top: 1px solid #eee; }
        .comment-input-wrap { display: flex; gap: 8px; margin-bottom: 12px; }
        .comment-input-wrap input { flex: 1; padding: 10px 15px; border-radius: 20px; border: 1px solid #ddd; outline: none; font-family: 'Tajawal'; }
        .comment-input-wrap button { background: #b08968; color: white; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; }
        .single-comment { background: #fdf8f5; padding: 10px 12px; border-radius: 12px; margin-bottom: 8px; font-size: 0.9rem; border-right: 4px solid #b08968; text-align: right; }

        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; color: #b08968; font-weight: bold; font-size: 1.2rem; }
      `}</style>
    </div>
  );
};

export default EleganceSection;
