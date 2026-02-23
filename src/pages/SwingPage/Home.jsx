import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);
  
  // حالات الدردشة والتفاعلات
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('saved_ai_chats')) || []);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";
  const API_AI = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: API_GET });
      if (response.data && response.data.posts) setPosts(response.data.posts);
    } catch (error) { console.error("Fetch Error:", error); }
  };

  // دالة عرض الوسائط المحدثة لحل مشكلة الروابط المكسورة
  const renderMedia = (url) => {
    if (!url) return null;
    const videoPatterns = ['.mp4', '.mov', '.webm', 'video', 'drive.google', 'blob', 'stream'];
    const isVideo = videoPatterns.some(p => url.toLowerCase().includes(p));

    if (isVideo) {
      return (
        <div style={{ background: '#000', borderRadius: '15px', overflow: 'hidden', margin: '10px 0' }}>
          <video controls className="media-box" style={{ width: '100%', maxHeight: '350px' }} playsInline preload="metadata">
            <source src={url} />
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
        </div>
      );
    }
    return <img src={url} alt="Media" className="media-box" onError={(e) => e.target.style.display = 'none'} />;
  };

  const handlePublish = async () => {
    if (!newContent.trim() && !mediaUrl) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newContent);
      formData.append('section', selectedSection);
      formData.append('type', mediaUrl ? "رابط" : "نصي");
      formData.append('external_link', mediaUrl);

      const response = await fetch(API_SAVE, { method: 'POST', body: formData });
      if (response.ok) { setNewContent(""); setMediaUrl(""); fetchPosts(); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // تفعيل الميكروفون
  const startVoice = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return alert("المتصفح لا يدعم التسجيل");
    const rec = new Speech();
    rec.lang = 'ar-SA';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setUserInput(e.results[0][0].transcript);
    rec.start();
  };

  // وظيفة المشاركة (تعمل في الـ APK)
  const handleShare = async (post) => {
    if (navigator.share) {
      navigator.share({
        title: 'تطبيق الأرجوحة',
        text: post.content,
        url: post.media_url || window.location.href
      }).catch(() => console.log("Share cancelled"));
    } else {
      alert("رابط المنشور: " + (post.media_url || "لا يوجد رابط"));
    }
  };

  const lastVideo = posts.find(p => p.media_url && (p.media_url.includes('mp4') || p.media_url.includes('video')));

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; background: #fff5f7; }
        .ad-banner { background: white; margin: 0 15px 15px; border-radius: 15px; border: 2px solid #ff4d7d; overflow: hidden; height: 100px; display: flex; }
        .chat-full { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 10000; display: flex; flex-direction: column; }
        .post-card { background: white; margin: 15px; border-radius: 35px; border: 1px solid #ff4d7d33; overflow: hidden; }
        .media-box { width: 100%; object-fit: cover; display: block; border-radius: 15px; }
        .action-btn { background: none; border: none; color: #ff4d7d; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        /* رفع صندوق النشر 10% */
        .publish-area { transform: translateY(-10%); margin-top: 10px; }
      `}</style>

      {/* كارت الفيديو الإعلاني */}
      {lastVideo && (
        <div className="ad-banner">
          <div style={{ width: '40%', background: '#000' }}>
            <video src={lastVideo.media_url} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '10px', flex: 1 }}>
            <span style={{ fontSize: '0.7rem', color: '#ff4d7d', fontWeight: 'bold' }}>⚠️ فيديو يهمكِ جداً</span>
            <p style={{ fontSize: '0.8rem', margin: '4px 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lastVideo.content}</p>
          </div>
        </div>
      )}

      {/* صندوق النشر المرفوع */}
      <div className="publish-area" style={{ background: '#fff', margin: '15px', padding: '15px', borderRadius: '25px', border: '1px solid #ff4d7d22' }}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '8px', color: '#ff4d7d', fontWeight: 'bold' }}>
          <option value="bouh-display-1">حكايات لا تنتهي</option>
          <option value="bouh-display-2">ملاذ القلوب</option>
          <option value="bouh-display-3">ذكاء ووعي</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ؟" value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', minHeight: '40px', fontSize: '1rem' }} />
        <input placeholder="رابط فيديو أو صورة خارجي..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} style={{ width: '100%', padding: '5px', fontSize: '0.8rem', border: 'none', borderBottom: '1px solid #eee' }} />
        <button onClick={handlePublish} disabled={loading} style={{ float: 'left', background: '#ff4d7d', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? "..." : "نشر"}
        </button>
        <div style={{ clear: 'both' }}></div>
      </div>

      {/* زر الدردشة */}
      <div style={{ padding: '0 15px 15px' }}>
        <button onClick={() => setIsChatOpen(true)} style={{ width: '100%', padding: '12px', borderRadius: '15px', border: 'none', background: '#fff', color: '#ff4d7d', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          ✨ استشيري الأرجوحة الذكية
        </button>
      </div>

      {/* شاشة الدردشة الكاملة */}
      {isChatOpen && (
        <div className="chat-full">
          <div style={{ background: '#ff4d7d', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>صديقتكِ الذكية</strong>
            <button onClick={() => setIsChatOpen(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.5rem' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fffafb' }}>
            {chatMessages.map(m => (
              <div key={m.id} style={{ background: 'white', padding: '12px', borderRadius: '15px', marginBottom: '10px', borderRight: '4px solid #ff4d7d' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}><strong>أنتِ:</strong> {m.user}</p>
                <p style={{ fontSize: '0.9rem', color: '#9b59b6' }}><strong>الأرجوحة:</strong> {m.ai}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid #eee' }}>
            <button onClick={startVoice} style={{ width: '100%', marginBottom: '10px', background: 'none', border: 'none', color: isListening ? 'red' : '#ff4d7d', fontWeight: 'bold' }}>
              {isListening ? "🎙️ جاري السماع..." : "🎤 ميكروفون"}
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اكتبي سؤالكِ..." style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd' }} />
              <button onClick={async () => {
                if (!userInput) return;
                setIsAiLoading(true);
                const res = await CapacitorHttp.post({ url: API_AI, data: { prompt: userInput } });
                const reply = res.data.reply || res.data.message;
                const newMsg = { id: Date.now(), user: userInput, ai: reply };
                setChatMessages([newMsg, ...chatMessages]);
                localStorage.setItem('saved_ai_chats', JSON.stringify([newMsg, ...chatMessages]));
                setUserInput(""); setIsAiLoading(false);
              }} style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px' }}>⏎</button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المنشورات */}
      <div style={{ paddingBottom: '100px' }}>
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div style={{ padding: '18px' }}>
              <span style={{ fontSize: '0.7rem', color: '#ff4d7d', background: '#fff0f3', padding: '4px 10px', borderRadius: '10px' }}>{post.section}</span>
              <p style={{ margin: '12px 0', lineHeight: '1.5', color: '#333' }}>{post.content}</p>
            </div>
            
            <div style={{ padding: '0 15px' }}>
              {renderMedia(post.media_url)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #fff5f7' }}>
              <button className="action-btn" onClick={() => setLikedPosts({ ...likedPosts, [post.id]: (likedPosts[post.id] || 0) + 1 })}>
                ❤️ {likedPosts[post.id] || 0}
              </button>
              <button className="action-btn" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                💬 تعليق
              </button>
              <button className="action-btn" onClick={() => handleShare(post)}>
                🔗 مشاركة
              </button>
            </div>

            {activeCommentId === post.id && (
              <div style={{ padding: '12px', background: '#fffafb', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input placeholder="اكتبي تعليقكِ..." style={{ flex: 1, padding: '8px', borderRadius: '15px', border: '1px solid #ddd' }} />
                  <button style={{ border: 'none', background: 'none', color: '#ff4d7d', fontWeight: 'bold' }}>إرسال</button>
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
