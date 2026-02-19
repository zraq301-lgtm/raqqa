import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات بنفس الأسماء المطلوبة
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

  // تم تصحيح مصفوفة الأقسام وإغلاقها بشكل سليم لمنع خطأ Build 
  const categories = [
    { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🌸" },
    { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "🧸" },
    { ar: "واحة العافية", path: "WellnessOasis", icon: "🌿" },
    { ar: "أيقونة الأناقة", path: "EleganceIcon", icon: "💄" },
    { ar: "فن الطهي", path: "CulinaryArts", icon: "👩‍🍳" },
    { ar: "زوايا البيت", path: "HomeCorners", icon: "🏡" },
    { ar: "مسارات التمكين", path: "EmpowermentPaths", icon: "🚀" },
    { ar: "جسور المودة", path: "HarmonyBridges", icon: "🤝" },
    { ar: "شغف وحرف", path: "PassionsCrafts", icon: "🎨" },
    { ar: "ملتقى الأرواح", path: "SoulsLounge", icon: "✨" }
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

  // معالجة عرض المحتوى (فيديو أو صورة) بناءً على نوع الملف [cite: 33]
  const renderMedia = (p) => {
    if (!p.media_url) return null;
    const isVideo = p.media_url.match(/\.(mp4|webm|mov)$/i) || p.type === 'فيديو';
    if (isVideo) {
      return <video src={p.media_url} controls className="rounded-3xl w-full h-auto mb-4" />;
    }
    return <img src={p.media_url} className="rounded-3xl w-full max-h-96 object-cover mb-4 shadow-sm" alt="Post" />;
  };

  return (
    <div className="min-h-screen bg-[#FDF8FA] text-right font-sans pb-20" dir="rtl">
      
      {/* 1. شريط التنقل العلوي - تصميم Nearme */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 cursor-pointer">🔔</div>
          <div className="w-10 h-10 rounded-full border-2 border-pink-300 overflow-hidden cursor-pointer">
            <img src="https://ui-avatars.com/api/?name=Raqqa&background=f472b6&color=fff" alt="Profile" />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto mx-4 no-scrollbar">
          <div className="flex gap-6 items-center">
            {categories.map((c, i) => (
              <Link key={i} to={`/Swing/${c.path}`} className="flex flex-col items-center min-w-[45px] transition-transform hover:scale-110">
                <span className="text-xl">{c.icon}</span>
                <span className="text-[9px] font-bold text-gray-400 mt-1">{c.ar}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="text-pink-500 text-xl cursor-pointer">🔍</div>
      </header>

      <main className="max-w-xl mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* 2. القسم الترحيبي (Hero Section) */}
              <div className="bg-gradient-to-br from-pink-500 via-rose-400 to-purple-400 rounded-[2.5rem] p-7 mb-8 text-white shadow-xl shadow-pink-100">
                <h2 className="text-2xl font-bold mb-2">أهلاً بكِ في رقة ✨</h2>
                <p className="text-sm opacity-90 leading-relaxed">اكتشفي عالماً صُمم خصيصاً ليناسب رقتكِ وإبداعكِ.</p>
              </div>

              {/* 3. صندوق النشر (Card Style) */}
              <div className="bg-white p-6 rounded-[2.2rem] shadow-sm mb-8 border border-pink-50">
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-pink-200 border-none resize-none" 
                  placeholder="ما الذي تودين مشاركته اليوم؟" 
                  rows="3"
                />
                <div className="flex justify-between items-center mt-5">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" id="post-media" />
                  <label htmlFor="post-media" className="text-xs text-pink-600 font-bold cursor-pointer bg-pink-50 px-5 py-2.5 rounded-full hover:bg-pink-100 transition-all">📷 إضافة صورة/فيديو</label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all">نشر</button>
                </div>
              </div>

              {/* 4. عرض المواضيع (Discussion Cards) */}
              <div className="space-y-8">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-gradient-to-tr from-pink-200 to-rose-100 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">عضوة في مجتمع رقة</p>
                          <span className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-5 px-1">{p.content}</p>
                      {renderMedia(p)}
                    </div>
                    
                    {/* أزرار التفاعل (إعجاب، مشاركة، دردشة) */}
                    <div className="flex items-center justify-around py-4 border-t border-gray-50 bg-gray-50/40">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-all">
                        <span className="text-lg">❤️</span> <span className="text-xs font-bold">إعجاب</span>
                      </button>
                      <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-all">
                        <span className="text-lg">💬</span> <span className="text-xs font-bold">دردشة</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-all">
                        <span className="text-lg">🔗</span> <span className="text-xs font-bold">مشاركة</span>
                      </button>
                    </div>

                    {/* 5. الدردشة الجماعية (داخل الكرت) */}
                    {activeComments === p.id && (
                      <div className="p-5 bg-pink-50/30 border-t border-pink-50 animate-fadeIn">
                        <div className="h-40 overflow-y-auto mb-4 space-y-3 px-2 no-scrollbar">
                          <div className="flex flex-col items-start">
                            <div className="bg-white p-3 rounded-2xl rounded-tr-none shadow-sm text-[11px] border border-pink-50">شاركينا رأيكِ في هذا الموضوع.. ✨</div>
                            <button className="text-[9px] text-pink-400 mt-1 mr-2">رد على التعليق</button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="اكتبي رسالة للمجموعة..." className="flex-1 bg-white rounded-2xl px-4 py-2.5 text-xs outline-none shadow-sm focus:ring-1 focus:ring-pink-200" />
                          <button className="bg-pink-500 text-white px-5 rounded-2xl text-xs font-bold shadow-sm">إرسال</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />

          {/* المسارات الفرعية - نفس الأسماء الأصلية [cite: 35-36] */}
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

      {/* زر FAB للإضافة السريعة */}
      <button className="fixed bottom-24 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-95 transition-transform">+</button>

      {/* زر ذكاء رقة (AI) [cite: 37] */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-white border-2 border-pink-500 text-pink-600 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl z-50 animate-bounce">✨</button>

      {/* نافذة الدردشة (الذكاء الاصطناعي) بنفس المنطق الأصلي [cite: 38-44] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-6 bg-pink-600 text-white flex justify-between items-center">
              <span className="font-bold flex items-center gap-2">🤖 مستشارة رقة</span>
              <button onClick={() => setIsChatOpen(false)} className="bg-white/20 p-2 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-pink-50/20 no-scrollbar">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800' : 'bg-pink-500 text-white'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-white border-t flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 p-4 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-pink-100" placeholder="اسألي رقة عن أي شيء..." />
              <button onClick={handleChat} className="bg-pink-600 text-white px-6 rounded-2xl text-xs font-bold shadow-md">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
