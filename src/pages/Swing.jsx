[cite_start][cite: 214] import { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
[cite_start][cite: 215] import {
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

// ---- Constants ---- //
[cite_start][cite: 216] const API_BASE = "https://raqqa-v6cd.vercel.app/api";

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  [cite_start]color: string; [cite: 217]
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
    [cite_start]icon: <HeartPulse size={20} />, [cite: 218]
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
    [cite_start]icon: <Home size={20} />, [cite: 219]
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
    [cite_start]color: "#F44336", [cite: 220]
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
[cite_start][cite: 221] function strictSanitize(text: string): string {
  if (!text) return "";
  return text
    .replace(/https?:\/\/[^\s]+/g, "[رابط محذوف]")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    [cite_start].replace(/on\w+=/gi, ""); [cite: 222, 223]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  [cite_start]if (mins < 1) return "الآن"; [cite: 224]
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  [cite_start]if (hours < 24) return `منذ ${hours} ساعة`; [cite: 225]
  const days = Math.floor(hours / 24);
  [cite_start]return `منذ ${days} يوم`; [cite: 226]
}

// ---- Types ---- //
interface Post {
  _id?: string;
  id?: string;
  content: string;
  section: string;
  type?: string;
  file?: string;
  [cite_start]createdAt?: string; [cite: 227]
  likes?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
[cite_start]} [cite: 228]

// ---- Post Card Component ---- //
function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);
  [cite_start]const [likeCount, setLikeCount] = useState(post.likes || 0); [cite: 229]
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  [cite_start]const [comments, setComments] = useState<string[]>([]); [cite: 230]

  const handleLike = () => {
    setLiked(!liked);
    [cite_start]setLikeCount((prev) => (liked ? prev - 1 : prev + 1)); [cite: 231]
  };

  [cite_start]const handleShare = async () => { [cite: 232]
    if (navigator.share) {
      try {
        await navigator.share({
          title: "منتدى المرأة",
          text: strictSanitize(post.content).substring(0, 100),
          url: window.location.href,
        });
      [cite_start]} catch { [cite: 233]
        /* user cancelled */
      }
    }
  };

  [cite_start]const handleComment = () => { [cite: 234]
    if (comment.trim()) {
      setComments((prev) => [...prev, comment.trim()]);
      [cite_start]setComment(""); [cite: 235]
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
        [cite_start]marginBottom: "16px", [cite: 236]
        boxShadow: "var(--card-shadow)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      [cite_start]<div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}> [cite: 237]
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: `linear-gradient(135deg, var(--primary), var(--rose-gold))`,
          [cite_start]display: "flex", alignItems: "center", justifyContent: "center", [cite: 238]
          color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>
          {post.section?.[0]?.toUpperCase() || [cite_start]"م"} [cite: 239, 240]
        </div>
        <div style={{ flex: 1 }}>
          [cite_start]<div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>عضوة المنتدى</div> [cite: 241]
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            [cite_start]{post.createdAt ? timeAgo(post.createdAt) : "منذ قليل"} [cite: 242, 243]
          </div>
        </div>
      </div>

      [cite_start]<p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text)", marginBottom: "16px", wordBreak: "break-word" }}> [cite: 244]
        {strictSanitize(post.content)}
      </p>

      {post.file && (
        [cite_start]<div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: "16px" }}> [cite: 245]
          <img src={post.file} alt="محتوى المنشور" crossOrigin="anonymous"
            [cite_start]style={{ width: "100%", maxHeight: 300, objectFit: "cover", display: "block" }} loading="lazy" /> [cite: 246]
        </div>
      )}

      [cite_start]<div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}> [cite: 247]
        <button onClick={handleLike} aria-label={liked ? [cite_start]"إزالة الإعجاب" : "إعجاب"} [cite: 248, 249]
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none",
            background: liked ? [cite_start]"rgba(216, 27, 96, 0.1)" : "rgba(0,0,0,0.03)", [cite: 250]
            color: liked ? [cite_start]"var(--primary)" : "var(--text-secondary)", [cite: 251]
            cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
          }}>
          <Heart size={16} fill={liked ? "var(--primary)" : "none"} stroke={liked ? [cite_start]"var(--primary)" : "currentColor"} /> [cite: 252, 253, 254]
          [cite_start]<span>{likeCount > 0 ? likeCount : ""}</span> [cite: 255]
        </button>

        [cite_start]<button onClick={() => setShowComment(!showComment)} aria-label="تعليق" [cite: 256]
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none",
            background: showComment ? [cite_start]"rgba(216, 27, 96, 0.1)" : "rgba(0,0,0,0.03)", [cite: 257]
            color: showComment ? [cite_start]"var(--primary)" : "var(--text-secondary)", [cite: 258]
            cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all 0.2s",
          }}>
          <MessageCircle size={16} />
          [cite_start]<span>{comments.length > 0 ? comments.length : ""}</span> [cite: 259, 260]
        </button>

        [cite_start]<button onClick={handleShare} aria-label="مشاركة" [cite: 261]
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "none",
            [cite_start]background: "rgba(0,0,0,0.03)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 500, [cite: 262]
            fontFamily: "inherit", transition: "all 0.2s", marginRight: "auto",
          }}>
          <Share2 size={16} />
        </button>
      </div>

      {showComment && (
        [cite_start]<div className="animate-fade-in" style={{ marginTop: "12px" }}> [cite: 263]
          {comments.map((c, i) => (
            [cite_start]<div key={i} style={{ padding: "10px 14px", background: "rgba(0,0,0,0.02)", borderRadius: "var(--radius-sm)", marginBottom: "8px", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}> [cite: 264, 265]
              {c}
            </div>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            [cite_start]<input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} [cite: 266]
              [cite_start]placeholder="اكتبي تعليقك..." style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", direction: "rtl" }} /> [cite: 267, 268]
            [cite_start]<button onClick={handleComment} aria-label="إرسال التعليق" style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}> [cite: 269, 270]
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

// ---- Section Page Component ---- //
function SectionPage({ section }: { section: Section }) {
  const [posts, setPosts] = useState<Post[]>([]);
  [cite_start]const [loading, setLoading] = useState(true); [cite: 272]
  const [showPublish, setShowPublish] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [publishing, setPublishing] = useState(false);

  [cite_start]const fetchPosts = useCallback(async () => { [cite: 273]
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get-posts`);
      if (res.ok) {
        const data = await res.json();
        const allPosts = data.posts || data || [];
        [cite_start]const filtered = allPosts.filter((p: Post) => p.section?.toLowerCase() === section.id.toLowerCase()); [cite: 274]
        setPosts(filtered);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, [section.id]);

  [cite_start]useEffect(() => { fetchPosts(); }, [fetchPosts]); [cite: 275]

  [cite_start]const handlePublish = async () => { [cite: 276]
    if (!newContent.trim() || publishing) return;
    setPublishing(true);
    [cite_start]try { [cite: 277]
      const formData = new FormData();
      formData.append("content", newContent.trim());
      formData.append("section", section.id);
      formData.append("type", "text");
      [cite_start]await fetch(`${API_BASE}/save-post`, { method: "POST", body: formData }); [cite: 278]
      [cite_start]setNewContent(""); [cite: 279]
      setShowPublish(false);
      fetchPosts();
    } catch (err) {
      console.error("Error publishing:", err);
    } finally {
      [cite_start]setPublishing(false); [cite: 280]
    }
  };

  return (
    [cite_start]<div style={{ padding: "20px 16px 40px" }}> [cite: 281]
      <div className="animate-fade-in-up" style={{ textAlign: "center", padding: "28px 16px 20px" }}>
        [cite_start]<div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${section.color}22, ${section.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: section.color }}> [cite: 282, 283]
          {section.icon}
        </div>
        [cite_start]<h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{section.label}</h2> [cite: 284]
        [cite_start]<p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{section.description}</p> [cite: 285]
      </div>

      <button onClick={() => setShowPublish(!showPublish)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", borderRadius: "var(--radius)", border: "2px dashed rgba(216,27,96,0.2)", background: showPublish ? [cite_start]"rgba(216,27,96,0.05)" : "transparent", color: "var(--primary)", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", marginBottom: "16px", transition: "all 0.2s" }}> [cite: 286, 287]
        [cite_start]<Plus size={18} /> أضيفي منشورًا جديدًا [cite: 288]
      </button>

      {showPublish && (
        [cite_start]<div className="glass animate-fade-in" style={{ borderRadius: "var(--radius)", padding: "16px", marginBottom: "16px" }}> [cite: 289]
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="شاركي أفكارك مع المجتمع..." rows={4}
            [cite_start]style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", direction: "rtl", lineHeight: 1.7 }} /> [cite: 290, 291]
          [cite_start]<div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "flex-start" }}> [cite: 292]
            <button onClick={handlePublish} disabled={publishing || !newContent.trim()}
              style={{ padding: "10px 24px", borderRadius: "var(--radius-sm)", border: "none", background: "var(--primary)", color: "#fff", cursor: publishing ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", opacity: publishing || !newContent.trim() ? [cite_start]0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}> [cite: 293, 294, 295, 296, 297]
              [cite_start]{publishing && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />} نشر [cite: 298]
            </button>
            <button onClick={() => { setShowPublish(false); setNewContent(""); }}
              [cite_start]style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(0,0,0,0.08)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}> [cite: 299, 300, 301]
              إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          [cite_start]{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius)" }} />)} [cite: 302, 303]
        </div>
      ) : posts.length === 0 ? (
        [cite_start]<div className="glass animate-fade-in" style={{ textAlign: "center", padding: "48px 24px", borderRadius: "var(--radius)" }}> [cite: 304]
          [cite_start]<div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>{section.icon}</div> [cite: 305]
          [cite_start]<p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>لا توجد منشورات بعد في هذا القسم.<br />كوني أول من يشارك!</p> [cite: 306, 307]
        </div>
      ) : (
        posts.map((post, i) => <PostCard key={post._id || post.id || i} post={post} index={i} />)
      )}
    </div>
  );
}

// ---- Home Page ---- //
function HomePage() {
  [cite_start]const navigate = useNavigate(); [cite: 308]
  return (
    [cite_start]<div style={{ padding: "20px 16px 40px" }}> [cite: 309]
      <div className="animate-fade-in-up" style={{ textAlign: "center", padding: "32px 16px 24px" }}>
        [cite_start]<div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--rose-gold))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(216, 27, 96, 0.2)" }}> [cite: 310, 311]
          <Sparkles size={32} color="#fff" />
        </div>
        [cite_start]<h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 8, lineHeight: 1.3 }}>منتدى المرأة العربية</h1> [cite: 312]
        [cite_start]<p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>مجتمع نسائي راقٍ يجمعكِ مع نساء ملهمات من كل مكان</p> [cite: 313, 314]
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        [cite_start]{SECTIONS.map((section, i) => ( [cite: 315]
          <button key={section.id} onClick={() => navigate(section.path)} className="animate-fade-in-up"
            [cite_start]style={{ animationDelay: `${i * 60}ms`, opacity: 0, background: "var(--glass-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius)", padding: "20px 16px", cursor: "pointer", textAlign: "center", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "var(--card-shadow)", fontFamily: "inherit" }}> [cite: 316, 317]
            [cite_start]<div style={{ width: 48, height: 48, borderRadius: "50%", background: `${section.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: section.color, transition: "transform 0.2s" }}> [cite: 318, 319, 320]
              {section.icon}
            </div>
            [cite_start]<div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{section.label}</div> [cite: 321]
            [cite_start]<div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{section.description}</div> [cite: 322, 323]
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- AI Chat Overlay ---- //
function AIChatOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("raqqa_chats");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  [cite_start]}); [cite: 324]
  [cite_start]const [input, setInput] = useState(""); [cite: 325]
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { localStorage.setItem("raqqa_chats", JSON.stringify(messages)); } catch { }
  [cite_start]}, [messages]); [cite: 326]

  [cite_start]useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]); [cite: 327]

  [cite_start]useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]); [cite: 328]

  [cite_start]const handleChat = async () => { [cite: 329]
    if (!input.trim() || isLoading) return;
    [cite_start]const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: Date.now() }; [cite: 330]
    [cite_start]setMessages((prev) => [...prev, userMsg]); [cite: 331]
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/raqqa-ai`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.content }) });
      [cite_start]if (res.ok) { [cite: 332]
        const data = await res.json();
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply || data.message || data.response || [cite_start]"...", timestamp: Date.now() }; [cite: 333, 334, 335]
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      [cite_start]const errMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "عذرًا، حدث خطأ في الاتصال. حاولي مرة أخرى.", timestamp: Date.now() }; [cite: 336, 337]
      setMessages((prev) => [...prev, errMsg]);
    } finally { setIsLoading(false); }
  };

  const deleteMessage = (id: string) => { setMessages((prev) => prev.filter((m) => m.id !== id)); [cite_start]}; [cite: 338]

  [cite_start]if (!isOpen) return null; [cite: 339]

  return (
    <div className="animate-fade-in" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column" }}>
      [cite_start]<div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} /> [cite: 340]
      [cite_start]<div className="animate-slide-up" style={{ position: "relative", marginTop: "auto", height: "85dvh", background: "var(--bg)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}> [cite: 341, 342]
        [cite_start]<div style={{ padding: "16px 20px", background: "linear-gradient(135deg, var(--primary), var(--rose-gold))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}> [cite: 343]
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            [cite_start]<div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={20} /></div> [cite: 344, 345]
            <div>
              [cite_start]<div style={{ fontWeight: 700, fontSize: 16 }}>المساعدة الذكية</div> [cite: 346]
              <div style={{ fontSize: 12, opacity: 0.85 }}>{isLoading ? [cite_start]"تكتب..." : "متصلة"}</div> [cite: 347]
            </div>
          </div>
          [cite_start]<button onClick={onClose} aria-label="إغلاق المحادثة" style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button> [cite: 348, 349]
        </div>
        [cite_start]<div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}> [cite: 350, 351]
          {messages.length === 0 && (
            [cite_start]<div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-secondary)" }}> [cite: 352]
              [cite_start]<Sparkles size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} /> [cite: 353]
              <p style={{ fontSize: 15, lineHeight: 1.7 }}>مرحبًا بكِ! [cite_start]أنا مساعدتكِ الذكية.<br />اسأليني أي شيء وسأكون سعيدة بمساعدتكِ.</p> [cite: 354, 355]
            </div>
          )}
          {messages.map((msg) => (
            [cite_start]<div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-start" : "flex-end", alignItems: "flex-end", gap: "8px" }}> [cite: 356]
              {msg.role === "user" && (
                [cite_start]<button onClick={() => deleteMessage(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4, opacity: 0.4, flexShrink: 0 }}><Trash2 size={14} /></button> [cite: 357, 358, 359, 360]
              )}
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: msg.role === "user" ? "var(--radius) var(--radius) 4px var(--radius)" : "var(--radius) var(--radius) var(--radius) 4px", background: msg.role === "user" ? "var(--primary)" : "var(--glass-bg)", color: msg.role === "user" ? "#fff" : "var(--text)", fontSize: 14, lineHeight: 1.7, backdropFilter: msg.role === "assistant" ? "blur(16px)" : undefined, border: msg.role === "assistant" ? "1px solid var(--glass-border)" : "none", boxShadow: msg.role === "assistant" ? [cite_start]"var(--card-shadow)" : "none" }}> [cite: 361, 362, 363, 364, 365, 366, 367]
                {msg.content}
              </div>
              {msg.role === "assistant" && (
                [cite_start]<button onClick={() => deleteMessage(msg.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4, opacity: 0.4, flexShrink: 0 }}><Trash2 size={14} /></button> [cite: 368, 369, 370, 371]
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              [cite_start]<div className="glass" style={{ padding: "12px 20px", borderRadius: "var(--radius)", display: "flex", gap: "6px", alignItems: "center" }}> [cite: 372, 373]
                [cite_start]<span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse-soft 1s infinite" }} /> [cite: 374]
                [cite_start]<span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse-soft 1s infinite 0.2s" }} /> [cite: 375, 376]
                [cite_start]<span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse-soft 1s infinite 0.4s" }} /> [cite: 377, 378]
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        [cite_start]<div className="safe-bottom" style={{ padding: "12px 16px", borderTop: "1px solid rgba(0,0,0,0.06)", background: "#fff", flexShrink: 0 }}> [cite: 379, 380]
          [cite_start]<div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}> [cite: 381]
            [cite_start]<button style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Camera size={16} /></button> [cite: 382, 383]
            [cite_start]<button style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Mic size={16} /></button> [cite: 384, 385, 386]
            [cite_start]<button style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.04)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={16} /></button> [cite: 387, 388, 389]
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            [cite_start]<input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="اكتبي رسالتكِ..." style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--radius-lg)", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize: 14, fontFamily: "inherit", outline: "none", direction: "rtl" }} /> [cite: 390, 391, 392]
            <button onClick={handleChat} disabled={!input.trim() || isLoading} style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: !input.trim() || isLoading ? "rgba(0,0,0,0.06)" : "var(--primary)", color: !input.trim() || isLoading ? "var(--text-secondary)" : "#fff", cursor: !input.trim() || isLoading ? [cite_start]"not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}><Send size={18} /></button> [cite: 393, 394, 395, 396, 397, 398, 399]
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Navigation Bar (Moved to TOP) ---- //
function GlassNav() {
  const navigate = useNavigate();
  [cite_start]const location = useLocation(); [cite: 400, 401]

  return (
    <nav className="glass hide-scrollbar"
      style={{
        position: "sticky",
        top: 64, // Just below Header
        left: 0,
        right: 0,
        zIndex: 850,
        overflowX: "auto",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "10px 12px",
        [cite_start]borderBottom: "1px solid rgba(255,255,255,0.3)", [cite: 402]
      }}>
      <button onClick={() => navigate("/")}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "none", background: location.pathname === "/" ? "rgba(216,27,96,0.12)" : "transparent", color: location.pathname === "/" ? [cite_start]"var(--primary)" : "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all 0.2s" }}> [cite: 403, 404, 405]
        <Sparkles size={18} /> <span style={{ fontSize: 11, fontWeight: 600 }}>الرئيسية</span>
      </button>
      {SECTIONS.map((sec) => (
        <button key={sec.id} onClick={() => navigate(sec.path)}
          [cite_start]style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "none", background: location.pathname === sec.path ? `${sec.color}18` : "transparent", color: location.pathname === sec.path ? sec.color : "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all 0.2s" }}> [cite: 406, 407, 408, 409]
          [cite_start]{sec.icon} <span style={{ fontSize: 11, fontWeight: 600 }}>{sec.label}</span> [cite: 410]
        </button>
      ))}
    </nav>
  );
}

// ---- Header ---- //
function AppHeader({ onChatOpen }: { onChatOpen: () => void; }) {
  [cite_start]const location = useLocation(); [cite: 411]
  [cite_start]const navigate = useNavigate(); [cite: 412]
  [cite_start]const currentSection = SECTIONS.find((s) => s.path === location.pathname); [cite: 413]
  return (
    [cite_start]<header className="glass" style={{ position: "sticky", top: 0, zIndex: 900, height: 64, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.3)" }}> [cite: 414]
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {currentSection && (
          [cite_start]<button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4, display: "flex", fontFamily: "inherit" }}> [cite: 415]
            [cite_start]<ChevronDown size={20} style={{ transform: "rotate(90deg)" }} /> [cite: 416]
          </button>
        )}
        [cite_start]<h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>{currentSection ? currentSection.label : "منتدى المرأة"}</h1> [cite: 417, 418]
      </div>
      [cite_start]<button onClick={onChatOpen} style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "linear-gradient(135deg, var(--primary), var(--rose-gold))", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(216, 27, 96, 0.25)", transition: "transform 0.2s" }}> [cite: 419, 420]
        <Sparkles size={18} />
      </button>
    </header>
  );
}

// ---- Main App Layout ---- //
function AppLayout() {
  [cite_start]const [chatOpen, setChatOpen] = useState(false); [cite: 421, 422]
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", width: "100%", position: "relative", background: "var(--bg)" }}>
      <AppHeader onChatOpen={() => setChatOpen(true)} />
      <GlassNav />
      [cite_start]<main style={{ flex: 1 }}> [cite: 423]
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map((sec) => (
            [cite_start]<Route key={sec.id} path={sec.path} element={<SectionPage section={sec} />} /> [cite: 424]
          ))}
        </Routes>
      </main>
      <AIChatOverlay isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      
      {/* CSS Styles Integrated */}
      <style>{`
        #root { max-width: 1280px; margin: 0 auto; padding: 2rem; text-align: center; }
        .logo { height: 6em; padding: 1.5em; will-change: filter; transition: filter 300ms; }
        .logo:hover { filter: drop-shadow(0 0 2em #646cffaa); }
        .logo.react:hover { filter: drop-shadow(0 0 2em #61dafbaa); }
        @keyframes logo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: no-preference) { a:nth-of-type(2) .logo { animation: logo-spin infinite 20s linear; } }
        .card { padding: 2em; }
        .read-the-docs { color: #888; }
        
        /* App Specific Styles */
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
}

// ---- Root Export ---- //
export default function Swing() {
  return (
    [cite_start]<BrowserRouter> [cite: 425]
      <AppLayout />
    [cite_start]</BrowserRouter> [cite: 426]
  );
}
