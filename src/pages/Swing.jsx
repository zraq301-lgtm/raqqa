import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { CapacitorHttp } from '@capacitor/core';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Send, X, Trash2, Image as ImageIcon,
  Video, ChevronRight, Sparkles, RefreshCw, Plus, ChevronDown, Camera, Mic
} from 'lucide-react';

// Sub-pages imports
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

/* -------------------------------------------------------
   DESIGN TOKENS
   Deep Royal Purple: #4a148c
   Soft Lavender:     #f3e5f5
   Rose Gold:         #b76e79 / #e8b4b8
   Glass:             rgba(255,255,255,0.55) + blur
------------------------------------------------------- */

const CATEGORIES = [
  { ar: "ملاذ الأمومة",    path: "MotherhoodHaven",  icon: "\u{1F931}", color: "#e91e63", bg: "rgba(233,30,99,0.08)" },
  { ar: "أكاديمية الصغار",  path: "LittleOnesAcademy", icon: "\u{1F476}", color: "#2196f3", bg: "rgba(33,150,243,0.08)" },
  { ar: "واحة العافية",     path: "WellnessOasis",     icon: "\u{1F33F}", color: "#009688", bg: "rgba(0,150,136,0.08)" },
  { ar: "أيقونة الأناقة",   path: "EleganceIcon",      icon: "\u{1F457}", color: "#9c27b0", bg: "rgba(156,39,176,0.08)" },
  { ar: "فن الطهي",        path: "CulinaryArts",      icon: "\u{1F373}", color: "#ff9800", bg: "rgba(255,152,0,0.08)" },
  { ar: "زوايا البيت",     path: "HomeCorners",       icon: "\u{1F3E1}", color: "#4caf50", bg: "rgba(76,175,80,0.08)" },
  { ar: "مسارات التمكين",  path: "EmpowermentPaths",  icon: "\u{1F4AA}", color: "#673ab7", bg: "rgba(103,58,183,0.08)" },
  { ar: "جسور المودة",     path: "HarmonyBridges",    icon: "\u{1F495}", color: "#f44336", bg: "rgba(244,67,54,0.08)" },
  { ar: "شغف وحرف",       path: "PassionsCrafts",    icon: "\u{1F3A8}", color: "#00bcd4", bg: "rgba(0,188,212,0.08)" },
  { ar: "ملتقى الأرواح",   path: "SoulsLounge",       icon: "\u2615",    color: "#795548", bg: "rgba(121,85,72,0.08)" }
];

const AI_QUICK_PROMPTS = [
  'نصائح للعناية بالبشرة',
  'وصفة سريعة للعشاء',
  'كيف أتعامل مع التوتر؟',
  'تمارين خفيفة للصباح'
];

/* -------------------------------------------------------
   GLOBAL INLINE STYLES
------------------------------------------------------- */
const SWING_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

  .swing-root {
    font-family: 'Tajawal', sans-serif;
    --royal: #4a148c;
    --royal-light: #6a1b9a;
    --lavender: #f3e5f5;
    --rose-gold: #b76e79;
    --rose-gold-light: #e8b4b8;
    --glass-bg: rgba(255,255,255,0.55);
    --glass-border: rgba(255,255,255,0.65);
  }

  .swing-root * { box-sizing: border-box; }

  .swing-root .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
  }

  .swing-root .glass-nav {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(74,20,140,0.06);
  }

  .swing-root .custom-scrollbar::-webkit-scrollbar { width: 3px; }
  .swing-root .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .swing-root .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(74,20,140,0.15); border-radius: 99px; }
  .swing-root .scrollbar-hide::-webkit-scrollbar { display: none; }
  .swing-root .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  .swing-root .masonry-feed {
    columns: 1;
    column-gap: 16px;
  }
  @media (min-width: 520px) {
    .swing-root .masonry-feed {
      columns: 2;
    }
  }
  .swing-root .masonry-feed > * {
    break-inside: avoid;
    margin-bottom: 16px;
  }

  .swing-root .like-burst {
    animation: likeBurst 0.5s ease-out forwards;
  }
  @keyframes likeBurst {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.35); }
    60%  { transform: scale(0.9); }
    100% { transform: scale(1); }
  }

  .swing-root .fab-glow {
    box-shadow:
      0 0 20px rgba(74,20,140,0.35),
      0 0 60px rgba(183,110,121,0.15),
      0 8px 32px rgba(74,20,140,0.2);
  }

  .swing-root .shimmer {
    background: linear-gradient(
      110deg,
      rgba(243,229,245,0.4) 0%,
      rgba(243,229,245,0.8) 40%,
      rgba(243,229,245,0.4) 60%,
      rgba(243,229,245,0.4) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s linear infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .swing-root .bottomsheet-handle {
    width: 40px;
    height: 4px;
    border-radius: 4px;
    background: rgba(74,20,140,0.15);
    margin: 0 auto 12px;
  }
`;

/* -------------------------------------------------------
   SKELETON CARD
------------------------------------------------------- */
const SkeletonCard = () => (
  <div className="glass-card p-5" style={{ borderRadius: 24 }}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 shimmer rounded-full w-28" />
        <div className="h-2.5 shimmer rounded-full w-20" />
      </div>
    </div>
    <div className="space-y-2.5 mb-4">
      <div className="h-3 shimmer rounded-full w-full" />
      <div className="h-3 shimmer rounded-full w-4/5" />
      <div className="h-3 shimmer rounded-full w-3/5" />
    </div>
    <div className="h-48 shimmer mb-4" style={{ borderRadius: 20 }} />
    <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid rgba(74,20,140,0.06)' }}>
      <div className="h-9 shimmer rounded-full w-20" />
      <div className="h-9 shimmer rounded-full w-20" />
      <div className="h-9 shimmer rounded-full w-20" />
    </div>
  </div>
);

/* -------------------------------------------------------
   POST CARD - Glassmorphism + micro-interactions
------------------------------------------------------- */
const PostCard = React.memo(({ post, index }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 500);
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
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card overflow-hidden"
      style={{ borderRadius: 24 }}
    >
      {/* Post header */}
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4a148c, #b76e79)',
              boxShadow: '0 4px 14px rgba(74,20,140,0.2)'
            }}
          >
            {post.author?.charAt(0) || 'ع'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: '#2d1b4e' }}>{post.author || 'عضوة'}</p>
            <p className="text-[10px]" style={{ color: '#9e9e9e' }}>
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'الآن'}
            </p>
          </div>
          {post.section && (
            <span
              className="text-[10px] px-3 py-1.5 rounded-full font-bold flex-shrink-0"
              style={{ background: 'var(--lavender)', color: 'var(--royal)' }}
            >
              {post.section}
            </span>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm leading-[1.85] mb-3 whitespace-pre-wrap" style={{ color: '#37293f' }}>
            {post.content}
          </p>
        )}
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="mx-3 mb-3 overflow-hidden" style={{ borderRadius: 20 }}>
          {post.type === 'فيديو' ? (
            <video src={post.media_url} controls preload="metadata" className="w-full max-h-96 object-cover" style={{ background: '#1a0a2e' }} />
          ) : (
            <img src={post.media_url} alt="محتوى المنشور" loading="lazy" className="w-full max-h-96 object-cover" />
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid rgba(74,20,140,0.06)' }}>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-90 ${likeAnimating ? 'like-burst' : ''}`}
            style={{
              borderRadius: 20,
              background: liked ? 'rgba(183,110,121,0.12)' : 'rgba(74,20,140,0.04)',
              color: liked ? '#b76e79' : '#78748c'
            }}
          >
            <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
            <span>{likesCount > 0 ? likesCount : 'أعجبني'}</span>
          </button>

          <button
            onClick={() => setShowComments(prev => !prev)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-90"
            style={{ borderRadius: 20, background: 'rgba(74,20,140,0.04)', color: '#78748c' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length > 0 ? comments.length : 'تعليق'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-90"
            style={{ borderRadius: 20, background: 'rgba(74,20,140,0.04)', color: '#78748c' }}
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة</span>
          </button>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(74,20,140,0.06)' }}>
                {comments.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-44 overflow-y-auto custom-scrollbar">
                    {comments.map(c => (
                      <div key={c.id} className="p-3" style={{ borderRadius: 16, background: 'var(--lavender)' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold" style={{ color: 'var(--royal)' }}>{c.author}</span>
                          <span className="text-[9px]" style={{ color: '#9e9e9e' }}>{c.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: '#4a3e5c' }}>{c.text}</p>
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
                    className="flex-1 text-xs p-3 outline-none transition-all"
                    style={{
                      borderRadius: 16,
                      background: 'rgba(74,20,140,0.03)',
                      border: '1px solid rgba(74,20,140,0.08)',
                      color: '#37293f'
                    }}
                    placeholder="اكتبي تعليقك..."
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="text-white px-4 text-xs font-bold transition-all active:scale-90 disabled:opacity-40"
                    style={{
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, #4a148c, #b76e79)'
                    }}
                  >
                    أرسلي
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
});
PostCard.displayName = 'PostCard';

/* -------------------------------------------------------
   PUBLISH BOTTOM SHEET
------------------------------------------------------- */
const PublishBottomSheet = ({ onPostCreated }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
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
        setContent(''); setSelectedFile(null); setPreview(null); setIsExpanded(false);
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
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(20,5,40,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Collapsed trigger */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => setIsExpanded(true)}
            className="glass-card w-full flex items-center gap-3 p-4 mb-4 active:scale-[0.98] transition-transform"
            style={{ borderRadius: 24, cursor: 'pointer' }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4a148c, #b76e79)', boxShadow: '0 4px 12px rgba(74,20,140,0.2)' }}
            >
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#9e9e9e' }}>شاركينا ما يدور في خاطرك...</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded BottomSheet */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white"
            style={{
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -8px 40px rgba(74,20,140,0.12)',
              maxHeight: '80vh',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)'
            }}
          >
            <div className="p-5">
              {/* Handle */}
              <div className="bottomsheet-handle" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold" style={{ color: 'var(--royal)' }}>منشور جديد</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--lavender)', color: 'var(--royal)' }}
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                autoFocus
                className="w-full p-4 text-sm outline-none resize-none transition-all"
                style={{
                  borderRadius: 20,
                  background: 'rgba(74,20,140,0.03)',
                  border: '1.5px solid rgba(74,20,140,0.08)',
                  minHeight: 120,
                  color: '#37293f',
                  lineHeight: 1.8,
                  fontFamily: "'Tajawal', sans-serif"
                }}
                placeholder="ماذا تودين مشاركته مع الأخوات؟"
              />

              {/* File preview */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 relative overflow-hidden"
                    style={{ borderRadius: 20 }}
                  >
                    <div className="overflow-hidden relative" style={{ borderRadius: 20, background: '#f7f0fa' }}>
                      {selectedFile?.type?.startsWith('video') ? (
                        <video src={preview} className="w-full max-h-44 object-cover" controls style={{ borderRadius: 20 }} />
                      ) : (
                        <img src={preview} alt="معاينة" className="w-full max-h-44 object-cover" style={{ borderRadius: 20 }} />
                      )}
                      <button
                        onClick={removeFile}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-white"
                        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toolbar */}
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid rgba(74,20,140,0.06)' }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { fileRef.current?.setAttribute('accept', 'image/*'); fileRef.current?.click(); }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all active:scale-90"
                    style={{ borderRadius: 16, background: 'var(--lavender)', color: 'var(--royal)' }}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>صورة</span>
                  </button>
                  <button
                    onClick={() => { fileRef.current?.setAttribute('accept', 'video/*'); fileRef.current?.click(); }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all active:scale-90"
                    style={{ borderRadius: 16, background: 'rgba(183,110,121,0.1)', color: 'var(--rose-gold)' }}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>فيديو</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all active:scale-90"
                    style={{ borderRadius: 16, background: 'rgba(74,20,140,0.04)', color: '#78748c' }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold transition-all active:scale-90"
                    style={{ borderRadius: 16, background: 'rgba(74,20,140,0.04)', color: '#78748c' }}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }}
                    className="hidden"
                  />
                </div>

                <button
                  onClick={handleSavePost}
                  disabled={isPublishing || (!content.trim() && !selectedFile)}
                  className="text-white px-6 py-3 text-sm font-bold transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #4a148c, #b76e79)',
                    boxShadow: '0 4px 16px rgba(74,20,140,0.25)'
                  }}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري النشر</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>نشر</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* -------------------------------------------------------
   CATEGORIES GRID - Glassmorphism cards
------------------------------------------------------- */
const CategoriesGrid = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1, duration: 0.5 }}
    className="grid grid-cols-5 gap-3 mb-6"
  >
    {CATEGORIES.map((c, i) => (
      <motion.div
        key={c.path}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to={`/swing-forum/${c.path}`}
          className="flex flex-col items-center gap-2 p-3 glass-card transition-all duration-300 active:scale-90 group"
          style={{ borderRadius: 20, textDecoration: 'none' }}
        >
          <div
            className="w-12 h-12 flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
            style={{ borderRadius: 16, background: c.bg }}
          >
            {c.icon}
          </div>
          <span
            className="text-[9px] font-bold text-center leading-tight"
            style={{ color: '#4a3e5c', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {c.ar}
          </span>
        </Link>
      </motion.div>
    ))}
  </motion.div>
);

/* -------------------------------------------------------
   MARQUEE NAV - Horizontal scrolling pill navigation
------------------------------------------------------- */
const MarqueeNav = ({ activeCategory }) => {
  const scrollRef = useRef(null);

  return (
    <div className="overflow-x-auto scrollbar-hide py-3 -mx-1" ref={scrollRef}>
      <div className="flex gap-2 px-1 w-max">
        {CATEGORIES.map(c => {
          const isActive = activeCategory === c.path;
          return (
            <Link
              key={c.path}
              to={`/swing-forum/${c.path}`}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-250 flex-shrink-0 active:scale-90"
              style={{
                borderRadius: 20,
                textDecoration: 'none',
                ...(isActive
                  ? {
                      background: 'linear-gradient(135deg, #4a148c, #b76e79)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(74,20,140,0.25)'
                    }
                  : {
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(10px)',
                      color: 'var(--royal)',
                      border: '1px solid rgba(74,20,140,0.08)'
                    }
                )
              }}
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

/* -------------------------------------------------------
   AI CHAT PANEL - Doctor Raqqa
------------------------------------------------------- */
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
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(20,5,40,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white w-full sm:max-w-md flex flex-col overflow-hidden"
            style={{
              height: '85vh',
              borderRadius: '28px 28px 0 0',
              boxShadow: '0 -8px 60px rgba(74,20,140,0.18)'
            }}
            dir="rtl"
          >
            {/* Chat header */}
            <div
              className="p-4 flex justify-between items-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4a148c, #6a1b9a, #b76e79)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
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
                    className="text-white/80 hover:text-white text-[10px] px-3 py-1.5 rounded-full font-bold transition-colors"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    مسح الكل
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  aria-label="إغلاق الدردشة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat body */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #fce4ec 50%, #f3e5f5 100%)' }}
            >
              {chatHistory.length === 0 && (
                <div className="text-center py-10">
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--lavender), rgba(183,110,121,0.15))' }}
                  >
                    <Sparkles className="w-9 h-9" style={{ color: 'var(--royal)' }} />
                  </div>
                  <h4 className="text-sm font-bold mb-2" style={{ color: '#2d1b4e' }}>أهلاً بكِ حبيبتي</h4>
                  <p className="text-xs leading-relaxed max-w-xs mx-auto mb-5" style={{ color: '#9e9e9e' }}>
                    أنا طبيبة رقة، مستشارتك الذكية المتخصصة في شؤون المرأة المسلمة. اسأليني عن أي شيء!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AI_QUICK_PROMPTS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setUserInput(q)}
                        className="text-[10px] px-3.5 py-2.5 font-bold transition-all active:scale-90"
                        style={{
                          borderRadius: 20,
                          background: 'white',
                          color: 'var(--royal)',
                          border: '1px solid rgba(74,20,140,0.1)',
                          boxShadow: '0 2px 8px rgba(74,20,140,0.04)'
                        }}
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
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className="p-4 text-sm max-w-[85%] leading-[1.8]"
                    style={{
                      borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      ...(m.role === 'user'
                        ? {
                            background: 'white',
                            color: '#37293f',
                            border: '1px solid rgba(74,20,140,0.06)',
                            boxShadow: '0 2px 8px rgba(74,20,140,0.04)'
                          }
                        : {
                            background: 'linear-gradient(135deg, #4a148c, #6a1b9a)',
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(74,20,140,0.2)'
                          }
                      )
                    }}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <button
                    onClick={() => deleteMsg(m.id)}
                    className="text-[9px] mt-1 px-1 flex items-center gap-0.5 transition-colors hover:opacity-70"
                    style={{ color: '#bfb8c8' }}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    حذف
                  </button>
                </motion.div>
              ))}

              {isAiTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-end">
                  <div
                    className="p-4"
                    style={{
                      borderRadius: '20px 20px 20px 4px',
                      background: 'linear-gradient(135deg, #4a148c, #6a1b9a)',
                      boxShadow: '0 4px 16px rgba(74,20,140,0.2)'
                    }}
                  >
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

            {/* Input */}
            <div className="p-3 bg-white flex-shrink-0" style={{ borderTop: '1px solid rgba(74,20,140,0.06)' }}>
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                  className="flex-1 p-3.5 text-sm outline-none transition-all"
                  style={{
                    borderRadius: 20,
                    background: 'rgba(74,20,140,0.03)',
                    border: '1.5px solid rgba(74,20,140,0.08)',
                    color: '#37293f',
                    fontFamily: "'Tajawal', sans-serif"
                  }}
                  placeholder="اسألي طبيبة رقة..."
                  disabled={isAiTyping}
                />
                <button
                  onClick={handleChat}
                  disabled={!userInput.trim() || isAiTyping}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #4a148c, #b76e79)',
                    boxShadow: '0 4px 16px rgba(74,20,140,0.25)',
                    flexShrink: 0
                  }}
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

/* -------------------------------------------------------
   MAIN FEED PAGE
------------------------------------------------------- */
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
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-6 pt-1"
      >
        <h1
          className="text-3xl font-black"
          style={{
            background: 'linear-gradient(135deg, #4a148c, #b76e79, #4a148c)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          منتدى الأرجوحة
        </h1>
        <p className="text-xs mt-1.5" style={{ color: '#9e9e9e' }}>مساحتك الآمنة للمشاركة والتواصل</p>
      </motion.div>

      {/* Categories */}
      <CategoriesGrid />

      {/* Publish BottomSheet trigger */}
      <PublishBottomSheet onPostCreated={() => fetchPosts(true)} />

      {/* Refresh button */}
      {posts.length > 0 && (
        <div className="flex justify-center mb-5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => fetchPosts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50 glass-card"
            style={{ borderRadius: 20, color: 'var(--royal)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'جاري التحديث...' : 'تحديث المنشورات'}</span>
          </motion.button>
        </div>
      )}

      {/* Posts - Masonry layout */}
      <div className="masonry-feed">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 col-span-full"
          >
            <div
              className="w-24 h-24 mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--lavender), rgba(183,110,121,0.12))' }}
            >
              <Plus className="w-10 h-10" style={{ color: 'rgba(74,20,140,0.25)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#4a3e5c' }}>لا توجد منشورات بعد</h3>
            <p className="text-sm" style={{ color: '#9e9e9e' }}>كوني أول من يشارك في المنتدى!</p>
          </motion.div>
        ) : (
          posts.map((p, i) => <PostCard key={p.id || i} post={p} index={i} />)
        )}
      </div>
    </>
  );
};

/* -------------------------------------------------------
   SWING - Main Component
------------------------------------------------------- */
const Swing = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isMainPage = location.pathname === '/swing-forum' || location.pathname === '/swing-forum/';

  const activeCategory = useMemo(() => {
    const match = location.pathname.match(/\/swing-forum\/(\w+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  return (
    <div
      className="swing-root min-h-screen text-right"
      dir="rtl"
      style={{
        background: 'linear-gradient(160deg, #f3e5f5 0%, #fce4ec 35%, #ede7f6 65%, #f3e5f5 100%)',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <style>{SWING_CSS}</style>

      {/* ===== Sticky Glass Nav ===== */}
      <div
        className="sticky top-0 z-50 glass-nav"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <MarqueeNav activeCategory={activeCategory} />

          {/* Back button for sub-pages */}
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
                  className="flex items-center gap-2 text-xs font-bold transition-colors pb-3 active:scale-95"
                  style={{ color: 'var(--royal)' }}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>العودة للأرجوحة</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== Content ===== */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ===== FAB - Doctor Raqqa ===== */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 left-5 z-50 w-14 h-14 rounded-full flex items-center justify-center fab-glow"
        style={{ background: 'linear-gradient(135deg, #4a148c, #b76e79)' }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        animate={{
          y: [0, -6, 0],
          boxShadow: [
            '0 0 20px rgba(74,20,140,0.35), 0 0 60px rgba(183,110,121,0.15), 0 8px 32px rgba(74,20,140,0.2)',
            '0 0 30px rgba(74,20,140,0.45), 0 0 80px rgba(183,110,121,0.25), 0 12px 40px rgba(74,20,140,0.3)',
            '0 0 20px rgba(74,20,140,0.35), 0 0 60px rgba(183,110,121,0.15), 0 8px 32px rgba(74,20,140,0.2)'
          ]
        }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        aria-label="فتح دردشة طبيبة رقة"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* ===== AI Chat Panel ===== */}
      <AiChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Swing;
