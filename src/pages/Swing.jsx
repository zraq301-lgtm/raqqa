import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';
import { 
  Heart, MessageCircle, Share2, Send, X, Trash2, 
  ImageIcon, Camera, Mic, Sparkles, Baby, GraduationCap, 
  HeartPulse, Gem, ChefHat, Home, Rocket, Users, Palette, Coffee 
} from 'lucide-react';

const API_BASE = "https://raqqa-v6cd.vercel.app/api";

// --- تعريف الأقسام العشرة ---
const SECTIONS = [
  { id: "motherhood", label: "الأمومة", icon: <Baby size={20} />, path: "/motherhood", sectionKey: "MotherhoodHaven" },
  { id: "kids", label: "الصغار", icon: <GraduationCap size={20} />, path: "/kids", sectionKey: "LittleOnesAcademy" },
  { id: "wellness", label: "العافية", icon: <HeartPulse size={20} />, path: "/wellness", sectionKey: "WellnessOasis" },
  { id: "elegance", label: "الأناقة", icon: <Gem size={20} />, path: "/elegance", sectionKey: "EleganceIcon" },
  { id: "culinary", label: "الطهي", icon: <ChefHat size={20} />, path: "/culinary", sectionKey: "CulinaryArts" },
  { id: "home", label: "البيت", icon: <Home size={20} />, path: "/home", sectionKey: "HomeCorners" },
  { id: "empowerment", label: "التمكين", icon: <Rocket size={20} />, path: "/empowerment", sectionKey: "EmpowermentPaths" },
  { id: "harmony", label: "المودة", icon: <Users size={20} />, path: "/harmony", sectionKey: "HarmonyBridges" },
  { id: "passions", label: "شغف", icon: <Palette size={20} />, path: "/passions", sectionKey: "PassionsCrafts" },
  { id: "souls", label: "الأرواح", icon: <Coffee size={20} />, path: "/souls", sectionKey: "SoulsLounge" },
];

const Swing = () => {
  const [posts, setPosts] = useState([]);
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('raqqa_chats') || '[]'));
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const location = useLocation();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) { console.error("Error:", e); }
  };

  const handlePublish = async (sectionKey = "General") => {
    if (!content) return alert("اكتبي شيئاً أولاً");
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', sectionKey);
      formData.append('type', 'نصي');
      await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      setContent(''); fetchPosts();
    } catch (e) { alert("تعذر النشر"); } finally { setIsPublishing(false); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const newMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, newMsg]);
    const prompt = userInput; setUserInput('');
    try {
      const res = await CapacitorHttp.post({ url: `${API_BASE}/raqqa-ai`, data: { prompt } });
      const aiMsg = { role: 'ai', content: res.data.reply, id: Date.now() + 1 };
      setChatHistory(prev => {
        const updated = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(updated));
        return updated;
      });
    } catch (e) { alert("رقة مشغولة"); }
  };

  // استخراج الفيديوهات الجديدة للكروت الإعلانية
  const videoAds = posts.filter(p => p.content.includes('http') || p.media_url?.includes('video')).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right" dir="rtl">
      <style>{`
        .glass-nav { display: flex; overflow-x: auto; padding: 10px; gap: 10px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); sticky top-0 z-50; border-bottom: 1px solid #FFE4ED; }
        .glass-nav::-webkit-scrollbar { display: none; }
        .nav-item { display: flex; flex-direction: column; align-items: center; min-width: 60px; color: #D81B60; text-decoration: none; font-size: 10px; font-weight: bold; }
        .ad-card { flex: 1; background: white; border-radius: 15px; padding: 10px; border: 1px solid #FFD1E3; box-shadow: 0 4px 10px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 5px; }
        .post-card { background: white; margin: 15px; border-radius: 20px; border: 1px solid #FFF0F5; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .chat-overlay { position: fixed; inset: 0; background: white; z-index: 1000; display: flex; flex-direction: column; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {/* 1. قائمة الأقسام في أعلى الشاشة */}
      <nav className="glass-nav">
        {SECTIONS.map(sec => (
          <Link key={sec.id} to={sec.path} className="nav-item">
            <div className="p-2 bg-pink-50 rounded-full mb-1">{sec.icon}</div>
            {sec.label}
          </Link>
        ))}
      </nav>

      <main className="pb-20">
        <Routes>
          <Route path="/" element={
            <div className="p-4">
              {/* 2. كروت الإعلانات عن المنشورات الجديدة (فيديو/رابط) */}
              <div className="flex gap-3 mb-6">
                {videoAds.length > 0 ? videoAds.map((ad, i) => (
                  <div key={i} className="ad-card">
                    <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full w-fit">جديد ✨</span>
                    <p className="text-[11px] line-clamp-2 text-gray-600 font-bold">{ad.content}</p>
                    <button className="text-[10px] text-blue-500 underline mt-auto">مشاهدة الفديو</button>
                  </div>
                )) : (
                  <div className="ad-card text-center text-gray-400 text-xs py-4">لا توجد إعلانات جديدة حالياً</div>
                )}
              </div>

              {/* كارت الكتابة */}
              <div className="bg-white p-4 rounded-3xl border-2 border-pink-50 shadow-sm mb-6">
                 <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  placeholder="بماذا تفكرين يا رقة؟"
                  className="w-full h-20 outline-none resize-none text-sm"
                 />
                 <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-3 text-gray-400"><Camera size={20}/><Mic size={20}/><ImageIcon size={20}/></div>
                    <button onClick={() => handlePublish()} className="bg-pink-600 text-white px-6 py-1.5 rounded-full text-sm font-bold">نشر</button>
                 </div>
              </div>

              {/* عرض المحتوى العام القادم من كل الأقسام */}
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="p-3 flex items-center gap-2 border-b border-pink-50">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs">🦋</div>
                      <span className="text-xs font-bold text-gray-700">{post.section}</span>
                    </div>
                    <p className="p-4 text-sm text-gray-600 leading-relaxed">{post.content}</p>
                    {post.media_url && <img src={post.media_url} className="w-full object-cover max-h-72" alt="media"/>}
                    <div className="flex justify-around p-3 text-pink-400 border-t border-pink-50">
                      <Heart size={20} /> <MessageCircle size={20} /> <Share2 size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          } />

          {/* المسارات الداخلية (تعرض نفس المحتوى لكن مفلتر حسب القسم) */}
          {SECTIONS.map(sec => (
            <Route key={sec.id} path={sec.path} element={
              <div className="p-4">
                <h2 className="text-lg font-bold text-pink-600 mb-4">{sec.label}</h2>
                {posts.filter(p => p.section === sec.sectionKey).map(post => (
                   <div key={post.id} className="post-card">
                      <p className="p-4 text-sm">{post.content}</p>
                   </div>
                ))}
              </div>
            } />
          ))}
        </Routes>
      </main>

      {/* زر الذكاء الاصطناعي العائم */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-pink-600 rounded-full shadow-xl flex items-center justify-center text-white z-50"
      >
        <Sparkles size={24} />
      </button>

      {/* نافذة الدردشة المستقلة */}
      {isChatOpen && (
        <div className="chat-overlay">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-bold text-pink-600">رقة الذكية 🕊️</span>
            <X onClick={() => setIsChatOpen(false)} className="text-gray-400 cursor-pointer" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/20">
            {chatHistory.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-white text-gray-700' : 'bg-pink-600 text-white'}`}>
                  {m.content}
                </div>
                <button onClick={() => {
                  const filtered = chatHistory.filter(item => item.id !== m.id);
                  setChatHistory(filtered);
                  localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
                }} className="text-[9px] text-red-300 mt-1">حذف 🗑️</button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2">
            <input 
              value={userInput} onChange={e => setUserInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleChat()}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
              placeholder="اسألي رقة..."
            />
            <button onClick={handleChat} className="bg-pink-600 text-white p-2 rounded-full"><Send size={18}/></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
