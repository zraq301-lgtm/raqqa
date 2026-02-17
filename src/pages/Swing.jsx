import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات من المسار المحدد
import MotherhoodHaven from './pages/Swing/MotherhoodHaven';
import LittleOnesAcademy from './pages/Swing/LittleOnesAcademy';
import WellnessOasis from './pages/Swing/WellnessOasis';
import EleganceIcon from './pages/Swing/EleganceIcon';
import CulinaryArts from './pages/Swing/CulinaryArts';
import HomeCorners from './pages/Swing/HomeCorners';
import EmpowermentPaths from './pages/Swing/EmpowermentPaths';
import HarmonyBridges from './pages/Swing/HarmonyBridges';
import PassionsCrafts from './pages/Swing/PassionsCrafts';
import SoulsLounge from './pages/Swing/SoulsLounge';

const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('raqqa_chats')) || []);
  const [userInput, setUserInput] = useState('');

  const categories = [
    { ar: "ملاذ الأمومة", path: "Motherhood-Haven" },
    { ar: "أكاديمية الصغار", path: "Little-Ones-Academy" },
    { ar: "واحة العافية", path: "Wellness-Oasis" },
    { ar: "أيقونة الأناقة", path: "Elegance-Icon" },
    { ar: "فن الطهي", path: "Culinary-Arts" },
    { ar: "زوايا البيت", path: "Home-Corners" },
    { ar: "مسارات التمكين", path: "Empowerment-Paths" },
    { ar: "جسور المودة", path: "Harmony-Bridges" },
    { ar: "شغف وحرف", path: "Passions-Crafts" },
    { ar: "ملتقى الأرواح", path: "Souls-Lounge" }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(response.data.posts || []);
    } catch (err) { console.error("Error fetching posts", err); }
  };

  // دالة الدردشة مع رقة AI
  const handleChat = async () => {
    if (!userInput) return;
    const newMessage = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, newMessage]);
    setUserInput('');

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة أبحث عن نصيحة: ${userInput}` }
      };
      const response = await CapacitorHttp.post(options);
      const aiReply = { 
        role: 'ai', 
        content: response.data.reply || response.data.message, 
        id: Date.now() + 1 
      };
      const updatedHistory = [...chatHistory, newMessage, aiReply];
      setChatHistory(updatedHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(updatedHistory));
    } catch (err) {
      alert("عذراً، واجهت رقة مشكلة في الاتصال.");
    }
  };

  const deleteChat = (id) => {
    const filtered = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
        
        {/* شريط العناوين المتحرك */}
        <div className="bg-pink-600 text-white py-2 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block text-sm font-bold">
            {categories.map((cat, i) => (
              <Link key={i} to={`/Swing/${cat.path}`} className="mx-6 hover:text-pink-200">
                {cat.ar}
              </Link>
            ))}
          </div>
        </div>

        <main className="max-w-4xl mx-auto p-4">
          <Routes>
            <Route path="/" element={
              <>
                {/* كروت المحتوى الجديد */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {posts.slice(0, 2).map((post, i) => (
                    <div key={i} className="bg-gradient-to-l from-pink-500 to-rose-400 text-white p-5 rounded-2xl shadow-lg border-b-4 border-rose-600 animate-pulse">
                      <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">جديد الآن ✨</span>
                      <p className="mt-2 line-clamp-2 font-medium">{post.content}</p>
                    </div>
                  ))}
                </div>

                {/* عرض المحتوى العام (التايم لاين) */}
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="text-pink-600 font-bold text-sm mb-2">{post.section}</h4>
                      <p className="text-gray-700">{post.content}</p>
                      {post.media_url && <img src={post.media_url} className="mt-3 rounded-lg w-full object-cover max-h-64" alt="Post" />}
                    </div>
                  ))}
                </div>
              </>
            } />

            {/* مسارات الصفحات العشرة */}
            <Route path="/Swing/Motherhood-Haven" element={<MotherhoodHaven />} />
            <Route path="/Swing/Little-Ones-Academy" element={<LittleOnesAcademy />} />
            <Route path="/Swing/Wellness-Oasis" element={<WellnessOasis />} />
            <Route path="/Swing/Elegance-Icon" element={<EleganceIcon />} />
            <Route path="/Swing/Culinary-Arts" element={<CulinaryArts />} />
            <Route path="/Swing/Home-Corners" element={<HomeCorners />} />
            <Route path="/Swing/Empowerment-Paths" element={<EmpowermentPaths />} />
            <Route path="/Swing/Harmony-Bridges" element={<HarmonyBridges />} />
            <Route path="/Swing/Passions-Crafts" element={<PassionsCrafts />} />
            <Route path="/Swing/Souls-Lounge" element={<SoulsLounge />} />
          </Routes>
        </main>

        {/* الزر العائم للدردشة */}
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 left-6 bg-pink-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
        >
          💬 اسألي رقة
        </button>

        {/* نافذة الدردشة */}
        {isChatOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 bg-pink-600 text-white flex justify-between items-center">
                <span className="font-bold">مساعدة رقة الذكية</span>
                <button onClick={() => setIsChatOpen(false)}>✕</button>
              </div>

              {/* منطقة الرسائل وحفظ الردود */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex flex-col ${chat.role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${chat.role === 'user' ? 'bg-pink-100 text-pink-800' : 'bg-white text-gray-800 border'}`}>
                      {chat.content}
                    </div>
                    <button onClick={() => deleteChat(chat.id)} className="text-[10px] text-red-400 mt-1 hover:underline">حذف</button>
                  </div>
                ))}
              </div>

              {/* أزرار التحكم والوسائط */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                  <button onClick={() => document.getElementById('chatFile').click()} className="bg-gray-100 p-2 rounded-lg text-xs">🖼️ صورة</button>
                  <button onClick={() => alert("فتح الكاميرا...")} className="bg-gray-100 p-2 rounded-lg text-xs">📷 كاميرا</button>
                  <button onClick={() => alert("تسجيل صوتي...")} className="bg-gray-100 p-2 rounded-lg text-xs">🎙️ ميك</button>
                  <input type="file" id="chatFile" className="hidden" />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="اكتبي سؤالك هنا..."
                    className="flex-1 border p-2 rounded-xl outline-none focus:border-pink-500"
                  />
                  <button onClick={handleChat} className="bg-pink-600 text-white px-4 rounded-xl font-bold">إرسال</button>
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
