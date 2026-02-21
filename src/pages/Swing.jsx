import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  Image as ImageIcon, Camera, Loader2 
} from 'lucide-react'; [cite: 1, 2]

// استيراد الأقسام العشرة بالامتداد .jsx المطلوب
import MotherhoodHaven from './Swing-page/MotherhoodHaven.jsx';
import LittleOnesAcademy from './Swing-page/LittleOnesAcademy.jsx';
import WellnessOasis from './Swing-page/WellnessOasis.jsx';
import EleganceIcon from './Swing-page/EleganceIcon.jsx';
import CulinaryArts from './Swing-page/CulinaryArts.jsx';
import HomeCorners from './Swing-page/HomeCorners.jsx';
import EmpowermentPaths from './Swing-page/EmpowermentPaths.jsx';
import HarmonyBridges from './Swing-page/HarmonyBridges.jsx';
import PassionsCrafts from './Swing-page/PassionsCrafts.jsx';
import SoulsLounge from './Swing-page/SoulsLounge.jsx'; [cite: 3, 4, 5]

const API_BASE = "https://raqqa-v6cd.vercel.app/api"; [cite: 5]

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
]; [cite: 6, 7]

const Swing = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('raqqa_chats')) || []; } catch { return []; }
  }); [cite: 8, 9]

  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [userInput, setUserInput] = useState(''); [cite: 10, 11]

  useEffect(() => { fetchPosts(); }, []); [cite: 11]

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : (data.posts || []));
    } catch (err) { setPosts([]); }
  }; [cite: 12, 13]

  const handlePublish = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      if (selectedImage) formData.append('file', selectedImage);
      formData.append('section', 'general');

      const res = await fetch(`${API_BASE}/save-post`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setNewPostContent('');
        setSelectedImage(null);
        fetchPosts();
      }
    } catch (err) { console.error("خطأ في الحفظ:", err); }
    finally { setIsPublishing(false); }
  }; [cite: 14, 15, 16, 17, 18, 19]

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
          context: "أنتِ خبيرة في منتدى نسائي، متخصصة في تربية الأطفال، الطبخ، الموضة، والدعم النفسي. ردي كصديقة حكيمة."
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
  }; [cite: 20, 21, 22, 23, 24, 25]

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#fff9fb', minHeight: '100vh', fontFamily: 'system-ui' }}>
      
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '65px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ color: '#D81B60', fontSize: '24px', fontWeight: '900' }}>رقة</div>
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            background: 'linear-gradient(45deg, #D81B60, #f06292)',
            border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(216, 27, 96, 0.3)'
          }}
        >
          <Sparkles size={22} />
        </button>
      </header> [cite: 25, 26, 27]

      <nav style={{
        position: 'fixed', top: '65px', left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #ffe4ec', padding: '12px 0', overflowX: 'auto', 
        display: 'flex', zIndex: 1050, whiteSpace: 'nowrap', scrollbarWidth: 'none'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none', padding: '8px 22px', margin: '0 6px',
              borderRadius: '25px', fontSize: '14px', fontWeight: 'bold',
              color: location.pathname === cat.path ? '#fff' : '#D81B60',
              backgroundColor: location.pathname === cat.path ? '#D81B60' : '#fff',
              border: '1px solid #D81B60', transition: '0.3s'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav> [cite: 28, 29, 30, 31]

      <main style={{ paddingTop: '150px', paddingBottom: '40px', maxWidth: '550px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '15px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', margin: '0 15px 25px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}></div>
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="شاركينا تجربتكِ أو سؤالكِ اليوم..."
              style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '15px', padding: '10px' }}
            />
          </div> [cite: 31, 32, 33, 34]
          
          {selectedImage && (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img src={URL.createObjectURL(selectedImage)} style={{ width: '100%', borderRadius: '15px' }} alt="preview" />
              <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: '5px' }}><X size={16}/></button>
            </div>
          )} [cite: 34, 35]

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', cursor: 'pointer', fontSize: '13px' }}>
              <ImageIcon size={20} color="#D81B60" />
              <span>صورة</span>
              <input type="file" hidden accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} />
            </label>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              style={{ background: '#D81B60', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              نشر
            </button>
          </div> [cite: 35, 36, 37, 38]
        </div>

        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 15px' }}>
              {posts.map((post, i) => <PostCard key={i} post={post} />)}
            </div>
          } />
          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          ))}
        </Routes> [cite: 38, 39]
      </main>

      {isChatOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', height: '85%', backgroundColor: '#fff', borderRadius: '30px 30px 0 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', background: '#D81B60', color: '#fff', borderRadius: '30px 30px 0 0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>استشارة الخبيرة</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {chatHistory.map(m => (
                <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'user' ? '#f0f0f0' : '#ffe4ec', padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '80%' }}>
                  {m.content}
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' }}>
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} placeholder="اكتبي سؤالك هنا..." style={{ flex: 1, padding: '10px 20px', borderRadius: '25px', border: '1px solid #ddd' }} />
              <button onClick={handleChat} style={{ background: '#D81B60', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%' }}><Send size={20}/></button>
            </div>
          </div>
        </div>
      )} [cite: 40, 41, 42, 43, 44]
    </div>
  );
};

// مكون المنشور مع تفعيل زر التعليق
const PostCard = ({ post }) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState([]); // لحفظ التعليقات محلياً

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setCommentsList([...commentsList, comment]);
    setComment('');
  }; [cite: 45, 46, 49]

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '18px', marginBottom: '20px', border: '1px solid #fdf0f4' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#fce4ec' }}></div>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>عضوة متألقة</span>
      </div>
      <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6' }}>{post.content}</p>
      {post.file && <img src={post.file} alt="post" style={{ width: '100%', borderRadius: '15px', marginTop: '10px' }} />} [cite: 46, 47]
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
        <button style={{ background: 'none', border: 'none', color: '#777', display: 'flex', gap: '5px', cursor: 'pointer' }}><Heart size={18}/> إعجاب</button>
        <button onClick={() => setShowCommentInput(!showCommentInput)} style={{ background: 'none', border: 'none', color: '#777', display: 'flex', gap: '5px', cursor: 'pointer' }}><MessageCircle size={18}/> تعليق</button>
        <button style={{ background: 'none', border: 'none', color: '#777', display: 'flex', gap: '5px', cursor: 'pointer' }}><Share2 size={18}/> مشاركة</button>
      </div> [cite: 47, 48]

      {/* عرض التعليقات المضافة */}
      {commentsList.map((c, index) => (
        <div key={index} style={{ background: '#f8f8f8', padding: '8px 12px', borderRadius: '12px', marginTop: '8px', fontSize: '13px' }}>
          {c}
        </div>
      ))}

      {showCommentInput && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
          <input 
            value={comment} 
            onChange={e => setComment(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendComment()}
            placeholder="اكتبي تعليقكِ..." 
            style={{ flex: 1, background: '#f8f8f8', border: 'none', padding: '8px 15px', borderRadius: '15px', fontSize: '13px' }}
          />
          <button 
            onClick={handleSendComment}
            style={{ background: '#D81B60', color: '#fff', border: 'none', borderRadius: '12px', padding: '5px 12px', cursor: 'pointer' }}
          >
            <Send size={14}/>
          </button>
        </div>
      )} [cite: 49]
    </div>
  );
}; [cite: 50]

export default Swing;
