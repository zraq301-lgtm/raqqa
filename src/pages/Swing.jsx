import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية بناءً على الملفات المرفوعة
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

  const categories = [
    { name: "الأمومة", path: "MotherhoodHaven", icon: "🌸" },
    { name: "الصغار", path: "LittleOnesAcademy", icon: "🧸" },
    { name: "العافية", path: "WellnessOasis", icon: "🌿" },
    { name: "الأناقة", path: "EleganceIcon", icon: "💄" },
    { name: "الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
    { name: "البيت", path: "HomeCorners", icon: "🏡" },
    { name: "التمكين", path: "EmpowermentPaths", icon: "🚀" },
    { name: "المودة", path: "HarmonyBridges", icon: "🤝" },
    { name: "الحرف", path: "PassionsCrafts", icon: "🎨" },
    { name: "الملتقى", path: "SoulsLounge", icon: "✨" }
  ];

  // دالة تنظيف المحتوى لمنع جلب الروابط النصية الخارجية من البيانات 
  const sanitizeContent = (text) => {
    if (!text) return "";
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, "[محتوى محمي]"); 
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []); // جلب البيانات من Neon 
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async (p) => {
    try {
      await navigator.share({ title: 'رقة', text: p.content, url: window.location.href });
    } catch (e) { alert("تم نسخ الرابط لمشاركته مع من تحبين 🎀"); }
  };

  const handleSavePost = async () => {
    if (!content && !selectedFile) return alert("اكتبي شيئاً أو أرفقي ملفاً أولاً");
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'مرفق' : 'نصي'); [cite: 14]
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData }); [cite: 15]
      if (res.ok) { setContent(''); setSelectedFile(null); fetchPosts(); }
    } catch (e) { alert("فشل النشر"); }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .nav-scroller {
          display: flex;
          overflow-x: auto;
          padding: 12px 8px;
          gap: 14px;
          background: #fff;
          border-bottom: 2px solid #FFE4ED;
          margin-top: -10px;
        }
        .nav-scroller::-webkit-scrollbar { display: none; }
        .category-item {
          min-width: 80px;
          height: 90px;
          background: #FFF;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFD1E3;
          box-shadow: 0 2px 8px rgba(255, 182, 193, 0.1);
        }
        .cat-text { font-size: 16px; font-weight: 900; color: #D81B60; margin-top: 5px; }
        .content-card { 
          max-width: 500px; 
          margin: 0 auto; 
          background: #fff; 
          border-radius: 30px; 
          border: 1px solid #FFF0F5;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .media-display { 
          width: 100%; 
          max-height: 400px; 
          object-fit: cover; 
          border-radius: 24px; 
          background: #fdf2f8;
        }
        .action-bar {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #FFF5F7;
          background: #FFFBFC;
          border-radius: 0 0 30px 30px;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #A0A0A0;
          transition: 0.2s;
        }
        .action-btn.active { color: #E91E63; }
      `}</style>

      {/* شريط الأقسام المرفوع */}
      <nav className="sticky top-0 z-50 nav-scroller shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="category-item active:scale-95 transition-transform">
            <span className="text-xl">{c.icon}</span>
            <span className="cat-text">{c.name}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر الأنيق */}
              <div className="content-card p-6 border-b-4 border-pink-100 mb-8">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-[#FFFBFD] rounded-2xl text-sm outline-none border-none placeholder-pink-200 shadow-inner"
                  placeholder="انثري كلماتكِ الرقيقة هنا... ✍️" rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer text-xs font-bold text-pink-400 flex items-center gap-2">
                    🖼️ إضافة وسائط <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-10 py-2 rounded-full text-xs font-bold shadow-lg shadow-pink-100">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات الديناميكية [cite: 32, 33] */}
              <div className="space-y-10">
                {posts.map(p => (
                  <div key={p.id} className="content-card overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 bg-pink-100 rounded-full border-2 border-white flex items-center justify-center text-pink-500 font-bold shadow-sm">ر</div>
                        <div>
                           <p className="text-sm font-black text-gray-800 italic">رقة</p>
                           <p className="text-[10px] text-gray-400 font-medium">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p> [cite: 34]
                        </div>
                      </div>
                      
                      {p.content && (
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-5 px-1">
                          {sanitizeContent(p.content)} 
                        </p>
                      )}

                      {/* عرض الفيديوهات أو الصور بشكل ذكي */}
                      {p.media_url && (
                        <div className="shadow-inner rounded-2xl overflow-hidden border border-pink-50">
                          {p.media_url.match(/\.(mp4|webm|mov|blomp)$/i) ? (
                            <video src={p.media_url} controls className="media-display" />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" className="media-display" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* أزرار التفاعل العرضية الأنيقة */}
                    <div className="action-bar">
                      <button onClick={() => handleLike(p.id)} className={`action-btn ${likes[p.id] ? 'active' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="action-btn hover:text-pink-400">
                        💬 <span>رد</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="action-btn hover:text-pink-400">
                        🔗 <span>إهداء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          
          {/* مسارات الأقسام الفرعية */}
          <Route path="/MotherhoodHaven" element={<MotherhoodHaven />} />
          <Route path="/LittleOnesAcademy" element={<LittleOnesAcademy />} />
          <Route path="/WellnessOasis" element={<WellnessOasis />} />
          <Route path="/EleganceIcon" element={<EleganceIcon />} />
          <Route path="/CulinaryArts" element={<CulinaryArts />} />
          <Route path="/HomeCorners" element={<HomeCorners />} />
          <Route path="/EmpowermentPaths" element={<EmpowermentPaths />} />
          <Route path="/HarmonyBridges" element={<HarmonyBridges />} />
          <Route path="/PassionsCrafts" element={<PassionsCrafts />} />
          <Route path="/SoulsLounge" element={<SoulsLounge />} />
        </Routes>
      </main>

      {/* زر الدردشة الذكية العائم [cite: 37] */}
      <button 
        onClick={() => setIsChatOpen(true)} 
        className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce"
      >
        ✨
      </button>

      {/* نافذة الدردشة [cite: 38] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[75vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center shadow-md">
              <span className="font-bold">دردشة رقة 🤖</span>
              <button onClick={() => setIsChatOpen(false)} className="text-xl p-1">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/20">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-3xl text-sm max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-500 text-white rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm outline-none shadow-inner" placeholder="اسألي رقة..." />
              <button onClick={handleChat} className="bg-pink-600 text-white px-8 rounded-2xl font-bold">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
