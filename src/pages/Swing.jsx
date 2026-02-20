import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';
import { Share } from '@capacitor/share';

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

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      // فلترة المحتوى بناءً على تعليماتك (حذف أي منشور نوعه "رابط")
      const validPosts = (res.data.posts || []).filter(p => p.type !== 'رابط');
      setPosts(validPosts);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleShare = async (post) => {
    await Share.share({
      title: 'من منصة رقة',
      text: post.content,
      url: post.media_url || '',
      dialogTitle: 'شاركي الرقة مع صديقاتك',
    });
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const promptToSend = userInput;
    setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { 
          // تعليمات الذكاء الصناعي ليكون أدبياً وشعرياً ورومانسياً
          prompt: `أنتِ 'رقة'. ردي بأسلوب أدبي رفيع، ممزوج بالشعر والرومانسية، مع تقديم نصيحة نفسية إيجابية للجميلة التي تسألكِ: ${promptToSend}` 
        }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      setChatHistory(prev => {
        const newH = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(newH));
        return newH;
      });
    } catch (e) { console.error("AI Error", e); }
  };

  const deleteMsg = (id) => {
    const updated = chatHistory.filter(m => m.id !== id);
    setChatHistory(updated);
    localStorage.setItem('raqqa_chats', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .post-card-unified { width: 100%; max-width: 450px; margin: 0 auto 25px; background: #fff; border-radius: 35px; border: 1px solid #FFEBF2; box-shadow: 0 10px 25px rgba(255, 182, 193, 0.1); overflow: hidden; }
        .media-container { width: 100%; height: 350px; object-fit: cover; background: #FFF5F8; }
        .nav-scroller { display: flex; overflow-x: auto; padding: 15px; gap: 12px; background: #fff; border-bottom: 2px solid #FFF0F5; }
        .nav-scroller::-webkit-scrollbar { display: none; }
        .chat-bubble { max-width: 85%; padding: 15px 20px; border-radius: 25px; margin-bottom: 10px; font-size: 14px; line-height: 1.6; }
        .ai-btn-gradient { background: linear-gradient(45deg, #FF6B95, #F06292); color: white; padding: 8px 18px; border-radius: 20px; font-weight: 900; font-size: 12px; }
      `}</style>

      {/* شريط الأقسام العلوي */}
      <nav className="sticky top-0 z-50 nav-scroller shadow-sm">
        {[
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
        ].map((c, i) => (
          <Link key={i} to={`/Swing/${c.path}`} className="flex flex-col items-center min-w-[85px]">
            <span className="text-2xl">{c.icon}</span>
            <span className="text-[11px] font-bold text-pink-500 mt-1">{c.ar}</span>
          </Link>
        ))}
      </nav>

      <main className="p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* كارت النشر الأنيق */}
              <div className="post-card-unified p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌹</span>
                    <span className="font-black text-pink-600 italic">رقة</span>
                  </div>
                  <button onClick={() => setIsChatOpen(true)} className="ai-btn-gradient">✨ ذكاء رقة</button>
                </div>
                <textarea 
                  value={content} onChange={e => setContent(e.target.value)}
                  className="w-full p-4 bg-pink-50/30 rounded-[2rem] border border-pink-100 outline-none text-sm min-h-[100px]"
                  placeholder="ماذا يجول في خاطركِ يا رقيقة؟"
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-3 text-xl">
                    <label className="cursor-pointer">🖼️ <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
                    <button>🎙️</button>
                    <button>📸</button>
                  </div>
                  <button onClick={() => alert('تم النشر بنجاح')} className="bg-pink-600 text-white px-8 py-2 rounded-full font-black text-xs">نشر</button>
                </div>
              </div>

              {/* قائمة المحتوى */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="post-card-unified">
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">🦋</div>
                        <div>
                          <p className="text-sm font-black text-gray-800">رقة</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(p.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      <p className="text-[15px] text-gray-700 leading-relaxed mb-4">{p.content}</p>
                      {p.media_url && (
                        <div className="rounded-[2rem] overflow-hidden border border-pink-50">
                           {p.type === 'فيديو' ? (
                            <video src={p.media_url} controls className="media-container" />
                          ) : (
                            <img src={p.media_url} className="media-container" alt="رقة" />
                          )}
                        </div>
                      )}
                    </div>
                    {/* أزرار التفاعل العرضية */}
                    <div className="flex justify-around items-center py-4 border-t border-pink-50">
                      <button onClick={() => handleLike(p.id)} className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{likes[p.id] ? '💖' : '🤍'}</span>
                        <span className="text-[10px] font-black text-pink-400">أحببت</span>
                      </button>
                      <button onClick={() => setIsChatOpen(true)} className="flex flex-col items-center gap-1">
                        <span className="text-2xl">💬</span>
                        <span className="text-[10px] font-black text-pink-400">حوار</span>
                      </button>
                      <button onClick={() => handleShare(p)} className="flex flex-col items-center gap-1">
                        <span className="text-2xl">🎁</span>
                        <span className="text-[10px] font-black text-pink-400">إهداء</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          } />
          {/* Routes الأقسام ثابتة */}
        </Routes>
      </main>

      {/* نافذة الدردشة الذكية */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-4 animate-slide-up">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-black text-pink-600">همسات رقة الذكية 🖋️</h2>
            <button onClick={() => setIsChatOpen(false)} className="text-2xl">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                <div className={`chat-bubble ${m.role === 'user' ? 'bg-pink-50 text-gray-800' : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white italic'}`}>
                  {m.content}
                </div>
                <button onClick={() => deleteMsg(m.id)} className="text-[9px] text-red-300 mr-2">حذف</button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t flex gap-3 items-center">
            <button className="text-2xl">🎙️</button>
            <input 
              value={userInput} onChange={e => setUserInput(e.target.value)}
              className="flex-1 p-4 bg-gray-50 rounded-full outline-none text-sm"
              placeholder="اكتبي همستكِ هنا..."
            />
            <button onClick={handleChat} className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">🕊️</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
