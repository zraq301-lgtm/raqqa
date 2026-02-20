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
  const [comments, setComments] = useState({}); // تتبع التعليقات لكل منشور

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      const validPosts = (res.data.posts || []).filter(p => p.type !== 'رابط');
      setPosts(validPosts);
    } catch (e) { console.error(e); }
  };

  const strictSanitize = (text) => {
    if (!text) return "";
    return text.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, "[محتوى محمي 🔒]");
  };

  const handleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
    // هنا يمكن إضافة CapacitorHttp.post لتسجيل الإعجاب في السيرفر
  };

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'منشور من تطبيق رقة',
          text: post.content,
          url: window.location.href,
        });
      } catch (err) { console.log('Error sharing', err); }
    } else {
      alert("نسخ الرابط: " + window.location.href);
    }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const tempInput = userInput; 
    setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { 
          prompt: `أنتِ "رقة"، مستشارة أدبية ونفسية. ردي بأسلوب رقيق: ${tempInput}` 
        }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH));
        return newH;
      });
    } catch (e) { alert("رقة مشغولة حالياً بتنسيق الزهور.."); }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .glass-nav { display: flex; overflow-x: auto; padding: 15px; gap: 15px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #FFE4ED; }
        .glass-nav::-webkit-scrollbar { display: none; }
        .cat-btn { min-width: 100px; height: 110px; background: #fff; border-radius: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid #FFD1E3; }
        
        .premium-card { width: 100%; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 40px; border: 1px solid #FFF0F5; box-shadow: 0 10px 30px rgba(255, 182, 193, 0.1); }
        
        /* تحسين كارت النشر */
        .writer-card { background: linear-gradient(135deg, #ffffff 0%, #fff5f8 100%); border: 2px solid #ffe4ed; position: relative; overflow: hidden; }
        .writer-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,182,193,0.1) 0%, transparent 70%); pointer-events: none; }
        
        .input-glow { width: 100%; padding: 20px; background: rgba(255,255,255,0.7); border: 1px solid #FFE4ED; border-radius: 25px; outline: none; transition: 0.3s; resize: none; }
        .input-glow:focus { border-color: #FFB6C1; box-shadow: 0 0 15px rgba(255, 182, 193, 0.3); }
        
        .ai-btn-top { background: linear-gradient(45deg, #FF6B95, #D81B60); color: #fff; padding: 8px 16px; border-radius: 15px; font-weight: bold; font-size: 11px; }
      `}</style>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 glass-nav">
        {[
          { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🌸" },
          { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "🧸" },
          { ar: "واحة العافية", path: "WellnessOasis", icon: "🌿" },
          { ar: "أيقونة الأناقة", path: "EleganceIcon", icon: "💄" },
          { ar: "فن الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
          { ar: "زوايا البيت", path: "HomeCorners", icon: "🏡" },
          { ar: "ملتقى الأرواح", path: "SoulsLounge", icon: "✨" }
        ].map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-btn active:scale-95 transition">
            <span className="text-3xl">{c.icon}</span>
            <span className="text-[12px] font-bold text-pink-600 mt-2">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* كارت كتابة المنشور الأنيق */}
              <div className="premium-card writer-card p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white shadow-md">✍️</div>
                    <span className="font-bold text-pink-700">بـوح رقيـق</span>
                  </div>
                  <button onClick={() => setIsChatOpen(true)} className="ai-btn-top shadow-lg">✨ استشيري رقة</button>
                </div>
                
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="input-glow min-h-[120px]"
                  placeholder="ماذا يدور في خاطركِ يا جميلة؟ 🎀"
                />
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-3 text-pink-400">
                    <label className="cursor-pointer hover:text-pink-600 transition text-xl">🖼️ <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
                    <button className="hover:text-pink-600 transition text-xl">🎙️</button>
                  </div>
                  <button onClick={() => {alert('نُشر بجمال!'); setContent('');}} className="bg-pink-600 text-white px-8 py-2 rounded-full font-bold shadow-md hover:bg-pink-700 transition">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات */}
              <div className="space-y-10">
                {posts.map(p => (
                  <div key={p.id} className="premium-card overflow-hidden transition hover:shadow-2xl">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full border border-pink-100 flex items-center justify-center">🦋</div>
                        <div>
                           <p className="font-bold text-gray-800 text-sm">رقة</p>
                           <p className="text-[10px] text-gray-400 font-light">منذ قليل</p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed px-1 mb-4">{strictSanitize(p.content)}</p>
                      {p.media_url && <img src={p.media_url} className="w-full h-72 object-cover rounded-[25px]" alt="وسائط" />}
                    </div>

                    {/* أزرار التفاعل */}
                    <div className="flex justify-around p-4 border-t border-pink-50 bg-pink-50/20">
                      <button onClick={() => handleLike(p.id)} className="flex flex-col items-center group">
                        <span className={`text-2xl transition ${likes[p.id] ? 'scale-125' : ''}`}>
                          {likes[p.id] ? '❤️' : '🤍'}
                        </span>
                        <span className="text-[10px] font-bold text-pink-500">أحببت</span>
                      </button>
                      
                      <button onClick={() => setIsChatOpen(true)} className="flex flex-col items-center">
                        <span className="text-2xl">💬</span>
                        <span className="text-[10px] font-bold text-pink-500">حوار</span>
                      </button>

                      <button onClick={() => handleShare(p)} className="flex flex-col items-center">
                        <span className="text-2xl">🔗</span>
                        <span className="text-[10px] font-bold text-pink-500">مشاركة</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
        </Routes>
      </main>

      {/* نافذة الدردشة (AI) */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center p-6 border-b border-pink-100">
            <h2 className="text-xl font-bold text-pink-600 italic">مستشارة رقة الذكية 🕊️</h2>
            <button onClick={() => setIsChatOpen(false)} className="text-2xl text-pink-300">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-4 rounded-3xl max-w-[85%] text-sm shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-white border border-pink-100 text-gray-700' 
                  : 'bg-gradient-to-l from-pink-500 to-rose-400 text-white'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-pink-50">
            <div className="flex gap-3 items-center bg-pink-50/50 p-2 rounded-full">
              <input 
                value={userInput} onChange={e => setUserInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm" 
                placeholder="تحدثي مع رقة..." 
              />
              <button onClick={handleChat} className="bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition">
                <span className="text-lg">✦</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
