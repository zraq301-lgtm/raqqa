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

  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: API_GET });
      if (response.data && response.data.posts) setPosts(response.data.posts);
    } catch (error) { console.error("Fetch Error:", error); }
  };

  // --- دالة استخراج البيانات الحقيقية من النص المشوه ---
  const parsePostData = (post) => {
    let content = post.content || "";
    let media = post.media_url || post.external_link || "";

    // إذا كان النص يحتوي على صيغة JSON (الأقواس {})
    if (typeof content === 'string' && content.includes('{')) {
      try {
        // محاولة البحث عن الرابط داخل النص باستخدام Regex إذا فشل JSON.parse
        const urlRegex = /"(?:external_link|media_url)":"(https?:\/\/[^"]+)"/;
        const match = content.match(urlRegex);
        if (match) media = match[1];

        // تنظيف المحتوى من الـ JSON ليظهر النص فقط
        const contentRegex = /"content":"([^"]*)"/;
        const contentMatch = content.match(contentRegex);
        if (contentMatch) content = contentMatch[1];
      } catch (e) { console.error("Parsing error", e); }
    }
    return { cleanContent: content, cleanMedia: media };
  };

  // --- دالة عرض الفيديو (يدعم YouTube و Direct Links) ---
  const renderMedia = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();

    // 1. دعم روابط YouTube
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      const videoId = cleanUrl.includes('v=') 
        ? cleanUrl.split('v=')[1].split('&')[0] 
        : cleanUrl.split('/').pop().split('?')[0];
      
      return (
        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden', background: '#000' }}>
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // 2. دعم روابط الفيديو المباشرة (Neon, mp4, etc)
    const isDirectVideo = cleanUrl.match(/\.(mp4|webm|ogg)$/i) || cleanUrl.includes('video') || cleanUrl.includes('neon');
    if (isDirectVideo) {
      return (
        <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', background: '#000' }}>
          <video controls playsInline style={{ width: '100%', maxHeight: '400px' }}>
            <source src={cleanUrl} type="video/mp4" />
          </video>
        </div>
      );
    }

    // 3. عرض كصورة إذا لم يكن ما سبق
    return (
      <img src={cleanUrl} style={{ width: '100%', borderRadius: '15px', display: 'block' }} alt="رقة"
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
      <div style={{ background: '#fff', margin: '15px', padding: '15px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.1)' }}>
        <textarea 
          placeholder="ماذا يدور في خاطركِ؟" 
          value={newContent} 
          onChange={(e) => setNewContent(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', minHeight: '60px', fontSize: '1rem' }}
        />
        <input 
          placeholder="ضعي رابط فيديو (YouTube أو Neon) هنا..." 
          value={mediaUrl} 
          onChange={(e) => setMediaUrl(e.target.value)}
          style={{ width: '100%', padding: '10px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px', marginTop: '10px' }}
        />
        <button onClick={handlePublish} disabled={loading} style={{ background: '#ff4d7d', color: '#fff', border: 'none', width: '100%', padding: '12px', borderRadius: '15px', fontWeight: 'bold', marginTop: '15px' }}>
          {loading ? "جاري النشر..." : "نشر الآن"}
        </button>
      </div>

      {/* قائمة المنشورات */}
      <div style={{ paddingBottom: '50px' }}>
        {posts.map(post => {
          const { cleanContent, cleanMedia } = parsePostData(post);
          return (
            <div key={post.id} style={{ background: '#fff', margin: '15px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #ff4d7d11' }}>
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '0.7rem', color: '#ff4d7d', background: '#fff0f3', padding: '3px 10px', borderRadius: '8px' }}>رقة - الناشر الأصلي</span>
                {/* عرض النص النظيف فقط */}
                <p style={{ marginTop: '12px', color: '#333', lineHeight: '1.6' }}>{cleanContent || "منشور رقة"}</p>
              </div>

              {/* عرض الميديا (فيديو أو صورة) */}
              <div style={{ padding: '0 15px 15px' }}>
                {renderMedia(cleanMedia)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
