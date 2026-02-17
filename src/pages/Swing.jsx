import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

// استيراد الصفحات العشرة
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

  // قائمة الأقسام العشرة باللغة العربية
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

  // جلب المنشورات من نيون [cite: 9]
  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) { console.error("Fetch error", e); }
  };

  // حفظ المنشور (نص وصورة) [cite: 11]
  const handleSavePost = async () => {
    if (!content && !selectedFile) return alert("الرجاء إضافة نص أو صورة");
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الرئيسية');
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);

      // استخدام fetch للرفع لأن FormData تتطلب معالجة خاصة في المتصفح/الجوال
      const response = await fetch(`${API_BASE}/save-post`, { 
        method: 'POST', 
        body: formData 
      });
      
      if (response.ok) {
        setContent(''); 
        setSelectedFile(null); 
        fetchPosts(); 
        alert("تم النشر بنجاح!");
      }
    } catch (e) { alert("فشل النشر: " + e.message); }
  };

  // منطق الاتصال بذكاء رقة الاصطناعي عبر CapacitorHttp [cite: 16]
  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const currentInput = userInput;
    setUserInput('');

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${currentInput}` }
      };

      const res = await CapacitorHttp.post(options);
      const aiMsg = { role: 'ai', content: res.data.reply || res.data.message, id: Date.now() + 1 };
      
      const newHistory = [...chatHistory, userMsg, aiMsg];
      setChatHistory(newHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(newHistory));
    } catch (e) { 
      console.error("فشل الاتصال الأصلي:", e);
      alert("حدث خطأ في الشبكة، تأكدي من الاتصال بالإنترنت."); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans" dir="rtl">
      {/* شريط الأقسام المتحرك (Marquee) */}
      <div className="bg-pink-600 text-white py-3 overflow-hidden shadow-md sticky top-0 z-40">
        <div className="flex animate-marquee whitespace-nowrap">
          {categories.map((c, i) => (
            <Link key={i} to={`/Swing/${c.path}`} className="mx-8 font-bold hover:text-pink-200 transition-colors">
              {c.ar}
            </Link>
          ))}
          {/* تكرار القائمة لضمان انسيابية الحركة */}
          {categories.map((c, i) => (
            <Link key={`dup-${i}`} to={`/Swing/${c.path}`} className="mx-8 font-bold hover:text-pink-200 transition-colors">
              {c.ar}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق إضافة منشور جديد */}
              <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 border border-pink-100">
                <h3 className="text-pink-600 font-bold mb-3">شاركي مجتمع رقة ✨</h3>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none border focus:border-pink-300 transition-all" 
                  placeholder="ماذا يدور في ذهنكِ اليوم؟"
                  rows="3"
                />
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-pink-50 text-pink-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-pink-100">
                      إرفاق صورة 🖼️
                      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
                    </label>
                    {selectedFile && <span className="text-[10px] text-gray-500">{selectedFile.name}</span>}
                  </div>
                  <button onClick={handleSavePost} className="bg-pink-600 text-white px-10 py-2 rounded-xl text-sm font-bold shadow-lg shadow-pink-200 hover:bg-pink-700 w-full sm:w-auto">
                    نشر في المنتدى
                  </button>
                </div>
              </div>

              {/* عرض المنشورات من نيون */}
              <div className="grid grid-cols-1 gap-6">
                {posts.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-xs">🌸</div>
                      <span className="text-xs font-bold text-gray-500">{new Date(p.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed mb-4">{p.content}</p>
                    {p.media_url && (
                      <img src={p.media_url} className="rounded-2xl w-full max-h-[450px] object-cover border border-gray-50" alt="محتوى المنشور" />
                    )}
                  </div>
                ))}
              </div>
            </>
          } />

          {/* مسارات الصفحات العشرة */}
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

      {/* زر الدردشة العائم */}
      <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 left-6 bg-pink-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 hover:scale-110 transition-transform animate-bounce">💬</button>

      {/* مودال الدردشة المحسن */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md h-[90vh] sm:h-[80vh] rounded-t-[2rem] sm:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-pink-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold">رقة AI (مساعدتكِ الذكية)</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-pink-50/20">
              {chatHistory.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-2xl text-sm max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-white text-gray-800 rounded-tr-none' : 'bg-pink-500 text-white rounded-tl-none'}`}>
                    {m.content}
                  </div>
                  <button onClick={() => {
                    const filtered = chatHistory.filter(msg => msg.id !== m.id);
                    setChatHistory(filtered);
                    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
                  }} className="text-[10px] text-red-300 mt-1 mx-2">حذف</button>
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
                  className="flex-1 border border-pink-100 p-3 rounded-2xl text-sm outline-none focus:border-pink-500 bg-gray-50" 
                  placeholder="اسألي رقة عن أي شيء..." 
                />
                <button onClick={handleChat} className="bg-pink-600 text-white px-5 rounded-2xl hover:bg-pink-700 transition-colors">إرسال</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
