import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate
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
  Loader2
} from "lucide-react";

// ---- الثوابت ----
const API_BASE = "https://raqqa-v6cd.vercel.app/api";

const SECTIONS = [
  { id: "motherhood", label: "الأمومة", icon: <Baby size={20} />, path: "/motherhood", color: "#E91E63" },
  { id: "kids", label: "الصغار", icon: <GraduationCap size={20} />, path: "/kids", color: "#9C27B0" },
  { id: "wellness", label: "العافية", icon: <HeartPulse size={20} />, path: "/wellness", color: "#00BCD4" },
  { id: "fashion", label: "الأناقة", icon: <Gem size={20} />, path: "/fashion", color: "#B76E79" },
  { id: "cooking", label: "المطبخ", icon: <ChefHat size={20} />, path: "/cooking", color: "#FF5722" },
  { id: "home", label: "المنزل", icon: <Home size={20} />, path: "/home-decor", color: "#795548" },
  { id: "empowerment", label: "التمكين", icon: <Rocket size={20} />, path: "/empowerment", color: "#FF9800" },
  { id: "relationships", label: "العلاقات", icon: <Users size={20} />, path: "/relationships", color: "#F44336" },
  { id: "hobbies", label: "الهوايات", icon: <Palette size={20} />, path: "/hobbies", color: "#4CAF50" },
  { id: "lounge", label: "الاسترخاء", icon: <Coffee size={20} />, path: "/lounge", color: "#607D8B" },
];

// ---- مكون الصفحة الرئيسية (بدون شبكة) ----
const HomePage = () => (
  <div style={{ padding: "60px 20px", textAlign: "center", color: "#D81B60" }}>
    <div className="hero-icon-bounce"><Sparkles size={60} /></div>
    <h1 style={{ fontSize: "28px", marginTop: "20px" }}>مرحباً بكِ في رقة</h1>
    <p style={{ color: "#666", fontSize: "16px" }}>منتدى المرأة العربية - اختاري قسماً من الأعلى لتتصفحي</p>
  </div>
);

// ---- مكون عرض الأقسام ----
const SectionPage = ({ section }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`${API_BASE}/get-posts`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const list = data.posts || data || [];
        setPosts(list.filter(p => p.section?.toLowerCase() === section.id.toLowerCase()));
        setLoading(false);
      })
      .catch(() => { if(isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [section.id]);

  return (
    <div className="fade-in">
      <div style={{ padding: "20px", background: section.color, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
        {section.icon} <h2 style={{ margin: 0, fontSize: "18px" }}>{section.label}</h2>
      </div>
      <div style={{ padding: "10px" }}>
        {loading ? <div className="loader-box"><Loader2 className="spin" /></div> : 
         posts.length === 0 ? <p className="empty-msg">لا توجد منشورات في {section.label} حالياً</p> :
         posts.map((p, i) => (
           <div key={i} className="post-card">
              <div className="post-user-info">
                <div className="avatar-small">{p.section?.[0] || "R"}</div>
                <span>عضوة رقة</span>
              </div>
              <p>{p.content}</p>
              {p.file && <img src={p.file} alt="post" style={{ width: "100%", borderRadius: "10px" }} />}
           </div>
         ))
        }
      </div>
    </div>
  );
};

// ---- الهيكل الرئيسي ----
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-main-wrapper">
      {/* الهيدر العلوي */}
      <header className="header-glass">
        <span className="logo-text" onClick={() => navigate("/")}>رقة</span>
        <button className="ai-btn-round"><Sparkles size={18} /></button>
      </header>

      {/* شريط الأقسام العلوي - كما طلبت */}
      <nav className="top-scroll-nav">
        <button 
          onClick={() => navigate("/")} 
          className={location.pathname === "/" ? "nav-tab active" : "nav-tab"}
        >
          الرئيسية
        </button>
        {SECTIONS.map(s => (
          <button 
            key={s.id} 
            onClick={() => navigate(s.path)} 
            className={location.pathname === s.path ? "nav-tab active" : "nav-tab"}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* منطقة عرض المحتوى */}
      <main className="content-scrollable">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {SECTIONS.map(s => (
            <Route key={s.id} path={s.path} element={<SectionPage section={s} />} />
          ))}
          {/* مسار احتياطي لمنع الصفحة البيضاء */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <style>{`
        body { margin: 0; background: #fffafb; direction: rtl; font-family: sans-serif; }
        .app-main-wrapper { max-width: 500px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: #fff; position: relative; }
        
        .header-glass { position: sticky; top: 0; z-index: 1000; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #f0f0f0; }
        .logo-text { font-size: 24px; font-weight: 900; color: #D81B60; cursor: pointer; }
        .ai-btn-round { width: 38px; height: 38px; border-radius: 50%; border: none; background: linear-gradient(135deg, #D81B60, #FFA726); color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        .top-scroll-nav { position: sticky; top: 68px; z-index: 999; display: flex; overflow-x: auto; padding: 10px; gap: 8px; background: #fff; border-bottom: 1px solid #eee; scrollbar-width: none; }
        .top-scroll-nav::-webkit-scrollbar { display: none; }
        .nav-tab { padding: 8px 18px; border-radius: 20px; border: 1px solid #f0f0f0; background: #fafafa; white-space: nowrap; cursor: pointer; font-size: 13px; color: #666; transition: 0.3s; }
        .nav-tab.active { background: #D81B60; color: #fff; border-color: #D81B60; }

        .post-card { background: #fff; margin: 15px 5px; padding: 15px; border-radius: 15px; border: 1px solid #f5f5f5; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .post-user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: bold; font-size: 13px; }
        .avatar-small { width: 30px; height: 30px; border-radius: 50%; background: #fce4ec; color: #D81B60; display: flex; align-items: center; justify-content: center; }
        
        .loader-box { padding: 50px; text-align: center; color: #D81B60; }
        .empty-msg { text-align: center; padding: 40px; color: #999; font-size: 14px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hero-icon-bounce { animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .fade-in { animation: fadeIn 0.4s ease-in; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

// المكون المصدر النهائي
export default function Swing() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
