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
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);

  // الروابط المحدثة بناءً على ملفاتك
  const API_GET = "https://raqqa-ruddy.vercel.app/api/get-posts";
  const API_SAVE = "https://raqqa-ruddy.vercel.app/api/save-post";
  const API_AI = "https://raqqa-v6cd.vercel.app/api/raqqa-ai";

  useEffect(() => {
    fetchPosts();
  }, []);

  // جلب المنشورات طبقاً لملف get-posts (5).js
  const fetchPosts = async () => {
    try {
      const options = { url: API_GET };
      const response = await CapacitorHttp.get(options);
      if (response.data && response.data.posts) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
  };

  // حفظ المنشور طبقاً لملف save-post (6).js
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
    } catch (err) {
      console.error("خطأ في الحفظ:", err);
    } finally {
      setLoading(false);
    }
  };

  // منطق الدردشة الذكية مع الحفظ والحذف
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
      
      const newChat = { id: Date.now(), user: userInput, ai: aiReply };
      const updated = [newChat, ...chatMessages];
      setChatMessages(updated);
      localStorage.setItem('saved_ai_chats', JSON.stringify(updated));
      setUserInput("");
    } catch (err) {
      alert("حدث خطأ في الشبكة");
    } finally {
      setIsAiLoading(false);
    }
  };

  const deleteChat = (id) => {
    const filtered = chatMessages.filter(m => m.id !== id);
    setChatMessages(filtered);
    localStorage.setItem('saved_ai_chats', JSON.stringify(filtered));
  };

  // تفعيل المشاركة
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'منشور من الأرجوحة',
          text: post.content,
          url: post.media_url || window.location.href,
        });
      } catch (err) { console.log("تم إلغاء المشاركة"); }
    }
  };

  return (
    <div className="home-main">
      <style>{`
        .home-main { direction: rtl; font-family: 'Tajawal', sans-serif; background: var(--soft-bg); }
        .full-chat-overlay { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: white; z-index: 9999; display: flex; flex-direction: column; 
        }
        .chat-header { background: var(--female-pink); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        .chat-content { flex: 1; overflow-y: auto; padding: 15px; background: #fffafb; }
        .chat-card { background: white; padding: 12px; border-radius: 20px; margin-bottom: 12px; position: relative; border-right: 5px solid var(--female-pink); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .post-style { background: white; margin: 15px; border-radius: 35px; border: 1px solid var(--female-pink-light); overflow: hidden; box-shadow: 0 4px 15px var(--female-pink-light); }
        .media-box { width: 100%; max-height: 400px; object-fit: cover; display: block; }
        .btn-interact { background: none; border: none; color: var(--female-pink); font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-family: inherit; }
      `}</style>

      {/* زر الدردشة العلوي */}
      <div style={{padding: '10px'}}>
        <button className="top-card" style={{width: '100%', border: 'none', background:'white', padding:'12px', borderRadius:'15px', boxShadow: '0 4px 10px rgba(255, 77, 125, 0.1)'}} onClick={() => setIsChatOpen(true)}>
          <span className="card-label">✨ صديقتكِ الذكية (دردشة كاملة)</span>
        </button>
      </div>

      {/* شاشة الدردشة الكبيرة */}
      {isChatOpen && (
        <div className="full-chat-overlay">
          <div className="chat-header">
            <span style={{fontWeight:'bold'}}>دردشة الأرجوحة الذكية</span>
            <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white', fontSize:'1.2rem'}}>×</button>
          </div>
          
          <div className="chat-content">
            {chatMessages.length === 0 && <p style={{textAlign:'center', color:'#888', marginTop:'20px'}}>ابدئي المحادثة مع صديقتكِ الذكية..</p>}
            {chatMessages.map(msg => (
              <div key={msg.id} className="chat-card">
                <button onClick={() => deleteChat(msg.id)} style={{position:'absolute', left:'10px', top:'10px', color:'red', border:'none', background:'none'}}>🗑️</button>
                <p><strong>أنتِ:</strong> {msg.user}</p>
                <p style={{color: 'var(--accent-purple)'}}><strong>الأرجوحة:</strong> {msg.ai}</p>
              </div>
            ))}
            {isAiLoading && <p style={{color:'var(--female-pink)', textAlign:'center'}}>جاري التفكير...</p>}
          </div>

          <div style={{padding: '15px', borderTop: '1px solid #eee'}}>
             <div style={{display:'flex', gap:'15px', justifyContent:'center', marginBottom:'10px'}}>
                <button className="btn-interact">📷 كاميرا</button>
                <button className="btn-interact">🖼️ صورة</button>
                <button className="btn-interact">🎤 ميك</button>
             </div>
             <div style={{display:'flex', gap:'8px'}}>
                <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اكتبي سؤالكِ هنا..." style={{flex:1, padding:'12px', borderRadius:'25px', border:'1px solid #ddd', outline:'none'}} />
                <button onClick={handleAiChat} style={{background:'var(--female-pink)', color:'white', border:'none', borderRadius:'50%', width:'45px', height:'45px'}}>⏎</button>
             </div>
          </div>
        </div>
      )}

      {/* كارت النشر */}
      <div style={{background: '#fff', margin: '15px', padding: '18px', borderRadius: '25px', border: '1px solid var(--female-pink-light)'}}>
        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} 
                style={{width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '12px', border: '1px solid #f0f0f0', color: 'var(--female-pink)', fontWeight: 'bold'}}>
          <option value="bouh-display-1">حكايات لا تنتهي (1)</option>
          <option value="bouh-display-2">ملاذ القلوب (2)</option>
          <option value="bouh-display-3">قوة لترعيك (3)</option>
          <option value="bouh-display-4">لمسة مليئة (4)</option>
          <option value="bouh-display-5">ذكاء ووعي (5)</option>
        </select>
        <textarea placeholder="ماذا يدور في خاطركِ؟" value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  style={{width: '100%', border: 'none', minHeight: '60px', outline: 'none', resize: 'none'}} />
        <input placeholder="رابط صورة أو فيديو خارجي..." value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
               style={{width: '100%', padding: '8px', border: '1px solid #f9f9f9', fontSize: '0.8rem', borderRadius: '8px'}} />
        <button onClick={handlePublish} disabled={loading}
                style={{float: 'left', background: 'var(--female-pink)', color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '25px', fontWeight: 'bold', marginTop: '10px'}}>
          {loading ? "جاري..." : "نشر"}
        </button>
        <div style={{clear:'both'}}></div>
      </div>

      {/* عرض المنشورات */}
      <div className="feed" style={{paddingBottom: '100px'}}>
        {posts.map((post) => (
          <div key={post.id} className="post-style">
            <div style={{padding: '18px'}}>
               <span style={{fontSize: '0.75rem', color: 'var(--female-pink)', background: 'var(--female-pink-light)', padding: '4px 10px', borderRadius: '10px'}}>{post.section}</span>
               <p style={{margin: '12px 0', color: '#444', lineHeight: '1.6'}}>{post.content}</p>
            </div>
            
            {post.media_url && (
              post.media_url.includes('.mp4') ? 
              <video src={post.media_url} controls className="media-box" /> : 
              <img src={post.media_url} alt="post" className="media-box" />
            )}

            <div style={{display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #fdf2f4'}}>
               <button className="btn-interact" onClick={() => setLikedPosts({...likedPosts, [post.id]: (likedPosts[post.id]||0)+1})}>
                 ❤️ {likedPosts[post.id] || 0} إعجاب
               </button>
               <button className="btn-interact" onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}>
                 💬 تعليق
               </button>
               <button className="btn-interact" onClick={() => handleShare(post)}>
                 🔗 مشاركة
               </button>
            </div>

            {activeCommentId === post.id && (
              <div style={{padding: '15px', background: '#fffafb', borderTop: '1px solid #eee'}}>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input placeholder="أضيفي تعليقكِ..." style={{flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd'}} />
                  <button className="btn-interact">إرسال</button>
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
