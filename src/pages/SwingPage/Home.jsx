import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);
  
  // حالات الدردشة الذكية
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('saved_ai_chats')) || []);
  const [currentAiMsg, setCurrentAiMsg] = useState("");

  const API_GET = "https://raqqa-v6cd.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-v6cd.vercel.app/api/save-post";
  const API_AI = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: API_GET });
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) { console.error("Fetch Error:", error); }
  };

  // وظيفة الرفع (إصلاح مشكلة عدم وصول البيانات للسيرفر)
  const handlePublish = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', newContent);
      formData.append('section', selectedSection);
      formData.append('type', mediaUrl ? "رابط" : "نصي");
      formData.append('external_link', mediaUrl);

      const response = await fetch(API_SAVE, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewContent(""); setMediaUrl(""); fetchPosts();
      }
    } catch (err) { console.error("Save Error:", err); }
    finally { setLoading(false); }
  };

  // وظيفة فتح الكاميرا البديلة (لحل خطأ الـ Build)
  const triggerCamera = () => {
    document.getElementById('hiddenCameraInput').click();
  };

  const handleAiChat = async (text) => {
    if(!text) return;
    setCurrentAiMsg("جاري التفكير...");
    try {
      const response = await CapacitorHttp.post({
        url: API_AI,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: text }
      });
      const reply = response.data.reply || response.data.message;
      setCurrentAiMsg(reply);
      const newChat = { id: Date.now(), user: text, ai: reply };
      const updatedChats = [newChat, ...chatMessages];
      setChatMessages(updatedChats);
      localStorage.setItem('saved_ai_chats', JSON.stringify(updatedChats));
    } catch (err) { setCurrentAiMsg("فشل الاتصال"); }
  };

  const deleteSavedChat = (id) => {
    const filtered = chatMessages.filter(c => c.id !== id);
    setChatMessages(filtered);
    localStorage.setItem('saved_ai_chats', JSON.stringify(filtered));
  };

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; }
        .ai-chat-fixed { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: white; z-index: 9999; display: flex; flex-direction: column; 
        }
        .chat-header { background: var(--female-pink); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 15px; }
        .chat-footer { padding: 10px; border-top: 1px solid #eee; background: #fff; }
        .post-card-new { 
          background: white; margin: 15px; border-radius: 35px; 
          border: 1px solid var(--female-pink-light); overflow: hidden;
          box-shadow: 0 4px 15px var(--female-pink-light);
        }
        .media-box { width: 100%; max-height: 400px; object-fit: cover; background: #000; }
        .saved-item { background: var(--soft-bg); border-radius: 15px; padding: 10px; margin-bottom: 10px; position: relative; }
        .del-btn { position: absolute; left: 10px; top: 10px; color: red; border: none; background: none; font-size: 1.2rem; }
        .int-btn { background: none; border: none; color: var(--female-pink); font-weight: bold; cursor: pointer; }
      `}</style>

      {/* زر الدردشة العلوي */}
      <div style={{padding: '10px'}}>
        <button className="top-card" style={{width: '100%', border: 'none', background:'white', padding:'10px', borderRadius:'15px'}} onClick={() => setIsChatOpen(true)}>
          <span style={{color:'var(--female-pink)', fontWeight:'bold'}}>✨ دردشة الأرجوحة الذكية</span>
        </button>
      </div>

      {/* شاشة الدردشة كاملة الحجم */}
      {isChatOpen && (
        <div className="ai-chat-fixed">
          <div className="chat-header">
            <span>دردشة الأرجوحة</span>
            <button onClick={() => setIsChatOpen(false)} style={{background: 'none', border: 'none', color: 'white', fontWeight: 'bold'}}>إغلاق</button>
          </div>
          
          <div className="chat-body">
            {currentAiMsg && <div className="saved-item" style={{border: '2px solid var(--female-pink)'}}><strong>الصديقة:</strong> {currentAiMsg}</div>}
            <h5 style={{color: 'var(--female-pink)'}}>المحادثات المحفوظة:</h5>
            {chatMessages.map(chat => (
              <div key={chat.id} className="saved-item">
                <button className="del-btn" onClick={() => deleteSavedChat(chat.id)}>×</button>
                <p><strong>أنتِ:</strong> {chat.user}</p>
                <p style={{color: 'var(--accent-purple)'}}><strong>الأرجوحة:</strong> {chat.ai}</p>
              </div>
            ))}
          </div>

          <div className="chat-footer">
            {/* مدخل الكاميرا المخفي */}
            <input type="file" id="hiddenCameraInput" accept="image/*" capture="environment" style={{display:'none'}} />
            
            <div style={{display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'center'}}>
              <button onClick={triggerCamera} className="int-btn">📷 كاميرا</button>
              <button onClick={() => document.getElementById('hiddenCameraInput').click()} className="int-btn">🖼️ معرض</button>
              <button className="int-btn">🎤 ميك</button>
            </div>
            <div style={{display: 'flex', gap: '5px'}}>
              <input id="aiInput" placeholder="اسألي صديقتكِ..." style={{flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd'}} />
              <button onClick={() => handleAiChat(document.getElementById('aiInput').value)} 
                      style={{background: 'var(--female-pink)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px'}}>⏎</button>
            </div>
          </div>
        </div>
      )}

      {/* واجهة النشر */}
      <div className="publish-box" style={{background: '#fff', margin: '15px', padding: '15px', borderRadius: '25px', border: '1px solid var(--female-pink-light)'}}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} 
                style={{width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '10px', border: '1px solid #eee'}}>
          <option value="bouh-display-1">حكايات لا تنتهي (1)</option>
          <option value="bouh-display-2">ملاذ القلوب (2)</option>
          <option value="bouh-display-3">قوة لترعيك (3)</option>
          <option value="bouh-display-4">لمسة مليئة (4)</option>
          <option value="bouh-display-5">ذكاء ووعي (5)</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ؟" value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  style={{width: '100%', border: 'none', minHeight: '60px', outline: 'none'}} />
        <input placeholder="رابط خارجي (صورة أو فيديو)..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
               style={{width: '100%', padding: '5px', border: '1px solid #f9f9f9', fontSize: '0.8rem'}} />
        <button onClick={handlePublish} disabled={loading}
                style={{float: 'left', background: 'var(--female-pink)', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', fontWeight: 'bold'}}>
          {loading ? "جاري..." : "نشر"}
        </button>
        <div style={{clear: 'both'}}></div>
      </div>

      {/* عرض المنشورات */}
      <div className="feed" style={{paddingBottom: '100px'}}>
        {posts.map((post) => (
          <div key={post.id} className="post-card-new">
            <div style={{padding: '15px'}}>
               <span style={{fontSize: '0.7rem', color: 'var(--female-pink)'}}>{post.section}</span>
               <p style={{margin: '10px 0', color: 'var(--text-gray)'}}>{post.content}</p>
            </div>
            {post.media_url && (
              post.media_url.includes('.mp4') ? 
              <video src={post.media_url} controls className="media-box" /> : 
              <img src={post.media_url} alt="media" className="media-box" />
            )}
            <div style={{display: 'flex', justifyContent: 'space-around', padding: '12px', borderTop: '1px solid #fdf2f4'}}>
               <button className="int-btn">❤️ إعجاب</button>
               <button className="int-btn">💬 تعليق</button>
               <button className="int-btn">🔗 مشاركة</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
