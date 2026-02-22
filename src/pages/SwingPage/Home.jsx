import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share'; // تأكد من تثبيت @capacitor/share

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1"); // السكشن الافتراضي
  const [loading, setLoading] = useState(false);
  
  // حالات التعليقات والإعجابات (محلياً للعرض)
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [comments, setComments] = useState({}); // لتخزين التعليقات محلياً

  const GET_POSTS_URL = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const SAVE_POST_URL = "https://raqqa-v6cd.vercel.app/api/save-post";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: GET_POSTS_URL });
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) { console.error("Error fetching:", error); }
  };

  // وظيفة النشر مع السكشن المختار
  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      await CapacitorHttp.post({
        url: SAVE_POST_URL,
        headers: { 'Content-Type': 'application/json' },
        data: {
          content: newContent,
          section: selectedSection, // السكشن الذي يحدد مكان الظهور
          type: mediaUrl ? (mediaUrl.endsWith('.mp4') ? "فيديو" : "صورة") : "نصي",
          external_link: mediaUrl
        }
      });
      setNewContent(""); setMediaUrl(""); fetchPosts();
    } catch (err) { console.error("Publish error:", err); }
    finally { setLoading(false); }
  };

  // وظيفة المشاركة الرسمية
  const handleShare = async (post) => {
    try {
      await Share.share({
        title: 'مشاركة من منتدي الأرجوحة',
        text: post.content,
        url: post.media_url || '',
        dialogTitle: 'أنشري الجمال مع صديقاتك',
      });
    } catch (err) { console.error("Share error:", err); }
  };

  // منطق الإعجاب (عداد)
  const handleLike = (id) => {
    setLikedPosts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.includes('.mp4') || url.includes('youtube') || url.includes('youtu.be');
    return isVideo ? (
      <video key={url} controls className="p-media" playsInline><source src={url} type="video/mp4" /></video>
    ) : (
      <img src={url} alt="media" className="p-media" />
    );
  };

  return (
    <div className="home-container">
      <style>{`
        .home-container { direction: rtl; font-family: 'Tajawal', sans-serif; padding-bottom: 90px; }
        
        /* كارت النشر المطور */
        .publish-card {
          background: #fff; margin: 10px; padding: 15px; border-radius: 25px;
          border: 1px solid var(--female-pink-light); box-shadow: 0 4px 12px rgba(255, 77, 125, 0.1);
        }
        .section-selector {
          width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 12px;
          border: 1px solid var(--female-pink-light); color: var(--female-pink); font-weight: bold;
        }
        .publish-card textarea { width: 100%; border: none; outline: none; min-height: 80px; resize: none; }
        .publish-card input { width: 100%; border: 1px solid #f0f0f0; padding: 8px; border-radius: 10px; margin: 5px 0; }
        .btn-pub { background: var(--female-pink); color: white; border: none; padding: 8px 25px; border-radius: 20px; font-weight: bold; cursor: pointer; float: left; }

        /* المنشورات والتعليقات */
        .post-box { background: #fff; margin: 15px 10px; border-radius: 20px; border: 1px solid var(--female-pink-light); overflow: hidden; }
        .p-content { padding: 15px; line-height: 1.6; color: var(--text-gray); }
        .p-media { width: 100%; max-height: 400px; object-fit: cover; background: #000; }
        .action-row { display: flex; justify-content: space-around; padding: 10px; border-top: 1px solid #f9f9f9; }
        .act-btn { background: none; border: none; color: var(--female-pink); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; }
        
        /* نظام التعليقات */
        .comment-section { background: #fffafb; padding: 10px; border-top: 1px solid #eee; }
        .comment-input-area { display: flex; gap: 5px; margin-bottom: 10px; }
        .comment-input-area input { flex: 1; padding: 8px; border-radius: 20px; border: 1px solid #ddd; }
        .reply-box { margin-right: 20px; border-right: 2px solid var(--female-pink-light); padding-right: 10px; margin-top: 5px; font-size: 0.85rem; }
      `}</style>

      {/* واجهة النشر مع اختيار السكشن */}
      <div className="publish-card">
        <select 
          className="section-selector" 
          value={selectedSection} 
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="bouh-display-1">حكايات لا تنتهي (1)</option>
          <option value="bouh-display-2">ملاذ القلوب (2)</option>
          <option value="bouh-display-3">قوة لترعيك (3)</option>
          <option value="bouh-display-4">لمسة مليئة (4)</option>
          <option value="bouh-display-5">ذكاء ووعي (5)</option>
        </select>
        <textarea placeholder="اكتبي منشورك هنا..." value={newContent} onChange={(e)=>setNewContent(e.target.value)} />
        <input placeholder="رابط فيديو mp4 أو صورة..." value={mediaUrl} onChange={(e)=>setMediaUrl(e.target.value)} />
        <button className="btn-pub" onClick={handlePublish} disabled={loading}>{loading ? "جاري..." : "نشر الآن"}</button>
        <div style={{clear:'both'}}></div>
      </div>

      {/* عرض الخلاصات */}
      <div className="feed">
        {posts.map((post) => (
          <div key={post.id} className="post-box">
            <div className="p-content">{post.content}</div>
            {renderMedia(post.media_url)}
            
            <div className="action-row">
              <button className="act-btn" onClick={() => handleLike(post.id)}>
                ❤️ {likedPosts[post.id] || 0}
              </button>
              <button className="act-btn" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                💬 تعليق
              </button>
              <button className="act-btn" onClick={() => handleShare(post)}>
                🔗 مشاركة
              </button>
            </div>

            {/* شريط التعليقات المنسدل */}
            {activeCommentId === post.id && (
              <div className="comment-section">
                <div className="comment-input-area">
                  <input placeholder="اكتبي تعليقك..." />
                  <button className="act-btn">إرسال</button>
                </div>
                <div className="existing-comments">
                   <div className="single-comment">
                      <strong>عضوة:</strong> أحسنتِ النشر! 
                      <button className="act-btn" style={{fontSize:'0.7rem'}}>رد</button>
                      <div className="reply-box"><strong>رد:</strong> شكراً لكِ يا رقيقة 🌸</div>
                   </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
