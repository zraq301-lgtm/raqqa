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

  [cite_start]// دالة أمنية لمنع جلب الروابط الخارجية من قاعدة البيانات [cite: 10, 33]
  const sanitizeContent = (text) => {
    if (!text) return "";
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, "[محتوى محمي 🔒]"); 
  };

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
      catch (e) { console.log("Share failed"); }
    } else { alert("تم نسخ المحتوى لمشاركته 🎀"); }
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
        .top-nav-box {
          display: flex;
          overflow-x: auto;
          padding: 8px 10px;
          gap: 12px;
          background: #fff;
          border-bottom: 2px solid #FFE4ED;
          margin-top: -12px; /* رفع الشريط لأعلى */
        }
        .top-nav-box::-webkit-scrollbar { display: none; }
        .cat-card-elegant {
          min-width: 85px;
          height: 95px;
          background: #fff;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFD1E3;
          box-shadow: 0 2px 10px rgba(255, 182, 193, 0.1);
        }
        .cat-title-lg {
          font-size: 17px; /* تكبير الخط جداً */
          font-weight: 900;
          color: #D81B60;
          margin-top: 4px;
          line-height: 1;
        }
        .elegant-post {
          max-width: 500px;
          margin: 0 auto;
          background: #fff;
          border-radius: 32px;
          border: 1px solid #FFF0F5;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .media-unified-box {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          border-radius: 26px;
          background: #fdf2f8;
        }
        .interaction-row {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid #FFF5F7;
          background: #FFFBFC;
          border-radius: 0 0 32px 32px;
        }
        .btn-fem {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #A5A5A5;
          transition: 0.3s;
        }
        .btn-fem.active-heart { color: #E91E63; }
      `}</style>

      {/* شريط الأقسام المرفوع بتصميم الخط الكبير */}
      <nav className="sticky top-0 z-50 top-nav-box shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="cat-card-elegant active:scale-95 transition-transform">
            <span className="text-2xl">{c.icon}</span>
            <span className="cat-title-lg">{c.name}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-10">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر الأنيق */}
              <div className="elegant-post p-6 border-b-4 border-pink-100 mb-8">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-5 bg-[#FFFBFD] rounded-3xl text-sm outline-none border-none placeholder-pink-200 shadow-inner"
                  placeholder="ماذا يدور في خاطركِ يا رقة؟ ✍️" rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer text-xs font-bold text-pink-400 flex items-center gap-2">
                    🖼️ معرض الرقة <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-12 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-pink-100">نشر</button>
                </div>
              </div>

              [cite_start]{/* المنشورات مع تفعيل الفيديو والصور والروابط المحمية [cite: 33] */}
              <div className="space-y-12">
                {posts.map(p => (
                  <div key={p.id} className="elegant-post overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 bg-pink-100 rounded-full border-2 border-white flex items-center justify-center text-pink-500 font-black shadow-sm text-lg">ر</div>
                        <div>
                           <p className="text-sm font-black text-gray-800 italic">رقة</p>
                           <p className="text-[11px] text-gray-400 font-semibold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      
                      {p.content && (
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-6 px-1">
                          {sanitizeContent(p.content)}
                        </p>
                      )}

                      {p.media_url && (
                        <div className="rounded-3xl overflow-hidden border border-pink-50 shadow-inner">
                          {p.media_url.match(/\.(mp4|webm|mov|blomp)$/i) ? (
                            <video src={p.media_url} controls className="media-unified-box" />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" className="media-unified-box" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* الأزرار العرضية الأنيقة (تفاعل مفعل) */}
                    <div className="interaction-row">
                      <button onClick={() => handleLike(p.id)} className={`btn-fem ${likes[p.id] ? 'active-heart' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="btn-fem hover:text-pink-400">
                        💌 <span>رد</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="btn-fem hover:text-pink-400">
                        🎀 <span>إهداء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          
          [cite_start]{/* المسارات الفرعية من الصورة المرفقة [cite: 8, 9] */}
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
      <button 
        onClick={() => setIsChatOpen(true)} 
        className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce"
      >
        ✨
      </button>

      [cite_start]{/* نافذة الدردشة الذكية [cite: 38-44] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[78vh] rounded-[3.5rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center shadow-md font-bold">
              <span>دردشة رقة 🤖</span>
              <button onClick={() => setIsChatOpen(false)} className="text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/20">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-3xl text-sm max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-500 text-white rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-white border-t flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm outline-none shadow-inner" placeholder="اسألي رقة..." />
              <button onClick={handleChat} className="bg-pink-600 text-white px-8 rounded-2xl font-bold shadow-md">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
