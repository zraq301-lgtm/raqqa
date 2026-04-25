import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: API_GET });
      if (response.data && response.data.posts) setPosts(response.data.posts);
    } catch (error) { console.error("Fetch Error:", error); }
  };

  // --- دالة ذكية لتحليل البيانات (الحل الأساسي لمشكلتك) ---
  const parsePostData = (post) => {
    let finalContent = post.content;
    let finalMedia = post.media_url || post.external_link;

    // إذا كان المحتوى يبدأ بـ { فهذا يعني أنه JSON مشوه ويجب تحليله
    if (typeof post.content === 'string' && post.content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(post.content);
        finalContent = parsed.content || "";
        finalMedia = parsed.external_link || parsed.media_url || finalMedia;
      } catch (e) {
        // إذا فشل التحليل، نحاول استخراج الرابط يدوياً بواسطة Regex كحل أخير
        const linkMatch = post.content.match(/"external_link":"(.*?)"/);
        if (linkMatch) finalMedia = linkMatch[1];
      }
    }
    return { content: finalContent, media: finalMedia };
  };

  const renderMedia = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // تشغيل روابط نيون أو الروابط المباشرة كفيديو
    const isVideo = cleanUrl.includes('video') || cleanUrl.includes('.mp4') || cleanUrl.includes('neon');

    if (isVideo) {
      return (
        <div style={{ width: '100%', background: '#000', borderRadius: '15px', overflow: 'hidden' }}>
          <video controls playsInline style={{ width: '100%', maxHeight: '400px' }}>
            <source src={cleanUrl} type="video/mp4" />
          </video>
        </div>
      );
    }

    return (
      <img src={cleanUrl} style={{ width: '100%', borderRadius: '15px' }} alt="محتوى رقة" 
           onError={(e) => e.target.style.display = 'none'} />
    );
  };

  const handlePublish = async () => {
    if (!newContent.trim() && !mediaUrl) return;
    setLoading(true);
    try {
      const payload = {
        content: newContent,
        section: selectedSection,
        type: mediaUrl ? "رابط" : "نصي",
        external_link: mediaUrl 
      };

      const response = await fetch(API_SAVE, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      });

      if (response.ok) { 
        setNewContent(""); setMediaUrl(""); fetchPosts(); 
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Tajawal, sans-serif', background: '#fffafb', minHeight: '100vh' }}>
      
      {/* صندوق النشر */}
      <div style={{ background: '#fff', margin: '15px', padding: '15px', borderRadius: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <textarea 
          placeholder="ماذا يدور في خاطركِ؟" 
          value={newContent} 
          onChange={(e) => setNewContent(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', minHeight: '60px' }}
        />
        <input 
          placeholder="ضع رابط الفيديو (نيون) هنا..." 
          value={mediaUrl} 
          onChange={(e) => setMediaUrl(e.target.value)}
          style={{ width: '100%', padding: '8px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.8rem' }}
        />
        <button onClick={handlePublish} disabled={loading} style={{ background: '#ff4d7d', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '20px', marginTop: '10px', cursor: 'pointer' }}>
          {loading ? "جاري النشر..." : "نشر الآن"}
        </button>
      </div>

      {/* عرض المنشورات */}
      <div style={{ paddingBottom: '50px' }}>
        {posts.map(post => {
          const { content, media } = parsePostData(post); // تحليل البيانات هنا
          return (
            <div key={post.id} style={{ background: '#fff', margin: '15px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #ff4d7d11' }}>
              <div style={{ padding: '15px' }}>
                <span style={{ fontSize: '0.7rem', color: '#ff4d7d', background: '#fff0f3', padding: '2px 8px', borderRadius: '5px' }}>رقة - الناشر الأصلي</span>
                <p style={{ marginTop: '10px', color: '#333', fontSize: '0.95rem' }}>{content}</p>
              </div>

              <div style={{ padding: '0 10px 10px' }}>
                {renderMedia(media)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', borderTop: '1px solid #fcfcfc' }}>
                <button style={{ background: 'none', border: 'none', color: '#ff4d7d' }}>❤️ {likedPosts[post.id] || 0}</button>
                <button style={{ background: 'none', border: 'none', color: '#ff4d7d' }}>💬 تعليق</button>
                <button style={{ background: 'none', border: 'none', color: '#ff4d7d' }}>🔗 مشاركة</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
