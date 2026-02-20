import { useState, useEffect, useRef, useCallback } from "react"; [cite: 1]
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom"; [cite: 1]
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
} from "lucide-react"; [cite: 2]

// ---- Constants ---- //
const API_BASE = "https://raqqa-v6cd.vercel.app/api"; [cite: 3]

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string; [cite: 4]
  description: string;
}

const SECTIONS: Section[] = [
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
    icon: <HeartPulse size={20} />, [cite: 5]
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
    id: "home", [cite: 6]
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
    color: "#F44336", [cite: 7]
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

// ---- Helpers ---- //
function strictSanitize(text: string): string { [cite: 8]
  if (!text) return "";
  return text [cite: 9]
    .replace(/https?:\/\/[^\s]+/g, "[رابط محذوف]")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
} [cite: 10]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن"; [cite: 11]
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`; [cite: 12]
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
} [cite: 13]

// ---- Types ---- //
interface Post {
  _id?: string;
  id?: string;
  content: string;
  section: string;
  type?: string;
  file?: string;
  createdAt?: string; [cite: 14]
  likes?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
} [cite: 15]

// ---- Post Card Component ---- //
function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0); [cite: 16]
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]); [cite: 17]

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1)); [cite: 18]
  };

  const handleShare = async () => { [cite: 19]
    if (navigator.share) {
      try {
        await navigator.share({
          title: "منتدى المرأة",
          text: strictSanitize(post.content).substring(0, 100),
          url: window.location.href,
        });
      } catch { [cite: 20]
        /* user cancelled */
      }
    }
  };

  const handleComment = () => { [cite: 21]
    if (comment.trim()) {
      setComments((prev) => [...prev, comment.trim()]);
      setComment(""); [cite: 22]
    }
  };

  return (
    <article
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 80}ms`,
        opacity: 0,
        background: "var(--glass-bg)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius)",
        padding: "20px",
        marginBottom: "16px", [cite: 23]
        boxShadow: "var(--card-shadow)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "14px", [cite: 24]
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: `linear-gradient(135deg, var(--primary), var(--rose-gold))`,
            display: "flex", [cite: 25]
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {post.section?.[0]?.toUpperCase() || "م"} [cite: 26, 27]
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}> [cite: 28]
            عضوة المنتدى
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}> [cite: 29]
            {post.createdAt ? timeAgo(post.createdAt) : "منذ قليل"} [cite: 30]
          </div>
        </div>
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text)", marginBottom: "16px", wordBreak: "break-word" }}> [cite: 31]
        {strictSanitize(post.content)}
      </p>

      {post.file && (
        <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "16px" }}> [cite: 32]
          <img src={post.file} alt="محتوى المنشور" crossOrigin="anonymous"
            style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} [cite: 33]
            loading="lazy" />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}> [cite: 34]
        <button onClick={handleLike} aria-label={liked ? "إزالة الإعجاب" : "إعجاب"} [cite: 35, 36]
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none",
            background: liked ? "rgba(216, 27, 96, 0.1)" : "rgba(0,0,0,0.03)", [cite: 37]
            color: liked ? "var(--primary)" : "var(--text-secondary)", [cite: 38]
            cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
          }}>
          <Heart size={16} fill={liked ? "var(--primary)" : "none"} stroke={liked ? "var(--primary)" : "currentColor"} /> [cite: 39, 40, 41]
          <span>{likeCount > 0 ? likeCount : ""}</span> [cite: 42]
        </button>

        <button onClick={() => setShowComment(!showComment)} aria-label="تعليق"
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", [cite: 43]
            borderRadius: "var(--radius-sm)", border: "none",
            background: showComment ? "rgba(216, 27, 96, 0.1)" : "rgba(0,0,0,0.03)", [cite: 44]
            color: showComment ? "var(--primary)" : "var(--text-secondary)", [cite: 45]
            cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
          }}>
          <MessageCircle size={16} />
          <span>{comments.length > 0 ? comments.length : ""}</span> [cite: 46, 47]
        </button>

        <button onClick={handleShare} aria-label="مشاركة"
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", [cite: 48]
            borderRadius: "var(--radius-sm)", border: "none", background: "rgba(0,0,0,0.03)",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 500,
            fontFamily: "inherit", transition: "all 0.2s", marginRight: "auto", [cite: 49]
          }}>
          <Share2 size={16} />
        </button>
      </div>

      {showComment && (
        <div className="animate-fade-in" style={{ marginTop: "12px" }}> [cite: 50]
          {comments.map((c, i) => (
            <div key={i} style={{ padding: "10px 14px", background: "rgba(0,0,0,0.02)", borderRadius: "var(--radius-sm)", marginBottom: "8px", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}> [cite: 51, 52]
              {c}
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <input value={comment} onChange={(e) => setComment(e.target.value)} [cite: 53]
              onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder="اكتبي تعليقك..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--radius-sm)", [cite: 54]
                border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 13, fontFamily: "inherit",
                outline: "none", direction: "rtl" }} [cite: 55] />
            <button onClick={handleComment} aria-label="إرسال التعليق"
              style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", [cite: 56]
                border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}> [cite: 57]
              <Send size={16} />
            </button>
          </div>
        </div>
      )} [cite: 58]
    </article>
  );
}

// ---- Section Page Component ---- //
function SectionPage({ section }: { section: Section }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); [cite: 59]
  const [showPublish, setShowPublish] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [publishing, setPublishing] = useState(false);

  const fetchPosts = useCallback(async () => { [cite: 60]
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      if (res.ok) {
        const data = await res.json();
        const allPosts = data.posts || data || [];
        const filtered = allPosts.filter((p: Post) => p.section?.toLowerCase() === section.id.toLowerCase()); [cite: 61]
        setPosts(filtered);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [section.id]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]); [cite: 62]

  const handlePublish = async () => { [cite: 63]
    if (!newContent.trim() || publishing) return;
    setPublishing(true);
    try { [cite: 64]
      const formData = new FormData();
      formData.append("content", newContent.trim());
      formData.append("section", section.id);
      formData.append("type", "text");
      await fetch(`${API_BASE}/save-post`, { method: "POST", body: formData }); [cite: 65]
      setNewContent(""); [cite: 66]
      setShowPublish(false);
      fetchPosts();
    } catch (err) {
      console.error("Error publishing:", err);
    } finally { [cite: 67]
      setPublishing(false);
    }
  };

  return ( [cite: 68]
    <div style={{ padding: "20px 16px 40px" }}>
      <div className="animate-fade-in-up" style={{ textAlign: "center", padding: "28px 16px 20px" }}>
        <div style={{ width: 56, height: 56, [cite: 69]
          borderRadius: "50%", background: `linear-gradient(135deg, ${section.color}22, ${section.color}44)`,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: section.color }}> [cite: 70]
          {section.icon}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{section.label}</h2> [cite: 71]
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{section.description}</p> [cite: 72]
      </div>

      <button onClick={() => setShowPublish(!showPublish)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", [cite: 73]
          width: "100%", padding: "14px", borderRadius: "var(--radius)", border: "2px dashed rgba(216,27,96,0.2)",
          background: showPublish ? "rgba(216,27,96,0.05)" : "transparent", [cite: 74]
          color: "var(--primary)", cursor: "pointer", fontSize: 14, fontWeight: 600,
          fontFamily: "inherit", marginBottom: "16px", transition: "all 0.2s" }}>
        <Plus size={18} /> [cite: 75]
        أضيفي منشورًا جديدًا
      </button>

      {showPublish && (
        <div className="glass animate-fade-in" style={{ borderRadius: "var(--radius)", padding: "16px", marginBottom: "16px" }}> [cite: 76]
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
            placeholder="شاركي أفكارك مع المجتمع..." rows={4}
            style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", [cite: 77]
              border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 14, fontFamily: "inherit", [cite: 78]
              outline: "none", resize: "vertical", direction: "rtl", lineHeight: 1.7 }} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-start" }}> [cite: 79]
            <button onClick={handlePublish} disabled={publishing || !newContent.trim()} [cite: 80, 81]
              style={{ padding: "10px 24px", borderRadius: "var(--radius-sm)", border: "none",
                background: "var(--primary)", color: "#fff", cursor: publishing ? "not-allowed" : "pointer", [cite: 82, 83]
                fontSize: 14, fontWeight: 600, fontFamily: "inherit", opacity: publishing || !newContent.trim() ? 0.6 : 1, [cite: 84]
                display: "flex", alignItems: "center", gap: "6px" }}>
              {publishing && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />} [cite: 85]
              نشر
            </button>
            <button onClick={() => { setShowPublish(false); setNewContent(""); }} [cite: 86]
              style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,0,0,0.08)",
                background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}> [cite: 87]
              إلغاء [cite: 88]
            </button>
          </div>
        </div>
      )}

      {loading ? ( [cite: 89]
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius)" }} />)} [cite: 90]
        </div>
      ) : posts.length === 0 ? ( [cite: 91]
        <div className="glass animate-fade-in" style={{ textAlign: "center", padding: "48px 24px", borderRadius: "var(--radius)" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}> [cite: 92]
            {section.icon}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}> [cite: 93]
            لا توجد منشورات بعد في هذا القسم.<br />كوني أول من يشارك! [cite: 94]
          </p>
        </div>
      ) : (
        posts.map((post, i) => <PostCard key={post._id || post.id || i} post={post} index={i} />)
      )} [cite: 95]
    </div>
  );
}

// ---- Home Page ---- //
function HomePage() {
  const navigate = useNavigate();
  return ( [cite: 96]
    <div style={{ padding: "20px 16px 40px" }}>
      <div className="animate-fade-in-up" style={{ textAlign: "center", padding: "32px 16px 24px" }}>
        <div style={{ width: 72, height: 72, [cite: 97]
          borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--rose-gold))",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", [cite: 98]
          boxShadow: "0 8px 24px rgba(216, 27, 96, 0.2)" }}>
          <Sparkles size={32} color="#fff" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}> [cite: 99]
          منتدى المرأة العربية
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}> [cite: 100]
          مجتمع نسائي راقٍ يجمعكِ مع نساء ملهمات من كل مكان [cite: 101]
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        {SECTIONS.map((section, i) => ( [cite: 102]
          <button key={section.id} onClick={() => navigate(section.path)} className="animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms`, opacity: 0, background: "var(--glass-bg)", [cite: 103]
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius)", padding: "20px 16px", cursor: "pointer", textAlign: "center", [cite: 104]
              transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "var(--card-shadow)", fontFamily: "inherit" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${section.color}15`, [cite: 105]
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", [cite: 106]
              color: section.color, transition: "transform 0.2s" }}> [cite: 107]
              {section.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{section.label}</div> [cite: 108]
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}> [cite: 109]
              {section.description} [cite: 110]
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} [cite: 111]

// ---- AI Chat Overlay ---- //
function AIChatOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("raqqa_chats");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState(""); [cite: 112]
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { [cite: 113]
    try { localStorage.setItem("raqqa_chats", JSON.stringify(messages)); } catch { }
  }, [messages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]); [cite: 114]

  useEffect(() => { if (isOpen) { setTimeout(() => inputRef.current?.focus(), 300); } }, [isOpen]); [cite: 115]

  const handleChat = async () => { [cite: 116]
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: Date.now() }; [cite: 117]
    setMessages((prev) => [...prev, userMsg]); [cite: 118]
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.content }) });
      if (res.ok) { [cite: 119]
        const data = await res.json();
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply || data.message || data.response || "...", timestamp: Date.now() }; [cite: 120, 121]
        setMessages((prev) => [...prev, aiMsg]); [cite: 122]
      }
    } catch (err) { [cite: 123]
      const errMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "عذرًا، حدث خطأ في الاتصال. حاولي مرة أخرى.", timestamp: Date.now() };
      setMessages((prev) => [...prev, errMsg]); [cite: 124]
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id: string) => { setMessages((prev) => prev.filter((m) => m.id !== id)); }; [cite: 125]

  if (!isOpen) return null; [cite: 126]

  return (
    <div className="animate-fade-in" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} /> [cite: 127]
      <div className="animate-slide-up" style={{ position: "relative", [cite: 128]
          marginTop: "auto", height: "85dvh", background: "var(--bg)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}> [cite: 129]
        <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, var(--primary), var(--rose-gold))",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}> [cite: 130]
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", [cite: 131]
                alignItems: "center", justifyContent: "center" }}> [cite: 132]
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>المساعدة الذكية</div> [cite: 133]
              <div style={{ fontSize: 12, opacity: 0.85 }}>{isLoading ? "تكتب..." : "متصلة"}</div> [cite: 134]
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق المحادثة"
            style={{ background: "rgba(255,255,255,0.15)", [cite: 135]
              border: "none", color: "#fff", cursor: "pointer", borderRadius: "50%", width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center" }}> [cite: 136]
            <X size={20} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}> [cite: 137, 138]
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-secondary)" }}> [cite: 139]
              <Sparkles size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} /> [cite: 140]
              <p style={{ fontSize: 15, lineHeight: 1.7 }}>مرحبًا بكِ! أنا مساعدتكِ الذكية.<br />اسأليني أي شيء وسأكون سعيدة بمساعدتكِ.</p> [cite: 141, 142]
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end", [cite: 143]
                alignItems: "flex-end", gap: "8px" }}>
              {msg.role === "user" && ( [cite: 144]
                <button onClick={() => deleteMessage(msg.id)} aria-label="حذف الرسالة"
                  style={{ background: "none", [cite: 145]
                    border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4,
                    opacity: 0.4, flexShrink: 0 }}> [cite: 146]
                  <Trash2 size={14} />
                </button>
              )} [cite: 147]
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: msg.role === "user" ? [cite: 148]
                    "var(--radius) var(--radius) 4px var(--radius)" : "var(--radius) var(--radius) var(--radius) 4px", [cite: 149]
                  background: msg.role === "user" ? "var(--primary)" : "var(--glass-bg)", [cite: 150]
                  color: msg.role === "user" ? "#fff" : "var(--text)", fontSize: 14, lineHeight: 1.7, [cite: 151]
                  backdropFilter: msg.role === "assistant" ? "blur(16px)" : undefined, [cite: 152]
                  border: msg.role === "assistant" ? "1px solid var(--glass-border)" : "none", [cite: 153]
                  boxShadow: msg.role === "assistant" ? "var(--card-shadow)" : "none", }}> [cite: 154]
                {msg.content}
              </div>
              {msg.role === "assistant" && (
                <button onClick={() => deleteMessage(msg.id)} aria-label="حذف الرسالة" [cite: 155]
                  style={{ background: "none", border: "none", cursor: "pointer", [cite: 156]
                    color: "var(--text-secondary)", padding: 4, opacity: 0.4, flexShrink: 0 }}> [cite: 157]
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))} [cite: 158]
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div className="glass" style={{ padding: "12px 20px", [cite: 159]
                  borderRadius: "var(--radius)", display: "flex", gap: "6px", alignItems: "center" }}> [cite: 160]
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", [cite: 161]
                    animation: "pulse-soft 1s infinite" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", [cite: 162, 163]
                    animation: "pulse-soft 1s infinite 0.2s" }} />
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", [cite: 164]
                    animation: "pulse-soft 1s infinite 0.4s" }} /> [cite: 165]
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="safe-bottom" style={{ padding: "12px 16px", [cite: 166]
            borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fff", flexShrink: 0 }}> [cite: 167]
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}> [cite: 168]
            <button aria-label="كاميرا" style={{ width: 36, height: 36, borderRadius: "50%", [cite: 169]
                border: "none", background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}> [cite: 170]
              <Camera size={16} />
            </button>
            <button aria-label="ميكروفون" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", [cite: 171]
                background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)", cursor: "pointer", [cite: 172]
                display: "flex", alignItems: "center", justifyContent: "center" }}> [cite: 173]
              <Mic size={16} />
            </button>
            <button aria-label="صور" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", [cite: 174, 175]
                background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ImageIcon size={16} />
            </button>
          </div> [cite: 176]
          <div style={{ display: "flex", gap: "8px" }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="اكتبي رسالتكِ..." [cite: 177]
              style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--radius-lg)", [cite: 178]
                border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize: 14, fontFamily: "inherit",
                outline: "none", direction: "rtl" }} /> [cite: 179]
            <button onClick={handleChat} disabled={!input.trim() || isLoading} aria-label="إرسال" [cite: 180, 181]
              style={{ width: 44, height: 44, borderRadius: "50%", border: "none", [cite: 182]
                background: !input.trim() || isLoading ? "rgba(0,0,0,0.06)" : "var(--primary)", [cite: 183]
                color: !input.trim() || isLoading ? "var(--text-secondary)" : "#fff", [cite: 184]
                cursor: !input.trim() || isLoading ? "not-allowed" : "pointer", [cite: 185]
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}> [cite: 186]
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} [cite: 187]

// ---- Navigation Bar (Moved to TOP) ---- //
function GlassNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null); [cite: 188]

  return (
    <nav
      ref={navRef}
      className="glass hide-scrollbar"
      style={{
        position: "sticky", // Changed to sticky for Top Placement
        top: 64, // Just under Header
        left: 0,
        right: 0,
        zIndex: 900,
        overflowX: "auto",
        whiteSpace: "nowrap",
        display: "flex", [cite: 189]
        alignItems: "center",
        gap: "4px",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.3)", // Bottom border for top nav
      }}
    >
      <button onClick={() => navigate("/")}
        style={{ display: "flex", flexDirection: "column", [cite: 190]
          alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "none",
          background: location.pathname === "/" ? "rgba(216,27,96,0.12)" : "transparent", [cite: 191]
          color: location.pathname === "/" ? "var(--primary)" : "var(--text-secondary)",
          cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all 0.2s" }}> [cite: 192]
        <Sparkles size={18} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>الرئيسية</span>
      </button>

      {SECTIONS.map((sec) => (
        <button key={sec.id} onClick={() => navigate(sec.path)}
          style={{ display: "flex", [cite: 193]
            flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "var(--radius-sm)",
            border: "none", background: location.pathname === sec.path ? `${sec.color}18` : "transparent", [cite: 194, 195]
            color: location.pathname === sec.path ? sec.color : "var(--text-secondary)", [cite: 196]
            cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all 0.2s" }}>
          {sec.icon}
          <span style={{ fontSize: 11, fontWeight: 600 }}>{sec.label}</span> [cite: 197]
        </button>
      ))}
    </nav>
  );
} [cite: 198]

// ---- Header ---- //
function AppHeader({ onChatOpen }: { onChatOpen: () => void; }) {
  const location = useLocation();
  const navigate = useNavigate(); [cite: 199]
  const currentSection = SECTIONS.find((s) => s.path === location.pathname);
  return ( [cite: 200]
    <header className="glass"
      style={{ position: "sticky", top: 0, zIndex: 800, padding: "12px 20px", display: "flex",
        alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.3)" }}> [cite: 201]
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {currentSection && (
          <button onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", [cite: 202]
              color: "var(--text-secondary)", padding: 4, display: "flex", fontFamily: "inherit" }}>
            <ChevronDown size={20} style={{ transform: "rotate(90deg)" }} /> [cite: 203]
          </button>
        )}
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}> [cite: 204]
          {currentSection ? currentSection.label : "منتدى المرأة"} [cite: 205]
        </h1>
      </div>

      <button onClick={onChatOpen} aria-label="فتح المحادثة الذكية"
        style={{ width: 40, height: 40, borderRadius: "50%", border: "none", [cite: 206]
          background: "linear-gradient(135deg, var(--primary), var(--rose-gold))", color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(216, 27, 96, 0.25)", transition: "transform 0.2s" }}> [cite: 207]
        <Sparkles size={18} />
      </button>
    </header>
  );
} [cite: 208]

// ---- Main App Layout ---- //
function AppLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  return ( [cite: 209]
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", width: "100%", position: "relative" }}>
      <AppHeader onChatOpen={() => setChatOpen(true)} />
      
      {/* Navigation moved here to be at top */}
      <GlassNav />

      <main style={{ flex: 1 }}> [cite: 210]
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map((sec) => (
            <Route key={sec.id} path={sec.path} element={<SectionPage section={sec} />} /> [cite: 211]
          ))}
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
          --card-shadow: 0 8px 32px rgba(0,0,0,0.04);
        }
        #root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }
        .logo { height: 6em; padding: 1.5em; will-change: filter; transition: filter 300ms; }
        .logo:hover { filter: drop-shadow(0 0 2em #646cffaa); }
        .logo.react:hover { filter: drop-shadow(0 0 2em #61dafbaa); }
        @keyframes logo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: no-preference) { a:nth-of-type(2) .logo { animation: logo-spin infinite 20s linear; } }
        .card { padding: 2em; }
        .read-the-docs { color: #888; }
        .glass { background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border); }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; }
        @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
} [cite: 212]

// ---- Root Export ---- //
export default function Swing() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
} [cite: 213]
