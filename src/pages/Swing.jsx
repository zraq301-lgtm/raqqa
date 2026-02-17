import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استدعاء الصفحات من المسار الجديد المحدد: src/pages/Swing-page/
import MotherhoodHaven from './pages/Swing-page/MotherhoodHaven';
import LittleOnesAcademy from './pages/Swing-page/LittleOnesAcademy';
import WellnessOasis from './pages/Swing-page/WellnessOasis';
import EleganceIcon from './pages/Swing-page/EleganceIcon';
import CulinaryArts from './pages/Swing-page/CulinaryArts';
import HomeCorners from './pages/Swing-page/HomeCorners';
import EmpowermentPaths from './pages/Swing-page/EmpowermentPaths';
import HarmonyBridges from './pages/Swing-page/HarmonyBridges';
import PassionsCrafts from './pages/Swing-page/PassionsCrafts';
import SoulsLounge from './pages/Swing-page/SoulsLounge';

const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('raqqa_chats')) || []);
  const [userInput, setUserInput] = useState('');

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
      const response = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(response.data.posts || []);
    } catch (err) { console.error("خطأ في جلب البيانات", err); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const newMessage = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, newMessage]);
    setUserInput('');

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة: ${userInput}` }
      };
      const response = await CapacitorHttp.post(options);
      const aiReply = { 
        role: 'ai', 
        content: response.data.reply || response.data.message, 
        id: Date.now() + 1 
      };
      setChatHistory(prev => [...prev, aiReply]);
      localStorage.setItem('raqqa_chats', JSON.stringify([...chatHistory, newMessage, aiReply]));
    } catch (err) { alert("خطأ في الاتصال برقة AI"); }
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(c => c.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
        
        {/* الشريط المتحرك العلوي */}
        <div className="bg-pink-600 text-white py-3 overflow-hidden shadow-lg">
          <div className="animate-marquee whitespace-nowrap inline-block font-bold">
            {categories.map((cat, i) => (
              <Link key={i} to={`/${cat.path}`} className="mx-8 hover:text-pink-200 transition">
                {cat.ar}
              </Link>
            ))}
          </div>
        </div>

        <main className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/" element={
              <>
                {/* كروت المحتوى الجديد في الأعلى */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  {posts.slice(0, 2).map((post, i) => (
                    <div key={i} className="bg-gradient-to-br from-pink-500 to-rose-400 p-6 rounded-3xl text-white shadow-xl animate-pulse border-b-8 border-rose-600">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/30 text-[10px] px-2 py-1 rounded-full uppercase">Update</span>
                      </div>
                      <p className="text-lg font-bold leading-snug">{post.content || "محتوى جديد بانتظارك..."}</p>
                    </div>
                  ))}
                </div>

                {/* تايم لاين المنشورات */}
                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                  {posts.map(post => (
                    <div key={post.id} className="break-inside-avoid bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                      <span className="text-xs font-bold text-pink-500 mb-2 block">{post.section}</span>
                      <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
                      {post.media_url && <img src={post.media_url} className="rounded-xl w-full object-cover" alt="Post" />}
                    </div>
                  ))}
                </div>
              </>
            } />

            {/* المسارات الديناميكية لكل قسم */}
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

        {/* الزر العائم والدردشة */}
        <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 left-8 bg-pink-600 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 z-50">💬</button>

        {isChatOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg h-[85vh] rounded-[2rem] flex flex-col shadow-2xl overflow-hidden border border-pink-100">
              <div className="p-5 bg-pink-600 text-white flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center italic font-serif">R</div>
                  <span className="font-bold text-lg">دردشة رقة الذكية</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-2xl hover:rotate-90 transition">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex flex-col ${chat.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${chat.role === 'user' ? 'bg-pink-100 text-pink-900 self-start' : 'bg-white text-gray-800 self-end border border-pink-50'}`}>
                      {chat.content}
                    </div>
                    <button onClick={() => deleteChat(chat.id)} className="text-[10px] text-red-400 mt-1 mx-2 hover:font-bold">حذف الرد</button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t space-y-3">
                <div className="flex gap-2 justify-center pb-2 border-b border-gray-100">
                  <button onClick={() => document.getElementById('chatImg').click()} className="flex-1 py-2 bg-gray-50 rounded-xl text-xs hover:bg-pink-50 transition">🖼️ أرفقي صورة</button>
                  <button onClick={() => alert("فتح الكاميرا...")} className="flex-1 py-2 bg-gray-50 rounded-xl text-xs hover:bg-pink-50 transition">📷 الكاميرا</button>
                  <button onClick={() => alert("الميكروفون قيد التشغيل...")} className="flex-1 py-2 bg-gray-50 rounded-xl text-xs hover:bg-pink-50 transition">🎙️ بصمة صوت</button>
                  <input type="file" id="chatImg" className="hidden" />
                </div>
                <div className="flex gap-2">
                  <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="اكتبي سؤالك هنا لرقة..." className="flex-1 bg-gray-100 p-3 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400 text-sm" />
                  <button onClick={handleChat} className="bg-pink-600 text-white px-6 rounded-2xl font-bold hover:bg-pink-700 transition">إرسال</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
