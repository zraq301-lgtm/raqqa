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

  // روابط الأيقونات التي قمتِ برفعها
  const raqqaIcon = "https://files.catbox.moe/up4f8f.ico"; // أيقونة رقة
  const likeIcon = "https://files.catbox.moe/images19.jpeg"; // قلب الإعجاب
  const commentIcon = "https://files.catbox.moe/images20.jpeg"; // أيقونة التعليق

  const strictSanitize = (text) => {
    if (!text) return "";
    return text.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, "[محتوى محمي 🔒]");
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

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .nav-header { display: flex; overflow-x: auto; padding: 12px; gap: 12px; background: #fff; border-bottom: 2px solid #FFE4ED; }
        .nav-header::-webkit-scrollbar { display: none; }
        .cat-card { min-width: 95px; height: 105px; background: #fff; border-radius: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1.5px solid #FFD1E3; flex-shrink: 0; }
        
        .unified-card { width: 100%; max-width: 500px; margin: 0 auto; background: #fff; border-radius: 40px; border: 1px solid #FFF0F5; box-shadow: 0 10px 30px rgba(255, 182, 193, 0.1); }
        .post-media { width: 100%; height: 400px; object-fit: cover; border-radius: 30px; }
        
        .female-action-bar { display: flex; justify-content: space-around; align-items: center; padding: 15px 10px; border-top: 1px solid #FFF5F7; }
        .action-item { display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; transition: 0.3s; }
        .action-item:active { transform: scale(0.9); }
        .action-icon { width: 45px; height: 45px; object-fit: contain; }
        .action-label { font-size: 13px; font-weight: 800; color: #D81B60; }
      `}</style>

      {/* شريط الأقسام */}
      <nav className="sticky top-0 z-50 nav-header shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-card active:scale-95">
            <span className="text-2xl">{c.icon}</span>
            <span className="text-[14px] font-black text-pink-600 mt-1">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10 max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر */}
              <div className="unified-card p-6 bg-gradient-to-b from-white to-[#FFFBFC]">
                <div className="flex items-center gap-3 mb-4">
                  <img src={raqqaIcon} className="w-10 h-10 rounded-full border-2 border-pink-200" alt="رقة" />
                  <span className="text-sm font-black text-pink-500 italic">اكتبي ما بقلبكِ..</span>
                </div>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-5 bg-white border border-pink-100 rounded-[2.5rem] outline-none text-sm shadow-inner min-h-[120px]"
                  placeholder="حدثينا عن يومكِ الجميل... 🎀"
                />
                <div className="flex justify-between items-center mt-5">
                  <label className="bg-pink-50 px-6 py-2.5 rounded-2xl cursor-pointer text-pink-500 font-bold text-xs">🖼️ أضيفي صورة</label>
                  <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-12 py-3 rounded-full text-xs font-black shadow-lg">نشر الرقة</button>
                </div>
              </div>

              {/* قائمة المنشورات */}
              <div className="space-y-12">
                {posts.map(p => (
                  <div key={p.id} className="unified-card overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-5">
                        <img src={raqqaIcon} className="w-12 h-12 rounded-full shadow-md border-2 border-white" alt="رقة" />
                        <div>
                          <p className="text-sm font-black text-gray-800 italic">رقة</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      
                      {p.content && (
                        <p className="text-[16px] text-gray-700 leading-relaxed mb-6 px-2 font-medium">
                          {strictSanitize(p.content)}
                        </p>
                      )}

                      {p.media_url && (
                        <div className="rounded-[2.5rem] overflow-hidden shadow-sm border border-pink-50">
                          {p.type === 'فيديو' || p.media_url.match(/\.(mp4|webm|blomp)$/i) ? (
                            <video src={p.media_url} controls className="post-media" />
                          ) : (
                            <img src={p.media_url} alt="محتوى" className="post-media" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* أزرار التفاعل العرضية الكبيرة */}
                    <div className="female-action-bar">
                      <div className="action-item" onClick={() => handleLike(p.id)}>
                        <img src={likeIcon} className={`action-icon ${likes[p.id] ? 'animate-pulse' : 'grayscale-[0.5]'}`} />
                        <span className="action-label">أحببت</span>
                      </div>

                      <div className="action-item" onClick={() => setIsChatOpen(true)}>
                        <img src={commentIcon} className="action-icon" />
                        <span className="action-label">رد وحوار</span>
                      </div>

                      <div className="action-item">
                        <span className="text-3xl">🎁</span>
                        <span className="action-label">إهداء</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          
          {/* Routes الأقسام ثابتة كما هي */}
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

      {/* زر AI العائم */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50">💬</button>
    </div>
  );
};

export default Swing;
