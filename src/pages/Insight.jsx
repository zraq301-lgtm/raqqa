import React, { useState } from 'react';
import { 
  Heart, Sparkles, Video, Activity, Moon, MessageCircle, 
  Settings, User, Flower2, Gem, LayoutDashboard, Bell,
  BookOpen, ShieldCheck, Clock, Users, Coffee, Star
} from 'lucide-react';

// --- نظام الأيقونات المستوحى من ملفك iconMap.js ---
const customIconMap = {
  purity: Flower2,    // فقه الطهارة (نظافة وجمال)
  prayer: Sparkles,   // فقه الصلاة (نور وخشوع)
  fasting: Moon,      // فقه الصيام
  quran: BookOpen,    // فقه القرآن
  dhikr: Bell,        // التسبيح والذكر
  modesty: Gem,       // العفة والحجاب (قيمة وجوهرة)
  family: Heart,      // المعاملات والبيوت
  shield: ShieldCheck, // تجنب المحرمات
  peace: Activity,    // الهدوء النفسي
  deeds: User,        // الأعمال الصالحة
  time: Clock,        // فقه الوقت
  growth: LayoutDashboard, // الوعي والفكر
  selfcare: Coffee,   // الرعاية الذاتية
  giving: MessageCircle, // فقه العطاء
  eternal: Star       // الاستعداد للقاء الله
};

const FiqhApp = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  const sections = [
    { title: "فقه الطهارة (Purity)", icon: "purity", color: "#f8bbd0", items: ["سنن الفطرة ✨", "صفة الغسل 🚿", "الوضوء الجمالي 💧", "طهارة الثوب 👗", "طيب الرائحة 🌸"] },
    { title: "فقه الصلاة (Sacred)", icon: "prayer", color: "#e1bee7", items: ["أوقات الصلاة 🕌", "السنن الرواتب 🌱", "سجدة الشكر 🤲", "لباس الصلاة الأنيق 🧕", "صلاة الوتر 🌌"] },
    { title: "فقه الصيام (Fast)", icon: "fasting", color: "#c5cae9", items: ["صيام الاثنين والخميس 🌙", "قضاء ما فات 📅", "سحور البركة 🥣", "كف اللسان 🤐"] },
    { title: "فقه العفة (Modesty)", icon: "modesty", color: "#b2ebf2", items: ["حجاب القلب 💎", "غض البصر 👁️", "الحياء في القول 🎀", "سمو الفكر 🧠"] },
    { title: "الهدوء النفسي (Mind)", icon: "peace", color: "#dcedc8", items: ["تفريغ الانفعالات 🌬️", "الرضا بالقدر ⚖️", "حسن الظن بالله 🌈"] },
    // يمكن إضافة باقي الـ 15 قائمة هنا بنفس النمط
  ];

  const toggleTask = (sectionIdx, taskIdx) => {
    const key = `${sectionIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ActiveIcon = customIconMap[sections[activeTab].icon];

  return (
    <div style={styles.appContainer}>
      {/* Sidebar Navigation */}
      <nav style={styles.sidebar}>
        <div style={styles.logoArea}>
          <Flower2 size={32} color="#d63384" />
          <h2 style={styles.logoText}>رَوْاقة الفقهية</h2>
        </div>
        {sections.map((section, idx) => {
          const IconTag = customIconMap[section.icon];
          return (
            <button 
              key={idx} 
              onClick={() => setActiveTab(idx)}
              style={{...styles.navItem, backgroundColor: activeTab === idx ? '#fff1f6' : 'transparent'}}
            >
              <IconTag size={20} color={activeTab === idx ? '#d63384' : '#666'} />
              <span style={{marginRight: '10px'}}>{section.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerTitle}>
            <ActiveIcon size={40} color="#d63384" />
            <h1 style={{marginRight: '15px'}}>{sections[activeTab].title}</h1>
          </div>
          <div style={styles.aiBadge}>تحليل الروح بالذكاء الاصطناعي 🧠✨</div>
        </header>

        <div style={styles.tasksGrid}>
          {sections[activeTab].items.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleTask(activeTab, idx)}
              style={{
                ...styles.taskCard, 
                borderRight: `5px solid ${sections[activeTab].color}`,
                opacity: completedTasks[`${activeTab}-${idx}`] ? 0.6 : 1
              }}
            >
              <span style={styles.taskText}>{item}</span>
              <div style={{
                ...styles.checkbox, 
                backgroundColor: completedTasks[`${activeTab}-${idx}`] ? '#4caf50' : '#eee'
              }}>
                {completedTasks[`${activeTab}-${idx}`] && "✓"}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button - Al-Azhar */}
        <a 
          href="https://www.azhar.eg/fatwacenter" 
          target="_blank" 
          rel="noreferrer"
          style={styles.fab}
        >
          <div style={styles.fabContent}>
             <span style={{fontSize: '12px'}}>اسألي الأزهر</span>
             <Sparkles size={20} />
          </div>
        </a>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
        body { margin: 0; font-family: 'Tajawal', sans-serif; background: #fdf2f5; }
      `}</style>
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    direction: 'rtl',
    backgroundColor: '#fdf2f5',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#fff',
    borderLeft: '1px solid #eee',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '30px',
    padding: '10px',
  },
  logoText: {
    fontSize: '1.2rem',
    color: '#d63384',
    margin: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'right',
    transition: '0.3s',
    fontSize: '0.95rem',
    color: '#444',
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  aiBadge: {
    backgroundColor: '#fff',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '0.85rem',
    boxShadow: '0 4px 15px rgba(214, 51, 132, 0.1)',
    color: '#d63384',
    fontWeight: 'bold',
  },
  tasksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  taskText: {
    fontSize: '1rem',
    color: '#333',
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '12px',
  },
  fab: {
    position: 'fixed',
    bottom: '30px',
    left: '30px',
    backgroundColor: '#d63384',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '30px',
    textDecoration: 'none',
    boxShadow: '0 10px 25px rgba(214, 51, 132, 0.3)',
    transition: '0.3s transform',
  },
  fabContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 'bold',
  }
};

export default FiqhApp;
