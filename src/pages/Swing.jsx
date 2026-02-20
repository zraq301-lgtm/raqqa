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

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      // فلترة المحتوى: جلب كل المنشورات واستبعاد الروابط فقط
      const validPosts = (res.data.posts || []).filter(p => p.type !== 'رابط');
      setPosts(validPosts);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  // دالة المشاركة البديلة التي لا تسبب أخطاء في الـ Build
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'رقة - أنوثة وجمال',
          text: post.content,
          url: window.location.href,
        });
      } catch (err) { console.log('Share cancelled'); }
    } else {
      alert("خاصية المشاركة غير مدعومة في متصفحك حالياً");
    }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const tempText = userInput;
    setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { 
          // ضبط الأسلوب ليكون أدبياً نفسياً وشعرياً
          prompt: `بصفتكِ 'رقة'، ردي بأسلوب أدبي رقيق وشعري رومانسي، مع لمسة نفسية إيجابية على: ${tempText}` 
        }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH));
        return newH;
      });
    } catch (e) { console.error("AI Error", e); }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFE] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .post-card { width: 100%; max-width: 480px; margin: 0 auto 20px; background: #fff; border-radius: 30px; border: 1px solid #FFF0F5; box-shadow: 0 8px 20px rgba(255, 192, 203, 0.1); overflow: hidden; }
        .nav-bar { display: flex; overflow-x: auto; padding: 15px; gap: 15px; background: #fff; border-bottom: 2px solid #FFF5F7; }
        .nav-bar::-webkit-scrollbar { display: none; }
        .media-box { width: 100%; height: 380px; object-fit: cover; background: #fdf2f8; border-radius: 25px; }
        .btn-action { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 12px; gap: 4px; transition: 0.2s; }
        .btn-action:active { transform: scale(0.9); }
        .ai-glow { background: linear-gradient(135deg, #FF80AB, #EC407A); color: white; border-radius: 15px; padding: 6px 15px; font-weight: 900; font-size: 11px; box-shadow: 0 4px 10px rgba(236, 64, 122, 0.3); }
      `}</style>

      <nav className="sticky top-0 z-50 nav-bar shadow-sm">
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
          <Link key={i} to={`/Swing/${c.path}`} className="flex flex-col items-center min-w-[90px] no-underline">
            <span className="text-2xl">{c.icon}</span>
            <span className="text-[12px] font-black text-pink-500 mt-1">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر المطور */}
              <div className="post-card p-6 border-b-4 border-pink-100">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-md">🦋</div>
                    <span className="font-black text-pink-600 italic">عالم رقة</span>
                  </div>
                  <button onClick={() => setIsChatOpen(true)} className="ai-glow animate-pulse">✨ دردشة الذكاء</button>
                </div>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-5 bg-pink-50/20 border border-pink-100 rounded-[2rem] outline-none text-sm placeholder-pink-200 min-h-[110px]"
                  placeholder="حدثينا عن جمال يومكِ يا رقيقة... 🎀"
                />
                <div className="flex justify-between items-center mt-5">
                  <div className="flex gap-4">
                    <button className="text-2xl">📸</button>
                    <button className="text-2xl">🎙️</button>
                    <label className="cursor-pointer text-2xl">🖼️ <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
                  </div>
                  <button onClick={() => alert('تم النشر بنجاح')} className="bg-pink-600 text-white px-10 py-2.5 rounded-full text-xs font-black shadow-lg">نشر</button>
                </div>
              </div>

              {/* عرض المحتوى بمقاسات موحدة */}
              <div className="space-y-8">
                {posts.map(p => (
                  <div key={p.id} className="post-card">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-xl">🌷</div>
                        <div>
                          <p className="text-sm font-black text-gray-800">رقة</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <p className="text-[15px] text-gray-700 leading-relaxed px-1 mb-5">{p.content}</p>
                      
                      {p.media_url && (
                        <div className="rounded-[2.5rem] overflow-hidden shadow-inner border border-pink-50">
                          {p.type === 'فيديو' ? (
                            <video src={p.media_url} controls className="media-box" />
                          ) : (
                            <img src={p.media_url} className="media-box" alt="رقة" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex border-t border-pink-50">
                      <button onClick={() => handleLike(p.id)} className="btn-action">
                        <span className="text-2xl">{likes[p.id] ? '💖' : '🤍'}</span>
                        <span className="text-[10px] font-black text-pink-500">أحببت</span>
                      </button>
                      <button onClick={() => setIsChatOpen(true)} className="btn-action border-x border-pink-50">
                        <span className="text-2xl">💬</span>
                        <span className="text-[10px] font-black text-pink-500">رد وحوار</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="btn-action">
                        <span className="text-2xl">🎁</span>
                        <span className="text-[10px] font-black text-pink-500">إهداء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          {/* Routes الأقسام ثابتة */}
        </Routes>
      </main>

      {/* نافذة الدردشة الذكية المتطورة */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-4">
          <div className="flex justify-between items-center p-5 border-b-2 border-pink-50">
            <h2 className="text-xl font-black text-pink-600 italic">مستشارة رقة الأدبية 🖋️</h2>
            <button onClick={() => setIsChatOpen(false)} className="text-3xl text-pink-300">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {chatHistory.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                <div className={`p-5 rounded-[2rem] text-sm shadow-sm max-w-[85%] ${m.role === 'user' ? 'bg-white border border-pink-100 text-gray-800' : 'bg-gradient-to-r from-pink-400 to-rose-500 text-white italic'}`}>
                  {m.content}
                </div>
                <button onClick={() => {
                  const filtered = chatHistory.filter(item => item.id !== m.id);
                  setChatHistory(filtered);
                  localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
                }} className="text-[10px] text-red-300 mt-2 px-3">حذف الرد 🗑️</button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-pink-100">
            <div className="flex gap-3 items-center">
              <button className="text-2xl">📸</button>
              <button className="text-2xl">🎙️</button>
              <input 
                value={userInput} onChange={e => setUserInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                className="flex-1 p-4 bg-pink-50/50 rounded-full text-sm outline-none" 
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
