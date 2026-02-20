import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية بناءً على هيكلة الملفات المرفوعة
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

  // دالة الفلترة الصارمة لمنع الروابط الخارجية وأسماء الملفات البرمجية
  const strictSanitize = (text) => {
    if (!text) return "";
    return text
      .replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, "[محتوى محمي 🔒]")
      .replace(/\b[\w-]+\.(mp4|mov|webm|jpg|png|js|jsx)\b/gi, "");
  };

  const categories = [
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
  ];

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      // تصفية المحتوى بناءً على صور قاعدة البيانات: منع أي صف نوعه "رابط" 
      const validPosts = (res.data.posts || []).filter(p => p.type !== 'رابط');
      setPosts(validPosts);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSavePost = async () => {
    if (!content && !selectedFile) return;
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (res.ok) { setContent(''); setSelectedFile(null); fetchPosts(); }
    } catch (e) { console.error(e); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const temp = userInput; setUserInput('');
    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: `أنا أنثى مسلمة... ${temp}` }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH));
        return newH;
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .nav-header { display: flex; overflow-x: auto; padding: 12px; gap: 12px; background: #fff; border-bottom: 2px solid #FFE4ED; margin-top: -10px; }
        .nav-header::-webkit-scrollbar { display: none; }
        .cat-card { min-width: 90px; height: 100px; background: #fff; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1.5px solid #FFD1E3; flex-shrink: 0; }
        .cat-text { font-size: 15px; font-weight: 900; color: #D81B60; margin-top: 5px; text-align: center; }
        
        .elegant-post-card { width: 100%; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 35px; border: 1px solid #FFF0F5; box-shadow: 0 4px 15px rgba(255, 182, 193, 0.05); }
        .media-viewer { width: 100%; height: 380px; object-fit: cover; border-radius: 25px; background: #fdf2f8; }
        
        .publish-box { background: linear-gradient(145deg, #ffffff, #fffafa); padding: 25px; border-radius: 35px; border: 1px solid #FFE4ED; margin-bottom: 30px; }
        .btn-interact { padding: 14px 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 800; color: #A5A5A5; }
        .btn-interact.active { color: #E91E63; }
      `}</style>

      <nav className="sticky top-0 z-50 nav-header shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-card active:scale-95 transition-transform">
            <span className="text-2xl">{c.icon}</span>
            <span className="cat-text">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10 max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={
            <>
              {/* كارت النشر الأنيق والمطور */}
              <div className="elegant-post-card publish-box">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">ر</div>
                  <span className="text-sm font-black text-pink-600 italic">ماذا تخبرين رقة اليوم؟</span>
                </div>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-5 bg-white border border-pink-50 rounded-[2rem] outline-none text-sm placeholder-pink-200 min-h-[120px] shadow-inner"
                  placeholder="انثري كلماتكِ هنا بكل حب... 🎀"
                />
                <div className="flex justify-between items-center mt-5 px-2">
                  <label className="flex items-center gap-2 bg-pink-50 px-5 py-2.5 rounded-2xl cursor-pointer hover:bg-pink-100 transition-all">
                    <span className="text-xs font-bold text-pink-500">🖼️ وسائط</span>
                    <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-10 py-2.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-all">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات مع تطبيق الفلترة الصارمة */}
              <div className="space-y-12">
                {posts.map(p => (
                  <div key={p.id} className="elegant-post-card overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-black border-2 border-white">ر</div>
                        <div>
                          <p className="text-sm font-black text-gray-800 italic">رقة</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      
                      {p.content && (
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-6 px-1">
                          {strictSanitize(p.content)}
                        </p>
                      )}

                      {p.media_url && (
                        <div className="rounded-[2rem] overflow-hidden border border-pink-50 shadow-sm">
                          {p.type === 'فيديو' || p.media_url.match(/\.(mp4|webm|blomp)$/i) ? (
                            <video src={p.media_url} controls className="media-viewer" />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" className="media-viewer" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 border-t border-pink-50">
                      <button onClick={() => handleLike(p.id)} className={`btn-interact ${likes[p.id] ? 'active' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="btn-interact">💬 <span>رد</span></button>
                      <button className="btn-interact">🎀 <span>إهداء</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          
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

      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce">💬</button>
    </div>
  );
};

export default Swing;
