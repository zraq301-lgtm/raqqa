import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  Image as ImageIcon, Loader2 
} from 'lucide-react';

// 1. استيراد الأقسام - تأكدي أن هذه الملفات موجودة في مجلد SwingPage ولديها export default
import MotherhoodHaven from './SwingPage/MotherhoodHaven.jsx';
import LittleOnesAcademy from './SwingPage/LittleOnesAcademy.jsx';
import WellnessOasis from './SwingPage/WellnessOasis.jsx';
import EleganceIcon from './SwingPage/EleganceIcon.jsx';
// إذا كانت صفحة الطهي محذوفة، قومي بتعطيل السطر أدناه بوضع // قبله
import CulinaryArts from './SwingPage/CulinaryArts.jsx'; 
import HomeCorners from './SwingPage/HomeCorners.jsx';
import EmpowermentPaths from './SwingPage/EmpowermentPaths.jsx';
import HarmonyBridges from './SwingPage/HarmonyBridges.jsx';
import PassionsCrafts from './SwingPage/PassionsCrafts.jsx';
import SoulsLounge from './SwingPage/SoulsLounge.jsx';

const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const Swing = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // تعريف الأقسام داخل المكون لضمان التوافق
  const CATEGORIES = [
    { ar: "الرئيسية", path: "/Swing", component: null }, // تم تعديل المسار ليناسب نظام الصفحات لديكِ
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
      const res = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (res.ok) {
        setNewPostContent('');
        setSelectedImage(null);
        fetchPosts();
      }
    } catch (err) { console.error(err); } finally { setIsPublishing(false); }
  };

  return (
    <div style={{ direction: 'rtl', backgroundColor: 'var(--soft-bg)', minHeight: '100vh' }}>
      
      {/* هيدر علوي متوافق مع App.css */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '65px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderBottom: '2px solid var(--female-pink-light)'
      }}>
        <div style={{ color: 'var(--female-pink)', fontSize: '24px', fontWeight: '900' }}>رقة</div>
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            background: 'linear-gradient(45deg, var(--female-pink), #f06292)',
            border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}
        >
          <Sparkles size={22} />
        </button>
      </header>

      {/* ناف بار الأقسام */}
      <nav style={{
        position: 'fixed', top: '65px', left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--female-pink-light)', padding: '12px 0', overflowX: 'auto', 
        display: 'flex', zIndex: 1050, whiteSpace: 'nowrap', scrollbarWidth: 'none'
      }}>
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none', padding: '8px 22px', margin: '0 6px',
              borderRadius: '25px', fontSize: '14px', fontWeight: 'bold',
              color: location.pathname === cat.path ? '#fff' : 'var(--female-pink)',
              backgroundColor: location.pathname === cat.path ? 'var(--female-pink)' : '#fff',
              border: '1px solid var(--female-pink)', transition: '0.3s'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      <main style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '550px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 15px' }}>
              {/* صندوق النشر */}
              <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '15px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="شاركينا تجربتكِ..."
                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', height: '80px', fontSize: '15px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                   <label style={{ cursor: 'pointer' }}>
                      <ImageIcon color="var(--female-pink)" />
                      <input type="file" hidden onChange={(e) => setSelectedImage(e.target.files[0])} />
                   </label>
                   <button onClick={handlePublish} style={{ backgroundColor: 'var(--female-pink)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px' }}>
                      {isPublishing ? <Loader2 className="animate-spin" /> : 'نشر'}
                   </button>
                </div>
              </div>
              {posts.map((post, i) => <PostCard key={i} post={post} />)}
            </div>
          } />
          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          ))}
        </Routes>
      </main>
    </div>
  );
};

const PostCard = ({ post }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '15px', marginBottom: '15px', border: '1px solid var(--female-pink-light)' }}>
    <p>{post.content}</p>
    {post.file && <img src={post.file} style={{ width: '100%', borderRadius: '15px' }} />}
  </div>
);

export default Swing;
