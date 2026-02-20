import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية بناءً على الملفات المرفوعة [cite: 3, 4]
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

  // دالة تنظيف المحتوى لمنع جلب الروابط الخارجية من قاعدة البيانات
  const sanitizeContent = (text) => {
    if (!text) return "";
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, "[محتوى محمي]"); 
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []); // جلب البيانات من نيون [cite: 10, 11]
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleLike = (id) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async (p) => {
    try {
      await navigator.share({ title: 'رقة', text: p.content, url: window.location.href });
    } catch (e) { alert("تم نسخ المحتوى للمشاركة 🎀"); }
  };

  const handleSavePost = async () => {
    if (!content) return alert("اكتبي شيئاً أولاً");
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'صورة' : 'نصي'); // [cite: 14]
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData }); // [cite: 15]
      if (res.ok) { setContent(''); setSelectedFile(null); fetchPosts(); }
    } catch (e) { alert("فشل النشر"); }
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] text-right font-sans pb-20" dir="rtl">
      <style>{`
        .nav-wrapper {
          display: flex;
          overflow-x: auto;
          padding: 10px 5px;
          gap: 12px;
          background: #fff;
          border-bottom: 2px solid #FFE4ED;
          margin-top: -5px; /* رفع الشريط لأعلى */
        }
        .nav-wrapper::-webkit-scrollbar { display: none; }
        .category-card {
          min-width: 75px;
          height: 85px;
          background: #FFF;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFD1E3;
          transition: 0.3s;
        }
        .cat-icon { font-size: 1.1rem; }
        .cat-name { 
          font-size: 16px; /* تكبير الخط للضعف */
          font-weight: 900; 
          color: #D81B60; 
          margin-top: 4px;
          text-align: center;
          line-height: 1;
        }
        .feminine-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #888;
          transition: 0.3s;
          padding: 10px 0;
        }
        .feminine-btn.liked { color: #E91E63; }
        .post-card { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 28px; border: 1px solid #FFF0F5; }
        .media-box { width: 100%; height: 320px; object-fit: cover; border-radius: 22px; }
      `}</style>

      {/* شريط الأقسام المرفوع والأنيق */}
      <header className="sticky top-0 z-50 shadow-sm nav-wrapper">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="category-card shadow-sm active:scale-95">
            <span className="cat-icon">{c.icon}</span>
            <span className="cat-name">{c.name}</span>
          </Link>
        ))}
      </header>

      <main className="p-4 space-y-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر بلمسة أنثوية */}
              <div className="post-card p-6 shadow-sm mb-6 border-b-4 border-pink-100">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-[#FFF9FB] rounded-2xl text-sm outline-none border-none placeholder-pink-200"
                  placeholder="شاركينا رقتكِ اليوم... ✍️" rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer text-xs font-bold text-pink-400 flex items-center gap-1">
                    ✨ معرض الصور <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-gradient-to-l from-pink-500 to-rose-400 text-white px-10 py-2 rounded-full text-xs font-bold shadow-pink-100 shadow-lg">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات مع تنظيف الروابط وتفعيل التفاعل */}
              <div className="space-y-8">
                {posts.map(p => (
                  <div key={p.id} className="post-card shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-50 rounded-full border-2 border-white flex items-center justify-center text-pink-500 font-black">ر</div>
                        <span className="text-sm font-black text-gray-700 italic">رقة</span>
                      </div>
                      <p className="text-[14px] text-gray-600 leading-relaxed mb-4 px-1">
                        {sanitizeContent(p.content)} 
                      </p>
                      {p.media_url && <img src={p.media_url} alt="محتوى رقة" className="media-box shadow-inner" />}
                    </div>

                    {/* أزرار تفاعل أنيقة ومفعلة */}
                    <div className="flex border-t border-pink-50 py-1 bg-[#FFFDFE]">
                      <button onClick={() => handleLike(p.id)} className={`feminine-btn ${likes[p.id] ? 'liked' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="feminine-btn hover:text-pink-400">
                        💌 <span>رد</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="feminine-btn hover:text-pink-400">
                        🎀 <span>إهداء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          
          {/* المسارات الفرعية [cite: 3, 4] */}
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

      {/* زر AI عائم */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-[0_10px_20px_rgba(233,30,99,0.3)] flex items-center justify-center text-2xl z-50">✨</button>
    </div>
  );
};

export default Swing;
