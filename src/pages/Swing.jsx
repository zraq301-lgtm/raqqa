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
  const [activeComments, setActiveComments] = useState(null);

  // الأقسام بالعربي مع الأيقونات
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
      formData.append('type', selectedFile ? 'مرفق' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (res.ok) {
        setContent(''); setSelectedFile(null); fetchPosts();
      }
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
    <div className="min-h-screen bg-[#FFF5F7] text-right font-sans pb-20 overflow-x-hidden" dir="rtl">
      
      {/* CSS مخصص للشريط المتحرك والكروت الزجاجية */}
      <style>{`
        .glass-nav-container {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 15px 0;
          overflow: hidden;
        }
        .glass-card-item {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          min-width: 100px;
          height: 100px;
          border-radius: 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 10px;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-120px * 10)); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .unified-media {
          width: 100%;
          height: 300px;
          object-fit: cover;
          border-radius: 20px;
          background: #fdf2f8;
        }
      `}</style>

      {/* الشريط العلوي المتحرك (كروت زجاجية) */}
      <div className="glass-nav-container">
        <div className="marquee-track">
          {[...categories, ...categories].map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="glass-card-item">
              <span className="text-3xl mb-1">{c.icon}</span>
              <span className="text-[10px] font-bold text-pink-600 tracking-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-xl mx-auto p-4 space-y-8 mt-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر بتصميم زجاجي */}
              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2.5rem] shadow-sm border border-white post-unified">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-white/50 rounded-3xl text-sm outline-none border-none placeholder-pink-300 shadow-inner"
                  placeholder="شاركينا برقتكِ اليوم..." rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer text-[11px] font-bold text-pink-500 bg-white/80 px-4 py-2 rounded-full border border-pink-50 shadow-sm hover:bg-white transition-all">
                    📷 ميديا <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2 rounded-full text-sm font-bold shadow-lg shadow-pink-100 hover:scale-105 transition-transform">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات الموحدة */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-pink-50 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-pink-400 to-rose-300 rounded-full flex items-center justify-center font-bold text-white shadow-sm">ر</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">رقة</p>
                          <p className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <p className="text-[14px] text-gray-700 leading-relaxed mb-4 px-1">{p.content}</p>
                      
                      {p.media_url && (
                        <div className="rounded-2xl overflow-hidden border border-pink-50 shadow-inner">
                          {p.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                            <video src={p.media_url} controls className="unified-media" />
                          ) : (
                            <img src={p.media_url} alt="رقة" className="unified-media" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* أزرار التفاعل */}
                    <div className="flex justify-around py-4 bg-gray-50/30 border-t border-gray-50">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-all scale-105">❤️ <span className="text-[11px] font-bold">إعجاب</span></button>
                      <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-2 text-gray-400 hover:text-pink-500 scale-105">💬 <span className="text-[11px] font-bold">دردشة</span></button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 scale-105">🔗 <span className="text-[11px] font-bold">مشاركة</span></button>
                    </div>

                    {/* دردشة جماعية بسيطة */}
                    {activeComments === p.id && (
                      <div className="p-5 bg-white border-t border-pink-50 animate-fadeIn">
                        <div className="h-32 overflow-y-auto mb-3 space-y-2 p-1">
                          <div className="bg-pink-50/50 p-2 rounded-xl rounded-tr-none text-[10px] shadow-sm text-pink-600">أهلاً بكن في نقاش رقة! 🌸</div>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="اكتبي رداً..." className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-xs outline-none" />
                          <button className="bg-pink-500 text-white px-4 rounded-xl text-xs">إرسال</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />

          {/* المسارات الفرعية */}
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
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 transition-transform active:scale-90 animate-bounce">✨</button>

      {/* نافذة AI زجاجية */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-lg w-full max-w-md h-[80vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center">
              <span className="font-bold">🤖 مستشارة رقة الذكية</span>
              <button onClick={() => setIsChatOpen(false)} className="text-xl p-2">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/20">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-3xl text-xs max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-600 text-white rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input 
                type="text" value={userInput} onChange={e => setUserInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-gray-50 p-3 rounded-2xl text-xs outline-none"
                placeholder="اسألي رقة..." 
              />
              <button onClick={handleChat} className="bg-pink-600 text-white px-6 rounded-2xl font-bold text-xs">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
