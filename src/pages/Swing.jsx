import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات بناءً على أسماء الملفات في الصورة المرفوعة
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

  // تحديث الأقسام: حذف كلمة ar، استخدام الأسماء العربية، والأيقونات
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
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    const temp = userInput; 
    setUserInput('');
    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: `أنا أنثى مسلمة... ${temp}` }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now()+1 };
      const finalH = [...updatedHistory, aiMsg];
      setChatHistory(finalH);
      localStorage.setItem('raqqa_chats', JSON.stringify(finalH));
    } catch (e) { 
      alert("خطأ في الذكاء الاصطناعي"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F3] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .glass-icon-card {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 15px rgba(244, 114, 182, 0.1);
        }
        .unified-post-card {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
        }
        .media-box {
          width: 100%;
          height: 320px;
          border-radius: 24px;
          overflow: hidden;
          background: #fdf2f8;
        }
        .media-box img, .media-box video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* الشريط العلوي المتحرك بالأيقونات الزجاجية والأسماء العربية */}
      <header className="sticky top-0 z-50 p-4 overflow-x-auto no-scrollbar flex gap-4 bg-[#FFF0F3]/90 backdrop-blur-md border-b border-pink-100">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="glass-icon-card min-w-[90px] h-[95px] rounded-[2rem] flex flex-col items-center justify-center shrink-0 transition-all active:scale-90 hover:bg-white/60">
            <span className="text-3xl mb-1">{c.icon}</span>
            <span className="text-[10px] font-bold text-pink-700 tracking-tighter">{c.name}</span>
          </Link>
        ))}
      </header>

      <main className="p-4 space-y-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر */}
              <div className="unified-post-card bg-white/70 p-6 rounded-[2.5rem] shadow-sm border border-white">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-white/50 rounded-3xl text-sm outline-none border-none placeholder-pink-300 resize-none shadow-inner"
                  placeholder="ماذا يدور في ذهنكِ يا رقة؟" rows="3"
                />
                <div className="flex justify-between items-center mt-4 px-2">
                   <label className="text-xs text-pink-500 font-bold cursor-pointer bg-pink-50/50 px-4 py-2 rounded-full hover:bg-pink-100 transition-colors">
                     📷 إضافة محتوى <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                   </label>
                   <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-pink-200 hover:bg-pink-700">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات بمقاسات موحدة وتصميم أنيق */}
              <div className="space-y-8">
                {posts.map(p => (
                  <div key={p.id} className="unified-post-card bg-white rounded-[3rem] shadow-sm overflow-hidden border border-pink-50/50">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 bg-gradient-to-tr from-pink-400 to-rose-300 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs">ر</div>
                        <div>
                          <p className="text-sm font-extrabold text-gray-800">رقة</p>
                          <p className="text-[10px] text-gray-400 font-medium">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <p className="text-[15px] text-gray-700 mb-5 leading-relaxed px-1">{p.content}</p>
                      
                      {/* معالجة عرض المحتوى ومنع عرض الروابط النصية الخام */}
                      {p.media_url && (
                        <div className="media-box shadow-inner">
                          {p.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                            <video src={p.media_url} controls className="bg-black" />
                          ) : (
                            <img src={p.media_url} alt="محتوى مجتمع رقة" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* أزرار التفاعل - نظام الدردشة الجماعية */}
                    <div className="flex justify-around py-5 bg-pink-50/20 border-t border-pink-50/50">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-all scale-110">❤️ <span className="text-[11px] font-bold">إعجاب</span></button>
                      <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-2 text-gray-400 hover:text-pink-500 scale-110">💬 <span className="text-[11px] font-bold">دردشة</span></button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 scale-110">🔗 <span className="text-[11px] font-bold">مشاركة</span></button>
                    </div>

                    {/* نظام الدردشة الجماعية داخل الكارت */}
                    {activeComments === p.id && (
                      <div className="p-5 bg-white border-t border-pink-50 animate-slideDown">
                        <div className="h-44 overflow-y-auto mb-4 space-y-3 no-scrollbar p-1">
                           <div className="bg-pink-50/50 p-3 rounded-2xl rounded-tr-none text-[11px] text-pink-700 shadow-sm border border-pink-100/50">مرحباً بكن في ركن النقاش الخاص برقة! يمكنكن الرد هنا.. 🌸</div>
                        </div>
                        <div className="flex gap-3">
                           <input type="text" placeholder="اكتبي رداً للمجموعة..." className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-pink-200 transition-all shadow-inner" />
                           <button className="bg-pink-500 text-white px-6 rounded-2xl text-xs font-bold shadow-md hover:bg-pink-600">إرسال</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />
          
          {/* استدعاء الصفحات الفرعية بنفس الأسماء الموضحة في الصورة */}
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

      {/* زر رقة الذكي العائم */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-600 text-white w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(219,39,119,0.4)] flex items-center justify-center text-3xl z-50 transition-transform active:scale-90 animate-pulse">✨</button>

      {/* نافذة مستشارة رقة الذكية */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[85vh] rounded-[3.5rem] flex flex-col shadow-2xl overflow-hidden border-[6px] border-white">
             <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-500 text-white flex justify-between items-center shadow-md">
                <span className="font-bold text-lg flex items-center gap-2">🤖 مستشارة رقة</span>
                <button onClick={() => setIsChatOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40">✕</button>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-pink-50/30 no-scrollbar">
                {chatHistory.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-4 rounded-[1.5rem] text-[13px] max-w-[85%] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-white text-gray-700 rounded-tr-none' : 'bg-pink-500 text-white rounded-tl-none'}`}>{m.content}</div>
                  </div>
                ))}
             </div>
             <div className="p-5 bg-white border-t flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-pink-100 shadow-inner" placeholder="اسألي رقة عن أي شيء..." />
                <button onClick={handleChat} className="bg-pink-600 text-white px-7 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all">إرسال</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
