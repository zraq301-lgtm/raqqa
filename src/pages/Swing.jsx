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

  // دالة منع جلب وعرض الروابط الخارجية من قاعدة البيانات (نيون)
  const sanitizeText = (text) => {
    if (!text) return "";
    // تعبير نمطي للبحث عن أي رابط يبدأ بـ http أو www
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    return text.replace(urlPattern, "[محتوى محمي 🔒]");
  };

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

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleShare = async (p) => {
    if (navigator.share) {
      try { await navigator.share({ title: 'رقة', text: p.content, url: window.location.href }); } 
      catch (e) { console.log("Share cancelled"); }
    }
  };

  const handleSavePost = async () => {
    if (!content && !selectedFile) return alert("اكتبي شيئاً أولاً");
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'مرفق' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (res.ok) { setContent(''); setSelectedFile(null); fetchPosts(); }
    } catch (e) { alert("فشل النشر"); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const tempInput = userInput; setUserInput('');
    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: `أنا أنثى مسلمة... ${tempInput}` }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH));
        return newH;
      });
    } catch (e) { alert("خطأ في الاتصال"); }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .nav-scroll { display: flex; overflow-x: auto; padding: 10px; gap: 12px; background: #fff; border-bottom: 2px solid #FFE4ED; margin-top: -10px; }
        .nav-scroll::-webkit-scrollbar { display: none; }
        .cat-card { min-width: 85px; height: 95px; background: #fff; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1.5px solid #FFD1E3; }
        .cat-name { font-size: 17px; font-weight: 900; color: #D81B60; margin-top: 4px; }
        
        /* كارت النشر الأنيق */
        .publish-card {
          max-width: 500px; margin: 0 auto 30px auto;
          background: linear-gradient(145deg, #ffffff, #fff5f8);
          border-radius: 35px; padding: 25px;
          border: 1px solid #FFE4ED;
          box-shadow: 0 10px 30px rgba(255, 182, 193, 0.1);
        }
        .text-area-feminine {
          width: 100%; padding: 20px; background: #ffffff; border-radius: 25px;
          border: 1px solid #FFF0F5; outline: none; font-size: 14px;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.01); transition: 0.3s;
        }
        .text-area-feminine:focus { border-color: #FFB6C1; }
        .upload-btn {
          display: flex; align-items: center; gap: 8px; color: #FF6B95;
          font-weight: 700; font-size: 12px; background: #FFF0F5;
          padding: 8px 18px; border-radius: 20px; transition: 0.3s;
        }
        .upload-btn:hover { background: #FFE4ED; }

        .post-display-card { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 32px; border: 1px solid #FFF0F5; }
        .action-row { display: flex; justify-content: space-around; padding: 15px 0; border-top: 1px solid #FFF5F7; }
        .action-btn { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; color: #A5A5A5; }
        .action-btn.active { color: #E91E63; }
      `}</style>

      {/* الشريط العلوي */}
      <nav className="sticky top-0 z-50 nav-scroll shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-card">
            <span className="text-2xl">{c.icon}</span>
            <span className="cat-name">{c.name}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر المطور والأنيق */}
              <div className="publish-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md shadow-pink-100">ر</div>
                  <span className="text-sm font-black text-pink-600 italic">ماذا تخبرين رقة اليوم؟</span>
                </div>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="text-area-feminine mb-4"
                  placeholder="انثري كلماتكِ هنا بكل حب... 🎀" rows="3"
                />
                <div className="flex justify-between items-center">
                  <label className="cursor-pointer">
                    <div className="upload-btn">
                      <span>🖼️ إضافة وسائط</span>
                      <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                    </div>
                  </label>
                  <button onClick={handleSavePost} className="bg-gradient-to-r from-pink-400 to-rose-500 text-white px-10 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-pink-200 hover:scale-105 transition-transform">
                    نشر الرقة
                  </button>
                </div>
                {selectedFile && <p className="text-[10px] text-pink-400 mt-2 px-2">📎 تم اختيار ملف: {selectedFile.name}</p>}
              </div>

              {/* قائمة المنشورات */}
              <div className="space-y-12">
                {posts.map(p => (
                  <div key={p.id} className="post-display-card overflow-hidden shadow-sm">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-black shadow-sm">ر</div>
                        <div>
                          <p className="text-sm font-black text-gray-800 italic">رقة</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      
                      {/* عرض المحتوى مع تنظيفه من أي روابط خارجية */}
                      {p.content && (
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-6 px-1">
                          {sanitizeText(p.content)}
                        </p>
                      )}

                      {p.media_url && (
                        <div className="rounded-3xl overflow-hidden border border-pink-50 shadow-inner">
                          {p.media_url.match(/\.(mp4|webm|mov|blomp)$/i) ? (
                            <video src={p.media_url} controls className="w-full max-h-[400px] object-cover" />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" className="w-full max-h-[400px] object-cover" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="action-row">
                      <button onClick={() => handleLike(p.id)} className={`action-btn ${likes[p.id] ? 'active' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="action-btn hover:text-pink-400">💌 <span>رد</span></button>
                      <button onClick={() => handleShare(p)} className="action-btn hover:text-pink-400">🎀 <span>إهداء</span></button>
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

      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce">✨</button>
    </div>
  );
};

export default Swing;
