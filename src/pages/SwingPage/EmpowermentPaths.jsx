import React, { useState, useEffect } from 'react';
// استيراد مكتبة المشاركة الخاصة بكاباسيتور لضمان فتح قائمة النظام الشاملة
import { Share } from '@capacitor/share';
// استيراد الخدمة الموحدة النظيفة لجلب البيانات من السيرفر
import { fetchPageData } from '../../services/adminService'; 

const EmpowermentPaths = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState({}); 
  const [comments, setComments] = useState({}); 
  const [newComment, setNewComment] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  // 🎯 جلب البيانات بناءً على الاسم العربي الصحيح للقسم المتوافق مع السيرفر
  const PAGE_NAME = "دروب التمكين"; 
  const APP_LINK = "https://raqa-1zhm.vercel.app/";

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem('raqa_likes') || '{}');
    const savedComments = JSON.parse(localStorage.getItem('raqa_comments') || '{}');
    setLikes(savedLikes);
    setComments(savedComments);
    fetchArticles();
  }, []);

  // دالة مساعدة لتهيئة روابط اليوتيوب وتضمينها بشكل صحيح
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const fetchArticles = async () => {
    try {
      // استدعاء الخدمة لقراءة مصفوفة البيانات الخام
      const result = await fetchPageData(PAGE_NAME);
      
      if (result) {
        let rawItems = [];
        if (Array.isArray(result)) {
          rawItems = result;
        } else if (result && typeof result === 'object') {
          rawItems = [result];
        }

        const formattedPosts = rawItems.map((item, index) => {
          const videoUrl = item.media?.videoUrl && item.media.videoUrl.trim() !== "" ? item.media.videoUrl : null;
          const imageUrl = item.media?.imageUrl && item.media.imageUrl.trim() !== "" ? item.media.imageUrl : null;
          const audioUrl = item.media?.audioUrl && item.media.audioUrl.trim() !== "" ? item.media.audioUrl : null;
          const bodyContent = item.article?.body && item.article.body.trim() !== "" ? item.article.body : "";

          const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
          const finalVideoUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl) : videoUrl;

          // 🎯 جلب المعرف التعريفي الأصلي (ID) الحقيقي للمنشور لسهولة حذفه وإدارته
          const databaseId = item.id || item.lastUpdated || `post_${index}`;

          // قياس حجم الكارت ديناميكياً لمعرفة إن كان ميديا فقط أم ميديا ونص
          const hasFeaturedMedia = !!(finalVideoUrl || imageUrl);
          const isTextShortOrEmpty = bodyContent.trim().length < 10;
          const isMediaOnly = hasFeaturedMedia && isTextShortOrEmpty;

          return {
            id: databaseId,
            title: { rendered: item.article?.title && item.article.title.trim() !== "" ? item.article.title : `${PAGE_NAME}` },
            featuredImage: imageUrl, 
            featuredVideo: finalVideoUrl, 
            isVideoYouTube: isYouTube,
            isMediaOnly: isMediaOnly,
            content: { 
              rendered: `
                ${bodyContent.trim() !== "" ? `<p style="margin-bottom: 15px; line-height: 1.7;">${bodyContent.replace(/\n/g, '<br />')}</p>` : ''}
                ${audioUrl ? `<p style="text-align:center; margin-top:15px;"><audio src="${audioUrl}" controls style="width:100%; border-radius:30px;"></audio></p>` : ''}
              `
            }
          };
        });

        // ترتيب المنشورات من الأحدث إلى الأقدم
        setArticles(formattedPosts.reverse());
      }
    } catch (error) {
      console.error("Fetch Error in Interface:", error);
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

  const handleShare = async (title) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = title;
    const cleanTitle = tempDiv.textContent || tempDiv.innerText || "";
    try {
      await Share.share({
        title: cleanTitle,
        text: `إليكِ هذا الموضوع المميز من تطبيق رقة: ${cleanTitle}`,
        url: APP_LINK,
        dialogTitle: 'مشاركة عبر تطبيقاتك',
      });
    } catch (error) {
      window.open(`https://wa.me/?text=${encodeURIComponent(cleanTitle + " " + APP_LINK)}`);
    }
  };

  if (loading) return <div className="loading-screen">لحظات من التمكين...</div>;

  return (
    <div className="main-wrapper" dir="rtl">
      
      {/* الترحيب الثابت المخصص لقسم دروب التمكين */}
      <div className="fixed-welcome">
        ✨ هنا نمنح شغفكِ صبغة الاحتراف.. لتتحول مهارة يديكِ إلى جسرٍ نحو الاستقلال والتمكين. ✨
      </div>
      
      <div className="container">
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8d6e63', marginTop: '50px', fontFamily: 'Tajawal' }}>لا توجد منشورات حالياً في هذا القسم</div>
        ) : (
          articles.map((post) => {
            const featuredImage = post.featuredImage;
            const featuredVideo = post.featuredVideo;
            const isVideoYouTube = post.isVideoYouTube;

            return (
              <div key={post.id} className="article-container">
                <div className={`card ${post.isMediaOnly ? 'media-only-card' : ''}`}>
                  
                  {/* ترويسة تعرض رقم الـ ID الحقيقي المستلم من قاعدة البيانات */}
                  <div className="card-header-title">
                    <span className="post-id-badge">ID: #{post.id}</span>
                    <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  </div>
                  
                  {featuredVideo && (
                    <div className="main-featured-video" style={{ width: '100%', padding: '0' }}>
                      {isVideoYouTube ? (
                        <iframe src={featuredVideo} width="100%" height="280" frameBorder="0" allowFullScreen style={{ display: 'block' }} />
                      ) : (
                        <video src={featuredVideo} controls style={{ width: '100%', display: 'block', height: 'auto' }} />
                      )}
                    </div>
                  )}

                  {!featuredVideo && featuredImage && (
                    <div className="main-featured-image">
                      <img src={featuredImage} alt="Empowerment" />
                    </div>
                  )}
                  
                  <div className="content">
                    <div className="wp-html-content" dangerouslySetInnerHTML={{ __html: cleanPostContent(post.content.rendered) }} />
                    <div className="app-download-box">
                      <a href={APP_LINK} target="_blank" rel="noreferrer">✨ حملي التطبيق الآن من هنا ✨</a>
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
                        <input type="text" placeholder="أضيفي لمستكِ..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
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
        body { font-family: 'Tajawal', sans-serif; background-color: #fdf8f5; margin: 0; padding: 0; }
        
        .fixed-welcome { 
          position: fixed; top: 0; left: 0; right: 0; 
          background: #b08968; color: white; text-align: center; 
          padding: 12px 15px; font-size: 0.95rem; font-weight: 700; 
          z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1); line-height: 1.5; 
        }
        
        .container { display: flex; flex-direction: column; align-items: center; padding: 90px 10px 100px; }
        
        .card { background: #ffffff; max-width: 500px; width: 95%; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.06); margin-bottom: 30px; border: 1px solid #f0e6e0; position: relative; }
        
        /* تصميم كروت الميديا الصرف بدون نصوص */
        .card.media-only-card { margin-bottom: 22px; }
        .card.media-only-card .card-header-title { padding: 14px 15px 10px; }
        .card.media-only-card .content { padding: 10px 15px 14px; }
        .card.media-only-card .app-download-box { margin-top: 12px; padding: 10px; }

        .card-header-title { padding: 24px 15px 16px; text-align: center; position: relative; }
        .card-header-title h2 { color: #8d6e63; margin: 0; font-size: 1.35rem; padding-top: 8px; }
        
        /* شارة الـ ID الحقيقي لتسهيل التطوير */
        .post-id-badge { position: absolute; top: 6px; left: 12px; background: #f2eae4; color: #8d6e63; font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; font-weight: bold; direction: ltr; }

        .main-featured-image img { width: 100%; display: block; height: auto; }
        .content { padding: 20px; text-align: center; }
        .wp-html-content { text-align: right; color: #4a3f35; font-size: 1.1rem; }
        .wp-html-content img, .wp-html-content video, .wp-html-content iframe { max-width: 100% !important; height: auto !important; border-radius: 10px; margin: 10px 0; display: block; }
        
        .app-download-box { margin-top: 25px; padding: 15px; background: #fdfaf8; border: 1px dashed #b08968; border-radius: 15px; }
        .app-download-box a { color: #8d6e63; text-decoration: none; font-weight: 700; font-size: 1rem; }
        
        .interaction-buttons { display: flex; justify-content: space-around; padding: 15px; border-top: 1px solid #fcf6f2; background: #fffcfb; }
        .interaction-buttons button { background: none; border: none; cursor: pointer; font-family: 'Tajawal'; color: #8d6e63; font-size: 1rem; font-weight: 500; }
        
        .comments-area { padding: 15px; border-top: 1px solid #eee; background: #fffbf9; }
        .comment-input-wrap { display: flex; gap: 8px; margin-bottom: 12px; }
        .comment-input-wrap input { flex: 1; padding: 10px 15px; border-radius: 20px; border: 1px solid #ddd; outline: none; font-family: 'Tajawal'; }
        .comment-input-wrap button { background: #b08968; color: white; border: none; padding: 8px 18px; border-radius: 20px; cursor: pointer; }
        
        .single-comment { background: #ffffff; padding: 10px 12px; border-radius: 12px; margin-bottom: 8px; border-right: 4px solid #b08968; text-align: right; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; color: #b08968; font-weight: bold; font-family: 'Tajawal'; background: #fdf8f5; font-size: 1.2rem; }
      `}</style>
    </div>
  );
};

export default EmpowermentPaths;
