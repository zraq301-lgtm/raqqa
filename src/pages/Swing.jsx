import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HttpClient from '../utils/http';

// استيراد الصفحات الفرعية (نفس الأسماء المطلوبة)
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
  // --- States (المنطق البرمجي الأصلي) ---
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('raqqa_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [userInput, setUserInput] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState(null); // لإدارة شات التعليقات

  const categories = [
    { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🌸" },
    { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "👶" },
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

  // --- Functions (منطق جلب وحفظ البيانات) ---
  const fetchPosts = async () => {
    try {
      const res = await HttpClient.get({ url: `${API_BASE}/get-posts` });
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
      
      const response = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (response.ok) { setContent(''); setSelectedFile(null); fetchPosts(); }
    } catch (e) { alert("فشل النشر"); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setUserInput('');

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${userInput}` }
      };
      const res = await HttpClient.post(options);
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      const finalHistory = [...updatedHistory, aiMsg];
      setChatHistory(finalHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(finalHistory));
    } catch (e) { alert("خطأ في الذكاء الاصطناعي"); }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-right font-sans pb-20" dir="rtl">
      {/* CSS Styles Customization */}
      <style>{`
        @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-150%); } }
        .nav-scroll { display: flex; animation: scroll 30s linear infinite; }
        .nav-scroll:hover { animation-play-state: paused; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #F472B6; border-radius: 10px; }
      `}</style>

      {/* شريط الأيقونات العلوي المتحرك */}
      <div className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 py-3 overflow-hidden shadow-sm">
        <div className="nav-scroll whitespace-nowrap flex items-center">
          {categories.concat(categories).map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="flex flex-col items-center mx-5 group transition-transform hover:scale-110">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-xl shadow-inner group-hover:bg-pink-500 group-hover:shadow-lg transition-all">
                {c.icon}
              </div>
              <span className="text-[10px] mt-1 font-bold text-pink-700">{c.ar}</span>
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 mt-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر المطور */}
              <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-100/50 mb-8 border border-white">
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-pink-50/30 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-200 resize-none" 
                  placeholder="ماذا يدور في ذهنكِ اليوم؟ ✨"
                  rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer bg-gray-50 px-4 py-2 rounded-full text-xs text-gray-500 hover:bg-pink-50 transition-colors">
                    <span>📷 إضافة صورة</span>
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
                  </label>
                  <button onClick={handleSavePost} className="bg-gradient-to-l from-pink-500 to-rose-400 text-white px-10 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-pink-200 transition-all active:scale-95">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات (كروت أنيقة) */}
              <div className="space-y-8">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-pink-50 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-pink-400 to-orange-300 rounded-full border-2 border-white shadow-sm" />
                        <span className="text-xs font-bold text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed mb-4">{p.content}</p>
                      {p.media_url && (
                        <img src={p.media_url} className="rounded-3xl w-full h-72 object-cover border border-gray-50" alt="Post" />
                      )}
                    </div>
                    
                    {/* أزرار التفاعل الجديدة */}
                    <div className="flex items-center justify-around p-3 border-t border-gray-50 bg-gray-50/50">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors">
                        <span className="text-lg">❤️</span> <span className="text-xs">إعجاب</span>
                      </button>
                      <button 
                        onClick={() => setActiveCommentId(activeCommentId === p.id ? null : p.id)}
                        className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors"
                      >
                        <span className="text-lg">💬</span> <span className="text-xs">دردشة التعليقات</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors">
                        <span className="text-lg">🔗</span> <span className="text-xs">مشاركة</span>
                      </button>
                    </div>

                    {/* نظام التعليقات (شات داخلي) */}
                    {activeCommentId === p.id && (
                      <div className="p-4 bg-white border-t border-pink-50 animate-fadeIn">
                        <div className="h-40 overflow-y-auto mb-3 p-2 bg-pink-50/20 rounded-xl space-y-2 text-xs">
                          <div className="bg-white p-2 rounded-lg inline-block shadow-sm">أهلاً بكن في نقاش هذا الموضوع! 👋</div>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="اكتبي تعليقك..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs outline-none" />
                          <button className="bg-pink-500 text-white p-2 rounded-full text-xs">إرسال</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />

          {/* المسارات الأخرى */}
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

      {/* زر ذكاء رقة الاصطناعي Floating Button */}
      <button 
        onClick={() => setIsChatOpen(true)} 
        className="fixed bottom-6 left-6 bg-pink-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 hover:rotate-12 transition-transform active:scale-90"
      >
        ✨
      </button>

      {/* نافذة الدردشة (الذكاء الاصطناعي) */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-pink-900/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[85vh] rounded-[3rem] flex flex-col shadow-2xl border-4 border-white overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-pink-600 to-rose-500 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤖</div>
                <span className="font-bold">مستشارتكِ رقة</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/30">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-3xl text-sm shadow-sm max-w-[85%] ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-500 text-white rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 bg-white border-t flex gap-2">
              <input 
                value={userInput} 
                onChange={e => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="اسألي رقة عن أي شيء..."
                className="flex-1 bg-gray-50 border-none p-4 rounded-2xl text-sm focus:ring-2 focus:ring-pink-200 transition-all"
              />
              <button onClick={handleChat} className="bg-pink-600 text-white px-6 rounded-2xl font-bold shadow-md shadow-pink-100">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
