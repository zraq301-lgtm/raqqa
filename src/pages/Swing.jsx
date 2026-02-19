import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core'; [cite: 2]

// استيراد الصفحات بنفس الأسماء المطلوبة
import MotherhoodHaven from './Swing-page/MotherhoodHaven'; [cite: 3]
import LittleOnesAcademy from './Swing-page/LittleOnesAcademy';
import WellnessOasis from './Swing-page/WellnessOasis'; [cite: 3]
import EleganceIcon from './Swing-page/EleganceIcon';
import CulinaryArts from './Swing-page/CulinaryArts';
import HomeCorners from './Swing-page/HomeCorners';
import EmpowermentPaths from './Swing-page/EmpowermentPaths'; [cite: 3]
import HarmonyBridges from './Swing-page/HarmonyBridges'; [cite: 4]
import PassionsCrafts from './Swing-page/PassionsCrafts';
import SoulsLounge from './Swing-page/SoulsLounge';

const API_BASE = "https://raqqa-v6cd.vercel.app/api"; [cite: 4]

const Swing = () => {
  const [posts, setPosts] = useState([]); [cite: 5]
  const [isChatOpen, setIsChatOpen] = useState(false); [cite: 5]
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('raqqa_chats');
    return saved ? JSON.parse(saved) : [];
  }); [cite: 6]
  const [userInput, setUserInput] = useState(''); [cite: 7]
  const [content, setContent] = useState(''); [cite: 7]
  const [selectedFile, setSelectedFile] = useState(null); [cite: 7]
  const [activeComments, setActiveComments] = useState(null);

  // تم إصلاح الخطأ هنا (إغلاق المصفوفة بشكل صحيح)
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
  ]; [cite: 8, 9]

  useEffect(() => {
    fetchPosts();
  }, []); [cite: 9]

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` }); [cite: 10]
      setPosts(res.data.posts || []); [cite: 11]
    } catch (e) {
      console.error("Fetch error", e);
    } [cite: 11]
  };

  const handleSavePost = async () => {
    if (!content) return alert("اكتبي شيئاً أولاً"); [cite: 12]
    try {
      const formData = new FormData(); [cite: 13]
      formData.append('content', content); [cite: 13]
      formData.append('section', 'الرئيسية'); [cite: 13]
      formData.append('type', selectedFile ? 'صورة' : 'نصي'); [cite: 14]
      if (selectedFile) formData.append('file', selectedFile); [cite: 14]
      const response = await fetch(`${API_BASE}/save-post`, { 
        method: 'POST', 
        body: formData 
      }); [cite: 15]
      if (response.ok) {
        setContent('');
        setSelectedFile(null);
        fetchPosts();
      } [cite: 16]
    } catch (e) {
      alert("فشل النشر");
    } [cite: 17]
  };

  const handleChat = async () => {
    if (!userInput) return; [cite: 18]
    const userMsg = { role: 'user', content: userInput, id: Date.now() }; [cite: 19]
    const updatedHistoryWithUser = [...chatHistory, userMsg]; [cite: 19]
    setChatHistory(updatedHistoryWithUser); [cite: 19]
    const tempInput = userInput; [cite: 20]
    setUserInput(''); [cite: 20]

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${tempInput}` }
      }; [cite: 20]
      const res = await CapacitorHttp.post(options); [cite: 21]
      const aiMsg = { 
        role: 'ai', 
        content: res.data.reply || res.data.message, 
        id: Date.now() + 1 
      }; [cite: 22]
      const finalHistory = [...updatedHistoryWithUser, aiMsg]; [cite: 23]
      setChatHistory(finalHistory); [cite: 23]
      localStorage.setItem('raqqa_chats', JSON.stringify(finalHistory)); [cite: 23]
    } catch (e) {
      alert("خطأ في الاتصال بالذكاء الاصطناعي");
    } [cite: 23]
  };

  const renderMedia = (p) => {
    if (!p.media_url) return null;
    if (p.type === 'فيديو' || p.media_url.match(/\.(mp4|webm|mov)$/i)) {
      return <video src={p.media_url} controls className="rounded-3xl w-full h-auto mb-4" />;
    }
    return <img src={p.media_url} className="rounded-3xl w-full max-h-96 object-cover mb-4" alt="Post" />;
  };

  return (
    <div className="min-h-screen bg-[#FDF8FA] text-right font-sans" dir="rtl">
      
      {/* شريط التنقل العلوي (Nearme Style) */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">🔔</div>
          <div className="w-10 h-10 rounded-full border-2 border-pink-200 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=User&background=f472b6&color=fff" alt="Profile" />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto mx-4 no-scrollbar">
          <div className="flex gap-5 items-center">
            {categories.map((c, i) => (
              <Link key={i} to={`/Swing/${c.path}`} className="flex flex-col items-center min-w-[45px]">
                <span className="text-xl">{c.icon}</span>
                <span className="text-[9px] font-bold text-gray-400">{c.ar}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="text-pink-500 text-xl">🔍</div>
      </header>

      <main className="max-w-xl mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* قسم الترحيب Hero */}
              <div className="bg-gradient-to-l from-pink-500 to-rose-400 rounded-[2.5rem] p-6 mb-8 text-white shadow-lg shadow-pink-100">
                <h2 className="text-xl font-bold mb-1">أهلاً بكِ في رقة ✨</h2>
                <p className="text-xs opacity-90">مساحتكِ الخاصة للإبداع والجمال</p>
              </div>

              {/* صندوق النشر */}
              <div className="bg-white p-5 rounded-[2rem] shadow-sm mb-8 border border-pink-50">
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-pink-200" 
                  placeholder="شاركينا ما في جعبتكِ..." 
                  rows="3" [cite: 29, 30]
                />
                <div className="flex justify-between items-center mt-4">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" id="post-file" /> [cite: 31]
                  <label htmlFor="post-file" className="text-xs text-pink-600 font-bold cursor-pointer bg-pink-50 px-4 py-2 rounded-full">📷 إضافة محتوى</label>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-8 py-2 rounded-full text-sm font-bold shadow-md hover:bg-pink-700">نشر</button> [cite: 31]
                </div>
              </div>

              {/* عرض المنشورات (Cards) */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden"> [cite: 32]
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-pink-100 rounded-full" />
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span> [cite: 34]
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{p.content}</p> [cite: 33]
                      {renderMedia(p)} [cite: 33]
                    </div>
                    
                    {/* أزرار التفاعل */}
                    <div className="flex items-center justify-around py-4 border-t border-gray-50 bg-gray-50/30">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                        <span>❤️</span> <span className="text-[11px] font-bold">إعجاب</span>
                      </button>
                      <button onClick={() => setActiveComments(activeComments === p.id ? null : p.id)} className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                        <span>💬</span> <span className="text-[11px] font-bold">دردشة</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                        <span>🔗</span> <span className="text-[11px] font-bold">مشاركة</span>
                      </button>
                    </div>

                    {/* دردشة التعليقات الجماعية */}
                    {activeComments === p.id && (
                      <div className="p-4 bg-pink-50/20 border-t border-pink-50">
                        <div className="h-32 overflow-y-auto mb-3 space-y-2">
                          <div className="bg-white p-2 rounded-xl rounded-tr-none shadow-sm text-[11px] inline-block">مرحباً بكِ في نقاش هذا المنشور! 🌸</div>
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="اكتبي رداً..." className="flex-1 bg-white rounded-xl px-4 py-2 text-xs outline-none shadow-inner" />
                          <button className="bg-pink-500 text-white px-3 rounded-xl text-xs">إرسال</button>
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

      {/* زر FAB العائم */}
      <button className="fixed bottom-24 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl z-40 hover:scale-110 transition-transform">+</button>

      {/* زر شات الذكاء الاصطناعي */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-white border-2 border-pink-500 text-pink-600 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl z-50 animate-bounce">💬</button> [cite: 37]

      {/* نافذة شات رقة (AI) */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden border-4 border-white">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center"> [cite: 38]
              <span className="font-bold">دردشة رقة الذكية</span> [cite: 38]
              <button onClick={() => setIsChatOpen(false)}>✕</button> [cite: 38]
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/20"> [cite: 38]
              {chatHistory.map(m => ( [cite: 39]
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? [cite_start]'items-start' : 'items-end'}`}> [cite: 39, 40]
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] ${m.role === 'user' ? [cite_start]'bg-white text-gray-800' : 'bg-pink-500 text-white'}`}> [cite: 40, 41]
                    {m.content} [cite: 41]
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t flex gap-2"> [cite: 42]
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-50 p-3 rounded-xl text-sm outline-none" placeholder="اسألي رقة..." /> [cite: 42, 43, 44]
              <button onClick={handleChat} className="bg-pink-600 text-white px-5 rounded-xl text-xs font-bold">إرسال</button> [cite: 44]
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing; [cite: 45]
