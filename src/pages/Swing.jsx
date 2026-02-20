import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية - تأكدي من وجود هذه الملفات في مجلد Swing-page [cite: 1, 2, 3, 4]
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

const API_BASE = "https://raqqa-v6cd.vercel.app/api"; // [cite: 4]

const Swing = () => {
  const [posts, setPosts] = useState([]); // [cite: 5]
  const [isChatOpen, setIsChatOpen] = useState(false); // [cite: 5]
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('raqqa_chats');
    return saved ? JSON.parse(saved) : [];
  }); // [cite: 6]
  const [userInput, setUserInput] = useState(''); // [cite: 7]
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [likes, setLikes] = useState({});

  // الأقسام العشرة مع الأيقونات وتكبير الخط [cite: 8, 9]
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

  // منع جلب الروابط الخارجية من قاعدة البيانات
  const sanitizeContent = (text) => {
    if (!text) return "";
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, "[محتوى محمي 🔒]"); 
  };

  useEffect(() => {
    fetchPosts();
  }, []); // [cite: 9]

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` }); // [cite: 10]
      setPosts(res.data.posts || []); // [cite: 11]
    } catch (e) {
      console.error("Fetch error", e); // [cite: 11]
    }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleShare = async (p) => {
    if (navigator.share) {
      try { await navigator.share({ title: 'رقة', text: p.content, url: window.location.href }); } 
      catch (e) { console.log("Share failed"); }
    } else { alert("تم نسخ المحتوى 🎀"); }
  };

  const handleSavePost = async () => {
    if (!content && !selectedFile) return alert("اكتبي شيئاً أولاً"); // [cite: 12]
    try {
      const formData = new FormData(); // [cite: 13]
      formData.append('content', content); // [cite: 13]
      formData.append('section', 'الرئيسية'); // [cite: 13]
      formData.append('type', selectedFile ? 'مرفق' : 'نصي'); // [cite: 14]
      if (selectedFile) formData.append('file', selectedFile); // [cite: 14]
      const response = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData }); // [cite: 15]
      if (response.ok) { setContent(''); setSelectedFile(null); fetchPosts(); } // [cite: 16]
    } catch (e) { alert("فشل النشر"); } // [cite: 17]
  };

  const handleChat = async () => {
    if (!userInput) return; // [cite: 18]
    const userMsg = { role: 'user', content: userInput, id: Date.now() }; // [cite: 19]
    const updatedHistory = [...chatHistory, userMsg]; // [cite: 19]
    setChatHistory(updatedHistory);
    const tempInput = userInput; // [cite: 20]
    setUserInput(''); // [cite: 20]
    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: `أنا أنثى مسلمة... ${tempInput}` }
      }); // [cite: 20, 21]
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 }; // [cite: 21, 22]
      const finalHistory = [...updatedHistory, aiMsg]; // [cite: 23]
      setChatHistory(finalHistory); // [cite: 23]
      localStorage.setItem('raqqa_chats', JSON.stringify(finalHistory)); // [cite: 23]
    } catch (e) { alert("خطأ في الاتصال"); } // [cite: 24]
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-20" dir="rtl">
      <style>{`
        .top-nav-wrapper {
          display: flex;
          overflow-x: auto;
          padding: 10px;
          gap: 12px;
          background: #fff;
          border-bottom: 2px solid #FFE4ED;
          margin-top: -10px;
        }
        .top-nav-wrapper::-webkit-scrollbar { display: none; }
        .category-card {
          min-width: 80px;
          height: 90px;
          background: #fff;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FFD1E3;
          box-shadow: 0 2px 8px rgba(255,182,193,0.1);
        }
        .cat-name-lg {
          font-size: 16px; /* خط كبير جداً */
          font-weight: 900;
          color: #D81B60;
          margin-top: 4px;
        }
        .post-card-elegant {
          max-width: 500px;
          margin: 0 auto;
          background: #fff;
          border-radius: 28px;
          border: 1px solid #FFF0F5;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }
        .interaction-bar {
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          background: #FFFBFC;
          border-top: 1px solid #FFF5F7;
          border-radius: 0 0 28px 28px;
        }
        .action-btn-fem {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #A0A0A0;
        }
        .action-btn-fem.liked { color: #E91E63; }
        .media-container { width: 100%; max-height: 400px; object-fit: cover; border-radius: 22px; }
      `}</style>

      {/* شريط الأقسام [cite: 26, 27, 28] */}
      <nav className="sticky top-0 z-50 top-nav-wrapper shadow-sm">
        {categories.map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="category-card active:scale-95 transition-transform">
            <span className="text-xl">{c.icon}</span>
            <span className="cat-name-lg">{c.name}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4 space-y-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر [cite: 29, 30, 31, 32] */}
              <div className="post-card-elegant p-6 border-b-4 border-pink-100 mb-6">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-[#FFFBFD] rounded-2xl text-sm outline-none border-none placeholder-pink-200 shadow-inner"
                  placeholder="انثري كلماتكِ الرقيقة هنا... ✍️" rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer text-xs font-bold text-pink-400 flex items-center gap-2">
                    🖼️ إضافة وسائط <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2 rounded-full text-xs font-bold shadow-lg">نشر</button>
                </div>
              </div>

              {/* المنشورات [cite: 33, 34] */}
              <div className="space-y-10">
                {posts.map(p => (
                  <div key={p.id} className="post-card-elegant overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold shadow-sm">ر</div>
                        <span className="text-sm font-black text-gray-700 italic">رقة</span>
                      </div>
                      <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
                        {sanitizeContent(p.content)}
                      </p>
                      {p.media_url && (
                        <div className="rounded-2xl overflow-hidden border border-pink-50 shadow-inner">
                          {p.media_url.match(/\.(mp4|webm|mov|blomp)$/i) ? (
                            <video src={p.media_url} controls className="media-container" />
                          ) : (
                            <img src={p.media_url} alt="محتوى رقة" className="media-container" />
                          )}
                        </div>
                      )}
                    </div>
                    {/* أزرار التفاعل العرضية الأنيقة */}
                    <div className="interaction-bar">
                      <button onClick={() => handleLike(p.id)} className={`action-btn-fem ${likes[p.id] ? 'liked' : ''}`}>
                        {likes[p.id] ? '💖' : '🤍'} <span>حب</span>
                      </button>
                      <button className="action-btn-fem hover:text-pink-400">
                        💬 <span>رد</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="action-btn-fem hover:text-pink-400">
                        🔗 <span>إهداء</span>
                      </button>
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

      {/* زر AI عائم [cite: 37] */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce">✨</button>

      {/* نافذة AI [cite: 38, 39, 40, 41, 42, 43, 44] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[75vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center shadow-md font-bold">
              <span>دردشة رقة 🤖</span>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
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
            <div className="p-4 bg-white border-t flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm outline-none" placeholder="اسألي رقة..." />
              <button onClick={handleChat} className="bg-pink-600 text-white px-8 rounded-2xl font-bold">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
