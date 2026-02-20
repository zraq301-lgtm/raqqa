import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية [cite: 2, 3, 4]
import MotherhoodHaven from './Swing-page/MotherhoodHaven';
import LittleOnesAcademy from './Swing-page/LittleOnesAcademy';
import Wellness Oasis from './Swing-page/WellnessOasis';
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

  // الأقسام بناءً على الملفات المرفوعة [cite: 8, 9]
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const handleSavePost = async () => {
    if (!content) return alert("اكتبي شيئاً أولاً");
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);
      const response = await fetch(`${API_BASE}/save-post`, { 
        method: 'POST', 
        body: formData 
      });
      if (response.ok) {
        setContent('');
        setSelectedFile(null);
        fetchPosts();
      }
    } catch (e) {
      alert("فشل النشر");
    }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    const updatedHistoryWithUser = [...chatHistory, userMsg];
    setChatHistory(updatedHistoryWithUser);
    const tempInput = userInput;
    setUserInput('');

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${tempInput}` }
      };
      const res = await CapacitorHttp.post(options);
      const aiMsg = { 
        role: 'ai', 
        content: res.data.reply || res.data.message, 
        id: Date.now() + 1 
      };
      const finalHistory = [...updatedHistoryWithUser, aiMsg];
      setChatHistory(finalHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(finalHistory));
    } catch (e) {
      alert("خطأ في الاتصال بالذكاء الاصطناعي");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-right font-sans" dir="rtl">
      {/* تنسيق CSS للكروت الزجاجية والشريط المتحرك */}
      <style>{`
        .glass-container {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          min-width: 100px;
          height: 110px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 10px;
          transition: transform 0.3s ease;
        }
        .glass-card:hover { transform: translateY(-5px); }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-120px * 10)); }
        }
        .scrolling-wrapper {
          display: flex;
          width: calc(120px * 20);
          animation: scroll 30s linear infinite;
        }
        .scrolling-wrapper:hover { animation-play-state: paused; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* الشريط العلوي المتحرك بكروت زجاجية */}
      <div className="sticky top-0 z-50 glass-container py-4 overflow-hidden shadow-sm">
        <div className="scrolling-wrapper">
          {/* تكرار المصفوفة مرتين لضمان استمرار الحركة */}
          {[...categories, ...categories].map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="glass-card">
              <span className="text-3xl mb-1">{c.icon}</span>
              <span className="text-xs font-bold text-pink-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-xl mx-auto p-4 mt-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر بتصميم زجاجي */}
              <div className="glass-container p-6 rounded-[2.5rem] mb-8">
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-white/40 rounded-3xl text-sm outline-none border-none placeholder-pink-400 shadow-inner" 
                  placeholder="ماذا يدور في ذهنكِ يا رقة؟"
                  rows="3"
                />
                <div className="flex justify-between items-center mt-4 px-2">
                  <input 
                    type="file" 
                    id="file-input"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                  />
                  <label htmlFor="file-input" className="cursor-pointer text-xs font-bold text-pink-600 bg-white/50 px-4 py-2 rounded-full border border-white/40 shadow-sm">
                    📷 إضافة ميديا
                  </label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-pink-700 transition-all">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات بمقاسات موحدة */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-pink-50">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-500 border border-white">ر</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">رقة</p>
                          <span className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{p.content}</p>
                      {p.media_url && (
                        <div className="w-full h-72 rounded-3xl overflow-hidden bg-gray-50 border border-pink-50">
                          {p.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                            <video src={p.media_url} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={p.media_url} className="w-full h-full object-cover" alt="Post" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />

          {/* المسارات الفرعية [cite: 35, 36] */}
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

      {/* زر الدردشة العائم [cite: 37] */}
      <button 
        onClick={() => setIsChatOpen(true)} 
        className="fixed bottom-6 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce"
      >
        ✨
      </button>

      {/* نافذة الدردشة الذكية بتصميم زجاجي [cite: 38-44] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-pink-900/10 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-lg w-full max-w-md h-[80vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center shadow-md">
              <span className="font-bold">مستشارة رقة الذكية</span>
              <button onClick={() => setIsChatOpen(false)} className="text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/20 no-scrollbar">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-3xl text-xs max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-500 text-white rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white/80 border-t flex gap-2">
              <input 
                type="text" 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-gray-50 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-pink-300 shadow-inner" 
                placeholder="اسألي رقة..." 
              />
              <button onClick={handleChat} className="bg-pink-600 text-white px-6 rounded-2xl font-bold text-xs shadow-md transition-transform active:scale-95">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
