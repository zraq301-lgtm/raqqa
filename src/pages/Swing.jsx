import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  Image as ImageIcon, Loader2 
} from 'lucide-react';

// استيراد الأقسام من المسار الصحيح: src/pages/SwingPage
import MotherhoodHaven from './SwingPage/MotherhoodHaven.jsx';
import LittleOnesAcademy from './SwingPage/LittleOnesAcademy.jsx';
import WellnessOasis from './SwingPage/WellnessOasis.jsx';
import EleganceIcon from './SwingPage/EleganceIcon.jsx';
import CulinaryArts from './SwingPage/CulinaryArts.jsx';
import HomeCorners from './SwingPage/HomeCorners.jsx';
import EmpowermentPaths from './SwingPage/EmpowermentPaths.jsx';
import HarmonyBridges from './SwingPage/HarmonyBridges.jsx';
import PassionsCrafts from './SwingPage/PassionsCrafts.jsx';
import SoulsLounge from './SwingPage/SoulsLounge.jsx';

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handlePublish = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      if (selectedImage) formData.append('file', selectedImage);
      formData.append('section', 'general');
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (res.ok) {
        setNewPostContent('');
        setSelectedImage(null);
        fetchPosts();
      }
    } catch (err) { console.error(err); }
    finally { setIsPublishing(false); }
  };

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#fff9fb', minHeight: '100vh', fontFamily: 'system-ui' }}>
      
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '65px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ color: '#D81B60', fontSize: '24px', fontWeight: '900' }}>رقة</div>
        <div style={{ color: '#D81B60' }}><Sparkles /></div>
      </header>

      <nav style={{
        position: 'fixed', top: '65px', left: 0, right: 0,
        backgroundColor: '#fff', borderBottom: '1px solid #ffe4ec', padding: '10px 0', 
        overflowX: 'auto', display: 'flex', zIndex: 1050, whiteSpace: 'nowrap', scrollbarWidth: 'none'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link key={index} to={cat.path} style={{
            textDecoration: 'none', padding: '8px 18px', margin: '0 5px',
            borderRadius: '20px', fontSize: '13px', fontWeight: 'bold',
            color: location.pathname === cat.path ? '#fff' : '#D81B60',
            backgroundColor: location.pathname === cat.path ? '#D81B60' : '#fff',
            border: '1px solid #D81B60'
          }}>
            {cat.ar}
          </Link>
        ))}
      </nav>

      <main style={{ paddingTop: '140px', paddingBottom: '40px', maxWidth: '500px', margin: '0 auto', paddingLeft: '15px', paddingRight: '15px' }}>
        <Routes>
          <Route path="/" element={
            <>
              {/* صندوق النشر */}
              <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="شاركينا ما يدور في خاطركِ..."
                  style={{ width: '100%', border: 'none', outline: 'none', minHeight: '60px', resize: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <input type="file" id="upload" hidden onChange={(e) => setSelectedImage(e.target.files[0])} />
                  <label htmlFor="upload" style={{ cursor: 'pointer' }}><ImageIcon color="#D81B60" /></label>
                  <button onClick={handlePublish} disabled={isPublishing} style={{ background: '#D81B60', color: '#fff', border: 'none', padding: '5px 20px', borderRadius: '20px', cursor: 'pointer' }}>
                    {isPublishing ? <Loader2 className="animate-spin" size={16} /> : 'نشر'}
                  </button>
                </div>
              </div>

              {posts.map((post, i) => <PostCard key={i} post={post} />)}
            </>
          } />

          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          ))}
        </Routes>
      </main>
    </div>
  );
};

const PostCard = ({ post }) => {
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleSend = () => {
    if (!comment.trim()) return;
    setComments([...comments, comment]);
    setComment('');
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
      <p style={{ fontSize: '15px' }}>{post.content}</p>
      {post.file && <img src={post.file} style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} alt="post" />}
      <div style={{ marginTop: '15px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
        <button onClick={() => setShowInput(!showInput)} style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <MessageCircle size={18} /> تعليق
        </button>
      </div>

      {comments.map((c, i) => (
        <div key={i} style={{ background: '#f8f8f8', padding: '8px', borderRadius: '10px', marginTop: '5px', fontSize: '13px' }}>{c}</div>
      ))}

      {showInput && (
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <input 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتبي تعليقاً..."
            style={{ flex: 1, background: '#f0f2f5', border: 'none', padding: '8px 15px', borderRadius: '20px' }}
          />
          <button onClick={handleSend} style={{ background: '#D81B60', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px' }}><Send size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default Swing;
