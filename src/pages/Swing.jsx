import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات
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

  const categories = [
    { ar: "الأمومة", path: "MotherhoodHaven", icon: "🌸" },
    { ar: "الصغار", path: "LittleOnesAcademy", icon: "🧸" },
    { ar: "العافية", path: "WellnessOasis", icon: "🌿" },
    { ar: "الأناقة", path: "EleganceIcon", icon: "💄" },
    { ar: "الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
    { ar: "البيت", path: "HomeCorners", icon: "🏡" },
    { ar: "التمكين", path: "EmpowermentPaths", icon: "🚀" },
    { ar: "المودة", path: "HarmonyBridges", icon: "🤝" },
    { ar: "الحرف", path: "PassionsCrafts", icon: "🎨" },
    { ar: "الملتقى", path: "SoulsLounge", icon: "✨" }
  ];

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleSavePost = async () => {
    if (!content) return alert("اكتبي شيئاً أولاً");
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (res.ok) { setContent(''); setSelectedFile(null); fetchPosts(); }
    } catch (e) { alert("فشل النشر"); }
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
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now()+1 };
      setChatHistory(prev => {
        const h = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(h));
        return h;
      });
    } catch (e) { alert("خطأ في AI"); }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-right font-sans pb-24" dir="rtl">
      {/* CSS مخصص للتأثيرات الزجاجية وتوحيد المقاسات */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .post-card {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        .media-container {
          width: 100%;
          height: 300px;
          overflow: hidden;
          border-radius: 20px;
        }
        .media-container img, .media-container video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* شريط الأقسام العلوي - كروت زجاجية صغيرة */}
      <header className="sticky top-0 z-50 p-4 overflow-x-auto no-scrollbar flex gap-3 bg-[#FFF0F3]/80 backdrop-blur-md">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="glass-card min-w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center shrink-0 transition-transform active:scale-90">
            <span className="text-2xl">{c.icon}</span>
            <span className="text-[10px] font-bold text-pink-700 mt-1">{c.ar}</span>
          </Link>
        ))}
      </header>

      <main className="p-4 space-y-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر */}
              <div className="post-card bg-white/60 p-5 rounded-[2.5rem] shadow-sm border border-white">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-white/40 rounded-3xl text-sm outline-none border-none placeholder-pink-300"
                  placeholder="اكتبي لمجتمع رقة..." rows="3"
                />
                <div className="flex justify-between items-center mt-3">
                   <label className="text-xs text-pink-500 font-bold cursor-pointer px-4">📷 <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
                   <button onClick={handleSavePost} className="bg-pink-500 text-white px-8 py-2 rounded-full text-sm font-bold shadow-lg shadow-pink-200">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات بمقاسات موحدة */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="post-card bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-pink-50">
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full border-2 border-white overflow-hidden">
                          <img src="https://ui-avatars.com/api/?name=Raqqa&background=fbcfe8&color=db2777" alt="رقة" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">رقة</p>
                          <p className="text-[9px] text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 px-1">{p.content}</p>
                      
                      {p.media_url && (
                        <div className="media-container bg-gray-50">
                          {p.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                            <video src={p.media_url} controls />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* أزرار التفاعل */}
                    <div className="flex justify-around py-4 bg-gray-50/50 border-t border-gray-50">
                      <button className="flex items-center gap-1 text-gray-400 hover:text-pink-500 transition-colors">❤️ <span className="text-[10px]">إعجاب</span></button>
                      <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-1 text-gray-400 hover:text-pink-500">💬 <span className="text-[10px]">دردشة</span></button>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-pink-500">🔗 <span className="text-[10px]">مشاركة</span></button>
                    </div>

                    {/* نظام الدردشة الجماعية */}
                    {activeComments === p.id && (
                      <div className="p-4 bg-pink-50/20 border-t border-pink-50 animate-fadeIn">
                        <div className="h-32 overflow-y-auto mb-3 space-y-2 no-scrollbar">
                           <div className="bg-white p-2 rounded-xl rounded-tr-none text-[10px] shadow-sm border border-pink-50">أهلاً بكن في نقاش رقة الجماعي! 🌸</div>
                        </div>
                        <div className="flex gap-2">
                           <input type="text" placeholder="اكتبي رداً..." className="flex-1 bg-white rounded-xl px-4 py-2 text-xs outline-none" />
                           <button className="bg-pink-400 text-white px-4 rounded-xl text-xs">إرسال</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />
          
          {/* الصفحات الداخلية */}
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
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-white text-pink-500 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 border-2 border-pink-100 animate-bounce">✨</button>

      {/* نافذة AI رقة */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-5 bg-pink-500 text-white flex justify-between items-center font-bold">
                <span>مستشارة رقة</span>
                <button onClick={() => setIsChatOpen(false)}>✕</button>
             </div>
             <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/10">
                {chatHistory.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-3 rounded-2xl text-xs max-w-[80%] shadow-sm ${m.role === 'user' ? 'bg-white' : 'bg-pink-500 text-white'}`}>{m.content}</div>
                  </div>
                ))}
             </div>
             <div className="p-4 bg-white border-t flex gap-2">
                <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 rounded-xl px-4 text-xs outline-none" placeholder="اسألي رقة..." />
                <button onClick={handleChat} className="bg-pink-500 text-white px-6 py-2 rounded-xl text-xs">إرسال</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
