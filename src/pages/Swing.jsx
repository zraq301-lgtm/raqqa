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

// ---- 1. Constants & Configuration ---- //
const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const SECTIONS = [
  {
    id: "motherhood",
    label: "الأمومة",
    icon: <Baby size={20} />,
    path: "/motherhood",
    color: "#E91E63",
    description: "عالم الأمومة والحنان",
  },
  {
    id: "kids",
    label: "الصغار",
    icon: <GraduationCap size={20} />,
    path: "/kids",
    color: "#9C27B0",
    description: "أكاديمية الأطفال والتعليم",
  },
  {
    id: "wellness",
    label: "العافية",
    icon: <HeartPulse size={20} />,
    path: "/wellness",
    color: "#00BCD4",
    description: "واحة الصحة والجمال",
  },
  {
    id: "fashion",
    label: "الأناقة",
    icon: <Gem size={20} />,
    path: "/fashion",
    color: "#B76E79",
    description: "عالم الموضة والأناقة",
  },
  {
    id: "cooking",
    label: "المطبخ",
    icon: <ChefHat size={20} />,
    path: "/cooking",
    color: "#FF5722",
    description: "فنون الطبخ والحلويات",
  },
  {
    id: "home",
    label: "المنزل",
    icon: <Home size={20} />,
    path: "/home-decor",
    color: "#795548",
    description: "ديكور وأركان المنزل",
  },
  {
    id: "empowerment",
    label: "التمكين",
    icon: <Rocket size={20} />,
    path: "/empowerment",
    color: "#FF9800",
    description: "مسارات التمكين والنجاح",
  },
  {
    id: "relationships",
    label: "العلاقات",
    icon: <Users size={20} />,
    path: "/relationships",
    color: "#F44336",
    description: "جسور التواصل والعلاقات",
  },
  {
    id: "hobbies",
    label: "الهوايات",
    icon: <Palette size={20} />,
    path: "/hobbies",
    color: "#4CAF50",
    description: "عالم الهوايات والإبداع",
  },
  {
    id: "lounge",
    label: "الاسترخاء",
    icon: <Coffee size={20} />,
    path: "/lounge",
    color: "#607D8B",
    description: "صالة الراحة والاسترخاء",
  },
];

// ---- 2. Helpers ---- //
function strictSanitize(text) {
  if (!text) return "";
  return text
    .replace(/https?:\/\/[^\s]+/g, "[رابط محذوف]")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

function timeAgo(dateStr) {
  if (!dateStr) return "منذ قليل";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

// ---- 3. Components ---- //

function PostCard({ post, index }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  if (!post) return null;

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
      } catch (err) { /* ignore */ }
    }
  };

  const handleComment = () => {
    if (comment.trim()) {
      setComments((prev) => [...prev, comment.trim()]);
      setComment("");
    }
  };

  return (
    <article
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 80}ms`,
        background: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border, rgba(0,0,0,0.1))",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: `linear-gradient(135deg, #D81B60, #FFB7C5)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0
        }}>
          {post.section?.[0]?.toUpperCase() || "م"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text, #333)" }}>عضوة المنتدى</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary, #777)" }}>
            {post.createdAt ? timeAgo(post.createdAt) : "منذ قليل"}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text, #333)", marginBottom: "16px", wordBreak: "break-word", textAlign: "right", direction: "rtl" }}>
        {strictSanitize(post.content)}
      </p>

      {post.file && (
        <div style={{ borderRadius: "8px", overflow: "hidden", marginBottom: "16px" }}>
          <img src={post.file} alt="محتوى المنشور" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} loading="lazy" />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <button onClick={handleLike} style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "none",
          background: liked ? "rgba(216, 27, 96, 0.1)" : "rgba(0,0,0,0.03)",
          color: liked ? "#D81B60" : "#777", cursor: "pointer"
        }}>
          <Heart size={16} fill={liked ? "#D81B60" : "none"} />
          <span>{likeCount > 0 ? likeCount : ""}</span>
        </button>

        <button onClick={() => setShowComment(!showComment)} style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "none",
          background: showComment ? "rgba(216, 27, 96, 0.1)" : "rgba(0,0,0,0.03)", color: showComment ? "#D81B60" : "#777", cursor: "pointer"
        }}>
          <MessageCircle size={16} />
          <span>{comments.length > 0 ? comments.length : ""}</span>
        </button>

        <button onClick={handleShare} style={{ marginRight: "auto", background: "none", border: "none", color: "#777", cursor: "pointer" }}>
          <Share2 size={16} />
        </button>
      </div>

      {showComment && (
        <div style={{ marginTop: "12px" }}>
          {comments.map((c, i) => (
            <div key={i} style={{ padding: "10px 14px", background: "rgba(0,0,0,0.02)", borderRadius: "8px", marginBottom: "8px", fontSize: 13, textAlign: "right" }}>
              {c}
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder="اكتبي تعليقك..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", direction: "rtl", outline: "none" }} />
            <button onClick={handleComment} style={{ padding: "10px 14px", borderRadius: "8px", border: "none", background: "#D81B60", color: "#fff", cursor: "pointer" }}>
              <Send size={16} />
            </button>
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
        const filtered = Array.isArray(allPosts) ? allPosts.filter(p => p.section?.toLowerCase() === section.id.toLowerCase()) : [];
        setPosts(filtered);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [section.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ textAlign: "center", padding: "28px 16px 20px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${section.color}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: section.color }}>
          {section.icon}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{section.label}</h2>
        <p style={{ fontSize: 14, color: "#777" }}>{section.description}</p>
      </div>

      <button onClick={() => setShowPublish(!showPublish)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px dashed #D81B6044", background: "transparent", color: "#D81B60", cursor: "pointer", fontWeight: 600, marginBottom: "16px" }}>
        <Plus size={18} style={{ verticalAlign: "middle", marginLeft: "8px" }} />
        أضيفي منشورًا جديدًا
      </button>

      {showPublish && (
        <div style={{ background: "white", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid #eee" }}>
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="شاركي أفكارك مع المجتمع..." rows={4} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", direction: "rtl", resize: "none" }} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={handlePublish} disabled={publishing} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#D81B60", color: "#fff", cursor: "pointer", opacity: publishing ? 0.6 : 1 }}>
              {publishing ? <Loader2 size={14} className="animate-spin" /> : "نشر"}
            </button>
            <button onClick={() => setShowPublish(false)} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ddd", background: "none", cursor: "pointer" }}>إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2].map(i => <div key={i} style={{ height: 120, background: "#f0f0f0", borderRadius: "12px" }} />)}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#777" }}>
          <p>لا توجد منشورات بعد في هذا القسم. كوني أول من يشارك!</p>
        </div>
      ) : (
        posts.map((post, i) => <PostCard key={post._id || i} post={post} index={i} />)
      )}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ textAlign: "center", padding: "32px 16px 24px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #D81B60, #FFB7C5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Sparkles size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>منتدى المرأة العربية</h1>
        <p style={{ fontSize: 15, color: "#777", maxWidth: 300, margin: "0 auto" }}>مجتمع نسائي راقٍ يجمعكِ مع نساء ملهمات من كل مكان</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        {SECTIONS.map((section, i) => (
          <button key={section.id} onClick={() => navigate(section.path)} style={{ background: "white", border: "1px solid #eee", borderRadius: "12px", padding: "20px 16px", cursor: "pointer", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${section.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: section.color }}>
              {section.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{section.label}</div>
            <div style={{ fontSize: 11, color: "#777" }}>{section.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AIChatOverlay({ isOpen, onClose }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("raqqa_chats");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("raqqa_chats", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: data.reply || data.message || "عذرًا، لم أستطع فهم ذلك." }]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "عذرًا، حدث خطأ في الاتصال." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", marginTop: "auto", height: "80dvh", background: "#fff", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", background: "linear-gradient(135deg, #D81B60, #FFB7C5)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>المساعدة الذكية</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff" }}><X /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ alignSelf: msg.role === "user" ? "flex-start" : "flex-end", maxWidth: "80%", padding: "10px 14px", borderRadius: "12px", background: msg.role === "user" ? "#D81B60" : "#f0f0f0", color: msg.role === "user" ? "#fff" : "#333", textAlign: "right", direction: "rtl" }}>
              {msg.content}
            </div>
          ))}
          {isLoading && <div style={{ alignSelf: "flex-end", padding: "10px", color: "#777" }}>جارِ التفكير...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: "12px", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="اكتبي سؤالك هنا..." style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ddd", outline: "none", direction: "rtl" }} />
          <button onClick={handleChat} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "#D81B60", color: "#fff", cursor: "pointer" }}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}

function GlassNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", display: "flex", gap: "5px", padding: "10px", borderTop: "1px solid #eee", overflowX: "auto", zIndex: 900 }}>
      <button onClick={() => navigate("/")} style={{ flexShrink: 0, padding: "8px 12px", border: "none", background: location.pathname === "/" ? "#D81B6015" : "transparent", color: location.pathname === "/" ? "#D81B60" : "#777", cursor: "pointer", borderRadius: "8px", textAlign: "center" }}>
        <Sparkles size={18} /><div style={{ fontSize: 10 }}>الرئيسية</div>
      </button>
      {SECTIONS.map(sec => (
        <button key={sec.id} onClick={() => navigate(sec.path)} style={{ flexShrink: 0, padding: "8px 12px", border: "none", background: location.pathname === sec.path ? `${sec.color}15` : "transparent", color: location.pathname === sec.path ? sec.color : "#777", cursor: "pointer", borderRadius: "8px", textAlign: "center" }}>
          {React.cloneElement(sec.icon, { size: 18 })}<div style={{ fontSize: 10 }}>{sec.label}</div>
        </button>
      ))}
    </nav>
  );
}

function AppHeader({ onChatOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSection = SECTIONS.find(s => s.path === location.pathname);
  return (
    <header style={{ position: "sticky", top: 0, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", zIndex: 800 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {currentSection && <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}><ChevronDown style={{ transform: "rotate(90deg)" }} /></button>}
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>{currentSection ? currentSection.label : "منتدى المرأة"}</h1>
      </div>
      <button onClick={onChatOpen} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#D81B60", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={18} />
      </button>
    </header>
  );
}

function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div style={{ minHeight: "100dvh", maxWidth: 480, margin: "0 auto", position: "relative", background: "#fafafa" }}>
      <AppHeader onChatOpen={() => setChatOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(sec => (
            <Route key={sec.id} path={sec.path} element={<SectionPage section={sec} />} />
          ))}
        </Routes>
      </main>
      <GlassNav />
      <AIChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

// ---- 4. Root Export ---- //
export default function Swing() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
