import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

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

  // دالة ذكية لعرض الوسائط المجلوبة من روابط خارجية (تمنع الروابط المكسورة)
  const renderMedia = (url) => {
    if (!url) return null;
    const videoExtensions = ['.mp4', '.mov', '.wmv', '.avi', 'video', 'drive.google.com'];
    const isVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext));

    if (isVideo) {
      return (
        <video controls className="media-box" playsInline>
          <source src={url} type="video/mp4" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      );
    }
    return (
      <img 
        src={url} 
        alt="Content" 
        className="media-box" 
        onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=جاري+تحميل+المحتوى..."; }} 
      />
    );
  };

  const handlePublish = async () => {
    if (!newContent.trim()) return;
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

  // تفعيل الميكروفون داخل الشات
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("عذراً، متصفحك لا يدعم التعرف على الصوت.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(prev => prev + " " + transcript);
    };
    recognition.start();
  };

  const handleAiChat = async () => {
    if (!userInput.trim()) return;
    setIsAiLoading(true);
    try {
      const options = {
        url: API_AI,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userInput }
      };
      const response = await CapacitorHttp.post(options);
      const aiReply = response.data.reply || response.data.message;
      const updated = [{ id: Date.now(), user: userInput, ai: aiReply }, ...chatMessages];
      setChatMessages(updated);
      localStorage.setItem('saved_ai_chats', JSON.stringify(updated));
      setUserInput("");
    } catch (err) { alert("خطأ في الشبكة"); } finally { setIsAiLoading(false); }
  };

  const lastVideoPost = posts.find(p => p.media_url && p.media_url.includes('video') || p.media_url?.includes('.mp4'));

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; background: #fff5f7; }
        .ad-video-card { background: white; margin: 15px; border-radius: 20px; border: 2px dashed #ff4d7d; overflow: hidden; position: relative; }
        .ad-label { position: absolute; top: 5px; right: 5px; background: #ff4d7d; color: white; padding: 2px 10px; border-radius: 10px; font-size: 0.7rem; z-index: 10; }
        .full-chat { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 9999; display: flex; flex-direction: column; }
        .media-box { width: 100%; max-height: 350px; object-fit: cover; display: block; background: #eee; }
        .post-card { background: white; margin: 15px; border-radius: 30px; border: 1px solid rgba(255, 77, 125, 0.2); overflow: hidden; }
        .btn-act { background: none; border: none; color: #ff4d7d; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.9rem; }
        .pulse { animation: pulse-red 2s infinite; }
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>

      {/* كارت الفيديو الإعلاني (آخر فيديو) */}
      {lastVideoPost && (
        <div className="ad-video-card">
          <div className="ad-label pulse">⚠️ فيديو هام جداً</div>
          <video src={lastVideoPost.media_url} muted loop autoPlay style={{width:'100%', height:'120px', objectFit:'cover'}} />
          <div style={{padding:'5px 10px', fontSize:'0.8rem', color:'#555', textAlign:'center'}}>
            شاهدي آخر التحديثات في عالم الأرجوحة
          </div>
        </div>
      )}

      {/* زر الدردشة */}
      <div style={{padding: '10px'}}>
        <button className="top-card" style={{width: '100%', border: 'none', background:'white', padding:'12px', borderRadius:'15px', boxShadow: '0 4px 10px rgba(255,77,125,0.1)'}} onClick={() => setIsChatOpen(true)}>
          <span style={{color:'#ff4d7d', fontWeight:'bold'}}>✨ استشيري صديقتكِ الذكية</span>
        </button>
      </div>

      {/* شاشة الدردشة */}
      {isChatOpen && (
        <div className="full-chat">
          <div style={{background:'#ff4d7d', color:'white', padding:'15px', display:'flex', justifyContent:'space-between'}}>
            <strong>الأرجوحة الذكية</strong>
            <button onClick={() => setIsChatOpen(false)} style={{color:'white', background:'none', border:'none', fontSize:'1.5rem'}}>×</button>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:'15px'}}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{background:'#fff0f3', padding:'12px', borderRadius:'15px', marginBottom:'10px'}}>
                <p><strong>أنتِ:</strong> {msg.user}</p>
                <p style={{color:'#9b59b6'}}><strong>الأرجوحة:</strong> {msg.ai}</p>
              </div>
            ))}
          </div>
          <div style={{padding:'15px', borderTop:'1px solid #eee'}}>
            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginBottom:'10px'}}>
               <button className="btn-act" onClick={startVoiceRecognition}>
                 {isListening ? "🎙️ جاري السماع..." : "🎤 ميكروفون"}
               </button>
            </div>
            <div style={{display:'flex', gap:'5px'}}>
              <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اسألي..." style={{flex:1, padding:'12px', borderRadius:'25px', border:'1px solid #ddd'}} />
              <button onClick={handleAiChat} style={{background:'#ff4d7d', color:'white', border:'none', borderRadius:'50%', width:'45px'}}>⏎</button>
            </div>
          </div>
        </div>
      )}

      {/* صندوق النشر */}
      <div style={{background:'#fff', margin:'15px', padding:'15px', borderRadius:'25px', border:'1px solid rgba(255,77,125,0.2)'}}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'10px', border:'1px solid #eee', marginBottom:'10px'}}>
          <option value="bouh-display-1">حكايات لا تنتهي</option>
          <option value="bouh-display-2">ملاذ القلوب</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ؟" value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{width:'100%', border:'none', minHeight:'50px', outline:'none'}} />
        <input placeholder="ضعي رابط الصورة أو الفيديو هنا..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} style={{width:'100%', padding:'5px', fontSize:'0.8rem', border:'1px solid #f9f9f9'}} />
        <button onClick={handlePublish} disabled={loading} style={{float:'left', background:'#ff4d7d', color:'#fff', border:'none', padding:'8px 25px', borderRadius:'20px', fontWeight:'bold'}}>
          {loading ? "جاري..." : "نشر"}
        </button>
        <div style={{clear:'both'}}></div>
      </div>

      {/* قائمة المنشورات */}
      <div style={{paddingBottom:'100px'}}>
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div style={{padding:'15px'}}>
              <span style={{fontSize:'0.7rem', color:'#ff4d7d'}}>{post.section}</span>
              <p style={{margin:'10px 0', color:'#444'}}>{post.content}</p>
            </div>
            
            {renderMedia(post.media_url)}

            <div style={{display:'flex', justifyContent:'space-around', padding:'12px', borderTop:'1px solid #fff5f7'}}>
              <button className="btn-act" onClick={() => setLikedPosts({...likedPosts, [post.id]: (likedPosts[post.id]||0)+1})}>
                ❤️ {likedPosts[post.id] || 0}
              </button>
              <button className="btn-act" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                💬 تعليق
              </button>
              <button className="btn-act" onClick={() => navigator.share({title: 'الأرجوحة', text: post.content, url: post.media_url})}>
                🔗 مشاركة
              </button>
            </div>

            {activeCommentId === post.id && (
              <div style={{padding:'10px', background:'#fffafb'}}>
                <input placeholder="اكتبي تعليقكِ..." style={{width:'100%', padding:'8px', borderRadius:'15px', border:'1px solid #ddd'}} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
