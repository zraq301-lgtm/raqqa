import { useState, useEffect, useRef, useCallback } from "react";
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

[cite_start]// ---- Constants ---- [cite: 3]
const API_BASE = "https://raqqa-v6cd.vercel.app/api";

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  description: string;
}

const SECTIONS: Section[] = [
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

[cite_start]// ---- Helpers ---- [cite: 8]
function strictSanitize(text: string): string {
  if (!text) return "";
  return text
    .replace(/https?:\/\/[^\s]+/g, "[رابط محذوف]")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

[cite_start]// ---- Types ---- [cite: 13, 14]
interface Post {
  _id?: string;
  id?: string;
  content: string;
  section: string;
  file?: string;
  createdAt?: string;
  likes?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

[cite_start]// ---- Post Card Component ---- [cite: 15]
function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

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
      } catch { /* user cancelled */ }
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
          <img src={post.file} alt="محتوى المنشور" crossOrigin="anonymous" loading="lazy" />
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

        <button onClick={handleShare} className="action-btn share-btn">
          <Share2 size={16} />
        </button>
      </div>

      {showComment && (
        <div className="comment-section animate-fade-in">
          {comments.map((c, i) => (
            <div key={i} className="comment-bubble">{c}</div>
          ))}
          <div className="comment-input-row">
            <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder="اكتبي تعليقك..." />
            <button onClick={handleComment} className="send-btn"><Send size={16} /></button>
          </div>
        </div>
      )}
    </article>
  );
}

[cite_start]// ---- Section Page ---- [cite: 58]
function SectionPage({ section }: { section: Section }) {
  const [posts, setPosts] = useState<Post[]>([]);
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
        setPosts(allPosts.filter((p: Post) => p.section?.toLowerCase() === section.id.toLowerCase()));
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
        <Plus size={18} /> أضيفي منشورًا جديدًا
      </button>

      {showPublish && (
        <div className="publish-form glass animate-fade-in">
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="شاركي أفكارك..." rows={4} />
          <div className="form-actions">
            <button onClick={handlePublish} disabled={publishing || !newContent.trim()} className="submit-btn">
              {publishing && <Loader2 size={14} className="spin" />} نشر
            </button>
            <button onClick={() => setShowPublish(false)} className="cancel-btn">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="skeleton-list">
          {[1, 2].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state glass">
          <div className="empty-icon">{section.icon}</div>
          <p>لا توجد منشورات بعد في هذا القسم.<br />كوني أول من يشارك!</p>
        </div>
      ) : (
        posts.map((post, i) => <PostCard key={post._id || post.id || i} post={post} index={i} />)
      )}
    </div>
  );
}

[cite_start]// ---- Home Page ---- [cite: 95]
function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="hero animate-fade-in-up">
        <div className="hero-logo"><Sparkles size={32} color="#fff" /></div>
        <h1>منتدى المرأة العربية</h1>
        <p>مجتمع نسائي راقٍ يجمعكِ مع نساء ملهمات من كل مكان</p>
      </div>

      <div className="sections-grid">
        {SECTIONS.map((section, i) => (
          <button key={section.id} onClick={() => navigate(section.path)} className="section-card animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="icon-circle" style={{ color: section.color, background: `${section.color}15` }}>{section.icon}</div>
            <div className="label">{section.label}</div>
            <div className="desc">{section.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

[cite_start]// ---- AI Chat Overlay ---- [cite: 111]
function AIChatOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("raqqa_chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem("raqqa_chats", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.content }) });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply || data.response || "...", timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      setMessages(prev => [...prev, { id: "err", role: "assistant", content: "خطأ في الاتصال. حاولي ثانية.", timestamp: Date.now() }]);
    } finally { setIsLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay animate-fade-in">
      <div className="chat-backdrop" onClick={onClose} />
      <div className="chat-window animate-slide-up">
        <div className="chat-header">
          <div className="chat-title-group">
            <div className="chat-icon-shell"><Sparkles size={20} /></div>
            <div>
              <div className="chat-name">المساعدة الذكية</div>
              <div className="chat-status">{isLoading ? "تكتب..." : "متصلة"}</div>
            </div>
          </div>
          <button onClick={onClose} className="close-chat-btn"><X size={20} /></button>
        </div>

        <div className="chat-messages-area">
          {messages.length === 0 && (
            <div className="chat-empty">
              <Sparkles size={40} className="faint" />
              <p>مرحبًا بكِ! أنا مساعدتكِ الذكية. اسأليني أي شيء.</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              <div className="bubble">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-footer">
          <div className="input-box-wrapper">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="اكتبي رسالتكِ..." />
            <button onClick={handleChat} disabled={!input.trim() || isLoading} className="chat-send-trigger"><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

[cite_start]// ---- Navigation Bar (Placed at Top) ---- [cite: 187]
function GlassNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="glass-nav-top hide-scrollbar">
      <button onClick={() => navigate("/")} className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
        <Sparkles size={18} />
        <span>الرئيسية</span>
      </button>
      {SECTIONS.map(sec => (
        <button key={sec.id} onClick={() => navigate(sec.path)} className={`nav-item ${location.pathname === sec.path ? "active" : ""}`} style={{ '--active-color': sec.color } as any}>
          {sec.icon}
          <span>{sec.label}</span>
        </button>
      ))}
    </nav>
  );
}

[cite_start]// ---- App Header ---- [cite: 198]
function AppHeader({ onChatOpen }: { onChatOpen: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSection = SECTIONS.find(s => s.path === location.pathname);

  return (
    <header className="main-header glass">
      <div className="header-left">
        {currentSection && <button onClick={() => navigate("/")} className="back-btn"><ChevronDown size={20} style={{ transform: "rotate(90deg)" }} /></button>}
        <h1>{currentSection ? currentSection.label : "منتدى المرأة"}</h1>
      </div>
      <button onClick={onChatOpen} className="ai-trigger-btn"><Sparkles size={18} /></button>
    </header>
  );
}

[cite_start]// ---- Layout ---- [cite: 208]
function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="app-shell">
      <AppHeader onChatOpen={() => setChatOpen(true)} />
      <GlassNav />
      <main className="content-area">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(sec => <Route key={sec.id} path={sec.path} element={<SectionPage section={sec} />} />)}
        </Routes>
      </main>
      <AIChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Embedded CSS */}
      <style>{`
        :root {
          --primary: #D81B60;
          --rose-gold: #E5B7A1;
          --bg: #FFF9FA;
          --text: #2D3436;
          --text-secondary: #636E72;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.4);
          --radius: 20px;
          --radius-sm: 12px;
          --radius-lg: 28px;
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); direction: rtl; }
        .app-shell { max-width: 480px; margin: 0 auto; min-height: 100dvh; display: flex; flexDirection: column; position: relative; }
        .glass { background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border); }
        .main-header { position: sticky; top: 0; z-index: 1000; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.3); }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .header-left h1 { font-size: 18px; margin: 0; }
        .ai-trigger-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: linear-gradient(135deg, var(--primary), var(--rose-gold)); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(216,27,96,0.2); }
        
        .glass-nav-top { position: sticky; top: 64px; z-index: 999; display: flex; overflow-x: auto; white-space: nowrap; padding: 10px; gap: 8px; background: rgba(255,255,255,0.5); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.05); }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 12px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; flex-shrink: 0; }
        .nav-item.active { background: rgba(216,27,96,0.1); color: var(--primary); }
        .nav-item.active[style*='--active-color'] { color: var(--active-color); background: color-mix(in srgb, var(--active-color), transparent 90%); }
        .nav-item span { font-size: 11px; font-weight: 600; }

        .content-area { flex: 1; padding-bottom: 40px; }
        .card-glass { background: white; border-radius: var(--radius); padding: 20px; margin: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .post-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .avatar-gradient { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--rose-gold)); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .post-content { line-height: 1.6; margin-bottom: 15px; }
        .post-image-container { border-radius: 12px; overflow: hidden; margin-bottom: 15px; }
        .post-image-container img { width: 100%; display: block; }
        .post-actions { display: flex; gap: 10px; border-top: 1px solid #eee; pt: 12px; }
        .action-btn { background: #f5f5f5; border: none; padding: 8px 14px; border-radius: 8px; display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary); }
        .action-btn.active { color: var(--primary); background: #fee; }
        
        .chat-modal-overlay { position: fixed; inset: 0; z-index: 2000; display: flex; flex-direction: column; }
        .chat-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
        .chat-window { position: relative; margin-top: auto; height: 85vh; background: white; border-radius: 30px 30px 0 0; display: flex; flex-direction: column; overflow: hidden; }
        .chat-header { padding: 16px 20px; background: linear-gradient(135deg, var(--primary), var(--rose-gold)); color: white; display: flex; justify-content: space-between; align-items: center; }
        .chat-title-group { display: flex; align-items: center; gap: 12px; }
        .chat-messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .message-row.user { align-self: flex-start; }
        .message-row.assistant { align-self: flex-end; }
        .message-row .bubble { padding: 12px 16px; border-radius: 15px; max-width: 85%; font-size: 14px; line-height: 1.5; }
        .user .bubble { background: var(--primary); color: white; }
        .assistant .bubble { background: #f0f0f0; color: var(--text); }
        .chat-input-footer { padding: 15px; border-top: 1px solid #eee; }
        .input-box-wrapper { display: flex; gap: 10px; background: #f8f8f8; padding: 5px; border-radius: 30px; border: 1px solid #eee; }
        .input-box-wrapper input { flex: 1; border: none; background: transparent; padding: 10px 15px; outline: none; }
        .chat-send-trigger { width: 40px; height: 40px; border-radius: 50%; border: none; background: var(--primary); color: white; cursor: pointer; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.1, 0.8, 0.2, 1); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
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
