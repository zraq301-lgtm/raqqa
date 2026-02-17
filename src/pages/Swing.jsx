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

  const deleteMsg = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans" dir="rtl">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      {/* الشريط المتحرك */}
      <div className="bg-pink-600 text-white py-3 overflow-hidden shadow-md sticky top-0 z-50">
        <div className="animate-marquee whitespace-nowrap">
          {categories.map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="mx-6 font-bold hover:text-pink-200">
              {c.ar}
            </Link>
          ))}
          {categories.map((c, i) => (
            <Link key={`d-${i}`} to={`/Swing/${c.path}`} className="mx-6 font-bold hover:text-pink-200">
              {c.ar}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر */}
              <div className="bg-white p-5 rounded-3xl shadow-sm mb-6 border border-pink-50">
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-pink-300 transition-all" 
                  placeholder="شاركينا منشورك الجديد..."
                  rows="3"
                />
                <div className="flex justify-between items-center mt-4">
                  <input 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                    className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" 
                  />
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-8 py-2 rounded-xl text-sm font-bold hover:bg-pink-700 shadow-md">نشر</button>
                </div>
              </div>

              {/* قائمة المنشورات */}
              <div className="space-y-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{p.content}</p>
                    {p.media_url && (
                      <img src={p.media_url} className="rounded-2xl w-full max-h-96 object-cover" alt="Post" />
                    )}
                    <div className="mt-3 text-[10px] text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('ar-EG')}
                    </div>
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
          <Route path="/HomeCorners" element={<HomeCorners />} />
          <Route path="/EmpowermentPaths" element={<EmpowermentPaths />} />
          <Route path="/HarmonyBridges" element={<HarmonyBridges />} />
          <Route path="/PassionsCrafts" element={<PassionsCrafts />} />
          <Route path="/SoulsLounge" element={<SoulsLounge />} />
        </Routes>
      </main>

      {/* زر الدردشة */}
      <button 
        onClick={() => setIsChatOpen(true)} 
        className="fixed bottom-6 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 animate-bounce"
      >
        💬
      </button>

      {/* نافذة الدردشة */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-pink-600 text-white flex justify-between items-center">
              <span className="font-bold">دردشة رقة</span>
              <button onClick={() => setIsChatOpen(false)} className="text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/20">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-white text-gray-800' : 'bg-pink-500 text-white'}`}>
                    {m.content}
                  </div>
                  <button onClick={() => deleteMsg(m.id)} className="text-[10px] text-red-400 mt-1">حذف</button>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={userInput} 
                  onChange={e => setUserInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  className="flex-1 border p-3 rounded-xl text-sm outline-none focus:border-pink-500" 
                  placeholder="اسألي رقة..." 
                />
                <button onClick={handleChat} className="bg-pink-600 text-white px-5 rounded-xl">إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
