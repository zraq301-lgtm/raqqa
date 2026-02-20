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

// الثوابت
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

// وظائف مساعدة
const strictSanitize = (text) => {
  if (!text) return "";
  return text.replace(/https?:\/\/[^\s]+/g, "[رابط]").replace(/<[^>]*>/g, "");
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} س`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
};

// مكون بطاقة المنشور
function PostCard({ post, index }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => (liked ? prev - 1 : prev + 1));
  };

  const handleComment = () => {
    if (comment.trim()) {
      setComments([...comments, comment.trim()]);
      setComment("");
    }
  };

  return (
    <div className="post-card animate-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="post-header">
        <div className="post-avatar">{post.section ? post.section[0].toUpperCase() : "M"}</div>
        <div className="post-meta">
          <span className="post-user">عضوة رقة</span>
          <span className="post-date">{post.createdAt ? timeAgo(post.createdAt) : "الآن"}</span>
        </div>
      </div>
      <p className="post-body">{strictSanitize(post.content)}</p>
      {post.file && <img src={post.file} className="post-img" alt="محتوى" crossOrigin="anonymous" />}
      <div className="post-actions">
        <button onClick={handleLike} className={liked ? "act-btn liked" : "act-btn"}>
          <Heart size={18} fill={liked ? "#D81B60" : "none"} /> {likeCount}
        </button>
        <button onClick={() => setShowComment(!showComment)} className="act-btn">
          <MessageCircle size={18} /> {comments.length}
        </button>
      </div>
      {showComment && (
        <div className="comment-area">
          {comments.map((c, i) => <div key={i} className="comm-text">{c}</div>)}
          <div className="comm-input">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتبي تعليقاً..." />
            <button onClick={handleComment}><Send size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// صفحة القسم
function SectionPage({ section }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/get-posts`);
      const d = await r.json();
      const list = d.posts || d || [];
      setPosts(list.filter(p => p.section?.toLowerCase() === section.id.toLowerCase()));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [section.id]);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    const fd = new FormData();
    fd.append("content", text);
    fd.append("section", section.id);
    await fetch(`${API_BASE}/save-post`, { method: "POST", body: fd });
    setText(""); setShowAdd(false); load();
  };

  return (
    <div className="page-content">
      <div className="sec-intro">
        <div className="sec-icon" style={{ background: section.color + "20", color: section.color }}>{section.icon}</div>
        <h2>{section.label}</h2>
        <p>{section.description}</p>
      </div>
      
      <button className="add-trigger" onClick={() => setShowAdd(!showAdd)}>
        <Plus size={20} /> شاركي في {section.label}
      </button>

      {showAdd && (
        <div className="add-form glass">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="ماذا يدور في ذهنك؟" rows="3" />
          <div className="add-footer">
            <button className="btn-main" onClick={send}>نشر المنشور</button>
            <button className="btn-sub" onClick={() => setShowAdd(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {loading ? <div className="loader"><Loader2 className="spin" /></div> : 
        posts.length === 0 ? <p className="empty">لا توجد منشورات هنا بعد..</p> :
        posts.map((p, i) => <PostCard key={i} post={p} index={i} />)
      }
    </div>
  );
}

// الصفحة الرئيسية (بدون شبكة الأقسام)
function HomePage() {
  return (
    <div className="home-hero">
      <div className="hero-glow">
        <Sparkles size={40} color="#fff" />
      </div>
      <h1>مرحباً بكِ في رقة</h1>
      <p>مجتمع نسائي آمن لتبادل الخبرات والجمال</p>
      <div className="home-hint">اختر قسماً من الأعلى للبدء</div>
    </div>
  );
}

// شريط التنقل العلوي
function GlassNav() {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <nav className="glass-nav">
      <button onClick={() => nav("/")} className={loc.pathname === "/" ? "nav-link active" : "nav-link"}>الرئيسية</button>
      {SECTIONS.map(s => (
        <button key={s.id} onClick={() => nav(s.path)} className={loc.pathname === s.path ? "nav-link active" : "nav-link"}>
          {s.label}
        </button>
      ))}
    </nav>
  );
}

// الهيكل الرئيسي
function AppLayout() {
  const [chat, setChat] = useState(false);
  return (
    <div className="app-shell">
      <header className="app-header glass">
        <span className="brand">رقة</span>
        <button className="ai-btn" onClick={() => setChat(true)}><Sparkles size={18} /></button>
      </header>

      <GlassNav />

      <main className="main-scroll">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(s => <Route key={s.id} path={s.path} element={<SectionPage section={s} />} />)}
        </Routes>
      </main>

      {chat && (
        <div className="chat-ui">
          <div className="chat-win">
            <div className="chat-top">
              <span>المساعدة الذكية</span>
              <button onClick={() => setChat(false)}><X size={20} /></button>
            </div>
            <div className="chat-msgs">
              <div className="msg-bot">مرحباً بكِ! كيف يمكنني مساعدتكِ اليوم في عالم رقة؟</div>
            </div>
            <div className="chat-in">
              <input placeholder="اسألي رقة..." />
              <button><Send size={18} /></button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root { --primary: #D81B60; --bg: #FFF9FA; --text: #2D3436; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, sans-serif; background: var(--bg); direction: rtl; color: var(--text); }
        .app-shell { max-width: 500px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #fff; position: relative; }
        .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
        
        .app-header { position: sticky; top: 0; z-index: 100; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .brand { font-size: 22px; font-weight: 800; color: var(--primary); }
        .ai-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: linear-gradient(135deg, var(--primary), #FFA726); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .glass-nav { position: sticky; top: 70px; z-index: 99; display: flex; overflow-x: auto; padding: 10px; gap: 8px; background: #fff; border-bottom: 1px solid #eee; scrollbar-width: none; }
        .glass-nav::-webkit-scrollbar { display: none; }
        .nav-link { padding: 8px 16px; border-radius: 20px; border: 1px solid #f0f0f0; background: #f9f9f9; white-space: nowrap; cursor: pointer; font-size: 13px; color: #666; transition: 0.3s; }
        .nav-link.active { background: var(--primary); color: #fff; border-color: var(--primary); }

        .home-hero { padding: 60px 20px; text-align: center; }
        .hero-glow { width: 80px; height: 80px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 10px 30px rgba(216,27,96,0.3); }
        .home-hint { margin-top: 30px; font-size: 13px; color: var(--primary); font-weight: bold; }

        .sec-intro { padding: 20px; text-align: center; }
        .sec-icon { width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        
        .add-trigger { width: calc(100% - 40px); margin: 0 20px 20px; padding: 12px; border-radius: 12px; border: 2px dashed #D81B6050; background: #fff; color: var(--primary); font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .add-form { margin: 0 20px 20px; padding: 15px; border-radius: 15px; border: 1px solid #eee; }
        .add-form textarea { width: 100%; border: none; outline: none; resize: none; font-family: inherit; }
        .add-footer { display: flex; gap: 10px; margin-top: 10px; }
        .btn-main { background: var(--primary); color: #fff; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; }
        .btn-sub { background: #f0f0f0; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; }

        .post-card { background: #fff; margin: 0 20px 15px; padding: 15px; border-radius: 15px; border: 1px solid #f0f0f0; }
        .post-header { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
        .post-avatar { width: 35px; height: 35px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
        .post-meta { display: flex; flex-direction: column; }
        .post-user { font-size: 13px; font-weight: bold; }
        .post-date { font-size: 10px; color: #999; }
        .post-img { width: 100%; border-radius: 10px; margin-top: 10px; }
        .post-actions { display: flex; gap: 15px; margin-top: 12px; border-top: 1px solid #f9f9f9; padding-top: 10px; }
        .act-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: #666; font-size: 12px; }
        .liked { color: var(--primary); }

        .chat-ui { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: flex-end; }
        .chat-win { background: #fff; border-radius: 20px 20px 0 0; height: 80vh; display: flex; flex-direction: column; }
        .chat-top { padding: 15px; background: var(--primary); color: #fff; display: flex; justify-content: space-between; border-radius: 20px 20px 0 0; }
        .chat-msgs { flex: 1; padding: 20px; overflow-y: auto; }
        .msg-bot { background: #f0f0f0; padding: 10px 15px; border-radius: 15px; max-width: 80%; font-size: 14px; }
        .chat-in { padding: 15px; display: flex; gap: 10px; border-top: 1px solid #eee; }
        .chat-in input { flex: 1; border: 1px solid #eee; padding: 10px; border-radius: 10px; outline: none; }
        .chat-in button { background: var(--primary); color: #fff; border: none; border-radius: 10px; padding: 0 15px; cursor: pointer; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-up { animation: up 0.4s ease-out forwards; opacity: 0; }
        @keyframes up { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
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
