import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// الاستيراد الصحيح: بما أن Swing.jsx في مجلد pages، ندخل مباشرة لمجلد Swing-page
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
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('raqqa_chats')) || []);
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

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleSavePost = async () => {
    if (!content) return alert("اكتبي شيئاً أولاً");
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      if (selectedFile) formData.append('file', selectedFile);

      await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      setContent(''); setSelectedFile(null); fetchPosts();
    } catch (e) { alert("فشل النشر"); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: userInput }
      });
      const aiMsg = { role: 'ai', content: res.data.reply, id: Date.now() + 1 };
      const newHistory = [...chatHistory, userMsg, aiMsg];
      setChatHistory(newHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(newHistory));
    } catch (e) { alert("خطأ في رد الذكاء"); }
  };

  const deleteMsg = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right font-arabic" dir="rtl">
      {/* شريط الأقسام المتحرك */}
      <div className="bg-pink-600 text-white py-2 overflow-hidden shadow-md">
        <div className="animate-marquee whitespace-nowrap inline-block font-bold text-sm">
          {categories.map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="mx-6 hover:text-pink-200">{c.ar}</Link>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* كروت المحتوى الجديد (أعلى الصفحة) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {posts.slice(0, 2).map((p, i) => (
                  <div key={i} className="bg-gradient-to-l from-pink-500 to-rose-400 p-5 rounded-2xl text-white shadow-lg animate-pulse">
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded">جديد ✨</span>
                    <p className="mt-2 text-sm font-bold">{p.content}</p>
                  </div>
                ))}
              </div>

              {/* صندوق الرفع (نص + صورة) */}
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-pink-100">
                <textarea 
                  value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none" placeholder="شاركينا منشورك الجديد..."
                />
                <div className="flex justify-between items-center mt-3">
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="text-xs" />
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-6 py-2 rounded-xl text-sm font-bold">نشر</button>
                </div>
              </div>

              {/* عرض المنشورات */}
              <div className="space-y-4">
                {posts.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                    <p className="text-gray-700 text-sm mb-3">{p.content}</p>
                    {p.media_url && <img src={p.media_url} className="rounded-xl w-full max-h-80 object-cover" alt="Post" />}
                  </div>
                ))}
              </div>
            </>
          } />

          {/* المسارات لكل صفحة داخل Swing-page */}
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

      {/* الزر العائم للدردشة */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-xl z-50 animate-bounce">💬</button>

      {/* مودال الدردشة */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-[80vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-pink-600 text-white flex justify-between items-center">
              <span className="font-bold">دردشة رقة</span>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/30">
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
              <div className="flex gap-2 mb-3">
                <button className="text-xs bg-gray-100 p-2 rounded-lg">🖼️ صورة</button>
                <button className="text-xs bg-gray-100 p-2 rounded-lg">📷 كاميرا</button>
                <button className="text-xs bg-gray-100 p-2 rounded-lg">🎙️ ميك</button>
              </div>
              <div className="flex gap-2">
                <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} className="flex-1 border p-2 rounded-xl text-sm outline-none focus:border-pink-500" placeholder="اسألي رقة..." />
                <button onClick={handleChat} className="bg-pink-600 text-white px-4 rounded-xl">إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
