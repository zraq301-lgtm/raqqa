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

  // دالة تنظيف المحتوى من الروابط
  const strictSanitize = (text) => {
    if (!text) return "";
    return text.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, "[محتوى محمي 🔒]");
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      const validPosts = (res.data.posts || []).filter(p => p.type !== 'رابط');
      setPosts(validPosts);
    } catch (e) { console.error(e); }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  // نظام الدردشة الأدبي المتطور
  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const tempInput = userInput; setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { 
          prompt: `أنتِ "رقة"، مستشارة أدبية ونفسية. ردي على هذه الأنثى بأسلوب أدبي، شعري، رومانسي، وبتحليل نفسي إيجابي يدعم روحها: ${tempInput}` 
        }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH));
        return newH;
      });
    } catch (e) { alert("عذراً، رقة مشغولة حالياً بالقصائد.."); }
  };

  const deleteChatMsg = (id) => {
    const updated = chatHistory.filter(m => m.id !== id);
    setChatHistory(updated);
    localStorage.setItem('raqqa_chats', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .glass-nav { display: flex; overflow-x: auto; padding: 15px; gap: 15px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #FFE4ED; }
        .glass-nav::-webkit-scrollbar { display: none; }
        .cat-btn { min-width: 100px; height: 110px; background: #fff; border-radius: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #FFD1E3; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        
        .premium-card { width: 100%; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 45px; border: 1px solid #FFF0F5; box-shadow: 0 15px 35px rgba(255, 182, 193, 0.15); }
        .input-glow { width: 100%; p: 20px; background: #FFFBFD; border: 1px solid #FFE4ED; border-radius: 35px; outline: none; transition: 0.4s; }
        .input-glow:focus { box-shadow: 0 0 15px rgba(255, 182, 193, 0.4); border-color: #FFB6C1; }
        
        .action-row-btns { display: flex; justify-content: space-around; padding: 18px; border-top: 1px solid #FFF5F7; }
        .ai-btn-top { background: linear-gradient(45deg, #FF6B95, #D81B60); color: #fff; padding: 10px 20px; border-radius: 20px; font-weight: 800; font-size: 12px; }
      `}</style>

      <nav className="sticky top-0 z-50 glass-nav shadow-sm">
        {/* الأقسام كما هي */}
        {[
          { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🌸" },
          { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "🧸" },
          { ar: "واحة العافية", path: "WellnessOasis", icon: "🌿" },
          { ar: "أيقونة الأناقة", path: "EleganceIcon", icon: "💄" },
          { ar: "فن الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
          { ar: "زوايا البيت", path: "HomeCorners", icon: "🏡" },
          { ar: "مسارات التمكين", path: "EmpowermentPaths", icon: "🚀" },
          { ar: "جسور المودة", path: "HarmonyBridges", icon: "🤝" },
          { ar: "شغف وحرف", path: "PassionsCrafts", icon: "🎨" },
          { ar: "ملتقى الأرواح", path: "SoulsLounge", icon: "✨" }
        ].map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-btn active:scale-95">
            <span className="text-3xl">{c.icon}</span>
            <span className="text-[13px] font-black text-pink-600 mt-2">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* كارت النشر الأكثر أناقة */}
              <div className="premium-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-50"></div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white text-xl">🌹</div>
                    <span className="font-black text-pink-600 italic text-lg">نادي رقة</span>
                  </div>
                  <button onClick={() => setIsChatOpen(true)} className="ai-btn-top animate-pulse">✨ دردشة مع الذكاء</button>
                </div>
                
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="input-glow min-h-[140px] p-6 text-gray-700"
                  placeholder="انثري عطركِ هنا بكلمات رقيقة... 🎀"
                />
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex gap-4">
                    <button className="text-2xl hover:scale-110 transition">📷</button>
                    <button className="text-2xl hover:scale-110 transition">🎙️</button>
                    <label className="cursor-pointer text-2xl">🖼️ <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
                  </div>
                  <button onClick={() => alert('تم الحفظ بنجاح')} className="bg-pink-600 text-white px-10 py-3 rounded-full font-black shadow-lg">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات */}
              <div className="space-y-12">
                {posts.map(p => (
                  <div key={p.id} className="premium-card overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">🦋</div>
                        <span className="font-black text-gray-700 italic">رقة</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-[16px] px-2">{strictSanitize(p.content)}</p>
                      {p.media_url && <img src={p.media_url} className="w-full h-80 object-cover mt-4 rounded-[30px]" alt="وسائط" />}
                    </div>
                    <div className="action-row-btns">
                      <button onClick={() => handleLike(p.id)} className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{likes[p.id] ? '❤️' : '🤍'}</span>
                        <span className="text-[10px] font-bold text-pink-500">أحببت</span>
                      </button>
                      <button onClick={() => setIsChatOpen(true)} className="flex flex-col items-center gap-1">
                        <span className="text-2xl">💬</span>
                        <span className="text-[10px] font-bold text-pink-500">حوار</span>
                      </button>
                      <button className="flex flex-col items-center gap-1">
                        <span className="text-2xl">🎁</span>
                        <span className="text-[10px] font-bold text-pink-500">إهداء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          {/* باقي الـ Routes تظل كما هي */}
        </Routes>
      </main>

      {/* نافذة الدردشة المتطورة */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl p-4 flex flex-col">
          <div className="flex justify-between items-center p-6 border-b-2 border-pink-100">
            <h2 className="text-2xl font-black text-pink-600 italic">مستشارة رقة الأدبية 🖋️</h2>
            <button onClick={() => setIsChatOpen(false)} className="text-3xl text-pink-400">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {chatHistory.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                <div className={`p-5 rounded-[2rem] text-[15px] shadow-sm max-w-[85%] ${m.role === 'user' ? 'bg-white border border-pink-100 text-gray-800' : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white italic'}`}>
                  {m.content}
                </div>
                <button onClick={() => deleteChatMsg(m.id)} className="text-[10px] text-red-300 mt-2 px-3">حذف الرد 🗑️</button>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t-2 border-pink-50 rounded-t-[3rem]">
            <div className="flex gap-4 items-center">
              <button className="text-2xl">📷</button>
              <button className="text-2xl">🎙️</button>
              <input 
                value={userInput} onChange={e => setUserInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                className="flex-1 p-5 bg-pink-50/50 rounded-full text-sm outline-none" 
                placeholder="اسألي رقة شعراً أو فضفضي..." 
              />
              <button onClick={handleChat} className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">🕊️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
