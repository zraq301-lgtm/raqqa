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

  // دالة مساعدة لتحويل روابط يوتيوب العادية إلى روابط قابلة للتضمين (Embed)
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } 
    else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } 
    else if (url.includes('embed/')) {
      return url;
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const fetchArticles = async () => {
    try {
      const rawData = await fetchPageData(PAGE_NAME);
      
      if (rawData) {
        const data = rawData.data ? rawData.data : (rawData.result ? rawData.result : rawData);

        let itemsArray = [];
        if (Array.isArray(data)) {
          itemsArray = data;
        } else if (data && typeof data === 'object') {
          itemsArray = [data];
        }

        const formattedPosts = itemsArray.map((item, index) => {
          const videoUrl = item.media?.videoUrl && item.media.videoUrl.trim() !== "" ? item.media.videoUrl : null;
          const imageUrl = item.media?.imageUrl && item.media.imageUrl.trim() !== "" ? item.media.imageUrl : null;
          const audioUrl = item.media?.audioUrl && item.media.audioUrl.trim() !== "" ? item.media.audioUrl : null;
          
          const embeddedType = item.article?.embeddedMedia?.type;
          const embeddedUrl = item.article?.embeddedMedia?.url && item.article.embeddedMedia.url.trim() !== "" ? item.article.embeddedMedia.url : null;
          const bodyContent = item.article?.body && item.article.body.trim() !== "" ? item.article.body : "";

          const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
          const finalVideoUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl) : videoUrl;

          const isEmbeddedYouTube = embeddedType === 'video' && embeddedUrl && (embeddedUrl.includes('youtube.com') || embeddedUrl.includes('youtu.be'));
          const finalEmbeddedVideoUrl = isEmbeddedYouTube ? getYouTubeEmbedUrl(embeddedUrl) : embeddedUrl;

          const uniqueId = item.id || (item.lastUpdated ? `post_${item.lastUpdated}_${index}` : `post_${index}`);

          // 🎯 تحديد ما إذا كان المنشور عبارة عن صورة أو فيديو بارز فقط بدون نص مقال طويل
          const hasFeaturedMedia = !!(finalVideoUrl || imageUrl);
          const isTextShortOrEmpty = bodyContent.trim().length < 10;
          const isMediaOnly = hasFeaturedMedia && isTextShortOrEmpty;

          return {
            id: uniqueId,
            title: { rendered: item.article?.title && item.article.title.trim() !== "" ? item.article.title : `${PAGE_NAME}` },
            featuredImage: imageUrl, 
            featuredVideo: finalVideoUrl, 
            isVideoYouTube: isYouTube,
            isMediaOnly: isMediaOnly, // نمرر هذه القيمة للتحكم في الكلاس الديناميكي
            content: { 
              rendered: `
                ${bodyContent.trim() !== "" ? `<p style="margin-bottom: 18px;">${bodyContent.replace(/\n/g, '<br />')}</p>` : ''}
                ${embeddedType === 'video' && finalEmbeddedVideoUrl ? (
                  isEmbeddedYouTube 
                  ? `<p><iframe src="${finalEmbeddedVideoUrl}" width="100%" height="315" frameborder="0" allowfullscreen style="border-radius:12px; margin-top:12px;"></iframe></p>`
                  : `<p><video src="${finalEmbeddedVideoUrl}" controls style="width:100%; border-radius:12px; margin-top:12px;"></video></p>`
                ) : ''}
                ${embeddedType === 'image' && embeddedUrl ? `<p><img src="${embeddedUrl}" alt="Embedded Media" style="width:100%; border-radius:12px; margin-top:12px;" /></p>` : ''}
                ${audioUrl ? `<p style="text-align:center; margin-top:18px;"><audio src="${audioUrl}" controls style="width:100%; max-width:100%; border-radius:30px;"></audio></p>` : ''}
              `
            }
          };
        });

        // ترتيب المنشورات من الأحدث للأقدم
        setArticles(formattedPosts.reverse());
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
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8d6e63', marginTop: '50px', fontFamily: 'Tajawal' }}>لا توجد منشورات حالياً</div>
        ) : (
          articles.map((post) => {
            const featuredImage = post.featuredImage;
            const featuredVideo = post.featuredVideo;
            const isVideoYouTube = post.isVideoYouTube;

            return (
              <div key={post.id} className="article-container">
                {/* 🎯 إضافة الكلاس الديناميكي media-only-card إذا كان الكارت يحتوي على ميديا فقط لتقليل الارتفاع تلقائياً */}
                <div className={`card ${post.isMediaOnly ? 'media-only-card' : ''}`}>
                  
                  {/* العنوان منسق ومرتب */}
                  <div className="card-header-title">
                    <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  </div>

                  {/* عرض الفيديو البارز الأساسي بكامل العرض وبأبعاد ممتازة */}
                  {featuredVideo && (
                    <div className="main-featured-video" style={{ width: '100%', padding: '0' }}>
                      {isVideoYouTube ? (
                        <iframe 
                          src={featuredVideo} 
                          width="100%" 
                          height="320" 
                          frameBorder="0" 
                          allowFullScreen 
                          style={{ display: 'block' }}
                        />
                      ) : (
                        <video src={featuredVideo} controls style={{ width: '100%', display: 'block', height: 'auto' }} />
                      )}
                    </div>
                  )}

                  {/* عرض الصورة البارزة كخيار بديل إذا لم يكن هناك فيديو */}
                  {!featuredVideo && featuredImage && (
                    <div className="main-featured-image">
                      <img src={featuredImage} alt="Elegance" />
                    </div>
                  )}
                  
                  {/* المحتوى منسق وبمحاذاة واضحة */}
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

                  {/* أزرار التفاعل منسقة ومرتبة بشكل ممتاز */}
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

                  {/* صندوق التعليقات منسق ومتباعد بشكل أنيق */}
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
                        {(comments[post.id] || []).length === 0 ? (
                          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#9c8e85', padding: '10px 0' }}>لا توجد تعليقات بعد، كوني الأولى! ✨</div>
                        ) : (
                          (comments[post.id] || []).map((c, i) => (
                            <div key={i} className="single-comment">{c.text}</div>
                          )).reverse()
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;500;700&display=swap');

        body {
          font-family: 'Tajawal', sans-serif;
          background-color: #fdf8f5;
          margin: 0; padding: 0;
          -webkit-font-smoothing: antialiased;
        }

        .fixed-welcome {
          position: fixed; top: 0; left: 0; right: 0;
          background: #b08968; color: white;
          text-align: center; padding: 14px 0;
          font-size: 1.05rem; font-weight: 700;
          z-index: 1000; box-shadow: 0 3px 12px rgba(0,0,0,0.08);
          font-family: 'Tajawal', sans-serif;
        }

        .container {
          display: flex; flex-direction: column; align-items: center;
          padding: 80px 16px 100px;
          width: 100%;
          box-sizing: border-box;
        }

        .article-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .card {
          background: #ffffff;
          max-width: 600px; 
          width: 100%;
          border-radius: 24px; 
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(141, 110, 99, 0.05);
          margin-bottom: 35px; 
          border: 1px solid #f2eae4;
          transition: transform 0.2s ease;
        }

        /* 🎯 كلاس خاص لتصغير المسافات الرأسية للكروت التي تحتوي على ميديا فقط */
        .card.media-only-card {
          margin-bottom: 25px;
        }
        .card.media-only-card .card-header-title {
          padding: 16px 20px;
        }
        .card.media-only-card .content {
          padding: 12px 20px 16px;
        }
        .card.media-only-card .app-download-box {
          margin-top: 15px;
          padding: 12px;
        }

        .card-header-title {
          padding: 24px 20px;
          text-align: right;
          background-color: #fff;
          border-bottom: 1px solid #fdfbf9;
        }
        .card-header-title h2 {
          color: #6d4c41;
          margin: 0;
          font-size: 1.45rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .main-featured-image {
          width: 100%;
          background: #faf6f3;
        }
        .main-featured-image img {
          width: 100%;
          display: block;
          height: auto; 
          max-height: 450px;
          object-fit: cover;
        }

        .content { 
          padding: 24px 20px; 
          text-align: right; 
        }

        .wp-html-content { 
          text-align: right; 
          color: #4e443c; 
          font-size: 1.12rem; 
          font-weight: 500;
        }
        
        .wp-html-content img, .wp-html-content video, .wp-html-content iframe {
          max-width: 100% !important; 
          border-radius: 14px;
          margin: 15px 0;
          display: block;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .wp-html-content p { line-height: 1.85; margin: 0 0 15px 0; }

        .app-download-box {
          margin-top: 30px; padding: 18px;
          background: #fffbf9; border: 1px dashed #d7ccc8; border-radius: 16px;
          text-align: center;
        }
        .app-download-box a { color: #8d6e63; text-decoration: none; font-weight: 700; font-size: 1.02rem; }

        .interaction-buttons {
          display: flex; justify-content: space-around;
          padding: 16px; border-top: 1px solid #fcf6f2; background: #fffcfb;
        }
        .interaction-buttons button {
          background: none; border: none; cursor: pointer;
          font-family: 'Tajawal', sans-serif; font-size: 1.05rem; color: #8d6e63; font-weight: 700;
          display: flex; align-items: center; gap: 6px;
          transition: opacity 0.2s ease;
        }
        .interaction-buttons button:active { opacity: 0.6; }

        .comments-area { padding: 20px; background: #fffbf9; border-top: 1px solid #f5ebe4; }
        .comment-input-wrap { display: flex; gap: 10px; margin-bottom: 16px; }
        .comment-input-wrap input { flex: 1; padding: 12px 18px; border-radius: 25px; border: 1px solid #e0d4cc; outline: none; font-family: 'Tajawal'; font-size: 0.95rem; background: #fff; }
        .comment-input-wrap input:focus { border-color: #b08968; }
        .comment-input-wrap button { background: #b08968; color: white; border: none; padding: 10px 22px; border-radius: 25px; cursor: pointer; font-family: 'Tajawal'; font-weight: 700; }
        
        .single-comment { background: #ffffff; padding: 12px 16px; border-radius: 14px; margin-bottom: 10px; font-size: 0.95rem; border-right: 4px solid #b08968; text-align: right; box-shadow: 0 2px 6px rgba(141,110,99,0.03); color: #4e443c; }

        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; color: #b08968; font-weight: bold; font-size: 1.3rem; font-family: 'Tajawal'; background: #fdf8f5; }
      `}</style>
    </div>
  );
};

export default EleganceSection;
