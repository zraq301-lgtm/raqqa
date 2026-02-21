import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  Image as ImageIcon 
} from 'lucide-react';

// استيراد الصفحات - تم تصحيح المسار ليتناسب مع هيكلة المجلدات لديك
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
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('raqqa_chats');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : (data.posts || []));
    } catch (err) {
      setPosts([]);
    }
  };

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
          prompt: "أنتِ خبيرة اجتماعية في منتدى 'رقة' للسيدات. ردي كأنكِ صديقة مقربة ملمة بأمور الأطفال، الطبخ، الصحة النفسية، والجمال. كوني ودودة جداً وتفهمي طبيعة ثرثرة النساء واحتياجاتهن العاطفية."
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
    <div style={{ direction: 'rtl', backgroundColor: '#fff9fb', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* هيدر ثابت يحتوي على أيقونة الذكاء في الأعلى */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ color: '#D81B60', fontSize: '22px', fontWeight: '900' }}>رقة</div>
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            background: 'linear-gradient(45deg, #D81B60, #f06292)',
            border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '25px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          <Sparkles size={18} />
          <span>استشارة الخبيرة</span>
        </button>
      </header>

      {/* شريط الأقسام - تم إنزاله ليكون تحت الهيدر بوضوح (top: 60px) */}
      <nav style={{
        position: 'fixed', top: '60px', left: 0, right: 0,
        backgroundColor: '#fff', borderBottom: '1px solid #ffe4ec',
        padding: '12px 0', overflowX: 'auto', display: 'flex', zIndex: 1050,
        whiteSpace: 'nowrap', scrollbarWidth: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none', padding: '7px 20px', margin: '0 6px',
              borderRadius: '20px', fontSize: '14px', fontWeight: 'bold',
              color: location.pathname === cat.path ? '#fff' : '#D81B60',
              backgroundColor: location.pathname === cat.path ? '#D81B60' : '#fff0f5',
              border: '1px solid #ffe4ec', transition: '0.3s'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      {/* المحتوى الرئيسي */}
      <main style={{ paddingTop: '140px', paddingBottom: '50px', maxWidth: '600px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 15px' }}>
              {posts.length > 0 ? posts.map((post, i) => (
                <PostCard key={i} post={post} />
              )) : <div style={{textAlign:'center', color:'#999', marginTop:'50px'}}>جاري تحميل عالمكِ الجميل...</div>}
            </div>
          } />
          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          ))}
        </Routes>
      </main>

      {/* نافذة الدردشة الذكية */}
      {isChatOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', 
          zIndex: 2000, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            width: '100%', height: '85%', backgroundColor: '#fff', 
            borderRadius: '30px 30px 0 0', display: 'flex', flexDirection: 'column',
            boxShadow: '0 -5px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '20px', background: '#D81B60', color: '#fff', borderRadius: '30px 30px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#fff', padding: '5px', borderRadius: '50%', color: '#D81B60' }}><Sparkles size={20}/></div>
                <span style={{ fontWeight: 'bold' }}>رقة AI - مستشارتكِ الخاصة</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatHistory.map(m => (
                <div key={m.id} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.role === 'user' ? '#D81B60' : '#f0f0f0',
                  color: m.role === 'user' ? '#fff' : '#333',
                  padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  maxWidth: '80%', fontSize: '14px', lineHeight: '1.6'
                }}>
                  {m.content}
                </div>
              ))}
              {isTyping && <div style={{ fontSize: '12px', color: '#D81B60', animate: 'pulse' }}>الخبيرة تفكر في رد يليق بكِ...</div>}
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input 
                type="text" value={userInput} onChange={e => setUserInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleChat()}
                placeholder="اسألي عن التربية، الموضة، أو حتى بوحِ بسر..."
                style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' }}
              />
              <button onClick={handleChat} style={{ background: '#D81B60', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer' }}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// مكون المنشور مع التفاعلات المفعلة
const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 10);
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'منتدى رقة', text: post.content, url: window.location.href });
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '18px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #fdf0f4' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(45deg, #f06292, #ffb74d)', border: '2px solid #fff' }}></div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>سيدة رقيقة</div>
          <div style={{ fontSize: '11px', color: '#999' }}>منذ قليل</div>
        </div>
      </div>
      <p style={{ fontSize: '15px', color: '#444', marginBottom: '15px', lineHeight: '1.7' }}>{post.content}</p>
      {post.file && <img src={post.file} alt="محتوى" style={{ width: '100%', borderRadius: '15px', marginBottom: '15px' }} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f9f9f9', paddingTop: '12px' }}>
        <button 
          onClick={() => { setIsLiked(!isLiked); setLikes(prev => isLiked ? prev - 1 : prev + 1); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: isLiked ? '#D81B60' : '#777', cursor: 'pointer', transition: '0.2s' }}
        >
          <Heart size={20} fill={isLiked ? '#D81B60' : 'none'} />
          <span style={{fontWeight: 'bold'}}>{likes}</span>
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#777', cursor: 'pointer' }}>
          <MessageCircle size={20} />
          <span>تعليق</span>
        </button>
        <button 
          onClick={handleShare}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#777', cursor: 'pointer' }}
        >
          <Share2 size={20} />
          <span>مشاركة</span>
        </button>
      </div>
    </div>
  );
};

export default Swing;
