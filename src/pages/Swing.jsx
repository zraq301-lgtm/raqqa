import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';

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
  const [showComments, setShowComments] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) { console.error("Error:", e); }
  };

  // دالة النشر مع معالجة خطأ السيرفر
  const handlePublish = async () => {
    if (!content && !selectedFile) return alert("اكتبِ شيئاً أولاً..");
    setIsPublishing(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'bouh-display-1');
      formData.append('type', selectedFile ? 'صورة' : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE}/save-post`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('فشل في الاتصال بالسيرفر');
      
      alert('تم النشر بنجاح ✨');
      setContent('');
      setSelectedFile(null);
      fetchPosts();
    } catch (e) {
      alert("تأكدي من تثبيت @vercel/blob في السيرفر أو حاولي لاحقاً");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'رقة', text: post.content, url: window.location.href });
      } catch (e) { console.log(e); }
    } else { alert("تم نسخ الرابط!"); }
  };

  const handleChat = async () => {
    if (!userInput) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    const tempInput = userInput; setUserInput('');

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        data: { prompt: tempInput }
      });
      const aiMsg = { role: 'ai', content: res.data.reply || "معكِ دائماً..", id: Date.now() + 1 };
      setChatHistory(prev => {
        const updated = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(updated));
        return updated;
      });
    } catch (e) { alert("رقة منشغلة حالياً.."); }
  };

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-right font-sans pb-24" dir="rtl">
      <style>{`
        .writer-card { width: 92%; margin: 15px auto; background: #fff; border-radius: 25px; border: 2px solid #FFE4ED; padding: 18px; box-shadow: 0 8px 20px rgba(255, 182, 193, 0.1); }
        .post-card { width: 92%; margin: 0 auto 15px; background: #fff; border-radius: 25px; overflow: hidden; border: 1px solid #FFF5F7; }
        .ai-card { position: fixed; bottom: 80px; left: 4%; right: 4%; height: 60vh; background: white; z-index: 1000; border-radius: 30px; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); border: 2px solid #FFB6C1; display: flex; flex-direction: column; overflow: hidden; }
        .glass-btn { background: rgba(255,107,149,0.1); color: #D81B60; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; }
      `}</style>

      {/* Navigation */}
      <nav className="flex overflow-x-auto p-4 gap-3 sticky top-0 bg-white/80 backdrop-blur-md z-40 border-b border-pink-50">
        {["ملاذ الأمومة", "أكاديمية الصغار", "واحة العافية", "أيقونة الأناقة"].map((cat, i) => (
          <button key={i} className="flex-shrink-0 bg-white border border-pink-100 px-4 py-2 rounded-2xl text-[12px] font-bold text-pink-600">{cat}</button>
        ))}
      </nav>

      <main className="p-2">
        {/* كارت الكتابة المطور */}
        <div className="writer-card">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white text-lg">🌸</div>
               <span className="font-bold text-gray-700 italic">نادي رقة</span>
             </div>
             <button onClick={() => setIsChatOpen(true)} className="bg-gradient-to-r from-pink-500 to-rose-400 text-white px-4 py-2 rounded-xl text-[11px] font-bold shadow-md">✨ استشارة ذكية</button>
          </div>
          
          <textarea 
            value={content} onChange={e => setContent(e.target.value)}
            className="w-full h-24 p-3 bg-pink-50/30 rounded-2xl outline-none text-sm border border-transparent focus:border-pink-200"
            placeholder="اكتبي بوحكِ هنا يا جميلة... 🎀"
          />
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-pink-50">
            <div className="flex gap-4 text-pink-400">
              <label className="cursor-pointer text-xl">🖼️ <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} /></label>
              <button className="text-xl">🎙️</button>
            </div>
            <button onClick={handlePublish} className="bg-pink-600 text-white px-8 py-2 rounded-full font-bold text-sm">
              {isPublishing ? "جاري..." : "نشر"}
            </button>
          </div>
        </div>

        {/* المنشورات */}
        <div className="space-y-4 mt-6">
          {posts.map(p => (
            <div key={p.id} className="post-card shadow-sm">
              <div className="p-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100">🦋</div>
                <span className="font-bold text-gray-700 text-xs">رقة</span>
              </div>
              <p className="px-5 pb-3 text-gray-600 text-[14px] leading-relaxed">{p.content}</p>
              {p.media_url && <img src={p.media_url} className="w-full aspect-square object-cover" alt="Content" />}
              
              <div className="flex justify-around p-3 bg-pink-50/10 border-t border-pink-50">
                <button onClick={() => setLikes(v=>({...v, [p.id]:!v[p.id]}))} className="flex flex-col items-center">
                  <span className="text-xl">{likes[p.id] ? '❤️' : '🤍'}</span>
                  <span className="text-[10px] text-pink-500 font-bold">أحببت</span>
                </button>
                <button onClick={() => setShowComments(v=>({...v, [p.id]:!v[p.id]}))} className="flex flex-col items-center">
                  <span className="text-xl">💬</span>
                  <span className="text-[10px] text-pink-500 font-bold">حوار</span>
                </button>
                <button onClick={() => handleShare(p)} className="flex flex-col items-center">
                  <span className="text-xl">🔗</span>
                  <span className="text-[10px] text-pink-500 font-bold">مشاركة</span>
                </button>
              </div>

              {/* قسم التعليقات البسيط */}
              {showComments[p.id] && (
                <div className="p-3 bg-gray-50 border-t border-pink-50 animate-in slide-in-from-top duration-300">
                  <input className="w-full p-2 text-xs rounded-full border border-pink-100 outline-none" placeholder="اكتبي تعليقكِ..." />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* كارت الدردشة المستقل (Floating Chat Card) */}
      {isChatOpen && (
        <div className="ai-card animate-in fade-in zoom-in duration-300">
          <div className="p-4 border-b border-pink-100 flex justify-between items-center bg-pink-50/50">
            <span className="font-bold text-pink-600 italic">مستشارة رقة الأدبية ✨</span>
            <button onClick={() => setIsChatOpen(false)} className="text-pink-300 text-xl">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-[13px] shadow-sm ${
                  m.role === 'user' ? 'bg-white border border-pink-100' : 'bg-pink-600 text-white italic'
                }`}>
                  {m.content}
                </div>
                <button onClick={() => {
                  const updated = chatHistory.filter(msg => msg.id !== m.id);
                  setChatHistory(updated);
                  localStorage.setItem('raqqa_chats', JSON.stringify(updated));
                }} className="text-[9px] text-red-300 mt-1 mr-1">حذف 🗑️</button>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-pink-50 bg-white">
            <div className="flex justify-center gap-4 mb-3">
              <button className="text-lg bg-pink-50 w-9 h-9 rounded-full">📷</button>
              <button className="text-lg bg-pink-50 w-9 h-9 rounded-full">🎙️</button>
              <label className="text-lg bg-pink-50 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer">
                🖼️ <input type="file" className="hidden" />
              </label>
            </div>
            <div className="flex gap-2">
              <input 
                value={userInput} onChange={e => setUserInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-pink-50/50 rounded-full px-4 text-xs outline-none"
                placeholder="تحدثي مع رقة..."
              />
              <button onClick={handleChat} className="bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center">🕊️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swing;
