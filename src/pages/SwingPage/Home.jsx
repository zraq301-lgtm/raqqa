import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share'; // استيراد مكتبة المشاركة الأصلية

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);

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

  // دالة تكبير الفيديو للملء التلقائي عند الضغط
  const toggleFullScreen = (e) => {
    const videoElem = e.target.parentElement.querySelector('video') || e.target.parentElement.querySelector('iframe');
    if (videoElem) {
      if (videoElem.requestFullscreen) videoElem.requestFullscreen();
      else if (videoElem.webkitRequestFullscreen) videoElem.webkitRequestFullscreen();
      else if (videoElem.msRequestFullscreen) videoElem.msRequestFullscreen();
    }
  };

  const renderMediaInApp = (url) => {
    if (!url) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = "";
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else {
        videoId = url.split('/').pop();
      }
      
      return (
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
            title="YouTube video player" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {/* زر تكبير الشاشة المخصص */}
          <button onClick={toggleFullScreen} style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(255, 77, 125, 0.8)', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', fontSize: '0.7rem', zIndex: 10 }}>
            تكبير ⛶
          </button>
        </div>
      );
    }

    const isDirectVideo = url.toLowerCase().match(/\.(mp4|webm|mov|ogg)$/) || url.includes('video');
    if (isDirectVideo) {
      return (
        <div style={{ width: '100%', background: '#000', position: 'relative' }}>
          <video controls playsInline style={{ width: '100%', maxHeight: '400px' }} preload="metadata">
            <source src={url} />
          </video>
          <button onClick={toggleFullScreen} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0, 0, 0, 0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', zIndex: 10 }}>
            ⛶
          </button>
        </div>
      );
    }

    return (
      <img src={url} style={{ width: '100%', display: 'block' }} alt="رقة - محتوى"
        onError={(e) => e.target.parentElement.style.display = 'none'} 
      />
    );
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

  // تحديث دالة المشاركة لتستخدم Capacitor Share الأصلي ليعمل على APK
  const handleShare = async (post) => {
    try {
      await Share.share({
        title: 'رقة - الناشر الأصلي',
        text: post.content,
        url: post.media_url || 'https://raqqa.app', // ضع رابط موقعك هنا
        dialogTitle: 'شاركي جمال رقة مع صديقاتكِ',
      });
    } catch (error) {
      console.log('خطأ في المشاركة:', error);
    }
  };

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

  const lastVideo = posts.find(p => p.media_url && (p.media_url.includes('mp4') || p.media_url.includes('video')));

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; background: #fffafb; }
        .publisher-badge { font-size: 0.65rem; color: #ff4d7d; background: #fff0f3; padding: 2px 8px; border-radius: 5px; margin-bottom: 5px; display: inline-block; }
        .ad-banner { background: white; margin: 0 15px 15px; border-radius: 20px; border: 2px solid #ff4d7d; overflow: hidden; height: 110px; display: flex; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .chat-full { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 10000; display: flex; flex-direction: column; }
        .post-card { background: white; margin: 15px; border-radius: 30px; border: 1px solid #ff4d7d1a; overflow: hidden; box-shadow: 0 5px 15px rgba(255, 77, 125, 0.05); }
        .action-btn { background: none; border: none; color: #ff4d7d; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .publish-area { transform: translateY(-10%); margin-top: 10px; z-index: 5; position: relative; }
      `}</style>

      {/* كارت الفيديو الإعلاني */}
      {lastVideo && (
        <div className="ad-banner">
          <div style={{ width: '45%', background: '#000' }}>
            <video src={lastVideo.media_url} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '12px', flex: 1 }}>
            <div className="publisher-badge">الناشر الأصلي: رقة</div>
            <p style={{ fontSize: '0.8rem', margin: '2px 0', fontWeight: 'bold', color: '#333' }}>⚠️ تحديث هام جداً</p>
            <p style={{ fontSize: '0.75rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>{lastVideo.content}</p>
          </div>
        </div>
      )}

      {/* صندوق النشر المرفوع */}
      <div className="publish-area" style={{ background: '#fff', margin: '15px', padding: '15px', borderRadius: '25px', border: '1px solid #ff4d7d22' }}>
        <div className="publisher-badge">رقة - المصدر</div>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '12px', border: '1px solid #f0f0f0', marginBottom: '8px', color: '#ff4d7d', fontWeight: 'bold' }}>
          <option value="bouh-display-1">حكايات لا تنتهي</option>
          <option value="bouh-display-2">ملاذ القلوب</option>
          <option value="bouh-display-3">قوة لترعيك</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ يا رقة؟"
          value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ width: '100%', border: 'none', outline: 'none', minHeight: '45px', fontSize: '1rem' }} />
        <input placeholder="رابط فيديو HTML أو صورة..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} style={{ width: '100%', padding: '5px', fontSize: '0.8rem', border: 'none', background: '#fcfcfc' }} />
        <button onClick={handlePublish} disabled={loading} style={{ float: 'left', background: '#ff4d7d', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '25px', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? "جاري..." : "نشر"}
        </button>
        <div style={{ clear: 'both' }}></div>
      </div>

      {/* زر الدردشة */}
      <div style={{ padding: '0 15px 15px' }}>
        <button onClick={() => setIsChatOpen(true)} style={{ width: '100%', padding: '14px', borderRadius: '20px', border: 'none', background: 'linear-gradient(to right, #ff4d7d, #ff7599)', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 77, 125, 0.2)' }}>
          ✨ رقة AI - استشارة ذكية
        </button>
      </div>

      {/* شاشة الدردشة الكاملة */}
      {isChatOpen && (
        <div className="chat-full">
          <div style={{ background: '#ff4d7d', color: 'white', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>رقة AI - صديقتكِ</strong>
            <button onClick={() => setIsChatOpen(false)} style={{ color: 'white', background: 'none', border: 'none', fontSize: '1.8rem' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fffafb' }}>
            {chatMessages.map(m => (
              <div key={m.id} style={{ background: 'white', padding: '12px', borderRadius: '20px', marginBottom: '10px', borderRight: '5px solid #ff4d7d', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
                <p style={{ fontSize: '0.9rem', color: '#444' }}><strong>أنتِ:</strong> {m.user}</p>
                <p style={{ fontSize: '0.9rem', color: '#9b59b6', marginTop: '5px' }}><strong>رقة AI:</strong> {m.ai}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: '15px', borderTop: '1px solid #eee' }}>
            <button onClick={startVoice} style={{ width: '100%', marginBottom: '10px', background: 'none', border: 'none', color: isListening ? 'red' : '#ff4d7d', fontWeight: 'bold' }}>
              {isListening ? "🎙️ رقة تسمعكِ الآن..." : "🎤 تحدثي مع رقة (ميكروفون)"}
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اسألي رقة..." style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #eee' }} />
              <button onClick={async () => {
                if (!userInput) return;
                setIsAiLoading(true);
                const res = await CapacitorHttp.post({ url: API_AI, data: { prompt: userInput } });
                const reply = res.data.reply || res.data.message;
                const newMsg = { id: Date.now(), user: userInput, ai: reply };
                setChatMessages([newMsg, ...chatMessages]);
                localStorage.setItem('saved_ai_chats', JSON.stringify([newMsg, ...chatMessages]));
                setUserInput(""); setIsAiLoading(false);
              }} style={{ background: '#ff4d7d', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px' }}>⏎</button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المنشورات */}
      <div style={{ paddingBottom: '100px' }}>
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div style={{ padding: '18px' }}>
              <div className="publisher-badge">رقة - الناشر الأصلي</div>
              <p style={{ margin: '8px 0', lineHeight: '1.6', color: '#333', fontSize: '1rem' }}>{post.content}</p>
            </div>
            
            {renderMediaInApp(post.media_url)}

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
              <div style={{ padding: '12px', background: '#fffafb', display: 'flex', gap: '8px' }}>
                <input placeholder="أضيفي رأيكِ..." style={{ flex: 1, padding: '10px', borderRadius: '15px', border: '1px solid #eee' }} />
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
