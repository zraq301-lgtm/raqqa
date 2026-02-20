import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات بناءً على ملفات المشروع [cite: 3, 4]
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
    const saved = localStorage.getItem('raqqa_chats'); [cite: 6]
    return saved ? JSON.parse(saved) : [];
  });
  const [userInput, setUserInput] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // مصفوفة الأقسام بأسماء عربية وتصحيح بنية الكود [cite: 8, 9]
  const categories = [
    { name: "الأمومة", path: "MotherhoodHaven", icon: "🌸" },
    { name: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "🧸" },
    { name: "واحة العافية", path: "WellnessOasis", icon: "🌿" },
    { name: "أيقونة الأناقة", path: "EleganceIcon", icon: "💄" },
    { name: "فن الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
    { name: "زوايا البيت", path: "HomeCorners", icon: "🏡" },
    { name: "مسارات التمكين", path: "EmpowermentPaths", icon: "🚀" },
    { name: "جسور المودة", path: "HarmonyBridges", icon: "🤝" },
    { name: "شغف وحرف", path: "PassionsCrafts", icon: "🎨" },
    { name: "ملتقى الأرواح", path: "SoulsLounge", icon: "✨" }
  ];

  useEffect(() => {
    fetchPosts(); [cite: 10]
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` }); [cite: 10]
      setPosts(res.data.posts || []); [cite: 11]
    } catch (e) {
      console.error("Fetch error", e);
    }
  };

  const handleSavePost = async () => {
    if (!content) return alert("اكتبي شيئاً أولاً"); [cite: 12]
    try {
      const formData = new FormData(); [cite: 13]
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'صورة' : 'نصي'); [cite: 14]
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData }); [cite: 15]
      if (res.ok) {
        setContent(''); setSelectedFile(null); fetchPosts(); [cite: 16]
      }
    } catch (e) { alert("فشل النشر"); }
  };

  const handleChat = async () => {
    if (!userInput) return; [cite: 18]
    const userMsg = { role: 'user', content: userInput, id: Date.now() }; [cite: 19]
    setChatHistory(prev => [...prev, userMsg]);
    const tempInput = userInput; setUserInput(''); [cite: 20]
    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: `أنا أنثى مسلمة... ${tempInput}` } [cite: 20]
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 }; [cite: 21, 22]
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH)); [cite: 23]
        return newH;
      });
    } catch (e) { alert("خطأ في الاتصال"); }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-right font-sans pb-20" dir="rtl">
      {/* تنسيق الأقسام الزجاجية والشريط المتحرك [cite: 25, 26] */}
      <style>{`
        .glass-nav {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          min-width: 110px;
          height: 100px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 10px;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-130px * 10)); }
        }
        .scrolling-content {
          display: flex;
          animation: scroll 25s linear infinite; [cite: 26]
        }
        .post-unified {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        .media-unified {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 20px;
        }
      `}</style>

      {/* الشريط العلوي المتحرك (Nearme Style) [cite: 26, 27] */}
      <div className="sticky top-0 z-50 glass-nav py-4 overflow-hidden">
        <div className="scrolling-content">
          {[...categories, ...categories].map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="glass-card shadow-sm hover:scale-105 transition-transform">
              <span className="text-3xl mb-1">{c.icon}</span>
              <span className="text-[11px] font-bold text-pink-600">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر [cite: 28, 29] */}
              <div className="post-unified bg-white/70 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-white/50 rounded-3xl text-sm outline-none border-none placeholder-pink-300 shadow-inner"
                  placeholder="ماذا يدور في ذهنكِ يا رقة؟" rows="3" [cite: 29, 30]
                />
                <div className="flex justify-between items-center mt-4 px-2">
                  <label className="cursor-pointer text-xs font-bold text-pink-500 bg-white/80 px-4 py-2 rounded-full border border-pink-100 shadow-sm">
                    📷 إضافة ميديا <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /> [cite: 31]
                  </label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2 rounded-full text-sm font-bold shadow-lg shadow-pink-200">نشر</button> [cite: 31]
                </div>
              </div>

              {/* قائمة المنشورات [cite: 32, 33] */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="post-unified bg-white rounded-[2.5rem] shadow-sm border border-pink-50 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full border-2 border-white flex items-center justify-center font-bold text-pink-500 shadow-sm">ر</div>
                        <div>
                          <p className="text-sm font-extrabold text-gray-800">رقة</p>
                          <p className="text-[10px] text-gray-400 font-medium">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p> [cite: 34]
                        </div>
                      </div>
                      <p className="text-[15px] text-gray-700 leading-relaxed mb-4 px-1">{p.content}</p> [cite: 33]
                      {p.media_url && (
                        <div className="rounded-3xl overflow-hidden bg-gray-50 border border-pink-50 shadow-inner">
                           {p.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                            <video src={p.media_url} controls className="media-unified" />
                           ) : (
                            <img src={p.media_url} alt="رقة" className="media-unified" /> [cite: 33]
                           )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />

          {/* المسارات الفرعية  */}
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

      {/* زر الدردشة الذكية [cite: 37] */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce">✨</button>

      {/* نافذة الدردشة الزجاجية [cite: 38, 39] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-lg w-full max-w-md h-[80vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center shadow-md">
              <span className="font-bold tracking-wide">🤖 مستشارة رقة الذكية</span> [cite: 38]
              <button onClick={() => setIsChatOpen(false)} className="text-xl bg-white/20 p-2 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/20 no-scrollbar">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}> [cite: 39, 40]
                  <div className={`p-4 rounded-3xl text-xs max-w-[85%] shadow-sm ${m.role === 'user' ? [cite_start]'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-600 text-white rounded-tl-none'}`}> [cite: 41]
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-white border-t flex gap-2">
              <input 
                type="text" value={userInput} onChange={e => setUserInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-gray-50 p-4 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-pink-200 shadow-inner" [cite: 42, 43, 44]
                placeholder="اسألي رقة..." 
              />
              <button onClick={handleChat} className="bg-pink-600 text-white px-8 rounded-2xl text-xs font-bold shadow-md">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
