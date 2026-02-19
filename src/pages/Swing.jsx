import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';

// استيراد الصفحات الفرعية العشر
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

// ===== مكون Skeleton Loader =====
const SkeletonCard = () => (
  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-purple-100/50 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-purple-200/60 rounded-full" />
      <div className="flex-1">
        <div className="h-3 bg-purple-200/60 rounded-full w-24 mb-2" />
        <div className="h-2 bg-purple-100/60 rounded-full w-16" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-purple-100/40 rounded-full w-full" />
      <div className="h-3 bg-purple-100/40 rounded-full w-4/5" />
      <div className="h-3 bg-purple-100/40 rounded-full w-3/5" />
    </div>
    <div className="h-48 bg-purple-100/30 rounded-2xl mb-3" />
    <div className="flex gap-4">
      <div className="h-8 bg-purple-100/40 rounded-full w-16" />
      <div className="h-8 bg-purple-100/40 rounded-full w-16" />
      <div className="h-8 bg-purple-100/40 rounded-full w-16" />
    </div>
  </div>
);

// ===== مكون بطاقة المنشور =====
const PostCard = ({ post, index }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      text: commentText,
      author: 'زائرة',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    setComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'منتدى الأرجوحة',
        text: post.content?.substring(0, 100) || 'شاركي هذا المنشور',
        url: window.location.href
      }).catch(() => {});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-purple-100/50 hover:shadow-md transition-shadow duration-300"
    >
      {/* رأس المنشور */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          {post.author?.charAt(0) || 'ع'}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">{post.author || 'عضوة'}</p>
          <p className="text-[10px] text-gray-400">
            {post.created_at ? new Date(post.created_at).toLocaleDateString('ar-EG', { 
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'الآن'}
          </p>
        </div>
        {post.section && (
          <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
            {post.section}
          </span>
        )}
      </div>

      {/* محتوى المنشور */}
      {post.content && (
        <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* الوسائط */}
      {post.media_url && (
        post.type === 'فيديو' ? (
          <video
            src={post.media_url}
            controls
            className="rounded-2xl w-full max-h-96 object-cover mb-3 bg-black"
            preload="metadata"
          />
        ) : (
          <img
            src={post.media_url}
            className="rounded-2xl w-full max-h-96 object-cover mb-3"
            alt="محتوى المنشور"
            loading="lazy"
          />
        )
      )}

      {/* أزرار التفاعل */}
      <div className="flex items-center gap-1 pt-2 border-t border-purple-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            liked
              ? 'bg-pink-100 text-pink-600 scale-105'
              : 'bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{likesCount > 0 ? likesCount : 'أعجبني'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-500 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{comments.length > 0 ? comments.length : 'تعليق'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>مشاركة</span>
        </button>
      </div>

      {/* قسم التعليقات */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-purple-50">
              {comments.length > 0 && (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {comments.map(c => (
                    <div key={c.id} className="bg-purple-50/50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-purple-600">{c.author}</span>
                        <span className="text-[9px] text-gray-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-600">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  className="flex-1 text-xs p-2.5 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-purple-300 transition-all"
                  placeholder="اكتبي تعليقك..."
                />
                <button
                  onClick={handleComment}
                  className="bg-purple-500 text-white px-4 rounded-xl text-xs font-bold hover:bg-purple-600 transition-colors"
                >
                  أرسلي
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ===== المكون الرئيسي: Swing =====
const Swing = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('raqqa_chats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeNav, setActiveNav] = useState(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // تعريف الأقسام العشرة مع الأيقونات والألوان
  const categories = [
    { ar: "ملاذ الأمومة", en: "Motherhood Haven", path: "MotherhoodHaven", icon: "🤱", color: "from-pink-400 to-rose-500", bg: "bg-pink-50" },
    { ar: "أكاديمية الصغار", en: "Little Ones Academy", path: "LittleOnesAcademy", icon: "👶", color: "from-sky-400 to-blue-500", bg: "bg-sky-50" },
    { ar: "واحة العافية", en: "Wellness Oasis", path: "WellnessOasis", icon: "🌿", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50" },
    { ar: "أيقونة الأناقة", en: "Elegance Icon", path: "EleganceIcon", icon: "👗", color: "from-fuchsia-400 to-purple-500", bg: "bg-fuchsia-50" },
    { ar: "فن الطهي", en: "Culinary Arts", path: "CulinaryArts", icon: "🍳", color: "from-orange-400 to-amber-500", bg: "bg-orange-50" },
    { ar: "زوايا البيت", en: "Home Corners", path: "HomeCorners", icon: "🏡", color: "from-yellow-400 to-lime-500", bg: "bg-yellow-50" },
    { ar: "مسارات التمكين", en: "Empowerment Paths", path: "EmpowermentPaths", icon: "💪", color: "from-violet-400 to-indigo-500", bg: "bg-violet-50" },
    { ar: "جسور المودة", en: "Harmony Bridges", path: "HarmonyBridges", icon: "💕", color: "from-rose-400 to-pink-500", bg: "bg-rose-50" },
    { ar: "شغف وحرف", en: "Passions & Crafts", path: "PassionsCrafts", icon: "🎨", color: "from-cyan-400 to-sky-500", bg: "bg-cyan-50" },
    { ar: "ملتقى الأرواح", en: "Soul's Lounge", path: "SoulsLounge", icon: "☕", color: "from-stone-400 to-neutral-500", bg: "bg-stone-50" }
  ];

  // جلب المنشورات
  useEffect(() => {
    fetchPosts();
  }, []);

  // التمرير التلقائي لأسفل الدردشة
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiTyping]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error("خطأ في جلب المنشورات:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // نشر منشور جديد
  const handleSavePost = async () => {
    if (!content.trim() && !selectedFile) return;
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الأرجوحة');
      formData.append('type', selectedFile ? (selectedFile.type?.startsWith('video') ? 'فيديو' : 'صورة') : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/save-post`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setContent('');
        setSelectedFile(null);
        fetchPosts();
      }
    } catch (e) {
      console.error("خطأ في النشر:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  // دردشة الذكاء الاصطناعي - طبيبة رقة
  const handleChat = async () => {
    if (!userInput.trim()) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    const tempInput = userInput;
    setUserInput('');
    setIsAiTyping(true);

    try {
      const options = {
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${tempInput}` }
      };

      const res = await CapacitorHttp.post(options);
      const aiMsg = {
        role: 'ai',
        content: res.data.reply || res.data.message || 'عذراً، لم أتمكن من المعالجة.',
        id: Date.now() + 1
      };

      const finalHistory = [...updatedHistory, aiMsg];
      setChatHistory(finalHistory);
      localStorage.setItem('raqqa_chats', JSON.stringify(finalHistory));
    } catch (e) {
      const errorMsg = {
        role: 'ai',
        content: 'عذراً حبيبتي، حدث خطأ في الاتصال. حاولي مرة أخرى.',
        id: Date.now() + 1
      };
      const finalHistory = [...updatedHistory, errorMsg];
      setChatHistory(finalHistory);
    } finally {
      setIsAiTyping(false);
    }
  };

  // حذف رسالة من الدردشة
  const deleteMsg = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_chats', JSON.stringify(filtered));
  };

  // مسح كل سجل الدردشة
  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem('raqqa_chats');
  };

  // التحقق مما إذا كنا في الصفحة الرئيسية للأرجوحة
  const isMainPage = location.pathname === '/swing-forum' || location.pathname === '/swing-forum/';

  return (
    <div className="min-h-screen text-right font-sans" dir="rtl" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 50%, #f0f9ff 100%)' }}>
      
      {/* ===== الشريط العلوي المتحرك - التنقل بين الأقسام العشرة ===== */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100/50 shadow-sm">
        <div className="overflow-hidden py-2.5">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .swing-marquee {
              display: flex;
              animation: marquee 30s linear infinite;
            }
            .swing-marquee:hover { animation-play-state: paused; }
          `}</style>
          <div className="swing-marquee whitespace-nowrap">
            {[...categories, ...categories].map((c, i) => (
              <Link
                key={i}
                to={`/swing-forum/${c.path}`}
                className="inline-flex items-center gap-1.5 mx-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: activeNav === c.path ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'white',
                  color: activeNav === c.path ? 'white' : '#6b21a8',
                  border: '1px solid rgba(147, 51, 234, 0.15)',
                  boxShadow: '0 2px 8px rgba(147, 51, 234, 0.08)'
                }}
                onClick={() => setActiveNav(c.path)}
              >
                <span>{c.icon}</span>
                <span>{c.ar}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* زر العودة للرئيسية إذا كنا داخل صفحة فرعية */}
        {!isMainPage && (
          <div className="px-4 pb-2">
            <button
              onClick={() => navigate('/swing-forum')}
              className="flex items-center gap-2 text-xs text-purple-600 font-bold hover:text-purple-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>العودة للأرجوحة</span>
            </button>
          </div>
        )}
      </div>

      {/* ===== منطقة المحتوى الرئيسية ===== */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        <Routes>
          {/* الصفحة الرئيسية - الفيد */}
          <Route path="/" element={
            <>
              {/* عنوان القسم */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  منتدى الأرجوحة
                </h1>
                <p className="text-xs text-gray-400 mt-1">مساحتك الآمنة للمشاركة والتواصل</p>
              </motion.div>

              {/* ===== شبكة الأقسام السريعة ===== */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-5 gap-2 mb-6"
              >
                {categories.map((c, i) => (
                  <Link
                    key={i}
                    to={`/swing-forum/${c.path}`}
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-100/30 hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-lg shadow-sm`}>
                      {c.icon}
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 text-center leading-tight">{c.ar}</span>
                  </Link>
                ))}
              </motion.div>

              {/* ===== صندوق النشر ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-sm mb-6 border border-purple-100/50"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                    {'ع'}
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-purple-50/50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-300/50 transition-all resize-none placeholder:text-gray-400"
                    placeholder="شاركينا ما يدور في خاطرك..."
                    rows="3"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium hover:bg-purple-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span>صورة</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <span className="text-[10px] text-purple-500 bg-purple-50 px-2 py-1 rounded-full flex items-center gap-1">
                        {selectedFile.name.substring(0, 15)}...
                        <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-600 font-bold mr-1">x</button>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSavePost}
                    disabled={isPublishing || (!content.trim() && !selectedFile)}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                  >
                    {isPublishing ? (
                      <span className="flex items-center gap-1.5">
                        <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        جاري النشر
                      </span>
                    ) : 'نشر'}
                  </button>
                </div>
              </motion.div>

              {/* ===== قائمة المنشورات (الفيد) ===== */}
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : posts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="text-6xl mb-4">🌸</div>
                    <h3 className="text-lg font-bold text-gray-600 mb-2">لا توجد منشورات بعد</h3>
                    <p className="text-sm text-gray-400">كوني أول من يشارك في المنتدى!</p>
                  </motion.div>
                ) : (
                  posts.map((p, i) => <PostCard key={p.id || i} post={p} index={i} />)
                )}
              </div>
            </>
          } />

          {/* مسارات الصفحات الفرعية العشر */}
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

      {/* ===== زر فتح دردشة طبيبة رقة (FAB) ===== */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 left-5 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        aria-label="فتح دردشة طبيبة رقة"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </motion.button>

      {/* ===== نافذة دردشة طبيبة رقة (AI Chat) ===== */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setIsChatOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-md h-[85vh] sm:h-[80vh] rounded-t-[2rem] sm:rounded-[2rem] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* رأس الدردشة */}
              <div className="p-4 flex justify-between items-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">طبيبة رقة</h3>
                    <p className="text-white/70 text-[10px]">مستشارتك الذكية</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {chatHistory.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="text-white/70 hover:text-white text-[10px] px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      مسح الكل
                    </button>
                  )}
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                    aria-label="إغلاق الدردشة"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* محتوى الدردشة */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #fdf2f8 100%)' }}>
                {chatHistory.length === 0 && (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-700 mb-1">أهلاً بكِ حبيبتي</h4>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                      أنا طبيبة رقة، مستشارتك الذكية المتخصصة في شؤون المرأة المسلمة. اسأليني عن أي شيء!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['نصائح للعناية بالبشرة', 'وصفة سريعة للعشاء', 'كيف أتعامل مع التوتر؟'].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setUserInput(q); }}
                          className="text-[10px] px-3 py-1.5 rounded-full bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chatHistory.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed shadow-sm ${
                        m.role === 'user'
                          ? 'bg-white text-gray-800 rounded-tr-sm border border-purple-100/50'
                          : 'text-white rounded-tl-sm'
                      }`}
                      style={m.role === 'ai' ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : {}}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                    <button
                      onClick={() => deleteMsg(m.id)}
                      className="text-[9px] text-gray-300 hover:text-red-400 mt-1 px-1 transition-colors"
                    >
                      حذف
                    </button>
                  </motion.div>
                ))}

                {/* مؤشر كتابة الذكاء الاصطناعي */}
                {isAiTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-end justify-end"
                  >
                    <div className="p-3 rounded-2xl rounded-tl-sm text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* حقل إدخال الرسائل */}
              <div className="p-3 bg-white border-t border-purple-100/50 flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
                    className="flex-1 border border-purple-200 p-3 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all placeholder:text-gray-400"
                    placeholder="اسألي طبيبة رقة..."
                    disabled={isAiTyping}
                  />
                  <button
                    onClick={handleChat}
                    disabled={!userInput.trim() || isAiTyping}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                    aria-label="إرسال"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Swing;
