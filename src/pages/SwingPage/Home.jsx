import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);

  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: API_GET });
      if (response.data && response.data.posts) setPosts(response.data.posts);
    } catch (error) { console.error("Fetch Error:", error); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const parsePostData = (post) => {
    let content = post.content || "";
    let media = post.media_url || post.external_link || "";

    if (typeof content === 'string' && content.includes('{')) {
      try {
        // تعديل الـ Regex ليشمل روابط الـ http وأيضاً بيانات الـ data:image (الصور المرفوعة)
        const urlRegex = /"(?:external_link|media_url)":"((?:https?:\/\/|data:image)[^"]+)"/;
        const match = content.match(urlRegex);
        if (match) media = match[1];

        const contentRegex = /"content":"([^"]*)"/;
        const contentMatch = content.match(contentRegex);
        if (contentMatch) content = contentMatch[1];
      } catch (e) { console.error("Parsing error", e); }
    }
    return { cleanContent: content, cleanMedia: media };
  };

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
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`} frameBorder="0" allowFullScreen></iframe>
        </div>
      );
    }

    // 2. عرض الصور (سواء روابط مباشره أو Base64 مرفوع من الجهاز)
    // نعتبرها صورة إذا بدأت بـ data:image أو انتهت بصيغة صورة معروفة أو احتوت على ibb
    const isImageData = cleanUrl.startsWith('data:image');
    const isImageLink = cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || cleanUrl.includes('ibb.co');

    if (isImageData || isImageLink) {
      return (
        <img 
          src={cleanUrl} 
          style={{ width: '100%', borderRadius: '15px', display: 'block', maxHeight: '500px', objectFit: 'cover' }} 
          alt="مرفق"
          onError={(e) => { e.target.style.display = 'none'; }} 
        />
      );
    }

    // 3. دعم روابط الفيديو المباشرة
    const isDirectVideo = cleanUrl.match(/\.(mp4|webm|ogg)$/i) || cleanUrl.startsWith('data:video');
    if (isDirectVideo) {
      return (
        <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', background: '#000' }}>
          <video controls playsInline style={{ width: '100%', maxHeight: '400px' }}>
            <source src={cleanUrl} />
          </video>
        </div>
      );
    }

    return null;
  };

  const handlePublish = async () => {
    if (!newContent.trim() && !mediaUrl) return;
    setLoading(true);
    try {
      const payload = {
        content: newContent,
        section: selectedSection,
        type: mediaUrl ? "ميديا" : "نصي",
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
          style={{ width: '100%', border: 'none', outline: 'none', minHeight: '60px', fontSize: '1rem', resize: 'none' }}
        />
        
        <div style={{ marginTop: '10px' }}>
          <input 
            placeholder="ضعي رابط (صورة، فيديو، أو يوتيوب)..." 
            value={mediaUrl} 
            onChange={(e) => setMediaUrl(e.target.value)}
            style={{ width: '100%', padding: '10px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px', marginBottom: '10px' }}
          />
          
          <label style={{ display: 'block', padding: '10px', background: '#f0f0f0', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#666' }}>
            📁 رفع ميديا من الجهاز
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {mediaUrl && (
          <div style={{ marginTop: '10px', position: 'relative', border: '1px solid #eee', borderRadius: '15px', padding: '5px' }}>
             <button onClick={() => setMediaUrl("")} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 77, 125, 0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: '25px', height: '25px', zIndex: 10 }}>×</button>
             {renderMedia(mediaUrl)}
          </div>
        )}

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
                <p style={{ marginTop: '12px', color: '#333', lineHeight: '1.6' }}>{cleanContent || "منشور رقة"}</p>
              </div>

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
