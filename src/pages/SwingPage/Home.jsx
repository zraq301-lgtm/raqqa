import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1"); 
  const [loading, setLoading] = useState(false);
  
  // حالات التفاعل
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");

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

  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      // إرسال البيانات حسب متطلبات ملف save-post.js
      await CapacitorHttp.post({
        url: SAVE_POST_URL,
        headers: { 'Content-Type': 'application/json' },
        data: {
          content: newContent,
          section: selectedSection,
          type: mediaUrl ? "رابط" : "نصي",
          external_link: mediaUrl
        }
      });
      setNewContent(""); setMediaUrl(""); fetchPosts();
    } catch (err) { console.error("Publish error:", err); }
    finally { setLoading(false); }
  };

  // معالجة المشاركة بدون الحاجة لمكتبة خارجية لتجنب خطأ الـ Build
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'مشاركة من منتدي الأرجوحة',
          text: post.content,
          url: post.media_url || window.location.href,
        });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      alert("رابط المنشور: " + (post.media_url || "منتدي الأرجوحة"));
    }
  };

  const handleLike = (id) => {
    setLikedPosts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.toLowerCase().includes('.mp4') || url.includes('youtube') || url.includes('youtu.be');
    return isVideo ? (
      <video key={url} controls className="p-media" playsInline preload="metadata">
        <source src={url} type="video/mp4" />
      </video>
    ) : (
      <img src={url} alt="media" className="p-media" />
    );
  };

  return (
    <div className="home-container">
      <style>{`
        .home-container { direction: rtl; font-family: 'Tajawal', sans-serif; padding-bottom: 90px; }
        .publish-card {
          background: #fff; margin: 10px; padding: 15px; border-radius: 25px;
          border: 1px solid var(--female-pink-light); box-shadow: 0 4px 12px rgba(255, 77, 125, 0.1);
        }
        .section-selector {
          width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 12px;
          border: 1px solid var(--female-pink-light); color: var(--female-pink); font-weight: bold; background: var(--soft-bg);
        }
        .publish-card textarea { width: 100%; border: none; outline: none; min-height: 80px; resize: none; font-family: inherit; }
        .publish-card input { width: 100%; border: 1px solid #f0f0f0; padding: 10px; border-radius: 10px; margin: 5px 0; }
        .btn-pub { background: var(--female-pink); color: white; border: none; padding: 10px 30px; border-radius: 20px; font-weight: bold; cursor: pointer; float: left; margin-top: 5px; }
        
        .post-box { background: #fff; margin: 15px 10px; border-radius: 20px; border: 1px solid var(--female-pink-light); overflow: hidden; }
        .p-content { padding: 15px; line-height: 1.6; color: var(--text-gray); }
        .p-media { width: 100%; max-height: 450px; object-fit: contain; background: #000; display: block; }
        
        .action-row { display: flex; justify-content: space-around; padding: 12px; border-top: 1px solid #f9f9f9; }
        .act-btn { background: none; border: none; color: var(--female-pink); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; }
        
        .comment-area { background: #fffafb; padding: 15px; border-top: 1px solid #eee; }
        .comment-input-box { display: flex; gap: 8px; }
        .comment-input-box input { flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #ddd; outline: none; }
        .reply-box { margin: 10px 25px 0 0; border-right: 3px solid var(--female-pink-light); padding-right: 12px; font-size: 0.9rem; color: #666; }
      `}</style>

      {/* واجهة النشر مع السكاشن كما في الصورة */}
      <div className="publish-card">
        <select className="section-selector" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
          <option value="bouh-display-1">حكايات لا تنتهي (Section 1)</option>
          <option value="bouh-display-2">ملاذ القلوب (Section 2)</option>
          <option value="bouh-display-3">قوة لترعيك (Section 3)</option>
          <option value="bouh-display-4">لمسة مليئة (Section 4)</option>
          <option value="bouh-display-5">ذكاء ووعي (Section 5)</option>
        </select>
        <textarea placeholder="اكتبي ما يجول في خاطرك..." value={newContent} onChange={(e)=>setNewContent(e.target.value)} />
        <input placeholder="رابط خارجي للفيديو (mp4) أو الصورة..." value={mediaUrl} onChange={(e)=>setMediaUrl(e.target.value)} />
        <button className="btn-pub" onClick={handlePublish} disabled={loading}>{loading ? "جاري..." : "نشر بالمنتدى"}</button>
        <div style={{clear:'both'}}></div>
      </div>

      <div className="feed">
        {posts.map((post) => (
          <div key={post.id} className="post-box">
            <div className="p-content">{post.content}</div>
            {renderMedia(post.media_url)}
            
            <div className="action-row">
              <button className="act-btn" onClick={() => handleLike(post.id)}>
                ❤️ {likedPosts[post.id] || 0} إعجاب
              </button>
              <button className="act-btn" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                💬 تعليق
              </button>
              <button className="act-btn" onClick={() => handleShare(post)}>
                🔗 مشاركة
              </button>
            </div>

            {activeCommentId === post.id && (
              <div className="comment-area">
                <div className="comment-input-box">
                  <input placeholder="أضيفي تعليقكِ..." value={commentText} onChange={(e)=>setCommentText(e.target.value)} />
                  <button className="act-btn" onClick={()=>{alert("تم إرسال التعليق"); setCommentText("");}}>إرسال</button>
                </div>
                <div className="reply-box">
                   <strong>عضوة:</strong> منشور رائع جداً! 🌸
                   <div style={{marginTop: '5px'}}>
                      <button className="act-btn" style={{fontSize: '0.75rem'}}>رد</button>
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
