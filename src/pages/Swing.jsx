[cite_start]import React, { useState, useEffect, useRef } from 'react'; [cite: 1]
[cite_start]import { Routes, Route, Link, useLocation } from 'react-router-dom'; [cite: 1]
import { 
  Heart, MessageCircle, Share2, Send, Sparkles, X, 
  Image as ImageIcon, Camera, Loader2 
[cite_start]} from 'lucide-react'; [cite: 2]

// استيراد الأقسام العشرة بالأسماء المطلوبة
[cite_start]import MotherhoodHaven from './Swing-page/MotherhoodHaven.jsx'; [cite: 3]
[cite_start]import LittleOnesAcademy from './Swing-page/LittleOnesAcademy.jsx'; [cite: 3]
[cite_start]import WellnessOasis from './Swing-page/WellnessOasis.jsx'; [cite: 3]
[cite_start]import EleganceIcon from './Swing-page/EleganceIcon.jsx'; [cite: 4]
[cite_start]import CulinaryArts from './Swing-page/CulinaryArts.jsx'; [cite: 4]
[cite_start]import HomeCorners from './Swing-page/HomeCorners.jsx'; [cite: 4]
[cite_start]import EmpowermentPaths from './Swing-page/EmpowermentPaths.jsx'; [cite: 4]
[cite_start]import HarmonyBridges from './Swing-page/HarmonyBridges.jsx'; [cite: 4]
[cite_start]import PassionsCrafts from './Swing-page/PassionsCrafts.jsx'; [cite: 5]
[cite_start]import SoulsLounge from './Swing-page/SoulsLounge.jsx'; [cite: 5]

[cite_start]const API_BASE = "https://raqqa-v6cd.vercel.app/api"; [cite: 5]

const CATEGORIES = [
  { ar: "الرئيسية", path: "/", component: null },
  { ar: "ملاذ الأمومة", path: "/MotherhoodHaven", component: <MotherhoodHaven /> },
  { ar: "أكاديمية الصغار", path: "/LittleOnesAcademy", component: <LittleOnesAcademy /> },
  { ar: "واحة العافية", path: "/WellnessOasis", component: <WellnessOasis /> },
  { ar: "أيقونة الأناقة", path: "/EleganceIcon", component: <EleganceIcon /> },
  { ar: "فنون الطهي", path: "/CulinaryArts", component: <CulinaryArts /> },
  { ar: "أركان المنزل", path: "/HomeCorners", component: <HomeCorners /> },
  { ar: "مسارات التمكين", path: "/EmpowermentPaths", component: <EmpowermentPaths /> },
  [cite_start]{ ar: "جسور الوئام", path: "/HarmonyBridges", component: <HarmonyBridges /> }, [cite: 6, 7]
  { ar: "حرف الشغف", path: "/PassionsCrafts", component: <PassionsCrafts /> },
  { ar: "ردهة الأرواح", path: "/SoulsLounge", component: <SoulsLounge /> },
[cite_start]]; [cite: 7]

const Swing = () => {
  [cite_start]const location = useLocation(); [cite: 8]
  [cite_start]const [posts, setPosts] = useState([]); [cite: 8]
  [cite_start]const [isChatOpen, setIsChatOpen] = useState(false); [cite: 9]
  const [chatHistory, setChatHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('raqqa_chats')) || []; } catch { return []; }
  [cite_start]}); [cite: 9]

  [cite_start]const [newPostContent, setNewPostContent] = useState(''); [cite: 10]
  [cite_start]const [selectedImage, setSelectedImage] = useState(null); [cite: 10]
  [cite_start]const [isPublishing, setIsPublishing] = useState(false); [cite: 10]
  [cite_start]const [userInput, setUserInput] = useState(''); [cite: 11]

  [cite_start]useEffect(() => { fetchPosts(); }, []); [cite: 11]

  const fetchPosts = async () => {
    try {
      [cite_start]const res = await fetch(`${API_BASE}/get-posts`); [cite: 12]
      [cite_start]const data = await res.json(); [cite: 13]
      [cite_start]setPosts(Array.isArray(data) ? data : (data.posts || [])); [cite: 13]
    } catch (err) { setPosts([]); }
  };

  const handlePublish = async () => {
    [cite_start]if (!newPostContent.trim() && !selectedImage) return; [cite: 14]
    [cite_start]setIsPublishing(true); [cite: 15]
    try {
      const formData = new FormData();
      [cite_start]formData.append('content', newPostContent); [cite: 15]
      [cite_start]if (selectedImage) formData.append('file', selectedImage); [cite: 15]
      [cite_start]formData.append('section', 'general'); [cite: 16]

      const res = await fetch(`${API_BASE}/save-post`, {
        method: 'POST',
        body: formData,
      [cite_start]}); [cite: 16]
      if (res.ok) {
        [cite_start]setNewPostContent(''); [cite: 17]
        [cite_start]setSelectedImage(null); [cite: 17]
        [cite_start]fetchPosts(); [cite: 17]
      }
    } catch (err) {
      [cite_start]console.error("خطأ في الحفظ:", err); [cite: 18]
    } finally {
      [cite_start]setIsPublishing(false); [cite: 19]
    }
  };

  const handleChat = async () => {
    [cite_start]if (!userInput.trim()) return; [cite: 20]
    [cite_start]const userMsg = { id: Date.now(), role: 'user', content: userInput }; [cite: 21]
    [cite_start]setChatHistory(prev => [...prev, userMsg]); [cite: 21]
    [cite_start]setUserInput(''); [cite: 21]
    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          context: "أنتِ خبيرة في منتدى نسائي، متخصصة في تربية الأطفال، الطبخ، الموضة، والدعم النفسي. ردي كصديقة حكيمة."
        })
      [cite_start]}); [cite: 22]
      [cite_start]const data = await res.json(); [cite: 23]
      [cite_start]const aiMsg = { id: Date.now() + 1, role: 'ai', content: data.reply || data.message }; [cite: 23]
      setChatHistory(prev => {
        const updated = [...prev, aiMsg];
        [cite_start]localStorage.setItem('raqqa_chats', JSON.stringify(updated)); [cite: 24]
        return updated;
      });
    } catch (err) { console.error(err); [cite_start]} [cite: 25]
  };

  return (
    <div style={{ direction: 'rtl', backgroundColor: '#fff9fb', minHeight: '100vh', fontFamily: 'system-ui' }}>
      
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '65px',
        backgroundColor: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      [cite_start]}}> [cite: 25, 26]
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
        [cite_start]</button> [cite: 27]
      </header>

      <nav style={{
        position: 'fixed', top: '65px', left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #ffe4ec', padding: '12px 0', overflowX: 'auto', 
        display: 'flex', zIndex: 1050, whiteSpace: 'nowrap', scrollbarWidth: 'none'
      [cite_start]}}> [cite: 28]
        {CATEGORIES.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path}
            style={{
              textDecoration: 'none', padding: '8px 22px', margin: '0 6px',
              borderRadius: '25px', fontSize: '14px', fontWeight: 'bold',
              [cite_start]color: location.pathname === cat.path ? '#fff' : '#D81B60', [cite: 29, 30]
              backgroundColor: location.pathname === cat.path ? [cite_start]'#D81B60' : '#fff', [cite: 31]
              border: '1px solid #D81B60', transition: '0.3s'
            }}
          >
            {cat.ar}
          </Link>
        ))}
      </nav>

      [cite_start]<main style={{ paddingTop: '150px', paddingBottom: '40px', maxWidth: '550px', margin: '0 auto' }}> [cite: 32]
        
        <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '15px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', margin: '0 15px 25px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee' }}></div>
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="شاركينا تجربتكِ أو سؤالكِ اليوم..."
              style={{ flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '15px', padding: '10px' }}
            [cite_start]/> [cite: 33]
          </div>
          
          {selectedImage && (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img src={URL.createObjectURL(selectedImage)} style={{ width: '100%', borderRadius: '15px' }} alt="preview" />
              <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', padding: '5px' }}><X size={16}/></button>
            [cite_start]</div> [cite: 34, 35]
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', cursor: 'pointer', fontSize: '13px' }}>
              <ImageIcon size={20} color="#D81B60" />
              <span>صورة</span>
              [cite_start]<input type="file" hidden accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} /> [cite: 36]
            </label>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              style={{ background: '#D81B60', color: '#fff', border: 'none', padding: '8px 25px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            > [cite_start][cite: 37]
              {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              نشر
            [cite_start]</button> [cite: 38]
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <div style={{ padding: '0 15px' }}>
              {posts.map((post, i) => <PostCard key={i} post={post} />)}
            </div>
          [cite_start]} /> [cite: 39]
          {CATEGORIES.map((cat, i) => (
            cat.component && <Route key={i} path={cat.path} element={cat.component} />
          [cite_start]))} [cite: 39]
        </Routes>
      </main>

      {isChatOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', height: '85%', backgroundColor: '#fff', borderRadius: '30px 30px 0 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', background: '#D81B60', color: '#fff', borderRadius: '30px 30px 0 0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>استشارة الخبيرة</span>
              [cite_start]<button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X /></button> [cite: 40, 41]
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {chatHistory.map(m => (
                <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end', backgroundColor: m.role === 'user' ? '#f0f0f0' : '#ffe4ec', padding: '12px', borderRadius: '15px', marginBottom: '10px', maxWidth: '80%' }}>
                  {m.content}
                [cite_start]</div> [cite: 42]
              ))}
            </div>
            <div style={{ padding: '15px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' }}>
              <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} placeholder="اكتبي سؤالك هنا..." style={{ flex: 1, padding: '10px 20px', borderRadius: '25px', border: '1px solid #ddd' }} />
              [cite_start]<button onClick={handleChat} style={{ background: '#D81B60', color: '#fff', border: 'none', width: '45px', height: '45px', borderRadius: '50%' }}><Send size={20}/></button> [cite: 43]
            </div>
          </div>
        [cite_start]</div> [cite: 44]
      )}
    </div>
  );
};

// مكون المنشور مع تفعيل وظيفة إرسال التعليق
const PostCard = ({ post }) => {
  [cite_start]const [showCommentInput, setShowCommentInput] = useState(false); [cite: 45]
  [cite_start]const [comment, setComment] = useState(''); [cite: 46]
  const [localComments, setLocalComments] = useState([]); // لإظهار التعليقات المضافة حالياً

  const handleSendComment = () => {
    if (!comment.trim()) return;
    // إضافة التعليق محلياً للعرض
    setLocalComments(prev => [...prev, comment]);
    setComment('');
    // هنا يمكن مستقبلاً إضافة Fetch لإرسال التعليق للـ API
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '18px', marginBottom: '20px', border: '1px solid #fdf0f4' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#fce4ec' }}></div>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>عضوة متألقة</span>
      </div>
      [cite_start]<p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6' }}>{post.content}</p> [cite: 46]
      [cite_start]{post.file && <img src={post.file} alt="post" style={{ width: '100%', borderRadius: '15px', marginTop: '10px' }} />} [cite: 47]
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '15px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
        <button style={{ background: 'none', border: 'none', color: '#777', display: 'flex', gap: '5px', cursor: 'pointer' }}><Heart size={18}/> إعجاب</button>
        <button onClick={() => setShowCommentInput(!showCommentInput)} style={{ background: 'none', border: 'none', color: '#777', display: 'flex', gap: '5px', cursor: 'pointer' }}><MessageCircle size={18}/> تعليق</button>
        [cite_start]<button style={{ background: 'none', border: 'none', color: '#777', display: 'flex', gap: '5px', cursor: 'pointer' }}><Share2 size={18}/> مشاركة</button> [cite: 48]
      </div>

      {/* عرض التعليقات المحلية المضافة */}
      {localComments.map((c, idx) => (
        <div key={idx} style={{ background: '#f8f8f8', padding: '8px 12px', borderRadius: '10px', marginTop: '8px', fontSize: '13px' }}>
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
          [cite_start]/> [cite: 49]
          <button 
            onClick={handleSendComment}
            style={{ background: '#D81B60', color: '#fff', border: 'none', borderRadius: '12px', padding: '5px 12px', cursor: 'pointer' }}
          >
            <Send size={14}/>
          [cite_start]</button> [cite: 49]
        </div>
      )}
    </div>
  );
};

[cite_start]export default Swing; [cite: 50]
