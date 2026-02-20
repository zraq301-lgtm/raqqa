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

  // دالة الفلترة الصارمة: تمنع الروابط، وأسماء الملفات، وأي إشارات لملفات فيديو
  const strictSanitize = (text) => {
    if (!text) return "";
    // حذف الروابط + الكلمات التي تنتهي بصيغ الفيديو + المسارات
    return text
      .replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, "[محتوى محمي]")
      .replace(/\b[\w-]+\.(mp4|mov|webm|avi|mkv|jpg|png)\b/gi, "") 
      .replace(/[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]+\.[a-z]{3,4}/g, ""); 
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
    } catch (e) { console.error("Error fetching", e); }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSavePost = async () => {
    if (!content && !selectedFile) return;
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

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24 overflow-x-hidden" dir="rtl">
      <style>{`
        .nav-header { display: flex; overflow-x: auto; padding: 10px; gap: 12px; background: #fff; border-bottom: 2px solid #FFE4ED; margin-top: -10px; }
        .nav-header::-webkit-scrollbar { display: none; }
        .cat-box { min-width: 85px; height: 95px; background: #fff; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1.5px solid #FFD1E3; flex-shrink: 0; }
        .cat-label { font-size: 17px; font-weight: 900; color: #D81B60; margin-top: 4px; }
        
        /* توحيد مقاسات الكارت */
        .unified-card {
          width: 100%; max-width: 500px; margin: 0 auto;
          background: #fff; border-radius: 35px; border: 1px solid #FFF0F5;
          box-shadow: 0 4px 15px rgba(255, 182, 193, 0.05); overflow: hidden;
        }

        .media-frame {
          width: 100%; height: 350px; /* مقاس موحد */
          object-fit: cover; border-radius: 25px;
          background: #fdf2f8; display: block;
        }

        .publish-area {
          background: linear-gradient(145deg, #ffffff, #fffafa);
          padding: 25px; border-radius: 40px; border: 1px solid #FFE4ED;
          margin: 10px auto 30px auto; max-width: 500px;
        }

        .action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 1px solid #FFF5F7; }
        .action-item { padding: 15px 0; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; font-weight: 800; color: #A5A5A5; }
        .action-item.active { color: #E91E63; }
      `}</style>

      {/* شريط الأقسام */}
      <nav className="sticky top-0 z-50 nav-header shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-box active:scale-95 transition-transform">
            <span className="text-2xl">{c.icon}</span>
            <span className="cat-label">{c.name}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* كارت النشر الأنيق والمنظم */}
              <div className="publish-area shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">ر</div>
                  <span className="text-sm font-black text-pink-600 italic">بماذا تشعرين يا رقة؟</span>
                </div>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-white border border-pink-50 rounded-3xl outline-none text-sm placeholder-pink-200 min-h-[100px]"
                  placeholder="انثري كلماتكِ هنا... 🎀"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-2xl cursor-pointer hover:bg-pink-100 transition-colors">
                    <span className="text-xs font-bold text-pink-500">🖼️ وسائط</span>
                    <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2.5 rounded-full text-xs font-bold shadow-lg">نشر الرقة</button>
                </div>
              </div>

              {/* قائمة المنشورات بمقاسات موحدة وفلترة صارمة */}
              <div className="space-y-12">
                {posts.map(p => (
                  <div key={p.id} className="unified-card">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-black border-2 border-white shadow-sm">ر</div>
                        <div>
                          <p className="text-sm font-black text-gray-800 italic">رقة</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      
                      {/* النص المفلتر من أي روابط أو أسماء ملفات */}
                      {p.content && (
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-6 px-1">
                          {strictSanitize(p.content)}
                        </p>
                      )}

                      {/* الوسائط بمقاس موحد */}
                      {p.media_url && (
                        <div className="rounded-3xl overflow-hidden border border-pink-50">
                          {p.media_url.match(/\.(mp4|webm|mov|blomp)$/i) ? (
                            <video src={p.media_url} controls className="media-frame" />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" className="media-frame" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* أزرار التفاعل العرضية الموحدة */}
                    <div className="action-grid">
                      <button onClick={() => handleLike(p.id)} className={`action-item ${likes[p.id] ? 'active' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="action-item">💬 <span>رد</span></button>
                      <button className="action-item">🎀 <span>إهداء</span></button>
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

      {/* زر AI العائم */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce">✨</button>
    </div>
  );
};

export default Swing;
