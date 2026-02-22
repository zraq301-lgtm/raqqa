import React, { useState, useEffect, useRef } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);
  
  // حالات دردشة الأرجوحة الذكية
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('saved_ai_chats')) || []);
  const [currentAiMsg, setCurrentAiMsg] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // حالات التفاعلات
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  // الروابط المحدثة بناءً على ملفاتك المرفوعة
  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";
  const API_AI = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  useEffect(() => {
    fetchPosts();
  }, []);

  // جلب المنشورات باستخدام CapacitorHttp لتجنب مشاكل الـ CORS وخطأ 500
  const fetchPosts = async () => {
    try {
      const options = { url: API_GET };
      const response = await CapacitorHttp.get(options);
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Database Fetch Error:", error);
    }
  };

  // وظيفة النشر المتوافقة مع ملف save-post (5).js
  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newContent);
      formData.append('section', selectedSection);
      formData.append('type', mediaUrl ? "رابط" : "نصي");
      formData.append('external_link', mediaUrl);

      // نستخدم fetch هنا لأن CapacitorHttp لا يدعم FormData بشكل مباشر لرفع الملفات
      const response = await fetch(API_SAVE, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewContent(""); setMediaUrl(""); fetchPosts();
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // منطق دردشة الأرجوحة (تحليل العضوة) كما أرفقته
  const handleAiChat = async (userInput) => {
    if (!userInput) return;
    setIsAiLoading(true);
    setCurrentAiMsg("جاري التفكير في كلماتكِ الرقيقة...");
    
    try {
      const summary = posts.slice(0, 3).map(p => p.content).join(" - ");
      const options = {
        url: API_AI,
        headers: { 'Content-Type': 'application/json' },
        data: {
          prompt: `أنا أنثى مسلمة، إليكِ منشوراتي الأخيرة: (${summary}). حللي شخصيتي وردي عليّ يا صديقتي بأسلوب الأرجوحة الرقيق بخصوص قولي: ${userInput}`
        }
      };

      const response = await CapacitorHttp.post(options);
      const responseText = response.data.reply || response.data.message;
      
      setCurrentAiMsg(responseText);
      const newChat = { id: Date.now(), user: userInput, ai: responseText };
      const updated = [newChat, ...chatMessages];
      setChatMessages(updated);
      localStorage.setItem('saved_ai_chats', JSON.stringify(updated));
    } catch (err) {
      setCurrentAiMsg("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const deleteSavedChat = (id) => {
    const filtered = chatMessages.filter(c => c.id !== id);
    setChatMessages(filtered);
    localStorage.setItem('saved_ai_chats', JSON.stringify(filtered));
  };

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; background: var(--soft-bg); }
        .ai-chat-screen { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: white; z-index: 10000; display: flex; flex-direction: column; 
        }
        .chat-header { background: var(--female-pink); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .chat-scroll { flex: 1; overflow-y: auto; padding: 15px; }
        .chat-input-area { padding: 10px; border-top: 1px solid #eee; background: white; }
        
        .post-card { 
          background: white; margin: 15px; border-radius: 35px; 
          border: 1px solid var(--female-pink-light); overflow: hidden;
          box-shadow: 0 4px 15px var(--female-pink-light);
        }
        .media-content { width: 100%; max-height: 400px; object-fit: cover; display: block; }
        .saved-chat-card { background: var(--soft-bg); border-radius: 15px; padding: 12px; margin-bottom: 10px; position: relative; border-right: 4px solid var(--female-pink); }
        .del-chat { position: absolute; left: 10px; top: 10px; color: #ff4d7d; border: none; background: none; font-size: 1.2rem; cursor: pointer; }
        .btn-act { background: none; border: none; color: var(--female-pink); font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; }
      `}</style>

      {/* زر دردشة الأرجوحة العلوي */}
      <div style={{padding: '10px'}}>
        <button className="top-card" style={{width: '100%', border: 'none', background:'white', padding:'12px', borderRadius:'15px'}} onClick={() => setIsChatOpen(true)}>
          <span style={{color:'var(--female-pink)', fontWeight:'bold'}}>✨ دردشة الأرجوحة (صديقتكِ الذكية)</span>
        </button>
      </div>

      {/* واجهة شات الذكاء الصناعي كاملة الشاشة */}
      {isChatOpen && (
        <div className="ai-chat-screen">
          <div className="chat-header">
            <span>دردشة الأرجوحة الذكية</span>
            <button onClick={() => setIsChatOpen(false)} style={{background: 'none', border: 'none', color: 'white', fontWeight: 'bold'}}>إغلاق</button>
          </div>
          
          <div className="chat-scroll">
            {currentAiMsg && (
              <div className="saved-chat-card" style={{background: '#fff0f3'}}>
                <small>صديقتكِ الآن:</small>
                <p>{currentAiMsg}</p>
              </div>
            )}
            <h5 style={{color: 'var(--female-pink)', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>المحادثات المحفوظة</h5>
            {chatMessages.map(msg => (
              <div key={msg.id} className="saved-chat-card">
                <button className="del-chat" onClick={() => deleteSavedChat(msg.id)}>×</button>
                <p><strong>أنتِ:</strong> {msg.user}</p>
                <p style={{color: 'var(--accent-purple)'}}><strong>الأرجوحة:</strong> {msg.ai}</p>
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input type="file" id="aiCam" accept="image/*" capture="environment" style={{display:'none'}} />
            <div style={{display:'flex', gap:'15px', justifyContent:'center', marginBottom:'10px'}}>
              <button className="btn-act" onClick={() => document.getElementById('aiCam').click()}>📷 كاميرا</button>
              <button className="btn-act" onClick={() => document.getElementById('aiCam').click()}>🖼️ صورة</button>
              <button className="btn-act">🎤 ميك</button>
            </div>
            <div style={{display:'flex', gap:'5px'}}>
              <input id="aiText" placeholder="اسألي صديقتكِ..." style={{flex:1, padding:'12px', borderRadius:'25px', border:'1px solid #ddd'}} />
              <button onClick={() => handleAiChat(document.getElementById('aiText').value)} 
                      style={{background:'var(--female-pink)', color:'white', border:'none', borderRadius:'50%', width:'45px', height:'45px'}}>⏎</button>
            </div>
          </div>
        </div>
      )}

      {/* كارت النشر */}
      <div className="publish-box" style={{background: '#fff', margin: '15px', padding: '18px', borderRadius: '25px', border: '1px solid var(--female-pink-light)'}}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} 
                style={{width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0'}}>
          <option value="bouh-display-1">حكايات لا تنتهي (1)</option>
          <option value="bouh-display-2">ملاذ القلوب (2)</option>
          <option value="bouh-display-3">قوة لترعيك (3)</option>
          <option value="bouh-display-4">لمسة مليئة (4)</option>
          <option value="bouh-display-5">ذكاء ووعي (5)</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ يا جميلة؟" value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  style={{width: '100%', border: 'none', minHeight: '60px', outline: 'none', resize: 'none'}} />
        <input placeholder="رابط صورة أو فيديو خارجي..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
               style={{width: '100%', padding: '8px', border: '1px solid #f9f9f9', fontSize: '0.8rem', borderRadius: '8px'}} />
        <button onClick={handlePublish} disabled={loading}
                style={{float: 'left', background: 'var(--female-pink)', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '25px', fontWeight: 'bold', marginTop:'10px'}}>
          {loading ? "جاري..." : "نشر"}
        </button>
        <div style={{clear: 'both'}}></div>
      </div>

      {/* عرض التايم لاين بنمط الصورة */}
      <div className="feed" style={{paddingBottom: '100px'}}>
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div style={{padding: '18px'}}>
               <span style={{fontSize: '0.75rem', color: 'var(--female-pink)', background: 'var(--female-pink-light)', padding: '4px 10px', borderRadius: '10px'}}>{post.section}</span>
               <p style={{margin: '12px 0', color: '#444', lineHeight: '1.5'}}>{post.content}</p>
            </div>
            
            {post.media_url && (
              post.media_url.toLowerCase().includes('.mp4') ? 
              <video src={post.media_url} controls className="media-content" /> : 
              <img src={post.media_url} alt="post" className="media-content" />
            )}

            <div style={{display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #fdf2f4'}}>
               <button className="btn-act" onClick={() => setLikedPosts({...likedPosts, [post.id]: (likedPosts[post.id]||0)+1})}>
                 ❤️ {likedPosts[post.id] || 0} إعجاب
               </button>
               <button className="btn-act" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                 💬 تعليق
               </button>
               <button className="btn-act" onClick={() => navigator.share?.({title: 'منتدى الأرجوحة', text: post.content, url: post.media_url})}>
                 🔗 مشاركة
               </button>
            </div>

            {activeCommentId === post.id && (
              <div style={{padding: '15px', background: '#fffafb', borderTop: '1px solid #eee'}}>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input placeholder="أضيفي تعليقكِ..." style={{flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd'}} />
                  <button className="btn-act">إرسال</button>
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
