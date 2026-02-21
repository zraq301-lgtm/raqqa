import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  Image as ImageIcon, Loader2, Smile 
} from 'lucide-react';

// --- تصحيح الاستيراد: التأكد من المسار src/pages/Swing-page ---
// ملاحظة: بما أن Swing.jsx في src/pages، فالدخول لـ Swing-page يكون بـ ./Swing-page/
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
    try { return JSON.parse(localStorage.getItem('raqqa_chats')) || []; } catch { return []; }
  });
  
  // حالات النشر
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [userInput, setUserInput] = useState('');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : (data.posts || []));
    } catch (err) { setPosts([]); }
  };

  const handlePublish = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      if (selectedImage) formData.append('file', selectedImage);
      
      const res = await fetch(`${API_BASE}/save-post`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setNewPostContent('');
        setSelectedImage(null);
        fetchPosts();
      }
    } catch (err) { console.error(err); } finally { setIsPublishing(false); }
  };

  const handleChat = async () => {
    if (!userInput.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          prompt: "أنتِ خبيرة اجتماعية في منتدى نسائي. ردي كصديقة مقربة وخبيرة في الطبخ، الأطفال، الجمال، والعلاقات. لغتكِ دافئة وداعمة للسيدات."
        })
      });
      const data = await res.json();
      const aiMsg = { id: Date.now() + 1, role: 'ai', content: data.reply || data.message };
      setChatHistory(prev => {
        const updated = [...prev, aiMsg];
        localStorage.setItem('raqqa_chats', JSON.stringify(updated));
        return updated;
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#fffcfd', minHeight: '100vh', fontFamily: 'system-ui, -apple-system' }}>
      
      {/* هيدر ثابت (أيقونة الذكاء في الأعلى) */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 1px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ color: '#D81B60', fontSize: '22px', fontWeight: 'bold' }}>رقة</div>
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            background: 'linear-gradient(45deg, #D81B60, #FF70A6)',
            border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <Sparkles size={20} />
        </button>
      </header>

      {/* شريط الأقسام (تم ضبط الـ top ليكون تحت الهيدر) */}
      <nav style={{
        position: 'fixed', top: '60px', left: 0, right: 0,
        backgroundColor: '#fff', borderBottom: '1px solid #eee',
        padding: '10px 0', overflowX: 'auto', display: 'flex', zIndex: 1050,
        whiteSpace: 'nowrap', scrollbarWidth: 'none'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} to={cat.path}
            style={{
              textDecoration: 'none', padding: '6px 15px', margin: '0 5px',
              borderRadius: '20px', fontSize: '13px', fontWeight: '600',
              color: location.pathname === cat.path ? '#fff' : '#D81B60',
              backgroundColor: location.pathname === cat.path ? '#D81B60' : '#fff0f5'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      {/* المحتوى الرئيسي */}
      <main style={{ paddingTop: '130px', maxWidth: '500px', margin: '0 auto', paddingBottom: '30px' }}>
        
        {/* كارت النشر (Add Post) */}
        {location.pathname === "/" && (
          <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #ffe4ec' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', flexShrink: 0 }}></div>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="أضيفي لمستكِ الخاصة هنا..."
                style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', minHeight: '60px', padding: '10px' }}
              />
            </div>
            {selectedImage && <img src={URL.createObjectURL(selectedImage)} style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
              <label style={{ cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ImageIcon size={20} /> <span style={{fontSize: '12px'}}>صورة</span>
                <input type="file" hidden accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
              </label>
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                style={{ background: '#D81B60', color: '#fff', border: 'none', padding: '6px 20px', borderRadius: '20px', cursor: 'pointer' }}
              >
                {isPublishing ? 'جاري النشر...' : 'نشر'}
              </button>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 10px' }}>
              {posts.map((post, i) => <PostCard key={i} post={post} />)}
            </div>
          } />
          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          ))}
        </Routes>
      </main>

      {/* نافذة الدردشة الخبيرة */}
      {isChatOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', height: '80%', backgroundColor: '#fff', borderRadius: '25px 25px 0 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '15px', background: '#D81B60', color: '#fff', display: 'flex', justifyContent: 'space-between', borderRadius: '25px 25px 0 0' }}>
              <span style={{ fontWeight: 'bold' }}>خبيرة رقة</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {chatHistory.map(m => (
                <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'user' ? '#f0f0f0' : '#ffe4ec', padding: '10px 15px', borderRadius: '15px', marginBottom: '10px', maxWidth: '80%', fontSize: '14px' }}>
                  {m.content}
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="اسألي خبيرة رقة..." style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }} />
              <button onClick={handleChat} style={{ background: '#D81B60', color: '#fff', border: 'none', borderRadius: '50%', width: '40px' }}><Send size={18}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// كارت المنشور مع تفعيل التعليقات
const PostCard = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [likes, setLikes] = useState(0);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '15px', border: '1px solid #f0f0f0' }}>
      <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>{post.content}</p>
      {post.file && <img src={post.file} style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} />}
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
        <button onClick={() => setLikes(l => l + 1)} style={{ background: 'none', border: 'none', color: '#777', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Heart size={18}/> {likes}
        </button>
        <button onClick={() => setCommentOpen(!commentOpen)} style={{ background: 'none', border: 'none', color: '#777', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MessageCircle size={18}/> تعليق
        </button>
        <button style={{ background: 'none', border: 'none', color: '#777' }}><Share2 size={18}/></button>
      </div>

      {commentOpen && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
          <input placeholder="اكتبي تعليقكِ..." style={{ flex: 1, background: '#f5f5f5', border: 'none', padding: '8px 12px', borderRadius: '15px', fontSize: '12px' }} />
          <button style={{ background: '#D81B60', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 10px' }}><Send size={14}/></button>
        </div>
      )}
    </div>
  );
};

export default Swing;
