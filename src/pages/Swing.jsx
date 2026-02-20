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

// ---- الثوابت والإعدادات ----
const API_BASE = "https://raqqa-v6cd.vercel.app/api"; [cite: 216]

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
]; [cite: 217, 218, 219, 220]

// ---- الدوال المساعدة ----
function strictSanitize(text) {
  if (!text) return "";
  return text.replace(/https?:\/\/[^\s]+/g, "[رابط محذوف]").replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "");
} [cite: 221, 222]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
} [cite: 223, 224, 225]

// ---- مكونات الواجهة ----
function PostCard({ post, index }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const handleLike = () => { setLiked(!liked); setLikeCount((prev) => (liked ? prev - 1 : prev + 1)); }; [cite: 231]
  const handleShare = async () => { if (navigator.share) { try { await navigator.share({ title: "منتدى المرأة", text: strictSanitize(post.content).substring(0, 100), url: window.location.href }); } catch {} } }; [cite: 232, 233]
  const handleComment = () => { if (comment.trim()) { setComments((prev) => [...prev, comment.trim()]); setComment(""); } }; [cite: 234, 235]

  return (
    <article className="animate-fade-in-up card-style" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="post-header">
        <div className="avatar">{post.section?.[0]?.toUpperCase() || "م"}</div>
        <div style={{ flex: 1 }}>
          <div className="user-name">عضوة المنتدى</div>
          <div className="post-time">{post.createdAt ? timeAgo(post.createdAt) : "منذ قليل"}</div>
        </div>
      </div>
      <p className="post-text">{strictSanitize(post.content)}</p>
      {post.file && <div className="post-img-wrap"><img src={post.file} alt="محتوى" crossOrigin="anonymous" loading="lazy" /></div>}
      <div className="post-actions">
        <button onClick={handleLike} className={`act-btn ${liked ? 'active-like' : ''}`}>
          <Heart size={16} fill={liked ? "var(--primary)" : "none"} /> <span>{likeCount > 0 ? likeCount : ""}</span>
        </button>
        <button onClick={() => setShowComment(!showComment)} className="act-btn">
          <MessageCircle size={16} /> <span>{comments.length > 0 ? comments.length : ""}</span>
        </button>
        <button onClick={handleShare} className="act-btn" style={{ marginRight: 'auto' }}><Share2 size={16} /></button>
      </div>
      {showComment && (
        <div className="comment-box">
          {comments.map((c, i) => <div key={i} className="comm-item">{c}</div>)}
          <div className="comm-input-wrap">
            <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder="اكتبي تعليقك..." />
            <button onClick={handleComment}><Send size={16} /></button>
          </div>
        </div>
      )}
    </article>
  );
}

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
        setPosts(allPosts.filter(p => p.section?.toLowerCase() === section.id.toLowerCase()));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [section.id]); [cite: 273, 274]

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handlePublish = async () => {
    if (!newContent.trim() || publishing) return;
    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append("content", newContent.trim());
      formData.append("section", section.id);
      formData.append("type", "text");
      await fetch(`${API_BASE}/save-post`, { method: "POST", body: formData }); [cite: 278]
      setNewContent(""); setShowPublish(false); fetchPosts();
    } catch (err) { console.error(err); } finally { setPublishing(false); }
  }; [cite: 276, 277, 280]

  return (
    <div style={{ padding: "0 16px 40px" }}>
      <div className="section-head">
        <div className="head-icon" style={{ color: section.color, background: `${section.color}22` }}>{section.icon}</div>
        <h2>{section.label}</h2>
        <p>{section.description}</p>
      </div>
      <button onClick={() => setShowPublish(!showPublish)} className="pub-btn">
        <Plus size={18} /> أضيفي منشورًا جديدًا
      </button>
      {showPublish && (
        <div className="pub-form glass">
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="شاركي أفكارك..." rows={4} />
          <div className="pub-actions">
            <button onClick={handlePublish} disabled={publishing || !newContent.trim()} className="sub-btn">
              {publishing && <Loader2 size={14} className="spin" />} نشر
            </button>
            <button onClick={() => setShowPublish(false)} className="can-btn">إلغاء</button>
          </div>
        </div>
      )}
      {loading ? [1, 2].map(i => <div key={i} className="skeleton-box" />) : posts.map((post, i) => <PostCard key={i} post={post} index={i} />)}
    </div>
  );
}

function HomePage() {
  return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <div className="hero-logo"><Sparkles size={32} color="#fff" /></div>
      <h1 className="hero-title">منتدى المرأة العربية</h1>
      <p className="hero-desc">مجتمع نسائي راقٍ يجمعكِ مع نساء ملهمات من كل مكان</p>
    </div>
  );
} [cite: 312, 314]

function AIChatOverlay({ isOpen, onClose }) {
  const [messages, setMessages] = useState(() => { try { return JSON.parse(localStorage.getItem("raqqa_chats") || "[]"); } catch { return []; } });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { localStorage.setItem("raqqa_chats", JSON.stringify(messages)); }, [messages]); [cite: 326]
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { id: Date.now(), role: "user", content: input.trim() };
    setMessages(p => [...p, userMsg]); setInput(""); setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.content }) }); [cite: 331]
      const data = await res.json();
      setMessages(p => [...p, { id: Date.now() + 1, role: "assistant", content: data.reply || "عذراً لم أفهم" }]);
    } catch { setMessages(p => [...p, { id: "err", role: "assistant", content: "خطأ في الاتصال" }]); } finally { setIsLoading(false); }
  }; [cite: 337]

  if (!isOpen) return null;

  return (
    <div className="chat-overlay">
      <div className="chat-backdrop" onClick={onClose} />
      <div className="chat-card animate-slide-up">
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="chat-icon"><Sparkles size={20} /></div>
            <div><strong>المساعدة الذكية</strong><div style={{ fontSize: 10 }}>{isLoading ? "تكتب..." : "متصلة"}</div></div>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="chat-body">
          {messages.map(m => (
            <div key={m.id} className={`msg-wrap ${m.role}`}><div className="msg-bubble">{m.content}</div></div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="chat-footer">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChat()} placeholder="اكتبي رسالتكِ..." />
          <button onClick={handleChat} disabled={!input.trim() || isLoading}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

function GlassNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="top-nav-bar hide-scrollbar">
      <button onClick={() => navigate("/")} className={`nav-btn ${location.pathname === "/" ? "active" : ""}`}>
        <Sparkles size={18} /> <span>الرئيسية</span>
      </button>
      {SECTIONS.map(sec => (
        <button key={sec.id} onClick={() => navigate(sec.path)} className={`nav-btn ${location.pathname === sec.path ? "active" : ""}`} style={{ '--active-c': sec.color }}>
          {sec.icon} <span>{sec.label}</span>
        </button>
      ))}
    </nav>
  );
}

function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentSec = SECTIONS.find(s => s.path === location.pathname);

  return (
    <div className="app-container">
      <header className="app-header glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentSec && <button onClick={() => navigate("/")} className="back-btn"><ChevronDown size={20} style={{ transform: "rotate(90deg)" }} /></button>}
          <h1>{currentSec ? currentSec.label : "منتدى المرأة"}</h1>
        </div>
        <button onClick={() => setChatOpen(true)} className="ai-btn"><Sparkles size={18} /></button>
      </header>
      
      <GlassNav />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(sec => <Route key={sec.id} path={sec.path} element={<SectionPage section={sec} />} />)}
        </Routes>
      </main>

      <AIChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* دمج الـ CSS داخل الملف */}
      <style>{`
        :root { --primary: #D81B60; --text: #2D3436; --text-sec: #636E72; --glass-bg: rgba(255, 255, 255, 0.7); --radius: 20px; }
        body { margin: 0; font-family: system-ui, sans-serif; background: #FFF9FA; direction: rtl; }
        .app-container { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; position: relative; }
        .glass { background: var(--glass-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.4); }
        
        .app-header { position: sticky; top: 0; z-index: 1000; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
        .app-header h1 { font-size: 17px; margin: 0; color: var(--text); }
        .ai-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: linear-gradient(135deg, var(--primary), #E5B7A1); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(216,27,96,0.2); }
        
        .top-nav-bar { position: sticky; top: 64px; z-index: 999; display: flex; gap: 6px; padding: 10px; overflow-x: auto; background: rgba(255,255,255,0.6); border-bottom: 1px solid #eee; }
        .nav-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 12px; border: none; background: transparent; cursor: pointer; color: var(--text-sec); flex-shrink: 0; }
        .nav-btn.active { color: var(--primary); background: rgba(216,27,96,0.1); border-radius: 12px; }
        .nav-btn span { font-size: 10px; font-weight: 700; }
        
        .card-style { background: white; border-radius: var(--radius); padding: 16px; margin-bottom: 16px; border: 1px solid #f0f0f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .post-header { display: flex; gap: 10px; margin-bottom: 12px; }
        .user-name { font-size: 14px; font-weight: 600; }
        .post-time { font-size: 11px; color: var(--text-sec); }
        .post-text { font-size: 14px; line-height: 1.6; color: var(--text); margin-bottom: 12px; }
        .post-img-wrap { border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
        .post-img-wrap img { width: 100%; display: block; }
        .post-actions { display: flex; gap: 8px; border-top: 1px solid #f9f9f9; padding-top: 10px; }
        .act-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; background: #f5f5f5; border: none; border-radius: 8px; cursor: pointer; color: var(--text-sec); font-size: 12px; }
        .active-like { color: var(--primary); background: #fee; }

        .chat-overlay { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column; }
        .chat-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.3); backdrop-filter: blur(3px); }
        .chat-card { position: relative; margin-top: auto; height: 85vh; background: #fff; border-radius: 25px 25px 0 0; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 -5px 20px rgba(0,0,0,0.1); }
        .chat-header { background: var(--primary); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .msg-wrap.user { align-self: flex-start; }
        .msg-wrap.assistant { align-self: flex-end; }
        .msg-bubble { padding: 10px 15px; border-radius: 15px; font-size: 14px; max-width: 85%; }
        .user .msg-bubble { background: var(--primary); color: white; }
        .assistant .msg-bubble { background: #f0f0f0; color: var(--text); }
        .chat-footer { padding: 15px; display: flex; gap: 8px; border-top: 1px solid #eee; }
        .chat-footer input { flex: 1; border: 1px solid #ddd; padding: 10px 15px; border-radius: 20px; outline: none; }
        .chat-footer button { width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--primary); color: white; cursor: pointer; }

        .pub-btn { width: 100%; padding: 12px; border: 2px dashed rgba(216,27,96,0.2); background: none; border-radius: 15px; color: var(--primary); font-weight: bold; cursor: pointer; margin-bottom: 16px; }
        .pub-form { padding: 15px; border-radius: 15px; margin-bottom: 20px; }
        .pub-form textarea { width: 100%; border: 1px solid #eee; border-radius: 10px; padding: 10px; font-family: inherit; }
        .hero-logo { width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .hero-title { font-size: 24px; margin-bottom: 10px; }
        .hero-desc { color: var(--text-sec); font-size: 15px; }

        .animate-fade-in-up { animation: fup 0.4s ease-out forwards; opacity: 0; }
        @keyframes fup { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: sup 0.4s cubic-bezier(0.1, 0.8, 0.2, 1); }
        @keyframes sup { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
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
