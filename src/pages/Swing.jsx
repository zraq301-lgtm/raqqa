import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Send, X, Trash2, Image as ImageIcon,
  Video, ChevronRight, Sparkles, RefreshCw, Plus
} from 'lucide-react';

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

// ==========================================
//  CATEGORIES - التعريف المركزي للأقسام العشرة
// ==========================================
const CATEGORIES = [
  { ar: "ملاذ الأمومة", path: "MotherhoodHaven", icon: "🤱", gradient: "from-rose-400 to-pink-500", light: "bg-rose-50 text-rose-600 border-rose-200" },
  { ar: "أكاديمية الصغار", path: "LittleOnesAcademy", icon: "👶", gradient: "from-sky-400 to-blue-500", light: "bg-sky-50 text-sky-600 border-sky-200" },
  { ar: "واحة العافية", path: "WellnessOasis", icon: "🌿", gradient: "from-emerald-400 to-teal-500", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { ar: "أيقونة الأناقة", path: "EleganceIcon", icon: "👗", gradient: "from-fuchsia-400 to-purple-500", light: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" },
  { ar: "فن الطهي", path: "CulinaryArts", icon: "🍳", gradient: "from-orange-400 to-amber-500", light: "bg-orange-50 text-orange-600 border-orange-200" },
  { ar: "زوايا البيت", path: "HomeCorners", icon: "🏡", gradient: "from-lime-400 to-green-500", light: "bg-lime-50 text-lime-600 border-lime-200" },
  { ar: "مسارات التمكين", path: "EmpowermentPaths", icon: "💪", gradient: "from-violet-400 to-indigo-500", light: "bg-violet-50 text-violet-600 border-violet-200" },
  { ar: "جسور المودة", path: "HarmonyBridges", icon: "💕", gradient: "from-pink-400 to-rose-500", light: "bg-pink-50 text-pink-600 border-pink-200" },
  { ar: "شغف وحرف", path: "PassionsCrafts", icon: "🎨", gradient: "from-cyan-400 to-sky-500", light: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  { ar: "ملتقى الأرواح", path: "SoulsLounge", icon: "☕", gradient: "from-stone-400 to-neutral-600", light: "bg-stone-50 text-stone-600 border-stone-200" }
];

const AI_QUICK_PROMPTS = [
  'نصائح للعناية بالبشرة',
  'وصفة سريعة للعشاء',
  'كيف أتعامل مع التوتر؟',
  'تمارين خفيفة للصباح'
];

// ==========================================
//  SKELETON LOADER
// ==========================================
const SkeletonCard = () => (
  <div className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-purple-100/50 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-11 h-11 bg-gradient-to-br from-purple-200/60 to-pink-200/60 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-purple-200/50 rounded-full w-28" />
        <div className="h-2 bg-purple-100/50 rounded-full w-20" />
      </div>
    </div>
    <div className="space-y-2.5 mb-4">
      <div className="h-3 bg-purple-100/40 rounded-full w-full" />
      <div className="h-3 bg-purple-100/40 rounded-full w-4/5" />
      <div className="h-3 bg-purple-100/40 rounded-full w-3/5" />
    </div>
    <div className="h-52 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-2xl mb-4" />
    <div className="flex gap-3 pt-3 border-t border-purple-50">
      <div className="h-8 bg-purple-100/40 rounded-full w-20" />
      <div className="h-8 bg-purple-100/40 rounded-full w-20" />
      <div className="h-8 bg-purple-100/40 rounded-full w-20" />
    </div>
  </div>
);

// ==========================================
//  POST CARD - بطاقة المنشور
// ==========================================
const PostCard = React.memo(({ post, index }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  }, [liked]);

  const handleComment = useCallback(() => {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      text: commentText,
      author: 'زائرة',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }]);
    setCommentText('');
  }, [commentText]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'منتدى الأرجوحة',
        text: post.content?.substring(0, 100) || 'شاركي هذا المنشور',
        url: window.location.href
      }).catch(() => {});
    }
  }, [post.content]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-[0_2px_16px_rgba(147,51,234,0.06)] border border-purple-100/40 hover:shadow-[0_4px_24px_rgba(147,51,234,0.1)] transition-shadow duration-300"
    >
      {/* رأس المنشور */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-purple-200/40 flex-shrink-0">
          {post.author?.charAt(0) || 'ع'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{post.author || 'عضوة'}</p>
          <p className="text-[10px] text-gray-400">
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'الآن'}
          </p>
        </div>
        {post.section && (
          <span className="text-[10px] bg-purple-100/80 text-purple-600 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
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
        <div className="rounded-2xl overflow-hidden mb-3 bg-gray-50">
          {post.type === 'فيديو' ? (
            <video src={post.media_url} controls preload="metadata" className="w-full max-h-96 object-cover bg-black" />
          ) : (
            <img src={post.media_url} alt="محتوى المنشور" loading="lazy" className="w-full max-h-96 object-cover" />
          )}
        </div>
      )}

      {/* أزرار التفاعل */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-purple-50/80">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
            liked
              ? 'bg-pink-100 text-pink-600 shadow-sm shadow-pink-200/40'
              : 'bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-500'
          }`}
        >
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount > 0 ? likesCount : 'أعجبني'}</span>
        </button>

        <button
          onClick={() => setShowComments(prev => !prev)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-500 transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length > 0 ? comments.length : 'تعليق'}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-all duration-200"
        >
          <Share2 className="w-4 h-4" />
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
                <div className="space-y-2 mb-3 max-h-44 overflow-y-auto custom-scrollbar">
                  {comments.map(c => (
                    <div key={c.id} className="bg-purple-50/60 p-3 rounded-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-purple-600">{c.author}</span>
                        <span className="text-[9px] text-gray-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{c.text}</p>
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
                  className="flex-1 text-xs p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-300/50 transition-all placeholder:text-gray-400"
                  placeholder="اكتبي تعليقك..."
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 rounded-xl text-xs font-bold hover:shadow-md active:scale-95 transition-all disabled:opacity-40"
                >
                  أرسلي
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
PostCard.displayName = 'PostCard';

// ==========================================
//  PUBLISH BOX - صندوق النشر
// ==========================================
const PublishBox = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) { setPreview(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleSavePost = async () => {
    if (!content.trim() && !selectedFile) return;
    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('section', 'الأرجوحة');
      formData.append('type', selectedFile ? (selectedFile.type?.startsWith('video') ? 'فيديو' : 'صورة') : 'نصي');
      if (selectedFile) formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE}/save-post`, { method: 'POST', body: formData });
      if (response.ok) {
        setContent('');
        setSelectedFile(null);
        setPreview(null);
        setIsExpanded(false);
        onPostCreated?.();
      }
    } catch (e) {
      console.error("خطأ في النشر:", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const removeFile = () => { setSelectedFile(null); setPreview(null); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-[0_2px_16px_rgba(147,51,234,0.06)] border border-purple-100/40 mb-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md shadow-purple-200/40">
          ع
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="w-full p-3 bg-purple-50/40 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-300/40 transition-all resize-none placeholder:text-gray-400"
            placeholder="شاركينا ما يدور في خاطرك..."
            rows={isExpanded ? 4 : 2}
          />
        </div>
      </div>

      {/* معاينة الملف المرفق */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 relative overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden bg-gray-50 relative">
              {selectedFile?.type?.startsWith('video') ? (
                <video src={preview} className="w-full max-h-48 object-cover rounded-2xl" controls />
              ) : (
                <img src={preview} alt="معاينة" className="w-full max-h-48 object-cover rounded-2xl" />
              )}
              <button
                onClick={removeFile}
                className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* شريط الأدوات */}
      <AnimatePresence>
        {(isExpanded || content || selectedFile) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-purple-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold hover:bg-purple-100 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>صورة</span>
                </button>
                <button
                  onClick={() => { fileRef.current?.setAttribute('accept', 'video/*'); fileRef.current?.click(); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-pink-50 text-pink-600 text-xs font-semibold hover:bg-pink-100 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>فيديو</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
                  className="hidden"
                />
                {selectedFile && !preview && (
                  <span className="text-[10px] text-purple-500 bg-purple-50 px-2 py-1 rounded-full truncate max-w-[120px]">
                    {selectedFile.name}
                  </span>
                )}
              </div>

              <button
                onClick={handleSavePost}
                disabled={isPublishing || (!content.trim() && !selectedFile)}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-purple-300/30 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-200/30 flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري النشر</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>نشر</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================
//  CATEGORIES GRID - شبكة الأقسام السريعة
// ==========================================
const CategoriesGrid = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.08 }}
    className="grid grid-cols-5 gap-2.5 mb-5"
  >
    {CATEGORIES.map((c, i) => (
      <motion.div
        key={c.path}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 + i * 0.04 }}
      >
        <Link
          to={`/swing-forum/${c.path}`}
          className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-purple-100/30 hover:shadow-lg hover:shadow-purple-200/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 group"
        >
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-lg shadow-md group-hover:shadow-lg transition-shadow`}>
            {c.icon}
          </div>
          <span className="text-[9px] font-bold text-gray-600 text-center leading-tight line-clamp-2">{c.ar}</span>
        </Link>
      </motion.div>
    ))}
  </motion.div>
);

// ==========================================
//  MARQUEE NAV - شريط التنقل المتحرك
// ==========================================
const MarqueeNav = ({ activeCategory }) => {
  const scrollRef = useRef(null);

  return (
    <div className="overflow-x-auto scrollbar-hide py-2.5 -mx-1" ref={scrollRef}>
      <div className="flex gap-2 px-1 w-max">
        {CATEGORIES.map(c => {
          const isActive = activeCategory === c.path;
          return (
            <Link
              key={c.path}
              to={`/swing-forum/${c.path}`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0 active:scale-95 ${
                isActive
                  ? 'text-white shadow-lg shadow-purple-300/30'
                  : 'bg-white/90 text-purple-700 border border-purple-100/50 hover:bg-purple-50 hover:border-purple-200'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #7c3aed, #ec4899)' } : {}}
            >
              <span className="text-sm">{c.icon}</span>
              <span>{c.ar}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
//  AI CHAT - دردشة طبيبة رقة
// ==========================================
const AiChatPanel = ({ isOpen, onClose }) => {
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('raqqa_swing_chats');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400);
  }, [isOpen]);

  const handleChat = async () => {
    if (!userInput.trim() || isAiTyping) return;
    const userMsg = { role: 'user', content: userInput, id: Date.now() };
    const updated = [...chatHistory, userMsg];
    setChatHistory(updated);
    const prompt = userInput;
    setUserInput('');
    setIsAiTyping(true);

    try {
      const res = await CapacitorHttp.post({
        url: `${API_BASE}/raqqa-ai`,
        headers: { 'Content-Type': 'application/json' },
        data: { prompt: `أنا أنثى مسلمة... ${prompt}` }
      });
      const aiMsg = {
        role: 'ai',
        content: res.data.reply || res.data.message || 'عذراً، لم أتمكن من المعالجة.',
        id: Date.now() + 1
      };
      const final = [...updated, aiMsg];
      setChatHistory(final);
      localStorage.setItem('raqqa_swing_chats', JSON.stringify(final));
    } catch {
      const errMsg = {
        role: 'ai',
        content: 'عذراً حبيبتي، حدث خطأ في الاتصال. حاولي مرة أخرى.',
        id: Date.now() + 1
      };
      setChatHistory([...updated, errMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const deleteMsg = (id) => {
    const filtered = chatHistory.filter(m => m.id !== id);
    setChatHistory(filtered);
    localStorage.setItem('raqqa_swing_chats', JSON.stringify(filtered));
  };

  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem('raqqa_swing_chats');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-white w-full sm:max-w-md h-[85vh] sm:h-[80vh] rounded-t-[2rem] sm:rounded-[2rem] flex flex-col shadow-2xl overflow-hidden"
            dir="rtl"
          >
            {/* رأس الدردشة */}
            <div
              className="p-4 flex justify-between items-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">طبيبة رقة</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-white/70 text-[10px]">متصلة الآن</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatHistory.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-white/80 hover:text-white text-[10px] px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors font-semibold"
                  >
                    مسح الكل
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                  aria-label="إغلاق الدردشة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* محتوى الدردشة */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #fdf2f8 50%, #f5f3ff 100%)' }}>
              {chatHistory.length === 0 && (
                <div className="text-center py-8">
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }}
                  >
                    <Sparkles className="w-9 h-9 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">أهلاً بكِ حبيبتي</h4>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto mb-4">
                    أنا طبيبة رقة، مستشارتك الذكية المتخصصة في شؤون المرأة المسلمة. اسأليني عن أي شيء!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AI_QUICK_PROMPTS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setUserInput(q)}
                        className="text-[10px] px-3 py-2 rounded-full bg-white text-purple-600 border border-purple-200/50 hover:bg-purple-50 hover:border-purple-300 transition-colors font-semibold shadow-sm"
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
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-white text-gray-800 rounded-tr-md border border-purple-100/50 shadow-sm'
                        : 'text-white rounded-tl-md shadow-md shadow-purple-300/20'
                    }`}
                    style={m.role === 'ai' ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : {}}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <button
                    onClick={() => deleteMsg(m.id)}
                    className="text-[9px] text-gray-300 hover:text-red-400 mt-1 px-1 transition-colors flex items-center gap-0.5"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    حذف
                  </button>
                </motion.div>
              ))}

              {isAiTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-end">
                  <div className="p-3.5 rounded-2xl rounded-tl-md text-white shadow-md" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* حقل الإدخال */}
            <div className="p-3 bg-white border-t border-purple-100/50 flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                  className="flex-1 border border-purple-200/60 p-3 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 transition-all placeholder:text-gray-400 bg-purple-50/30"
                  placeholder="اسألي طبيبة رقة..."
                  disabled={isAiTyping}
                />
                <button
                  onClick={handleChat}
                  disabled={!userInput.trim() || isAiTyping}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-40 shadow-md shadow-purple-200/30"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
                  aria-label="إرسال"
                >
                  <Send className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
//  MAIN FEED PAGE - الصفحة الرئيسية للفيد
// ==========================================
const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const res = await CapacitorHttp.get({ url: `${API_BASE}/get-posts` });
      setPosts(res.data.posts || []);
    } catch (e) {
      console.error("خطأ في جلب المنشورات:", e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <>
      {/* عنوان القسم */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          منتدى الأرجوحة
        </h1>
        <p className="text-xs text-gray-400 mt-1">مساحتك الآمنة للمشاركة والتواصل</p>
      </motion.div>

      {/* شبكة الأقسام */}
      <CategoriesGrid />

      {/* صندوق النشر */}
      <PublishBox onPostCreated={() => fetchPosts(true)} />

      {/* زر التحديث */}
      {posts.length > 0 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => fetchPosts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 text-purple-600 text-xs font-semibold border border-purple-100/50 hover:bg-purple-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'جاري التحديث...' : 'تحديث المنشورات'}</span>
          </button>
        </div>
      )}

      {/* قائمة المنشورات */}
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
            <div className="w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #fce7f3)' }}>
              <Plus className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">لا توجد منشورات بعد</h3>
            <p className="text-sm text-gray-400">كوني أول من يشارك في المنتدى!</p>
          </motion.div>
        ) : (
          posts.map((p, i) => <PostCard key={p.id || i} post={p} index={i} />)
        )}
      </div>
    </>
  );
};

// ==========================================
//  SWING - المكون الرئيسي
// ==========================================
const Swing = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isMainPage = location.pathname === '/swing-forum' || location.pathname === '/swing-forum/';

  // استخلاص القسم النشط من المسار
  const activeCategory = useMemo(() => {
    const match = location.pathname.match(/\/swing-forum\/(\w+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen text-right font-sans"
      dir="rtl"
      style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #fdf2f8 40%, #f0f9ff 70%, #f5f3ff 100%)' }}
    >
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(147,51,234,0.2); border-radius: 99px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ===== الشريط العلوي الثابت ===== */}
      <div className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-purple-100/40 shadow-[0_1px_8px_rgba(147,51,234,0.04)]">
        <div className="max-w-2xl mx-auto px-4">
          <MarqueeNav activeCategory={activeCategory} />

          {/* زر العودة في الصفحات الفرعية */}
          <AnimatePresence>
            {!isMainPage && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <button
                  onClick={() => navigate('/swing-forum')}
                  className="flex items-center gap-2 text-xs text-purple-600 font-bold hover:text-purple-800 transition-colors pb-2.5"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>العودة للأرجوحة</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== المحتوى الرئيسي ===== */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-28">
        <Routes>
          <Route path="/" element={<FeedPage />} />
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

      {/* ===== زر FAB لفتح دردشة طبيبة رقة ===== */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 left-5 z-50 w-14 h-14 rounded-full shadow-xl shadow-purple-400/30 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        aria-label="فتح دردشة طبيبة رقة"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* ===== نافذة دردشة طبيبة رقة ===== */}
      <AiChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Swing;
