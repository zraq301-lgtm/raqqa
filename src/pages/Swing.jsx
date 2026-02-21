import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// ---- الإعدادات والثوابت ----
const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const CATEGORIES = [
  { ar: "الرئيسية", path: "/", color: "#D81B60" },
  { ar: "ملاذ الأمومة", path: "/MotherhoodHaven", color: "#E91E63" },
  { ar: "أكاديمية الصغار", path: "/LittleOnesAcademy", color: "#9C27B0" },
  { ar: "واحة العافية", path: "/WellnessOasis", color: "#00BCD4" },
  { ar: "أيقونة الأناقة", path: "/EleganceIcon", color: "#B76E79" },
  { ar: "فنون الطهي", path: "/CulinaryArts", color: "#FF5722" },
  { ar: "أركان المنزل", path: "/HomeCorners", color: "#795548" },
  { ar: "مسارات التمكين", path: "/EmpowermentPaths", color: "#FF9800" },
  { ar: "جسور الوئام", path: "/HarmonyBridges", color: "#F44336" },
  { ar: "حرف الشغف", path: "/PassionsCrafts", color: "#4CAF50" },
  { ar: "ردهة الأرواح", path: "/SoulsLounge", color: "#607D8B" },
];

// ---- مكونات الصفحات الفرعية (لحماية التطبيق من الانهيار) ----
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '20px', textAlign: 'center', marginTop: '100px' }}>
    <h2 style={{ color: '#D81B60' }}>{title}</h2>
    <p>محتوى القسم سيظهر هنا...</p>
  </div>
);

const Swing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('raqqa_chats');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  const [userInput, setUserInput] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // التمرير التلقائي للدردشة
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // جلب المنشورات
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : (data.posts || []));
    } catch (err) {
      console.error("خطأ في جلب البيانات", err);
      setPosts([]); // تفادي الشاشة البيضاء
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // وظيفة الدردشة
  const handleChat = async () => {
    if (!userInput.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: userInput };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setUserInput('');

    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      const data = await res.json();
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: data.reply || data.message };
      const finalHistory = [...updatedHistory, aiMsg];
      setChatHistory(finalHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(finalHistory));
    } catch (err) {
      console.error("AI Error");
    }
  };

  const deleteMsg = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'sans-serif', backgroundColor: '#fff5f7', minHeight: '100vh' }}>
      
      {/* 1. شريط الأقسام العلوي (Fixed Header) */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zUnit: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #ffe4ec',
        padding: '10px 0',
        overflowX: 'auto',
        display: 'flex',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none',
              padding: '8px 16px',
              margin: '0 5px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: location.pathname === cat.path ? '#fff' : cat.color,
              backgroundColor: location.pathname === cat.path ? cat.color : 'transparent',
              border: `1px solid ${cat.color}`,
              transition: 'all 0.3s ease'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      {/* محتوى الصفحة الرئيسي مع تعويض المساحة للعلو */}
      <div style={{ pt: '70px', padding: '80px 15px 100px' }}>
        <Routes>
          <Route path="/" element={
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/* واجهة النشر */}
              <div style={{ background: '#white', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ماذا يدور في ذهنك يا ملكة؟"
                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', minHeight: '80px', fontSize: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', pt: '10px' }}>
                   <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ fontSize: '12px' }} />
                   <button 
                    onClick={() => { /* وظيفة النشر */ }}
                    style={{ background: '#D81B60', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer' }}
                   >نشر</button>
                </div>
              </div>

              {/* عرض المنشورات */}
              {posts.length > 0 ? posts.map((post, i) => (
                <div key={i} style={{ background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #ffe4ec' }}>
                  <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6' }}>{post.content}</p>
                  {post.file && <img src={post.file} alt="post" style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} />}
                </div>
              )) : <div style={{ textAlign: 'center', color: '#888' }}>لا توجد منشورات حالياً</div>}
            </div>
          } />
          
          {/* مسارات الأقسام */}
          {CATEGORIES.map((cat, i) => (
             <Route key={i} path={cat.path} element={<PlaceholderPage title={cat.ar} />} />
          ))}
        </Routes>
      </div>

      {/* زر المساعدة الذكية العائم */}
      <button 
        onClick={() => setIsChatOpen(true)}
        style={{
          position: 'fixed', bottom: '30px', left: '30px',
          width: '60px', height: '60px', borderRadius: '50%',
          backgroundColor: '#D81B60', color: '#fff', border: 'none',
          boxShadow: '0 4px 15px rgba(216, 27, 96, 0.4)', cursor: 'pointer', zIndex: 999
        }}
      >
        ✨
      </button>

      {/* نافذة الدردشة */}
      {isChatOpen && (
        <div style={{
          position: 'fixed', bottom: '0', left: '0', right: '0', top: '0',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end'
        }}>
          <div style={{
            width: '100%', height: '80%', backgroundColor: '#fff', 
            borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#D81B60', color: '#fff', borderRadius: '20px 20px 0 0' }}>
              <span style={{ fontWeight: 'bold' }}>مساعدة رقة الذكية</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
              {chatHistory.map(m => (
                <div key={m.id} style={{ marginBottom: '15px', textAlign: m.role === 'user' ? 'left' : 'right' }}>
                  <div style={{
                    display: 'inline-block', padding: '10px 15px', borderRadius: '15px',
                    backgroundColor: m.role === 'user' ? '#f0f0f0' : '#D81B60',
                    color: m.role === 'user' ? '#333' : '#fff',
                    maxWidth: '80%', fontSize: '14px'
                  }}>
                    {m.content}
                  </div>
                  <div onClick={() => deleteMsg(m.id)} style={{ fontSize: '10px', color: '#ff4d4d', cursor: 'pointer', marginTop: '4px' }}>حذف</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                placeholder="اسألي رقة عن أي شيء..."
                style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' }}
              />
              <button onClick={handleChat} style={{ background: '#D81B60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '25px' }}>إرسال</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Swing;
