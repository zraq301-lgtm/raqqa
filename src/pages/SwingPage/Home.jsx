import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share'; // استيراد مكتبة المشاركة الأصلية للـ APK

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);
  
  // حالات الدردشة
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('saved_ai_chats')) || []);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // حالات التفاعلات
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  // الروابط المحدثة بناءً على ملفاتك
  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";
  const API_AI = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const options = { url: API_GET };
      const response = await CapacitorHttp.get(options);
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  // دالة ذكية لعرض الوسائط ومنع ظهور الكروت فارغة
  const renderMedia = (url) => {
    if (!url) return null;
    
    // التحقق إذا كان الرابط فيديو (امتدادات أو كلمات دلالية)
    const videoPatterns = ['.mp4', '.mov', '.webm', 'video', 'drive.google', 'blob', 'stream'];
    const isVideo = videoPatterns.some(pattern => url.toLowerCase().includes(pattern));

    if (isVideo) {
      return (
        <div style={{ background: '#000', borderRadius: '15px', overflow: 'hidden' }}>
          <video 
            controls 
            className="media-box" 
            style={{ width: '100%', maxHeight: '350px' }}
            playsInline
            preload="metadata"
          >
            <source src={url} />
            عذراً، مشغل الفيديو لا يدعم هذا الرابط.
          </video>
        </div>
      );
    }

    return (
      <img 
        src={url} 
        alt="Post Media" 
        className="media-box" 
        onError={(e) => {
          // إذا فشل تحميل الصورة، نحاول عرضها كفيديو كخطة احتياطية أو إخفاء الإطار المكسور
          e.target.style.display = 'none';
        }}
      />
    );
  };

  // وظيفة النشر المتوافقة مع ملف save-post (6).js
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
      if (response.ok) {
        setNewContent(""); setMediaUrl(""); fetchPosts();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // تفعيل الميكروفون (Speech to Text)
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

  // وظيفة المشاركة الأصلية للـ APK
  const handleShare = async (post) => {
    try {
      await Share.share({
        title: 'تطبيق الأرجوحة',
        text: post.content,
        url: post.media_url || '',
        dialogTitle: 'مشاركة المنشور',
      });
    } catch (err) {
      console.log("Share failed", err);
    }
  };

  // إيجاد آخر فيديو لعرضه كإعلان
  const lastVideo = posts.find(p => p.media_url && (p.media_url.includes('mp4') || p.media_url.includes('video')));

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; background: #fff5f7; padding-top: 10px; }
        .ad-banner { background: white; margin: 0 15px 15px; border-radius: 15px; border: 2px solid #ff4d7d; overflow: hidden; height: 100px; display: flex; position: relative; }
        .ad-info { padding: 10px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .chat-full { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 10000; display: flex; flex-direction: column; }
        .post-card { background: white; margin: 15px; border-radius: 35px; border: 1px solid #ff4d7d33; overflow: hidden; box-shadow: 0 4px 12px rgba(255, 77, 125, 0.08); }
        .media-box { width: 100%; object-fit: cover; display: block; }
        .action-btn { background: none; border: none; color: #ff4d7d; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        /* رفع صندوق النشر بمقدار 10% */
        .publish-area { transform: translateY(-10%); margin-top: 10px; } 
      `}</style>

      {/* كارت الفيديو الإعلاني المستطيل */}
      {lastVideo && (
        <div className="ad-banner">
          <div style={{ width: '40%', background: '#000' }}>
            <video src={lastVideo.media_url} muted loop autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="ad-info">
            <span style={{ fontSize: '0.7rem', color: '#ff4d7d', fontWeight: 'bold' }}>⚠️ فيديو يهمكِ جداً</span>
            <p style={{ fontSize: '0.8rem', margin: '4px 0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{lastVideo.content}</p>
          </div>
        </div>
      )}

      {/* منطقة النشر المرفوعة */}
      <div className="publish-area" style={{ background: '#fff', margin: '15px', padding: '15px', borderRadius: '25px', border: '1px solid #ff4d7d22' }}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '8px', color: '#ff4d7d' }}>
          <option value="bouh-display-1">حكايات لا تنتهي</option>
          <option value="bouh-display-2">ملاذ القلوب</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ؟" value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', minHeight: '40px' }} />
        <input placeholder="رابط خارجي (فيديو/صورة)..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} style={{ width: '100%', padding: '5px', fontSize: '0.8rem', border: '1px solid #f9f9f9' }} />
        <button onClick={handlePublish} disabled={loading} style={{ float: 'left', background: '#ff4d7d', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', fontWeight: 'bold' }}>
          {loading ? "..." : "نشر"}
        </button>
        <div style={{ clear: 'both' }}></div>
      </div>

      {/* زر فتح الشات */}
      <div style={{ padding: '0 15px' }}>
        <button onClick={() => setIsChatOpen(true)} style={{ width: '100%', padding: '12px', borderRadius: '15px', border: 'none', background: '#fff', color: '#ff4d7d', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          ✨ استشيري الأرجوحة الذكية
        </button>
      </div>

      {/* شاشة الدردشة الكاملة */}
      {isChatOpen && (
        <div className="chat-full">
          <div style={{ background: '#ff4d7d', color: '#white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>صديقتكِ الذكية</span>
            <button onClick={() => setIsChatOpen(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.5rem' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fffafb' }}>
            {chatMessages.map(m => (
              <div key={m.id} style={{ background: 'white', padding: '12px', borderRadius: '15px', marginBottom: '10px', borderRight: '4px solid #ff4d7d' }}>
                <p style={{ fontSize: '0.9rem' }}><strong>أنتِ:</strong> {m.user}</p>
                <p style={{ fontSize: '0.9rem', color: '#9b59b6' }}><strong>الأرجوحة:</strong> {m.ai}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid #eee' }}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
              <button onClick={startVoice} style={{ background: 'none', border: 'none', color: isListening ? 'red' : '#ff4d7d', fontWeight: 'bold' }}>
                {isListening ? "🎙️ جاري السماع..." : "🎤 ميكروفون"}
              </button>
            </div>
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
            
            {renderMedia(post.media_url)}

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
              <div style={{ padding: '12px', background: '#fffafb', display: 'flex', gap: '5px' }}>
                <input placeholder="اكتبي تعليقكِ..." style={{ flex: 1, padding: '8px', borderRadius: '15px', border: '1px solid #ddd' }} />
                <button style={{ border: 'none', background: 'none', color: '#ff4d7d', fontWeight: 'bold' }}>إرسال</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
