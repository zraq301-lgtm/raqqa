import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core'; [cite: 2]

// استيراد الصفحات الفرعية العشرة بنفس المسميات المطلوبة [cite: 3, 4, 8]
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
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('raqqa_chats')) || []); [cite: 6]
  const [userInput, setUserInput] = useState(''); [cite: 6]
  const [content, setContent] = useState(''); [cite: 6]
  const [selectedFile, setSelectedFile] = useState(null); [cite: 7]

  // القائمة العربية للأقسام العشرة [cite: 7, 8]
  const categories = [
    { ar: "ملاذ الأمومة", path: "MotherhoodHaven" },
    { ar: "أكاديمية الصغار", path: "LittleOnesAcademy" },
    { ar: "واحة العافية", path: "WellnessOasis" },
    { ar: "أيقونة الأناقة", path: "EleganceIcon" },
    { ar: "فن الطهي", path: "CulinaryArts" },
    { ar: "زوايا البيت", path: "HomeCorners" },
    { ar: "مسارات التمكين", path: "EmpowermentPaths" },
    { ar: "جسور المودة", path: "HarmonyBridges" },
    { ar: "شغف وحرف", path: "PassionsCrafts" },
    { ar: "ملتقى الأرواح", path: "SoulsLounge" }
  ];

  // 1. جلب المنشورات عند تحميل الصفحة [cite: 8]
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` }); [cite: 9]
      setPosts(res.data.posts || []); [cite: 10]
    } catch (e) {
      console.error("خطأ في جلب البيانات:", e);
    }
  };

  // 2. منطق رفع المنشور (نص + صورة) إلى نيون [cite: 11]
  const handleSavePost = async () => {
    if (!content && !selectedFile) return alert("اكتبي شيئاً أو أرفقي صورة أولاً"); [cite: 11]
    
    try {
      const formData = new FormData();
      formData.append('content', content); [cite: 12]
      formData.append('section', 'الرئيسية'); [cite: 12]
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile); [cite: 12]

      await fetch(`${API_BASE}/save-post`, { [cite: 13]
        method: 'POST',
        body: formData
      });

      setContent('');
      setSelectedFile(null);
      fetchPosts(); // تحديث القائمة فوراً
      alert("تم النشر بنجاح ✨");
    } catch (e) {
      alert("فشل النشر، يرجى المحاولة لاحقاً");
    }
  };

  // 3. منطق الاتصال بذكاء رقة الاصطناعي [cite: 14]
  const handleChat = async () => {
    if (!userInput) return; [cite: 14]
    const userMsg = { role: 'user', content: userInput, id: Date.now() }; [cite: 15]
    setChatHistory(prev => [...prev, userMsg]);
    const currentInput = userInput;
    setUserInput('');

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`, [cite: 16]
        headers: { 'Content-Type': 'application/json' }, [cite: 16]
        data: { prompt: `أنا أنثى مسلمة... ${currentInput}` } [cite: 16]
      };

      const response = await CapacitorHttp.post(options); [cite: 16]
      const responseText = response.data.reply || response.data.message; [cite: 17]
      
      const aiMsg = { role: 'ai', content: responseText, id: Date.now() + 1 }; [cite: 17]
      const newHistory = [...chatHistory, userMsg, aiMsg];
      setChatHistory(newHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(newHistory)); [cite: 18]
    } catch (err) {
      console.error("فشل الاتصال الأصلي:", err);
      alert("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffafa] text-right font-arabic" dir="rtl">
      {/* CSS المدمج للحركات */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
        .font-arabic { font-family: 'Cairo', sans-serif; }
      `}</style>

      {/* شريط الأقسام المتحرك أعلى الصفحة [cite: 20] */}
      <nav className="bg-pink-600 text-white py-3 overflow-hidden shadow-lg sticky top-0 z-50">
        <div className="animate-marquee whitespace-nowrap">
          {categories.map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="mx-8 font-bold text-sm hover:text-pink-200 transition-colors">
              {c.ar}
            </Link>
          ))}
          {/* تكرار للعرض المستمر */}
          {categories.map((c, i) => (
            <Link key={`dup-${i}`} to={`/Swing/${c.path}`} className="mx-8 font-bold text-sm hover:text-pink-200 transition-colors">
              {c.ar}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={
            <>
              {/* قسم الترحيب المتحرك [cite: 22] */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {posts.slice(0, 2).map((p, i) => (
                  <div key={i} className="bg-gradient-to-r from-pink-500 to-rose-400 p-6 rounded-3xl text-white shadow-xl transform hover:scale-105 transition-transform cursor-pointer">
                    <span className="text-[10px] bg-white/30 px-3 py-1 rounded-full uppercase tracking-widest">إلهام اليوم ✨</span>
                    <p className="mt-3 text-sm font-medium leading-relaxed truncate">{p.content}</p>
                  </div>
                ))}
              </div>

              {/* صندوق النشر المطور [cite: 23, 24] */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm mb-10 border-2 border-pink-50">
                <h2 className="text-pink-600 font-bold mb-4 flex items-center gap-2">
                  <span>📝</span> شاركينا فكركِ أو إبداعكِ
                </h2>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none border border-transparent focus:border-pink-200 focus:bg-white transition-all resize-none" 
                  placeholder="اكتبي ما تودين مشاركته مع مجتمع رقة..."
                  rows="4"
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="relative">
                    <input 
                      type="file" 
                      id="file-upload"
                      onChange={(e) => setSelectedFile(e.target.files[0])} 
                      className="hidden" 
                    />
                    <label htmlFor="file-upload" className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                      {selectedFile ? '✅ تم اختيار صورة' : '🖼️ إضافة صورة'}
                    </label>
                  </div>
                  <button 
                    onClick={handleSavePost} 
                    className="bg-pink-600 text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all"
                  >
                    نشر الآن
                  </button>
                </div>
              </div>

              {/* عرض خلاصة المنتدى (المنشورات) [cite: 25, 26] */}
              <div className="space-y-8">
                {posts.length > 0 ? posts.map(p => (
                  <article key={p.id} className="bg-white overflow-hidden rounded-[2rem] shadow-sm border border-pink-50 transition-all hover:shadow-md">
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-lg">🌸</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">عضوة رقة</p>
                          <p className="text-[10px] text-gray-400">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{p.content}</p>
                    </div>
                    {p.media_url && (
                      <div className="px-5 pb-5">
                        <img src={p.media_url} className="rounded-2xl w-full object-cover max-h-[500px]" alt="Post Media" />
                      </div>
                    )}
                  </article>
                )) : (
                  <div className="text-center py-20 text-gray-400">لا توجد منشورات بعد، كوني الأولى! 🌸</div>
                )}
              </div>
            </>
          } />

          {/* مسارات الصفحات الفرعية [cite: 27, 28] */}
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

      {/* الزر العائم للدردشة [cite: 29] */}
      <button 
        onClick={() => setIsChatOpen(true)} 
        className="fixed bottom-8 left-8 bg-pink-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 hover:scale-110 active:scale-95 transition-transform animate-bounce"
      >
        💬
      </button>

      {/* نافذة الدردشة (مودال) [cite: 30] */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <header className="p-6 bg-pink-600 text-white flex justify-between items-center">
              <span className="font-bold flex items-center gap-2">🌸 دردشة رقة الذكية</span>
              <button onClick={() => setIsChatOpen(false)} className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/40">✕</button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fff9fa]">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                    m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none border border-pink-50' : 'bg-pink-500 text-white rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                  <button 
                    onClick={() => {
                      const filtered = chatHistory.filter(msg => msg.id !== m.id);
                      setChatHistory(filtered);
                      localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
                    }} 
                    className="text-[10px] text-red-300 mt-1 px-2"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>

            <footer className="p-6 bg-white border-t border-pink-50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userInput} 
                  onChange={e => setUserInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  className="flex-1 border-2 border-pink-50 p-3 rounded-2xl text-sm outline-none focus:border-pink-200 bg-gray-50 transition-all" 
                  placeholder="اسألي رقة ما تشائين..." 
                />
                <button onClick={handleChat} className="bg-pink-600 text-white px-6 rounded-2xl font-bold hover:bg-pink-700 transition-colors">إرسال</button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
