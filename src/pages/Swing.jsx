import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات الفرعية بناءً على الملفات المرفوعة
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

  // الأقسام العشرة بناءً على الصورة مع تصغير الأيقونات
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

  const handleLike = (id) => {
    alert(`تم الإعجاب بالمنشور رقم ${id}`);
  };

  const handleShare = (p) => {
    if (navigator.share) {
      navigator.share({ title: 'رقة', text: p.content, url: window.location.href });
    } else {
      alert("تم نسخ رابط المنشور للمشاركة");
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
      
      <style>{`
        .scrolling-nav {
          display: flex;
          overflow-x: auto;
          white-space: nowrap;
          padding: 10px;
          gap: 15px;
          background: #fff;
          border-bottom: 1px solid #ffe4e6;
        }
        .scrolling-nav::-webkit-scrollbar { display: none; }
        .mini-card {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: #fff;
          padding: 8px;
          border-radius: 15px;
          min-width: 60px;
          border: 1px solid #fce7f3;
        }
        .mini-icon { font-size: 1.2rem; } /* تصغير الأيقونة للنصف */
        .mini-text { font-size: 9px; font-weight: bold; color: #db2777; margin-top: 2px; }
        .post-container { max-width: 500px; margin: 0 auto; }
        .fixed-media { width: 100%; height: 300px; object-fit: cover; border-radius: 20px; }
      `}</style>

      {/* الشريط العلوي المتحرك (بدون زجاج وبأيقونات صغيرة) */}
      <div className="sticky top-0 z-50 shadow-sm scrolling-nav">
          {categories.map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="mini-card shadow-sm">
              <span className="mini-icon">{c.icon}</span>
              <span className="mini-text">{c.name}</span>
            </Link>
          ))}
      </div>

      <main className="p-4 space-y-6 post-container">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر */}
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-pink-100">
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none border-none placeholder-pink-200"
                  placeholder="ماذا يدور في ذهنكِ يا رقة؟" rows="3"
                />
                <div className="flex justify-between items-center mt-3 px-1">
                  <label className="cursor-pointer text-[10px] font-bold text-pink-500">
                    📷 إضافة ميديا <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-8 py-2 rounded-full text-xs font-bold">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2rem] shadow-sm border border-pink-50 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs font-bold text-pink-600">ر</div>
                        <span className="text-xs font-bold text-gray-700">رقة</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{p.content}</p>
                      {p.media_url && (
                        <img src={p.media_url} alt="Content" className="fixed-media" />
                      )}
                    </div>
                    {/* تفعيل أزرار التفاعل */}
                    <div className="flex border-t border-gray-50 py-3">
                      <button onClick={() => handleLike(p.id)} className="flex-1 text-[11px] font-bold text-gray-400 hover:text-pink-500">❤️ إعجاب</button>
                      <button className="flex-1 text-[11px] font-bold text-gray-400 hover:text-pink-500">💬 دردشة</button>
                      <button onClick={() => handleShare(p)} className="flex-1 text-[11px] font-bold text-gray-400 hover:text-pink-500">🔗 مشاركة</button>
                    </div>
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

      {/* زر AI العائم */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-pink-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl z-50">✨</button>

      {/* نافذة AI */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm h-[70vh] rounded-[2rem] flex flex-col shadow-xl overflow-hidden">
            <div className="p-4 bg-pink-600 text-white flex justify-between items-center text-sm font-bold">
              <span>مستشارة رقة</span>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-pink-50/10">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 rounded-2xl text-[11px] max-w-[80%] ${m.role === 'user' ? 'bg-white shadow-sm' : 'bg-pink-500 text-white'}`}>{m.content}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border-t flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 rounded-xl px-4 text-[11px] outline-none" placeholder="اسألي رقة..." />
              <button onClick={handleChat} className="bg-pink-600 text-white px-5 py-2 rounded-xl text-[11px] font-bold">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
