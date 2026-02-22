import React, { useState, useEffect } from 'react';
import { CapacitorHttp } from '@capacitor/core';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedSection, setSelectedSection] = useState("bouh-display-1");
  const [loading, setLoading] = useState(false);
  
  // حالات الدردشة الذكية والتفاعلات
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(JSON.parse(localStorage.getItem('saved_ai_chats')) || []);
  const [currentAiMsg, setCurrentAiMsg] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  // الروابط الجديدة المحدثة
  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";
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

  // وظيفة النشر باستخدام FormData لضمان وصول البيانات للسيرفر
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

  // وظيفة المشاركة (Native Share)
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'منتدى الأرجوحة',
          text: post.content,
          url: post.media_url || window.location.href,
        });
      } catch (err) { console.log("Share cancelled"); }
    } else {
      alert("رابط المنشور: " + (post.media_url || "منتدى الأرجوحة"));
    }
  };

  // وظيفة الإعجاب (عداد محلي)
  const handleLike = (id) => {
    setLikedPosts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  // وظائف الدردشة الذكية
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
    } catch (err) { setCurrentAiMsg("فشل الاتصال بصديقتكِ الذكية"); }
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
        .ai-chat-fixed { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: white; z-index: 9999; display: flex; flex-direction: column; 
        }
        .chat-header { background: var(--female-pink); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 15px; }
        .chat-footer { padding: 10px; border-top: 1px solid #eee; background: #fff; }
        .post-card-style { 
          background: white; margin: 15px; border-radius: 35px; 
          border: 1px solid var(--female-pink-light); overflow: hidden;
          box-shadow: 0 4px 15px var(--female-pink-light);
        }
        .media-box { width: 100%; max-height: 400px; object-fit: cover; background: #000; display: block; }
        .saved-item { background: var(--soft-bg); border-radius: 15px; padding: 10px; margin-bottom: 10px; position: relative; }
        .del-btn { position: absolute; left: 10px; top: 10px; color: red; border: none; background: none; font-size: 1.2rem; cursor: pointer; }
        .int-btn { background: none; border: none; color: var(--female-pink); font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: inherit; }
      `}</style>

      {/* زر الدردشة العلوي */}
      <div style={{padding: '10px'}}>
        <button className="top-card" style={{width: '100%', border: 'none', background:'white', padding:'12px', borderRadius:'15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} onClick={() => setIsChatOpen(true)}>
          <span style={{color:'var(--female-pink)', fontWeight:'bold'}}>✨ دردشة الأرجوحة الذكية</span>
        </button>
      </div>

      {/* شاشة الدردشة كاملة الحجم */}
      {isChatOpen && (
        <div className="ai-chat-fixed">
          <div className="chat-header">
            <span>دردشة الأرجوحة الذكية</span>
            <button onClick={() => setIsChatOpen(false)} style={{background: 'none', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.1rem'}}>إغلاق</button>
          </div>
          
          <div className="chat-body">
            {currentAiMsg && <div className="saved-item" style={{border: '2px solid var(--female-pink)'}}><strong>الصديقة:</strong> {currentAiMsg}</div>}
            <h5 style={{color: 'var(--female-pink)', marginBottom: '15px'}}>المحادثات المحفوظة:</h5>
            {chatMessages.map(chat => (
              <div key={chat.id} className="saved-item">
                <button className="del-btn" onClick={() => deleteSavedChat(chat.id)}>×</button>
                <p><strong>أنتِ:</strong> {chat.user}</p>
                <p style={{color: 'var(--accent-purple)'}}><strong>الأرجوحة:</strong> {chat.ai}</p>
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <input type="file" id="camInput" accept="image/*" capture="environment" style={{display:'none'}} />
            <div style={{display: 'flex', gap: '15px', marginBottom: '10px', justifyContent: 'center'}}>
              <button onClick={() => document.getElementById('camInput').click()} className="int-btn">📷 كاميرا</button>
              <button onClick={() => document.getElementById('camInput').click()} className="int-btn">🖼️ صورة</button>
              <button className="int-btn">🎤 ميك</button>
            </div>
            <div style={{display: 'flex', gap: '8px'}}>
              <input id="aiInput" placeholder="اكتبي سؤالكِ هنا..." style={{flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none'}} />
              <button onClick={() => handleAiChat(document.getElementById('aiInput').value)} 
                      style={{background: 'var(--female-pink)', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.2rem'}}>⏎</button>
            </div>
          </div>
        </div>
      )}

      {/* كارت النشر المتطور */}
      <div className="publish-box" style={{background: '#fff', margin: '15px', padding: '18px', borderRadius: '25px', border: '1px solid var(--female-pink-light)'}}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} 
                style={{width: '100%', marginBottom: '12px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', color: 'var(--female-pink)', fontWeight: 'bold'}}>
          <option value="bouh-display-1">حكايات لا تنتهي (1)</option>
          <option value="bouh-display-2">ملاذ القلوب (2)</option>
          <option value="bouh-display-3">قوة لترعيك (3)</option>
          <option value="bouh-display-4">لمسة مليئة (4)</option>
          <option value="bouh-display-5">ذكاء ووعي (5)</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ يا جميلة؟" value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  style={{width: '100%', border: 'none', minHeight: '70px', outline: 'none', fontSize: '1rem', resize: 'none'}} />
        <input placeholder="رابط صورة أو فيديو (external link)..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
               style={{width: '100%', padding: '8px', border: '1px solid #f9f9f9', fontSize: '0.85rem', borderRadius: '8px', marginBottom: '10px'}} />
        <button onClick={handlePublish} disabled={loading}
                style={{float: 'left', background: 'var(--female-pink)', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer'}}>
          {loading ? "جاري النشر..." : "نشر الآن"}
        </button>
        <div style={{clear: 'both'}}></div>
      </div>

      {/* عرض المنشورات بالنمط المطلوب */}
      <div className="feed" style={{paddingBottom: '100px'}}>
        {posts.map((post) => (
          <div key={post.id} className="post-card-style">
            <div style={{padding: '18px'}}>
               <span style={{fontSize: '0.75rem', color: 'var(--female-pink)', background: 'var(--female-pink-light)', padding: '4px 10px', borderRadius: '10px'}}>{post.section}</span>
               <p style={{margin: '12px 0', color: 'var(--text-gray)', lineHeight: '1.6'}}>{post.content}</p>
            </div>
            
            {post.media_url && (
              post.media_url.toLowerCase().includes('.mp4') ? 
              <video src={post.media_url} controls className="media-box" playsInline /> : 
              <img src={post.media_url} alt="منشور" className="media-box" />
            )}

            <div style={{display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #fdf2f4'}}>
               <button className="int-btn" onClick={() => handleLike(post.id)}>
                 ❤️ {likedPosts[post.id] || 0} إعجاب
               </button>
               <button className="int-btn" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                 💬 تعليق
               </button>
               <button className="int-btn" onClick={() => handleShare(post)}>
                 🔗 مشاركة
               </button>
            </div>

            {/* نظام التعليقات المنسدل */}
            {activeCommentId === post.id && (
              <div style={{padding:'15px', background:'#fffafb', borderTop:'1px solid #eee'}}>
                <div style={{display:'flex', gap:'8px', marginBottom: '10px'}}>
                  <input placeholder="أضيفي تعليقكِ..." style={{flex:1, padding:'10px', borderRadius:'20px', border:'1px solid #ddd'}} />
                  <button className="int-btn">إرسال</button>
                </div>
                <div style={{marginRight: '15px', borderRight: '2px solid var(--female-pink-light)', paddingRight: '10px'}}>
                  <p style={{fontSize: '0.9rem', marginBottom: '5px'}}><strong>عضوة:</strong> منشور جميل جداً 🌸</p>
                  <button className="int-btn" style={{fontSize: '0.75rem'}}>رد</button>
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
