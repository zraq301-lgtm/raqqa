import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  X,
  Trash2,
  ImageIcon,
  Camera,
  Mic,
  Plus,
  Sparkles,
  Baby,
  GraduationCap,
  HeartPulse,
  Gem,
  ChefHat,
  Home,
  Rocket,
  Users,
  Palette,
  Coffee,
  ChevronDown,
  Loader2,
} from "lucide-react";

// ---- الثوابت ----
const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const SECTIONS = [
  { id: "motherhood", label: "الأمومة", icon: <Baby size={20} />, path: "/motherhood", color: "#E91E63", description: "عالم الأمومة والحنان" },
  { id: "kids", label: "الصغار", icon: <GraduationCap size={20} />, path: "/kids", color: "#9C27B0", description: "أكاديمية الأطفال والتعليم" },
  { id: "wellness", label: "العافية", icon: <HeartPulse size={20} />, path: "/wellness", color: "#00BCD4", description: "واحة الصحة والجمال" },
  { id: "fashion", label: "الأناقة", icon: <Gem size={20} />, path: "/fashion", color: "#B76E79", description: "عالم الموضة والأناقة" },
  { id: "cooking", label: "المطبخ", icon: <ChefHat size={20} />, path: "/cooking", color: "#FF5722", description: "فنون الطبخ والحلويات" },
  { id: "home", label: "المنزل", icon: <Home size={20} />, path: "/home-decor", color: "#795548", description: "ديكور وأركان المنزل" },
  { id: "empowerment", label: "التمكين", icon: <Rocket size={20} />, path: "/empowerment", color: "#FF9800", description: "مسارات التمكين والنجاح" },
  { id: "relationships", label: "العلاقات", icon: <Users size={20} />, path: "/relationships", color: "#F44336", description: "جسور التواصل والعلاقات" },
  { id: "hobbies", label: "الهوايات", icon: <Palette size={20} />, path: "/hobbies", color: "#4CAF50", description: "عالم الهوايات والإبداع" },
  { id: "lounge", label: "الاسترخاء", icon: <Coffee size={20} />, path: "/lounge", color: "#607D8B", description: "صالة الراحة والاسترخاء" },
];

// ---- مساعدات الكود ----
function strictSanitize(text) {
  if (!text) return "";
  return text
    .replace(/https?:\/\/[^\s]+/g, "[رابط محذوف]")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

// ---- مكون بطاقة المنشور ----
function PostCard({ post, index }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "منتدى المرأة",
          text: strictSanitize(post.content).substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  const handleComment = () => {
    if (comment.trim()) {
      setComments((prev) => [...prev, comment.trim()]);
      setComment("");
    }
  };

  return (
    <article className="animate-fade-in-up card-glass" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="post-header">
        <div className="avatar-gradient">{post.section?.[0]?.toUpperCase() || "م"}</div>
        <div style={{ flex: 1 }}>
          <div className="username">عضوة المنتدى</div>
          <div className="timestamp">{post.createdAt ? timeAgo(post.createdAt) : "منذ قليل"}</div>
        </div>
      </div>
      <p className="post-content">{strictSanitize(post.content)}</p>
      {post.file && (
        <div className="post-image-container">
          <img src={post.file} alt="محتوى" crossOrigin="anonymous" loading="lazy" />
        </div>
      )}
      <div className="post-actions">
        <button onClick={handleLike} className={`action-btn ${liked ? 'active' : ''}`}>
          <Heart size={16} fill={liked ? "var(--primary)" : "none"} />
          <span>{likeCount > 0 ? likeCount : ""}</span>
        </button>
        <button onClick={() => setShowComment(!showComment)} className={`action-btn ${showComment ? 'active' : ''}`}>
          <MessageCircle size={16} />
          <span>{comments.length > 0 ? comments.length : ""}</span>
        </button>
        <button onClick={handleShare} className="action-btn"><Share2 size={16} /></button>
      </div>
      {showComment && (
        <div className="comment-section">
          {comments.map((c, i) => <div key={i} className="comment-bubble">{c}</div>)}
          <div className="comment-input-row">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتبي تعليقك..." />
            <button onClick={handleComment} className="send-btn"><Send size={16} /></button>
          </div>
        </div>
      )}
    </article>
  );
}

// ---- صفحة الأقسام ----
function SectionPage({ section }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [publishing, setPublishing] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      if (res.ok) {
        const data = await res.json();
        const allPosts = data.posts || data || [];
        setPosts(allPosts.filter((p) => p.section?.toLowerCase() === section.id.toLowerCase()));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [section.id]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handlePublish = async () => {
    if (!newContent.trim() || publishing) return;
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent.trim());
      formData.append("section", section.id);
      formData.append("type", "text");
      await fetch(`${API_BASE}/save-post`, { method: "POST", body: formData });
      setNewContent("");
      setShowPublish(false);
      fetchPosts();
    } catch (err) { console.error(err); } finally { setPublishing(false); }
  };

  return (
    <div className="page-container">
      <div className="section-header animate-fade-in-up">
        <div className="section-icon-bg" style={{ color: section.color, background: `${section.color}22` }}>{section.icon}</div>
        <h2>{section.label}</h2>
        <p>{section.description}</p>
      </div>
      <button onClick={() => setShowPublish(!showPublish)} className="publish-trigger">
        <Plus size={18} /> أضيفي منشورًا
      </button>
      {showPublish && (
        <div className="publish-form glass">
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="شاركي أفكارك..." rows={4} />
          <div className="form-actions">
            <button onClick={handlePublish} disabled={publishing || !newContent.trim()} className="submit-btn">نشر</button>
            <button onClick={() => setShowPublish(false)} className="cancel-btn">إلغاء</button>
          </div>
        </div>
      )}
      {loading ? <div className="skeleton-card" /> : posts.map((post, i) => <PostCard key={i} post={post} index={i} />)}
    </div>
  );
}

// ---- الصفحة الرئيسية ----
function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="hero animate-fade-in-up">
        <div className="hero-logo"><Sparkles size={32} color="#fff" /></div>
        <h1>منتدى المرأة العربية</h1>
        <p>مجتمع نسائي راقٍ ملهم</p>
      </div>
      <div className="sections-grid">
        {SECTIONS.map((section, i) => (
          <button key={section.id} onClick={() => navigate(section.path)} className="section-card">
            <div className="icon-circle" style={{ color: section.color, background: `${section.color}15` }}>{section.icon}</div>
            <div className="label">{section.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- المساعدة الذكية ----
function AIChatOverlay({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", content: data.reply || "رد المساعدة..." }]);
    } catch { 
      setMessages(prev => [...prev, { id: "err", role: "assistant", content: "خطأ بالاتصال" }]);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-window animate-slide-up">
        <div className="chat-header">
          <span>المساعدة الذكية</span>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="chat-messages-area">
          {messages.map(m => (
            <div key={m.id} className={`message-row ${m.role}`}><div className="bubble">{m.content}</div></div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="chat-input-footer">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="اكتبي هنا..." />
          <button onClick={handleChat}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

// ---- شريط التنقل العلوي ----
function GlassNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="glass-nav-top">
      <button onClick={() => navigate("/")} className={location.pathname === "/" ? "active" : ""}>الرئيسية</button>
      {SECTIONS.map(sec => (
        <button key={sec.id} onClick={() => navigate(sec.path)} className={location.pathname === sec.path ? "active" : ""}>
          {sec.label}
        </button>
      ))}
    </nav>
  );
}

// ---- الهيكل الرئيسي ----
function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="app-shell">
      <header className="main-header glass">
        <h1>منتدى المرأة</h1>
        <button onClick={() => setChatOpen(true)} className="ai-trigger-btn"><Sparkles size={18} /></button>
      </header>
      <GlassNav />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(sec => <Route key={sec.id} path={sec.path} element={<SectionPage section={sec} />} />)}
        </Routes>
      </main>
      <AIChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <style>{`
        :root { --primary: #D81B60; --bg: #FFF9FA; --text: #2D3436; --radius: 15px; }
        body { margin: 0; font-family: sans-serif; background: var(--bg); direction: rtl; }
        .app-shell { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
        .glass { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); }
        .main-header { position: sticky; top: 0; z-index: 1000; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
        .glass-nav-top { position: sticky; top: 60px; z-index: 999; display: flex; overflow-x: auto; padding: 10px; gap: 8px; background: white; border-bottom: 1px solid #eee; }
        .glass-nav-top button { padding: 8px 15px; border-radius: 20px; border: 1px solid #eee; background: none; white-space: nowrap; cursor: pointer; }
        .glass-nav-top button.active { background: var(--primary); color: white; border-color: var(--primary); }
        .card-glass { background: white; margin: 15px; padding: 15px; border-radius: var(--radius); border: 1px solid #eee; }
        .avatar-gradient { width: 35px; height: 35px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; margin-left: 10px; }
        .post-header { display: flex; align-items: center; }
        .post-actions { display: flex; gap: 15px; margin-top: 10px; }
        .action-btn { border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: #666; }
        .chat-modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; }
        .chat-window { margin-top: auto; height: 80vh; background: white; border-radius: 20px 20px 0 0; display: flex; flex-direction: column; }
        .chat-header { padding: 15px; background: var(--primary); color: white; display: flex; justify-content: space-between; }
        .chat-messages-area { flex: 1; overflow-y: auto; padding: 15px; }
        .message-row.user { text-align: left; }
        .message-row.assistant { text-align: right; }
        .bubble { display: inline-block; padding: 10px; border-radius: 10px; background: #f0f0f0; margin: 5px 0; }
        .user .bubble { background: var(--primary); color: white; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
      `}</style>
    </div>
  );
}

export default function Swing() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
