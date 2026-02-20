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

// ---- الإعدادات ----
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

// ---- المكونات الصغيرة ----
const PostCard = ({ post, index }) => {
  const [liked, setLiked] = useState(false);
  return (
    <div className="card-style animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="p-header">
        <div className="p-avatar">{post.section?.[0] || "R"}</div>
        <div>
          <div className="p-user">عضوة رقة</div>
          <div className="p-date">منذ قليل</div>
        </div>
      </div>
      <p className="p-text">{post.content}</p>
      {post.file && <img src={post.file} className="p-img" alt="post" />}
      <div className="p-footer">
        <button onClick={() => setLiked(!liked)} className={liked ? "act-b liked" : "act-b"}>
          <Heart size={18} fill={liked ? "#D81B60" : "none"} />
        </button>
        <button className="act-b"><MessageCircle size={18} /></button>
        <button className="act-b"><Share2 size={18} /></button>
      </div>
    </div>
  );
};

// ---- الصفحات ----
const HomePage = () => (
  <div className="home-container">
    <div className="welcome-box">
      <div className="logo-circle"><Sparkles size={40} /></div>
      <h1>مرحباً بكِ في منتدى رقة</h1>
      <p>مجتمعكِ الخاص للجمال، الأمومة، والتمكين</p>
      <div className="scroll-hint">اختاري قسماً من الأعلى لتتصفحي المنشورات</div>
    </div>
  </div>
);

const SectionPage = ({ section }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/get-posts`)
      .then(res => res.json())
      .then(data => {
        const list = data.posts || data || [];
        setPosts(list.filter(p => p.section?.toLowerCase() === section.id.toLowerCase()));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [section.id]);

  return (
    <div className="page-fade">
      <div className="sec-banner" style={{ background: section.color }}>
        {section.icon} <h2>{section.label}</h2>
      </div>
      <div className="content-list">
        {loading ? <div className="loader"><Loader2 className="spin" /></div> : 
          posts.length === 0 ? <div className="empty">لا توجد منشورات في هذا القسم بعد</div> :
          posts.map((p, i) => <PostCard key={i} post={p} index={i} />)
        }
      </div>
    </div>
  );
};

// ---- الهيكل الأساسي ----
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-frame">
      <header className="main-header glass">
        <div className="brand" onClick={() => navigate("/")}>رقة</div>
        <button className="ai-trigger"><Sparkles size={18} /></button>
      </header>

      <nav className="top-tabs hide-scroll">
        <button onClick={() => navigate("/")} className={location.pathname === "/" ? "tab active" : "tab"}>الرئيسية</button>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => navigate(s.path)} className={location.pathname === s.path ? "tab active" : "tab"}>
            {s.label}
          </button>
        ))}
      </nav>

      <main className="view-port">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(s => <Route key={s.id} path={s.path} element={<SectionPage section={s} />} />)}
        </Routes>
      </main>

      <style>{`
        :root { --primary: #D81B60; --soft: #FCE4EC; --text: #455A64; }
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FFF9FA; direction: rtl; color: var(--text); }
        .app-frame { max-width: 500px; margin: 0 auto; min-height: 100vh; background: #fff; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
        
        .glass { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); }
        .main-header { position: sticky; top: 0; z-index: 100; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
        .brand { font-size: 24px; font-weight: 900; color: var(--primary); cursor: pointer; }
        .ai-trigger { width: 38px; height: 38px; border-radius: 50%; border: none; background: linear-gradient(45deg, var(--primary), #FF7043); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .top-tabs { position: sticky; top: 69px; z-index: 90; display: flex; gap: 8px; padding: 10px; background: #fff; border-bottom: 1px solid #eee; overflow-x: auto; white-space: nowrap; }
        .tab { padding: 8px 18px; border-radius: 20px; border: 1px solid #eee; background: #f9f9f9; cursor: pointer; font-size: 13px; transition: 0.3s; color: #666; }
        .tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .hide-scroll::-webkit-scrollbar { display: none; }

        .home-container { padding: 60px 20px; text-align: center; }
        .welcome-box h1 { font-size: 22px; margin: 20px 0 10px; color: var(--primary); }
        .logo-circle { width: 80px; height: 80px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 10px 20px rgba(216,27,96,0.2); }
        .scroll-hint { margin-top: 40px; font-size: 13px; color: #999; border: 1px dashed #ccc; padding: 10px; border-radius: 10px; }

        .sec-banner { padding: 30px 20px; color: white; display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .sec-banner h2 { margin: 0; font-size: 20px; }
        
        .card-style { background: #fff; margin: 15px; padding: 15px; border-radius: 15px; border: 1px solid #f0f0f0; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .p-header { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
        .p-avatar { width: 35px; height: 35px; background: var(--soft); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .p-user { font-size: 14px; font-weight: bold; }
        .p-date { font-size: 11px; color: #999; }
        .p-img { width: 100%; border-radius: 12px; margin: 10px 0; }
        .p-footer { display: flex; gap: 20px; padding-top: 10px; border-top: 1px solid #f9f9f9; }
        .act-b { background: none; border: none; cursor: pointer; color: #777; transition: 0.2s; }
        .liked { color: var(--primary); }

        .loader { padding: 50px; text-align: center; color: var(--primary); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-in { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default function Swing() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
