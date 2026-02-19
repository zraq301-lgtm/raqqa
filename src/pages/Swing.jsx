import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات بنفس الأسماء المطلوبة [cite: 3, 4]
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
  const [posts, setPosts] = useState([]); [cite: 5]
  const [isChatOpen, setIsChatOpen] = useState(false); [cite: 5]
  const [activeComments, setActiveComments] = useState(null); 
  const [userInput, setUserInput] = useState(''); [cite: 7]
  const [content, setContent] = useState(''); [cite: 7]
  const [selectedFile, setSelectedFile] = useState(null); [cite: 7]

  const categories = [
    { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🌸" },
    { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "🧸" },
    { ar: "واحة العافية", path: "WellnessOasis", icon: "🧘‍♀️" },
    { ar: "أيقونة الأناقة", path: "EleganceIcon", icon: "👗" },
    { ar: "فن الطهي", path: "CulinaryArts", icon: "🍳" },
    { ar: "زوايا البيت", path: "HomeCorners", icon: "🏠" },
    { ar: "مسارات التمكين", path: "EmpowermentPaths", icon: "💪" },
    { ar: "جسور المودة", path: "HarmonyBridges", icon: "❤️" },
    { ar: "شغف وحرف", path: "PassionsCrafts", icon: "🎨" },
    { ar: "ملتقى الأرواح", path: "SoulsLounge", icon: "✨" }
  ]; [cite: 8, 9]

  useEffect(() => { fetchPosts(); }, []); [cite: 9]

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` }); [cite: 10]
      setPosts(res.data.posts || []); [cite: 11]
    } catch (e) { console.error("Fetch error", e); }
  };

  // وظيفة عرض المحتوى (صورة أو فيديو) بناءً على الرابط المجلوب
  const renderMedia = (url) => {
    if (!url) return null;
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i);
    if (isVideo) {
      return <video src={url} controls className="rounded-2xl w-full h-auto mb-4" />;
    }
    return <img src={url} className="rounded-2xl w-full max-h-96 object-cover mb-4" alt="Post Content" />; [cite: 33]
  };

  return (
    <div className="min-h-screen bg-[#FDF8FA] text-right font-sans" dir="rtl">
      
      {/* 1. شريط التنقل العلوي (Nearme Style) */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">🔔</div>
            <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-pink-400 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=User&background=f472b6&color=fff" alt="Profile" />
            </div>
        </div>
        <div className="flex-1 overflow-x-auto no-scrollbar mx-4">
            <div className="flex gap-6 items-center">
                {categories.map((c, i) => (
                    <Link key={i} to={`/Swing/${c.path}`} className="flex flex-col items-center min-w-[50px]">
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-[9px] font-bold text-gray-500">{c.ar}</span>
                    </Link> 
                ))}
            </div>
        </div>
        <div className="text-pink-600 text-2xl">🔍</div>
      </header>

      <main className="max-w-xl mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* 2. القسم الترحيبي (Hero Section) */}
              <div className="bg-gradient-to-br from-pink-400 to-purple-300 rounded-[2rem] p-6 mb-8 text-white shadow-lg shadow-pink-200/50">
                <h2 className="text-2xl font-bold mb-2">أهلاً بكِ في مجتمعنا ✨</h2>
                <p className="text-sm opacity-90">اكتشفي أكثر المواضيع تفاعلاً اليوم وشاركينا إبداعكِ.</p>
              </div>

              {/* 3. تبويبات التصفح */}
              <div className="flex gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {["الكل", "الأحدث", "المتابَعون", "الأكثر شعبية"].map((tab, i) => (
                    <button key={i} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-pink-600 text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>
                        {tab}
                    </button>
                ))}
              </div>

              {/* 4. صندوق النشر (Card Style) */}
              <div className="bg-white p-5 rounded-[2rem] shadow-sm mb-8 border border-pink-50">
                <textarea 
                  [cite_start]value={content} [cite: 29]
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-pink-300 transition-all border-none" 
                  placeholder="شاركينا خبراً أو قصة..." rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" id="file-upload" /> [cite: 31]
                  <label htmlFor="file-upload" className="cursor-pointer text-xs bg-pink-50 text-pink-600 px-4 py-2 rounded-full font-bold">🖼️ إضافة وسائط</label>
                  <button onClick={() => {}} className="bg-pink-600 text-white px-8 py-2 rounded-full text-sm font-bold">نشر</button>
                </div>
              </div>

              {/* 5. عرض المواضيع (Discussion Cards) */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-pink-100" />
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">عضوة رقة</h4>
                                <span className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span> [cite: 34]
                            </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">{p.content}</p> 
                        {renderMedia(p.media_url)}
                    </div>

                    {/* التفاعل السفلي */}
                    <div className="flex items-center justify-around py-4 border-t border-gray-50">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500">
                            <span className="text-xl">❤️</span> <span className="text-xs">إعجاب</span>
                        </button>
                        <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-2 text-gray-400 hover:text-blue-500">
                            <span className="text-xl">💬</span> <span className="text-xs">دردشة</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-500">
                            <span className="text-xl">🔗</span> <span className="text-xs">مشاركة</span>
                        </button>
                    </div>

                    {/* نظام الدردشة الجماعية على المنشور */}
                    {activeComments === p.id && (
                        <div className="bg-gray-50 p-4 border-t border-gray-100 animate-slideDown">
                            <div className="h-48 overflow-y-auto mb-4 space-y-3 p-2">
                                <div className="flex flex-col items-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-tr-none text-xs shadow-sm">أهلاً بكن! ما رأيكن في هذا الموضوع؟</div>
                                    <button className="text-[9px] text-pink-500 mt-1">رد على العضوة</button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="اكتبي رسالة للمجموعة..." className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs shadow-inner outline-none" />
                                <button className="bg-pink-600 text-white px-4 rounded-xl text-xs">إرسال</button>
                            </div>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          } />

          <Route path="/MotherhoodHaven" element={<MotherhoodHaven />} />
          <Route path="/LittleOnesAcademy" element={<LittleOnesAcademy />} />
          <Route path="/WellnessOasis" element={<WellnessOasis />} />
          <Route path="/EleganceIcon" element={<EleganceIcon />} />
          <Route path="/CulinaryArts" element={<CulinaryArts />} />
          <Route path="/HomeCorners" element={<HomeCorners />} /> [cite: 36]
          <Route path="/EmpowermentPaths" element={<EmpowermentPaths />} />
          <Route path="/HarmonyBridges" element={<HarmonyBridges />} />
          <Route path="/PassionsCrafts" element={<PassionsCrafts />} />
          <Route path="/SoulsLounge" element={<SoulsLounge />} />
        </Routes>
      </main>

      {/* 5. زر الإضافة العائم (FAB) */}
      <button className="fixed bottom-24 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl z-40 hover:scale-110 transition-transform">
        +
      </button>

      {/* زر شات الذكاء الاصطناعي */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-white border-2 border-pink-500 text-pink-600 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl z-50 animate-bounce">
        ✨
      </button>

      {/* نافذة شات رقة (AI) بنفس المنطق الأصلي [cite: 38, 42, 44] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] rounded-t-[3rem] sm:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
             <div className="p-6 bg-pink-600 text-white flex justify-between items-center">
                <span className="font-bold">مستشارتكِ الذكية</span>
                <button onClick={() => setIsChatOpen(false)}>✕</button>
             </div>
             {/* ... نفس منطق عرض الرسائل الأصلي [cite: 39-41] ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
