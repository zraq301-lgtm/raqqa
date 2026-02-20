import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية
import MotherhoodHaven from './Swing-page/MotherhoodHaven';
import LittleOnesAcademy from './Swing-page/LittleOnesAcademy';
import WellnessOasis from './Swing-page/WellnessOasis';
import EleganceIcon from './Swing-page/EleganceIcon';
import CulinaryArts from './Swing-page/CulinaryArts';
import HomeCorners from './Swing-page/HomeCorners';
import EmpowermentPaths from './Swing-page/EmpowermentPaths';
import HarmonyBridges from './Swing-page/HarmonyBridges';
import PassionsCrafts from './Swing-page/PassionsCrafts';
import SoulsLounge from './Swing-page/SoulsLounge';

const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const Swing = () => {
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('raqqa_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [userInput, setUserInput] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [likes, setLikes] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [openCommentId, setOpenCommentId] = useState(null); // لإظهار صندوق التعليقات

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      const validPosts = (res.data.posts || []).filter(p => p.type !== 'رابط');
      setPosts(validPosts);
    } catch (e) { console.error("Error fetching posts:", e); }
  };

  const handlePublish = async () => {
    if (!content && !selectedFile) return alert("اكتبي شيئاً أولاً يا جميلة");
    setIsPublishing(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'bouh-display-1');
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE}/save-post`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('تم حفظ بوحكِ في الذاكرة بنجاح ✨');
        setContent('');
        setSelectedFile(null);
        fetchPosts();
      }
    } catch (e) {
      alert("عذراً، تعثر النشر.. تأكدي من إعدادات السيرفر");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => {
        const updated = [...prev, userMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(updated));
        return updated;
    });
    const tempInput = userInput; setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: tempInput }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || "أنا معكِ دائماً..", id: Date.now() + 1 };
      setChatHistory(prev => {
        const updated = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(updated));
        return updated;
      });
    } catch (e) { alert("رقة منشغلة حالياً، سأرد قريباً.."); }
  };

  const deleteMsg = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'بوح من تطبيق رقة',
          text: post.content,
          url: window.location.href,
        });
      } else {
        alert("نسخ الرابط: " + window.location.href);
      }
    } catch (err) { console.log(err); }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .glass-nav { display: flex; overflow-x: auto; padding: 15px; gap: 12px; background: rgba(255,255,255,0.7); backdrop-filter: blur(15px); sticky top-0 z-50; border-bottom: 1px solid #FFE4ED; }
        .glass-nav::-webkit-scrollbar { display: none; }
        .cat-btn { min-width: 90px; height: 100px; background: #fff; border-radius: 25px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #FFD1E3; flex-shrink: 0; }
        
        .writer-card { width: 95%; max-width: 450px; margin: 20px auto; background: #fff; border-radius: 35px; border: 2px solid #FFF0F5; box-shadow: 0 10px 30px rgba(255, 182, 193, 0.1); padding: 20px; position: relative; }
        .input-area { width: 100%; min-height: 120px; border: none; outline: none; background: #FFFBFD; border-radius: 20px; padding: 15px; font-size: 15px; resize: none; color: #555; }
        
        .content-card { width: 95%; max-width: 450px; margin: 0 auto 20px; background: #fff; border-radius: 30px; border: 1px solid #FFF5F7; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .content-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; }

        .ai-float-btn { background: linear-gradient(45deg, #FF6B95, #D81B60); color: white; padding: 8px 15px; border-radius: 20px; font-size: 11px; font-weight: bold; }

        /* تنسيق كارت الشات المنبثق الانيق */
        .chat-overlay { position: fixed; inset: 0; background: rgba(255,182,193,0.2); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: flex-end; justify-content: center; }
        .chat-card-popup { width: 100%; height: 85vh; background: white; border-radius: 40px 40px 0 0; display: flex; flex-direction: column; box-shadow: 0 -20px 50px rgba(0,0,0,0.1); border: 1px solid #FFE4ED; animation: slideUp 0.4s ease-out; }
        
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <nav className="glass-nav">
        {[
          { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🌸" },
          { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "🧸" },
          { ar: "واحة العافية", path: "WellnessOasis", icon: "🌿" },
          { ar: "أيقونة الأناقة", path: "EleganceIcon", icon: "💄" },
          { ar: "فن الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
          { ar: "زوايا البيت", path: "HomeCorners", icon: "🏡" },
          { ar: "ملتقى الأرواح", path: "SoulsLounge", icon: "✨" }
        ].map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-btn">
            <span className="text-2xl">{c.icon}</span>
            <span className="text-[11px] font-bold text-pink-600 mt-1">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-2">
        <Routes>
          <Route path="/" element={
            <>
              <div className="writer-card">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setIsChatOpen(true)} className="ai-float-btn animate-pulse">✨ اسألي رقة</button>
                  <div className="flex items-center gap-2 text-pink-500 font-bold italic">
                    <span>نادي رقة</span>
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">🌹</div>
                  </div>
                </div>
                
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="input-area"
                  placeholder="انثري عطركِ بكلمات رقيقة هنا... 🎀"
                />
                
                <div className="flex justify-between items-center mt-3 border-t pt-3 border-pink-50">
                  <div className="flex gap-4">
                    <label className="text-xl cursor-pointer">🖼️ <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
                    <button className="text-xl" onClick={() => alert("فتح الميكروفون...")}>🎙️</button>
                    <button className="text-xl" onClick={() => alert("فتح الكاميرا...")}>📷</button>
                  </div>
                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-pink-600 text-white px-10 py-2 rounded-full font-bold shadow-lg active:scale-95 transition"
                  >
                    {isPublishing ? "جاري النشر..." : "نشر"}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="content-card">
                    <div className="p-4 flex items-center gap-2">
                      <div className="w-9 h-9 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100">🦋</div>
                      <span className="font-bold text-gray-700 text-sm italic">رقة</span>
                    </div>
                    
                    <p className="px-5 pb-3 text-gray-600 text-[14px] leading-relaxed">
                      {p.content}
                    </p>

                    {p.media_url && (
                      <div className="bg-gray-100">
                        <img src={p.media_url} className="content-img" alt="بوح" />
                      </div>
                    )}

                    <div className="flex justify-around p-3 border-t border-pink-50">
                      <button onClick={() => setLikes(v=>({...v, [p.id]:!v[p.id]}))} className="flex flex-col items-center group">
                        <span className={`text-xl transition-transform ${likes[p.id] ? 'scale-125' : ''}`}>
                            {likes[p.id] ? '❤️' : '🤍'}
                        </span>
                        <span className="text-[10px] text-pink-400 font-bold">أحببت</span>
                      </button>
                      <button onClick={() => setOpenCommentId(openCommentId === p.id ? null : p.id)} className="flex flex-col items-center">
                        <span className="text-xl">💬</span>
                        <span className="text-[10px] text-pink-400 font-bold">تعليق</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="flex flex-col items-center">
                        <span className="text-xl">🔗</span>
                        <span className="text-[10px] text-pink-400 font-bold">مشاركة</span>
                      </button>
                    </div>

                    {openCommentId === p.id && (
                        <div className="p-4 bg-pink-50/20 border-t border-pink-50 animate-in fade-in slide-in-from-top-2">
                            <input className="w-full p-3 rounded-full border border-pink-100 text-sm outline-none" placeholder="اكتبي تعليقكِ الرقيق..." />
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />
        </Routes>
      </main>

      {/* نافذة الدردشة (الكارت الأنيق المستقل) */}
      {isChatOpen && (
        <div className="chat-overlay" onClick={() => setIsChatOpen(false)}>
          <div className="chat-card-popup" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b-2 border-pink-50 flex justify-between items-center bg-white rounded-t-[40px]">
                <button onClick={() => setIsChatOpen(false)} className="text-pink-200 text-3xl">✕</button>
                <div className="text-right">
                    <h2 className="text-lg font-black text-pink-600">رقة الذكية</h2>
                    <p className="text-[10px] text-gray-400 italic">مستشارتكِ الأدبية الخاصة</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFBFD]">
              {chatHistory.length === 0 && (
                <div className="text-center mt-20 text-pink-200 italic font-light">
                    <span className="text-4xl block mb-4">🕊️</span>
                    أهلاً بكِ في عالم رقة.. كيف يمكنني أن أزين يومكِ؟
                </div>
              )}
              {chatHistory.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-5 rounded-[2rem] max-w-[85%] text-[15px] shadow-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-white border border-pink-100 text-gray-700 rounded-bl-none' : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white italic rounded-br-none'
                  }`}>
                    {m.content}
                  </div>
                  <button onClick={() => deleteMsg(m.id)} className="text-[10px] text-red-300 mt-2 px-3 hover:text-red-500 transition">حذف الرد 🗑️</button>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-pink-50 shadow-2xl">
              <div className="flex gap-4 items-center mb-4 justify-center">
                <button className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-xl shadow-inner" onClick={() => alert("فتح الميكروفون...")}>🎙️</button>
                <button className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-xl shadow-inner" onClick={() => alert("فتح الكاميرا...")}>📷</button>
                <label className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-xl shadow-inner cursor-pointer">
                  🖼️ <input type="file" className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 items-center">
                <input 
                  value={userInput} onChange={e => setUserInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleChat()}
                  className="flex-1 p-5 bg-pink-50/50 rounded-full outline-none text-sm font-medium placeholder-pink-200"
                  placeholder="اكتبي سؤالكِ هنا..."
                />
                <button onClick={handleChat} className="bg-pink-600 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center active:scale-90 transition transform">🕊️</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
