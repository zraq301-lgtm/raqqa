import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  ChevronRight, ChevronLeft, Image as ImageIcon 
} from 'lucide-react';

// استيراد الصفحات من المسار المحدد
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

const CATEGORIES = [
  { ar: "الرئيسية", path: "/", component: null },
  { ar: "ملاذ الأمومة", path: "/MotherhoodHaven", component: <MotherhoodHaven /> },
  { ar: "أكاديمية الصغار", path: "/LittleOnesAcademy", component: <LittleOnesAcademy /> },
  { ar: "واحة العافية", path: "/WellnessOasis", component: <WellnessOasis /> },
  { ar: "أيقونة الأناقة", path: "/EleganceIcon", component: <EleganceIcon /> },
  { ar: "فنون الطهي", path: "/CulinaryArts", component: <CulinaryArts /> },
  { ar: "أركان المنزل", path: "/HomeCorners", component: <HomeCorners /> },
  { ar: "مسارات التمكين", path: "/EmpowermentPaths", component: <EmpowermentPaths /> },
  { ar: "جسور الوئام", path: "/HarmonyBridges", component: <HarmonyBridges /> },
  { ar: "حرف الشغف", path: "/PassionsCrafts", component: <PassionsCrafts /> },
  { ar: "ردهة الأرواح", path: "/SoulsLounge", component: <SoulsLounge /> },
];

const Swing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('raqqa_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // جلب المنشورات مع تلافي خطأ الصفحة البيضاء
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE}/get-posts`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : (data.posts || []));
      } catch (err) {
        console.error("Fetch Error:", err);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  // تفعيل الذكاء الاصطناعي بالشخصية المطلوبة
  const handleChat = async () => {
    if (!userInput.trim()) return;
    
    const userMsg = { id: Date.now(), role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          system_prompt: "أنتِ خبيرة متخصصة في منتدى سيدات. ردي بأسلوب صديقة مقربة، خبيرة في تربية الأطفال، فنون الطبخ، الموضة، الصحة النفسية، والعلاقات الزوجية. لغتكِ دافئة، تفهم ثرثرة النساء واحتياجاتهن الخاصة وتفاصيل حياتهن اليومية."
        })
      });
      const data = await res.json();
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: data.reply || data.message };
      setChatHistory(prev => [...prev, aiMsg]);
      localStorage.setItem('raqqa_chats', JSON.stringify([...chatHistory, userMsg, aiMsg]));
    } catch (err) {
      console.error("AI Error");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#fff9fb', minHeight: '100vh' }}>
      
      {/* 1. الهيدر العلوي ويحتوي على أيقونة الذكاء */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1001,
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ color: '#D81B60', fontSize: '20px', fontWeight: 'bold' }}>رقة</h1>
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            background: 'linear-gradient(45deg, #D81B60, #FF4081)',
            border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(216, 27, 96, 0.3)'
          }}
        >
          <Sparkles size={18} />
          <span style={{ fontSize: '14px' }}>اسألي خبيرة رقة</span>
        </button>
      </header>

      {/* 2. شريط الأقسام - تم إنزاله قليلاً (marginTop) لعدم التغطية */}
      <nav style={{
        position: 'fixed', top: '60px', left: 0, right: 0,
        backgroundColor: '#fff', borderBottom: '1px solid #eee',
        padding: '10px 0', overflowX: 'auto', display: 'flex', zIndex: 1000,
        whiteSpace: 'nowrap', scrollbarWidth: 'none'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none', padding: '6px 18px', margin: '0 5px',
              borderRadius: '15px', fontSize: '14px', fontWeight: '500',
              color: location.pathname === cat.path ? '#fff' : '#666',
              backgroundColor: location.pathname === cat.path ? '#D81B60' : '#f5f5f5',
              transition: 'all 0.3s'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      {/* 3. محتوى الصفحات */}
      <main style={{ paddingTop: '130px', paddingBottom: '30px', maxWidth: '600px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 15px' }}>
              {posts.map((post, i) => (
                <PostCard key={i} post={post} />
              ))}
            </div>
          } />
          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          ))}
        </Routes>
      </main>

      {/* 4. نافذة الدردشة */}
      {isChatOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 2000, display: 'flex', alignItems: 'flex-end'
        }}>
          <div style={{
            width: '100%', height: '90%', backgroundColor: '#fff', 
            borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px', background: '#D81B60', color: '#fff', borderRadius: '25px 25px 0 0', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles />
                <div>
                  <div style={{ fontWeight: 'bold' }}>خبيرة رقة الذكية</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>متصلة الآن لمساعدتكِ</div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {chatHistory.map(m => (
                <div key={m.id} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end',
                  backgroundColor: m.role === 'user' ? '#f0f0f0' : '#ffe4ec',
                  padding: '12px 16px', borderRadius: '18px', maxWidth: '85%',
                  fontSize: '14px', lineHeight: '1.5', color: '#333'
                }}>
                  {m.content}
                </div>
              ))}
              {isTyping && <div style={{ fontSize: '12px', color: '#D81B60' }}>الخبيرة تكتب الآن...</div>}
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input 
                type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                placeholder="اسألي عن الطبخ، الأطفال، أو جمالك..."
                style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none' }}
              />
              <button onClick={handleChat} style={{ background: '#D81B60', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// مكون المنشور مع أزرار التفاعل
const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50));
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFC107' }}></div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>عضوة رقة</div>
      </div>
      <p style={{ fontSize: '15px', color: '#444', marginBottom: '15px', lineHeight: '1.6' }}>{post.content}</p>
      {post.file && <img src={post.file} alt="post" style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }} />}
      
      {/* أزرار التفاعل */}
      <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #f9f9f9', pt: '10px' }}>
        <button 
          onClick={() => { setIsLiked(!isLiked); setLikes(prev => isLiked ? prev - 1 : prev + 1); }}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: isLiked ? '#D81B60' : '#666', cursor: 'pointer' }}
        >
          <Heart size={20} fill={isLiked ? '#D81B60' : 'none'} />
          <span>{likes}</span>
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#666' }}>
          <MessageCircle size={20} />
          <span>تعليق</span>
        </button>
        <button 
          onClick={() => navigator.share?.({ title: 'منتدى رقة', text: post.content, url: window.location.href })}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#666' }}
        >
          <Share2 size={20} />
          <span>مشاركة</span>
        </button>
      </div>
    </div>
  );
};

export default Swing;
